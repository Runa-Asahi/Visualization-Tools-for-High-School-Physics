/**
 * 应用入口：状态管理、DOM 渲染与事件绑定。
 * App entry: state, DOM rendering, event wiring and the animation loop.
 */
(function (root) {
  "use strict";
  const PV = root.PhysicsViz;
  const { format, decimalsFromStep } = PV.utils;
  const { domains, topics, renderers, staticRenderers } = PV;
  const ALL = domains[0];
  const STEP_SECONDS = 1 / 24;

  const topicById = new Map(topics.map((topic) => [topic.id, topic]));
  const $ = (id) => document.getElementById(id);
  const el = {
    canvas: $("physicsCanvas"),
    topicSearch: $("topicSearch"),
    domainTabs: $("domainTabs"),
    topicList: $("topicList"),
    domainLabel: $("domainLabel"),
    topicTitle: $("topicTitle"),
    topicSummary: $("topicSummary"),
    playPause: $("playPause"),
    resetScene: $("resetScene"),
    stepScene: $("stepScene"),
    resetControls: $("resetControls"),
    controlsPanel: $("controlsPanel"),
    metricsPanel: $("metricsPanel"),
    formulaPanel: $("formulaPanel"),
    canvasCaption: $("canvasCaption"),
    questionText: $("questionText"),
    observationText: $("observationText"),
    mistakeText: $("mistakeText")
  };
  const ctx = el.canvas.getContext("2d");

  const state = {
    topicId: topicFromHash() || topics[0].id,
    values: {},
    running: true,
    time: 0,
    lastFrame: performance.now(),
    domain: ALL,
    query: "",
    dirty: true, // 需要重绘 / scene needs a redraw
    lastMetricsKey: "",
    lastCaption: ""
  };

  // ---------- URL hash 深链接 / deep links like #lens ----------
  function topicFromHash() {
    const id = decodeURIComponent((root.location && root.location.hash) || "").replace(/^#/, "");
    return topicById.has(id) ? id : null;
  }

  function writeHash(id) {
    if (root.history && root.history.replaceState) {
      try {
        root.history.replaceState(null, "", `#${id}`);
      } catch (error) {
        /* file:// 下部分浏览器禁止修改历史记录，忽略即可 */
      }
    }
  }

  // ---------- 初始化 ----------
  function init() {
    state.values = defaultsFor(currentTopic());
    setRunning(state.running);
    renderDomainTabs();
    renderTopicList();
    renderTopic();
    bindEvents();
    requestAnimationFrame(tick);
  }

  const currentTopic = () => topicById.get(state.topicId);
  const invalidate = () => {
    state.dirty = true;
  };

  function bindEvents() {
    el.topicSearch.addEventListener("input", () => {
      state.query = el.topicSearch.value.trim().toLowerCase();
      renderTopicList();
    });
    el.playPause.addEventListener("click", toggleRunning);
    el.resetScene.addEventListener("click", () => {
      state.time = 0;
      invalidate();
    });
    el.stepScene.addEventListener("click", stepOnce);
    el.resetControls.addEventListener("click", () => {
      state.values = defaultsFor(currentTopic());
      state.time = 0;
      renderTopic();
    });

    // 用 ResizeObserver 感知画布尺寸变化（含侧栏折叠等非窗口缩放场景）
    if (typeof ResizeObserver === "function") {
      new ResizeObserver(invalidate).observe(el.canvas);
    }
    // 窗口缩放 / 浏览器缩放（devicePixelRatio 变化）时重绘
    root.addEventListener("resize", invalidate);

    root.addEventListener("hashchange", () => {
      const id = topicFromHash();
      if (id) selectTopic(id);
    });

    root.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return;
      if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        toggleRunning();
      } else if (event.key === "r" || event.key === "R") {
        state.time = 0;
        invalidate();
      } else if (event.key === "." || (event.key === "ArrowRight" && event.shiftKey)) {
        stepOnce();
      } else if (event.key === "/") {
        event.preventDefault();
        el.topicSearch.focus();
      }
    });

    el.topicSearch.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        el.topicSearch.value = "";
        state.query = "";
        renderTopicList();
        el.topicSearch.blur();
      } else if (event.key === "Enter") {
        const first = el.topicList.querySelector(".topic-button");
        if (first) first.click();
      }
    });
  }

  function stepOnce() {
    setRunning(false);
    state.time += STEP_SECONDS;
    invalidate();
  }

  function toggleRunning() {
    setRunning(!state.running);
  }

  function setRunning(running) {
    state.running = running;
    el.playPause.textContent = running ? "Ⅱ" : "▶";
    el.playPause.title = running ? "暂停（空格键）" : "播放（空格键）";
    el.playPause.setAttribute("aria-label", running ? "暂停" : "播放");
    el.playPause.setAttribute("aria-pressed", String(!running));
    invalidate();
  }

  function isTypingTarget(target) {
    if (!target) return false;
    return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName);
  }

  // ---------- 侧栏 ----------
  function renderDomainTabs() {
    const fragment = document.createDocumentFragment();
    domains.forEach((domain) => {
      const button = document.createElement("button");
      const active = domain === state.domain;
      button.type = "button";
      button.className = `domain-tab${active ? " active" : ""}`;
      button.textContent = domain;
      button.setAttribute("aria-pressed", String(active));
      button.addEventListener("click", () => {
        state.domain = domain;
        renderDomainTabs();
        renderTopicList();
      });
      fragment.append(button);
    });
    el.domainTabs.replaceChildren(fragment);
  }

  function topicMatches(topic) {
    const inDomain = state.domain === ALL || topic.domain === state.domain;
    if (!inDomain) return false;
    if (!state.query) return true;
    if (!topic._haystack) {
      topic._haystack = [topic.title, topic.domain, topic.summary, ...topic.tags, ...topic.formulas].join(" ").toLowerCase();
    }
    return topic._haystack.includes(state.query);
  }

  function renderTopicList() {
    const visible = topics.filter(topicMatches);
    if (!visible.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.setAttribute("role", "status");
      empty.textContent = "没有找到匹配的主题。可以试试“电场”“透镜”“动量”或“PV”。";
      el.topicList.replaceChildren(empty);
      return;
    }
    const fragment = document.createDocumentFragment();
    visible.forEach((topic) => {
      const active = topic.id === state.topicId;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `topic-button${active ? " active" : ""}`;
      if (active) button.setAttribute("aria-current", "true");
      const title = document.createElement("strong");
      title.textContent = topic.title;
      const tags = document.createElement("span");
      tags.textContent = topic.tags.slice(0, 3).join(" · ");
      button.append(title, tags);
      button.addEventListener("click", () => selectTopic(topic.id));
      fragment.append(button);
    });
    el.topicList.replaceChildren(fragment);
  }

  function selectTopic(id) {
    if (state.topicId === id || !topicById.has(id)) return;
    state.topicId = id;
    state.values = defaultsFor(topicById.get(id));
    state.time = 0;
    setRunning(true);
    renderTopicList();
    renderTopic();
    writeHash(id);
  }

  // ---------- 主面板 ----------
  function renderTopic() {
    const topic = currentTopic();
    el.domainLabel.textContent = topic.domain;
    el.topicTitle.textContent = topic.title;
    el.topicSummary.textContent = topic.summary;
    el.questionText.textContent = topic.teaching.question;
    el.observationText.textContent = topic.teaching.observation;
    el.mistakeText.textContent = topic.teaching.mistake;
    document.title = `${topic.title} · 高中物理可视化演示工具`;
    renderControls(topic);
    renderFormulas(topic);
    renderScene();
  }

  function renderControls(topic) {
    const fragment = document.createDocumentFragment();
    topic.controls.forEach((control) => {
      const id = `control-${topic.id}-${control.key}`;
      const wrap = document.createElement("div");
      wrap.className = "control";

      const header = document.createElement("div");
      header.className = "control-header";
      const labelEl = document.createElement("label");
      labelEl.htmlFor = id;
      const strong = document.createElement("strong");
      strong.textContent = control.label;
      labelEl.append(strong);
      const value = document.createElement("output");
      value.className = "value-pill";
      value.htmlFor = id;
      header.append(labelEl, value);

      let input;
      const update = () => {
        const text = controlValueLabel(control, state.values[control.key]);
        value.textContent = text;
        if (control.type !== "select") input.setAttribute("aria-valuetext", text);
      };

      if (control.type === "select") {
        input = document.createElement("select");
        input.className = "select-control";
        control.options.forEach((option) => {
          const item = document.createElement("option");
          item.value = option.value;
          item.textContent = option.label;
          input.append(item);
        });
        input.value = state.values[control.key];
        input.addEventListener("change", () => {
          state.values[control.key] = input.value;
          update();
          renderScene();
        });
      } else {
        input = document.createElement("input");
        input.type = "range";
        input.min = control.min;
        input.max = control.max;
        input.step = control.step;
        input.value = state.values[control.key];
        input.addEventListener("input", () => {
          state.values[control.key] = Number(input.value);
          update();
          renderScene();
        });
        // 双击滑块恢复该参数默认值
        input.addEventListener("dblclick", () => {
          state.values[control.key] = control.default;
          input.value = control.default;
          update();
          renderScene();
        });
      }
      input.id = id;
      update();
      wrap.append(header, input);
      fragment.append(wrap);
    });
    el.controlsPanel.replaceChildren(fragment);
  }

  function renderFormulas(topic) {
    const fragment = document.createDocumentFragment();
    topic.formulas.forEach((formula) => {
      const item = document.createElement("div");
      item.className = "formula";
      const code = document.createElement("code");
      code.textContent = formula;
      item.append(code);
      fragment.append(item);
    });
    el.formulaPanel.replaceChildren(fragment);
  }

  // ---------- 画布 ----------
  function renderScene() {
    const topic = currentTopic();
    const size = prepareCanvas();
    PV.draw.drawBackdrop(ctx, size.w, size.h);
    const result = renderers[topic.renderer](ctx, size, state.values, state.time);
    renderMetrics(result.metrics);
    if (result.caption !== state.lastCaption) {
      el.canvasCaption.textContent = result.caption;
      state.lastCaption = result.caption;
    }
    state.dirty = false;
  }

  /** 仅在数值变化时更新 DOM，避免每帧重建节点。 */
  function renderMetrics(metrics) {
    const key = metrics.map((m) => `${m.label}\u0000${m.value}`).join("\u0001");
    if (key === state.lastMetricsKey) return;
    state.lastMetricsKey = key;
    const items = el.metricsPanel.children;
    if (items.length !== metrics.length) {
      const fragment = document.createDocumentFragment();
      metrics.forEach(() => {
        const item = document.createElement("div");
        item.className = "metric";
        item.append(document.createElement("span"), document.createElement("strong"));
        fragment.append(item);
      });
      el.metricsPanel.replaceChildren(fragment);
    }
    metrics.forEach((m, i) => {
      const [labelEl, valueEl] = items[i].children;
      if (labelEl.textContent !== m.label) labelEl.textContent = m.label;
      if (valueEl.textContent !== m.value) valueEl.textContent = m.value;
    });
  }

  function tick(now) {
    const dt = Math.min((now - state.lastFrame) / 1000, 0.05);
    state.lastFrame = now;
    const topic = currentTopic();
    const animated = !staticRenderers.has(topic.renderer);
    if (state.running) state.time += dt;
    // 静态场景或暂停时，仅在需要时重绘，降低 CPU/GPU 占用
    if (state.dirty || (state.running && animated)) renderScene();
    requestAnimationFrame(tick);
  }

  function defaultsFor(topic) {
    return Object.fromEntries(topic.controls.map((control) => [control.key, control.default]));
  }

  function controlValueLabel(control, value) {
    if (control.type === "select") {
      const option = control.options.find((o) => o.value === value);
      return option ? option.label : String(value);
    }
    return `${format(value, decimalsFromStep(control.step))}${control.unit ? ` ${control.unit}` : ""}`;
  }

  function prepareCanvas() {
    const rect = el.canvas.getBoundingClientRect();
    const dpr = root.devicePixelRatio || 1;
    const width = Math.max(320, rect.width);
    const height = Math.max(360, rect.height);
    const targetWidth = Math.round(width * dpr);
    const targetHeight = Math.round(height * dpr);
    if (el.canvas.width !== targetWidth || el.canvas.height !== targetHeight) {
      el.canvas.width = targetWidth;
      el.canvas.height = targetHeight;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: width, h: height };
  }

  init();
})(window);
