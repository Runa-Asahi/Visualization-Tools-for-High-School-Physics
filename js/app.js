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
  /** 渲染器的最小设计尺寸（CSS 像素）。 */
  const DESIGN_MIN = { w: 560, h: 440 };

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
    mistakeText: $("mistakeText"),
    presetPanel: $("presetPanel"),
    presetSection: $("presetSection"),
    speedSelect: $("speedSelect"),
    themeToggle: $("themeToggle"),
    presentToggle: $("presentToggle"),
    helpButton: $("helpButton"),
    helpDialog: $("helpDialog"),
    menuToggle: $("menuToggle"),
    sidePanel: $("sidePanel"),
    drawerBackdrop: $("drawerBackdrop"),
    appShell: $("appShell")
  };
  // 内联 SVG 图标：各平台渲染一致，避免 emoji 字体差异
  const svg = (body) => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  const ICONS = {
    play: svg('<path d="M7 5v14l12-7z" fill="currentColor" stroke="none"/>'),
    pause: svg('<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/>'),
    reset: svg('<path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v4h4"/>'),
    step: svg('<path d="M6 5v14l9-7z" fill="currentColor" stroke="none"/><path d="M18 5v14"/>'),
    auto: svg('<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none"/>'),
    light: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    dark: svg('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
    enter: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    exit: svg('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'),
    help: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>'),
    menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    close: svg('<path d="M6 6l12 12M18 6L6 18"/>')
  };
  const SPEEDS = [0.25, 0.5, 1, 1.5, 2];
  const THEME_ORDER = ["auto", "light", "dark"];
  const THEME_LABEL = { auto: "跟随系统", light: "浅色", dark: "深色" };

  // localStorage 在部分浏览器的 file:// 或隐私模式下不可用，统一做容错
  const storage = {
    get(key, fallback) {
      try {
        const v = root.localStorage.getItem(key);
        return v === null ? fallback : v;
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        root.localStorage.setItem(key, value);
      } catch (error) {
        /* ignore */
      }
    }
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
    speed: 1,
    themePref: storage.get("pv-theme", "auto"),
    presenting: false,
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
    el.resetScene.innerHTML = ICONS.reset;
    el.stepScene.innerHTML = ICONS.step;
    el.presentToggle.innerHTML = ICONS.enter;
    el.helpButton.innerHTML = ICONS.help;
    el.menuToggle.innerHTML = ICONS.menu;
    document.querySelectorAll(".help-header .icon-button").forEach((b) => (b.innerHTML = ICONS.close));
    applyTheme();
    setRunning(state.running);
    renderDomainTabs();
    renderTopicList();
    renderTopic();
    bindEvents();
    requestAnimationFrame(tick);
    // 首次访问时显示一次引导 / show onboarding once
    if (storage.get("pv-onboarded", "") !== "1") {
      storage.set("pv-onboarded", "1");
      openHelp();
    }
  }

  // ---------- 主题 / theme ----------
  function systemPrefersDark() {
    return !!(root.matchMedia && root.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function applyTheme() {
    const dark = state.themePref === "dark" || (state.themePref === "auto" && systemPrefersDark());
    const theme = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    PV.setTheme(theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0c171d" : "#12373f");
    const text = `主题：${THEME_LABEL[state.themePref]}（T 切换）`;
    el.themeToggle.title = text;
    el.themeToggle.setAttribute("aria-label", text);
    el.themeToggle.innerHTML = ICONS[state.themePref];
    invalidate();
  }

  function cycleTheme() {
    state.themePref = THEME_ORDER[(THEME_ORDER.indexOf(state.themePref) + 1) % THEME_ORDER.length];
    storage.set("pv-theme", state.themePref);
    applyTheme();
    toast(`主题：${THEME_LABEL[state.themePref]}`);
  }

  // ---------- 播放速度 ----------
  function setSpeed(speed) {
    state.speed = speed;
    el.speedSelect.value = String(speed);
  }

  function nudgeSpeed(direction) {
    const i = SPEEDS.indexOf(state.speed);
    const next = SPEEDS[Math.max(0, Math.min(SPEEDS.length - 1, (i < 0 ? 2 : i) + direction))];
    setSpeed(next);
    toast(`播放速度 ${next}×`);
  }

  // ---------- 演示模式 / presentation mode ----------
  function setPresenting(on) {
    state.presenting = on;
    document.body.classList.toggle("presenting", on);
    el.presentToggle.setAttribute("aria-pressed", String(on));
    el.presentToggle.setAttribute("aria-label", on ? "退出演示模式" : "进入演示模式");
    el.presentToggle.innerHTML = on ? ICONS.exit : ICONS.enter;
    const doc = document;
    try {
      if (on && !doc.fullscreenElement && doc.documentElement.requestFullscreen) {
        doc.documentElement.requestFullscreen().catch(() => {});
      } else if (!on && doc.fullscreenElement && doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
      }
    } catch (error) {
      /* 全屏不可用时仍保留演示布局 */
    }
    invalidate();
  }

  // ---------- 帮助 ----------
  function openHelp() {
    const dialog = el.helpDialog;
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  // ---------- 侧栏抽屉（窄屏） ----------
  function setDrawer(open) {
    el.appShell.classList.toggle("drawer-open", open);
    el.drawerBackdrop.hidden = !open;
    el.menuToggle.setAttribute("aria-expanded", String(open));
    el.menuToggle.setAttribute("aria-label", open ? "关闭主题列表" : "打开主题列表");
    if (open) el.topicSearch.focus({ preventScroll: true });
  }

  // ---------- 轻提示 ----------
  let toastTimer = 0;
  function toast(message) {
    let node = document.getElementById("toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "toast";
      node.className = "toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    node.textContent = message;
    node.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("visible"), 1400);
  }

  function selectAdjacentTopic(direction) {
    const list = topics.filter(topicMatches);
    const pool = list.length ? list : topics;
    const i = pool.findIndex((t) => t.id === state.topicId);
    const next = pool[(i + direction + pool.length) % pool.length];
    selectTopic(next.id);
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

    el.speedSelect.addEventListener("change", () => setSpeed(Number(el.speedSelect.value)));
    el.themeToggle.addEventListener("click", cycleTheme);
    el.presentToggle.addEventListener("click", () => setPresenting(!state.presenting));
    el.helpButton.addEventListener("click", openHelp);
    el.menuToggle.addEventListener("click", () => setDrawer(!el.appShell.classList.contains("drawer-open")));
    el.drawerBackdrop.addEventListener("click", () => setDrawer(false));
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement && state.presenting) setPresenting(false);
    });
    if (root.matchMedia) {
      const mq = root.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => state.themePref === "auto" && applyTheme();
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
    // 点击画布切换播放/暂停（触屏友好）
    el.canvas.addEventListener("click", toggleRunning);

    root.addEventListener("hashchange", () => {
      const id = topicFromHash();
      if (id) selectTopic(id);
    });

    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && el.appShell.classList.contains("drawer-open")) {
        setDrawer(false);
        return;
      }
      if (event.altKey && !event.ctrlKey && !event.metaKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        selectAdjacentTopic(event.key === "ArrowRight" ? 1 : -1);
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return;
      // 焦点在按钮上时，空格/回车交给按钮本身；字母快捷键仍然可用
      if (el.helpDialog && el.helpDialog.open) return;
      if (event.key === "Escape" && state.presenting) {
        setPresenting(false);
      } else if (event.key === "f" || event.key === "F") {
        setPresenting(!state.presenting);
      } else if (event.key === "t" || event.key === "T") {
        cycleTheme();
      } else if (event.key === "?") {
        openHelp();
      } else if (event.key === "[") {
        nudgeSpeed(-1);
      } else if (event.key === "]") {
        nudgeSpeed(1);
      } else if (event.code === "Space" && !event.repeat && event.target.tagName !== "BUTTON") {
        event.preventDefault();
        toggleRunning();
      } else if (event.key === "r" || event.key === "R") {
        state.time = 0;
        invalidate();
      } else if (event.key === "." || (event.key === "ArrowRight" && event.shiftKey && event.target.tagName !== "INPUT")) {
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
    el.playPause.innerHTML = running ? ICONS.pause : ICONS.play;
    el.playPause.title = running ? "暂停（空格键）" : "播放（空格键）";
    el.playPause.setAttribute("aria-label", running ? "暂停" : "播放");
    el.playPause.setAttribute("aria-pressed", String(!running));
    invalidate();
  }

  function isTypingTarget(target) {
    if (!target) return false;
    if (target.isContentEditable || ["TEXTAREA", "SELECT"].includes(target.tagName)) return true;
    // 滑块仍允许字母快捷键（方向键由滑块自身处理）
    if (target.tagName === "INPUT") return !["range", "button", "checkbox", "radio"].includes(target.type);
    return false;
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
    if (el.appShell.classList.contains("drawer-open")) setDrawer(false);
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
    renderPresets(topic);
    renderControls(topic);
    renderFormulas(topic);
    markActivePreset();
    renderScene();
  }

  const controlInputs = new Map();

  function renderPresets(topic) {
    const presets = topic.presets || [];
    el.presetSection.hidden = presets.length === 0;
    const fragment = document.createDocumentFragment();
    presets.forEach((preset, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preset-chip";
      button.textContent = preset.label;
      button.dataset.index = String(index);
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => applyPreset(topic, preset));
      fragment.append(button);
    });
    el.presetPanel.replaceChildren(fragment);
  }

  function applyPreset(topic, preset) {
    state.values = { ...defaultsFor(topic), ...preset.values };
    state.time = 0;
    controlInputs.forEach(({ input, update }, key) => {
      input.value = state.values[key];
      update();
    });
    markActivePreset();
    renderScene();
  }

  /** 高亮与当前参数完全一致的预设。 */
  function markActivePreset() {
    const topic = currentTopic();
    const defaults = defaultsFor(topic);
    el.presetPanel.querySelectorAll(".preset-chip").forEach((chip) => {
      const preset = topic.presets[Number(chip.dataset.index)];
      const target = { ...defaults, ...preset.values };
      const active = Object.keys(target).every((k) => target[k] === state.values[k]);
      chip.classList.toggle("active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
  }

  function renderControls(topic) {
    controlInputs.clear();
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
          markActivePreset();
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
          markActivePreset();
        });
        // 双击滑块恢复该参数默认值
        input.addEventListener("dblclick", () => {
          state.values[control.key] = control.default;
          input.value = control.default;
          update();
          renderScene();
          markActivePreset();
        });
      }
      input.id = id;
      update();
      if (control.type === "select") {
        wrap.append(header, input);
      } else {
        // − / + 微调按钮，触屏上比拖动更精确
        const row = document.createElement("div");
        row.className = "range-row";
        const stepBy = (direction) => {
          const decimals = decimalsFromStep(control.step);
          const next = Math.min(control.max, Math.max(control.min, state.values[control.key] + direction * control.step));
          state.values[control.key] = Number(next.toFixed(decimals));
          input.value = state.values[control.key];
          update();
          renderScene();
          markActivePreset();
        };
        const makeStep = (text, direction, aria) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "step-button";
          button.textContent = text;
          button.setAttribute("aria-label", `${control.label}${aria}`);
          button.addEventListener("click", () => stepBy(direction));
          return button;
        };
        row.append(makeStep("−", -1, "减小"), input, makeStep("+", 1, "增大"));
        wrap.append(header, row);
      }
      controlInputs.set(control.key, { input, update });
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
    // 画布较小时（短屏 / 手机）按设计最小尺寸整体等比缩放，避免固定像素布局互相重叠
    const k = Math.min(1, size.w / DESIGN_MIN.w, size.h / DESIGN_MIN.h);
    const logical = { w: size.w / k, h: size.h / k };
    if (k < 1) ctx.scale(k, k);
    PV.draw.drawBackdrop(ctx, logical.w, logical.h);
    const result = renderers[topic.renderer](ctx, logical, state.values, state.time);
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
    if (state.running) state.time += dt * state.speed;
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
    const width = Math.max(240, rect.width);
    const height = Math.max(220, rect.height);
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
