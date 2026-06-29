const domains = ["全部", "力学", "电磁学", "波动与光学", "热学", "近代物理"];

const topics = [
  {
    id: "projectile",
    domain: "力学",
    title: "平抛与斜抛运动",
    summary: "把运动拆成水平方向的匀速直线运动和竖直方向的匀变速运动，直观看到速度分解、轨迹和落点。",
    tags: ["运动的合成与分解", "匀变速直线运动", "机械能"],
    renderer: "projectile",
    controls: [
      { key: "speed", label: "初速度", min: 6, max: 38, step: 1, default: 22, unit: "m/s" },
      { key: "angle", label: "抛射角", min: 0, max: 70, step: 1, default: 32, unit: "°" },
      { key: "height", label: "初始高度", min: 0, max: 12, step: 0.5, default: 3, unit: "m" },
      { key: "gravity", label: "重力加速度", min: 1.6, max: 12, step: 0.1, default: 9.8, unit: "m/s²" }
    ],
    formulas: [
      "x = v₀cosθ · t",
      "y = h + v₀sinθ · t - 1/2gt²",
      "vᵧ = v₀sinθ - gt"
    ],
    teaching: {
      question: "若只增大初速度，水平位移和最高点会怎样变化？若只改变重力加速度呢？",
      observation: "观察横向速度始终不变，竖直速度线性减小再反向增大。",
      mistake: "不要把轨迹弯曲理解成水平方向存在力；忽略空气阻力时水平方向没有加速度。"
    }
  },
  {
    id: "circular",
    domain: "力学",
    title: "匀速圆周运动",
    summary: "展示速度方向不断改变而速率不变的运动，突出向心加速度、向心力和周期之间的关系。",
    tags: ["向心力", "角速度", "周期", "线速度"],
    renderer: "circular",
    controls: [
      { key: "radius", label: "半径", min: 1, max: 6, step: 0.1, default: 3.2, unit: "m" },
      { key: "speed", label: "线速度", min: 1, max: 14, step: 0.2, default: 6, unit: "m/s" },
      { key: "mass", label: "质量", min: 0.2, max: 5, step: 0.1, default: 1.2, unit: "kg" }
    ],
    formulas: [
      "ω = v / r",
      "aₙ = v² / r = ω²r",
      "Fₙ = maₙ"
    ],
    teaching: {
      question: "半径不变时速度加倍，向心力会变成几倍？",
      observation: "速度箭头沿切线，向心加速度永远指向圆心。",
      mistake: "匀速圆周运动不是加速度为零；速度方向改变就意味着有加速度。"
    }
  },
  {
    id: "shm",
    domain: "力学",
    title: "弹簧振子与简谐运动",
    summary: "将弹簧振子的往复运动、位移时间图像和能量变化放在同一画面，帮助理解回复力。",
    tags: ["简谐运动", "回复力", "周期", "能量守恒"],
    renderer: "shm",
    controls: [
      { key: "amplitude", label: "振幅", min: 2, max: 14, step: 0.5, default: 8, unit: "cm" },
      { key: "omega", label: "角频率", min: 0.8, max: 5.5, step: 0.1, default: 2.4, unit: "rad/s" },
      { key: "mass", label: "质量", min: 0.2, max: 3, step: 0.1, default: 1, unit: "kg" }
    ],
    formulas: [
      "x = Acos(ωt + φ)",
      "v = -Aωsin(ωt + φ)",
      "a = -ω²x"
    ],
    teaching: {
      question: "振子经过平衡位置时，哪些物理量最大？在端点又有什么不同？",
      observation: "位移越大，回复力和加速度越大；速度在平衡位置最大。",
      mistake: "回复力方向总是指向平衡位置，不是总和运动方向相同。"
    }
  },
  {
    id: "collision",
    domain: "力学",
    title: "动量守恒与碰撞",
    summary: "用两辆小车演示弹性、非弹性碰撞，比较碰撞前后的动量与动能。",
    tags: ["动量守恒", "机械能", "碰撞", "反冲"],
    renderer: "collision",
    controls: [
      { key: "m1", label: "左车质量", min: 0.5, max: 5, step: 0.1, default: 1.4, unit: "kg" },
      { key: "m2", label: "右车质量", min: 0.5, max: 5, step: 0.1, default: 2, unit: "kg" },
      { key: "v1", label: "左车初速度", min: 0.5, max: 6, step: 0.1, default: 4, unit: "m/s" },
      { key: "v2", label: "右车初速度", min: -5, max: 1, step: 0.1, default: -1.6, unit: "m/s" },
      { key: "e", label: "恢复系数", min: 0, max: 1, step: 0.05, default: 0.85, unit: "" }
    ],
    formulas: [
      "m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'",
      "e = (v₂' - v₁') / (v₁ - v₂)",
      "完全弹性碰撞中机械能也守恒"
    ],
    teaching: {
      question: "当恢复系数从 1 调到 0，动量和动能的变化有什么差别？",
      observation: "系统总动量守恒，但动能是否守恒取决于碰撞类型。",
      mistake: "动量守恒不是说每个物体动量都不变，而是系统总动量不变。"
    }
  },
  {
    id: "electric-field",
    domain: "电磁学",
    title: "点电荷电场",
    summary: "用矢量场展示正负点电荷周围电场的方向和强弱，看到叠加原理如何形成合电场。",
    tags: ["库仑定律", "电场强度", "场强叠加", "电势"],
    renderer: "electricField",
    controls: [
      { key: "q1", label: "左电荷", min: -6, max: 6, step: 0.5, default: 4, unit: "μC" },
      { key: "q2", label: "右电荷", min: -6, max: 6, step: 0.5, default: -4, unit: "μC" },
      { key: "distance", label: "电荷间距", min: 2, max: 9, step: 0.2, default: 5.2, unit: "m" },
      { key: "probeX", label: "探针横坐标", min: -5, max: 5, step: 0.2, default: 0, unit: "m" },
      { key: "probeY", label: "探针纵坐标", min: -3, max: 3, step: 0.2, default: 1.2, unit: "m" }
    ],
    formulas: [
      "E = kQ / r²",
      "F = qE",
      "合场强遵循矢量叠加"
    ],
    teaching: {
      question: "把两个电荷都改成正电后，中点附近的场强会怎样？",
      observation: "电场线从正电荷出发，指向负电荷；合场强要按矢量相加。",
      mistake: "场强方向指的是正试探电荷受力方向，不是负电荷受力方向。"
    }
  },
  {
    id: "circuit",
    domain: "电磁学",
    title: "欧姆定律与串并联电路",
    summary: "切换串联和并联，观察等效电阻、电流、分压分流和功率的实时变化。",
    tags: ["欧姆定律", "电功率", "串联", "并联"],
    renderer: "circuit",
    controls: [
      { key: "mode", label: "连接方式", type: "select", default: "series", options: [
        { value: "series", label: "串联" },
        { value: "parallel", label: "并联" }
      ] },
      { key: "voltage", label: "电源电压", min: 1, max: 24, step: 0.5, default: 12, unit: "V" },
      { key: "r1", label: "电阻 R₁", min: 1, max: 60, step: 1, default: 18, unit: "Ω" },
      { key: "r2", label: "电阻 R₂", min: 1, max: 60, step: 1, default: 30, unit: "Ω" }
    ],
    formulas: [
      "I = U / R",
      "串联：R = R₁ + R₂，电流相等",
      "并联：1/R = 1/R₁ + 1/R₂，电压相等"
    ],
    teaching: {
      question: "为什么并联增加支路后，总电阻反而减小？",
      observation: "串联看分压，并联看分流；功率等于 UI。",
      mistake: "不要把串联的分压规律套到并联电路中。"
    }
  },
  {
    id: "induction",
    domain: "电磁学",
    title: "电磁感应与交流电",
    summary: "旋转线圈切割磁感线，展示磁通量、感应电动势和交流电图像之间的关系。",
    tags: ["法拉第电磁感应", "楞次定律", "交流电", "磁通量"],
    renderer: "induction",
    controls: [
      { key: "turns", label: "线圈匝数", min: 1, max: 80, step: 1, default: 30, unit: "匝" },
      { key: "field", label: "磁感应强度", min: 0.1, max: 1.8, step: 0.1, default: 0.8, unit: "T" },
      { key: "area", label: "线圈面积", min: 0.02, max: 0.4, step: 0.01, default: 0.16, unit: "m²" },
      { key: "omega", label: "角速度", min: 0.5, max: 8, step: 0.1, default: 2.8, unit: "rad/s" }
    ],
    formulas: [
      "Φ = BAcos(ωt)",
      "ε = -N · ΔΦ/Δt",
      "ε = NBAωsin(ωt)"
    ],
    teaching: {
      question: "为什么磁通量最大时，感应电动势反而为零？",
      observation: "感应电动势取决于磁通量变化快慢，而不是磁通量本身大小。",
      mistake: "楞次定律判断的是感应电流磁场对磁通量变化的阻碍方向。"
    }
  },
  {
    id: "interference",
    domain: "波动与光学",
    title: "双源波的干涉",
    summary: "从两个相干波源发出的圆形波叠加，形成稳定的加强区和减弱区。",
    tags: ["波的叠加", "干涉", "波长", "相位差"],
    renderer: "interference",
    controls: [
      { key: "wavelength", label: "波长", min: 24, max: 96, step: 2, default: 54, unit: "px" },
      { key: "separation", label: "双源间距", min: 80, max: 300, step: 5, default: 170, unit: "px" },
      { key: "phase", label: "相位差", min: 0, max: 180, step: 5, default: 0, unit: "°" },
      { key: "amplitude", label: "振幅", min: 0.4, max: 1.8, step: 0.1, default: 1, unit: "" }
    ],
    formulas: [
      "y = y₁ + y₂",
      "波程差 Δr = nλ 时加强",
      "波程差 Δr = (n + 1/2)λ 时减弱"
    ],
    teaching: {
      question: "当两个波源反相时，原来中央加强线会变成什么？",
      observation: "亮暗区域来自波程差，不是某个波源单独造成的。",
      mistake: "干涉图样稳定需要频率相同且相位差恒定。"
    }
  },
  {
    id: "lens",
    domain: "波动与光学",
    title: "凸透镜成像",
    summary: "拖动物距和焦距，演示实像、虚像、倒立、放大缩小以及三条特殊光线。",
    tags: ["透镜成像", "焦距", "实像", "虚像", "放大率"],
    renderer: "lens",
    controls: [
      { key: "focal", label: "焦距", min: 6, max: 32, step: 1, default: 16, unit: "cm" },
      { key: "object", label: "物距", min: 7, max: 70, step: 1, default: 42, unit: "cm" },
      { key: "height", label: "物高", min: 2, max: 12, step: 0.5, default: 7, unit: "cm" }
    ],
    formulas: [
      "1/f = 1/u + 1/v",
      "m = -v/u",
      "像高 h' = mh"
    ],
    teaching: {
      question: "物体靠近焦点时，像距和放大率为什么会急剧变化？",
      observation: "u > f 时成实像，u < f 时成正立放大的虚像。",
      mistake: "虚像不是没有像，而是不能用光屏承接。"
    }
  },
  {
    id: "refraction",
    domain: "波动与光学",
    title: "折射定律与全反射",
    summary: "改变介质折射率和入射角，观察折射角、反射光线以及全反射条件。",
    tags: ["光的折射", "斯涅尔定律", "临界角", "全反射"],
    renderer: "refraction",
    controls: [
      { key: "n1", label: "上方介质折射率", min: 1, max: 2.4, step: 0.05, default: 1, unit: "" },
      { key: "n2", label: "下方介质折射率", min: 1, max: 2.4, step: 0.05, default: 1.5, unit: "" },
      { key: "angle", label: "入射角", min: 0, max: 82, step: 1, default: 42, unit: "°" }
    ],
    formulas: [
      "n₁sin i = n₂sin r",
      "从光密到光疏时可能发生全反射",
      "sin C = n₂ / n₁"
    ],
    teaching: {
      question: "光从水进入空气时，为什么入射角足够大就没有折射光？",
      observation: "向高折射率介质传播时，光线向法线偏折。",
      mistake: "入射角、折射角都是相对法线测量，不是相对界面测量。"
    }
  },
  {
    id: "gas",
    domain: "热学",
    title: "理想气体状态方程",
    summary: "用活塞和分子运动演示温度、体积、物质的量与压强之间的定量关系。",
    tags: ["分子动理论", "压强", "温度", "PV=nRT"],
    renderer: "gas",
    controls: [
      { key: "temperature", label: "温度", min: 180, max: 620, step: 10, default: 300, unit: "K" },
      { key: "volume", label: "体积", min: 4, max: 26, step: 0.5, default: 12, unit: "L" },
      { key: "amount", label: "物质的量", min: 0.2, max: 3, step: 0.1, default: 1, unit: "mol" }
    ],
    formulas: [
      "PV = nRT",
      "T 越高，分子平均动能越大",
      "等温过程：PV = 常量"
    ],
    teaching: {
      question: "保持温度不变压缩气体，压强为什么会增大？",
      observation: "体积减小或温度升高都会让单位面积受撞击更频繁或更强。",
      mistake: "摄氏温度不能直接代入 PV=nRT，必须使用热力学温度 K。"
    }
  },
  {
    id: "photoelectric",
    domain: "近代物理",
    title: "光电效应",
    summary: "改变入射光频率、逸出功和强度，观察是否产生光电子以及最大初动能。",
    tags: ["光子", "逸出功", "截止频率", "爱因斯坦光电方程"],
    renderer: "photoelectric",
    controls: [
      { key: "frequency", label: "光频率", min: 3, max: 15, step: 0.2, default: 8, unit: "×10¹⁴ Hz" },
      { key: "work", label: "逸出功", min: 1.2, max: 5.2, step: 0.1, default: 2.3, unit: "eV" },
      { key: "intensity", label: "光强", min: 1, max: 10, step: 1, default: 5, unit: "级" }
    ],
    formulas: [
      "E = hf",
      "hf = W₀ + Eₖmax",
      "eUₛ = Eₖmax"
    ],
    teaching: {
      question: "频率低于截止频率时，为什么增大光强也不能打出电子？",
      observation: "光强影响光电子数量，频率决定单个光子的能量。",
      mistake: "光电效应不能用单纯的波动能量连续积累解释。"
    }
  }
];

const topicById = new Map(topics.map((topic) => [topic.id, topic]));

const state = {
  topicId: topics[0].id,
  values: {},
  running: true,
  time: 0,
  lastFrame: performance.now(),
  domain: "全部",
  query: ""
};

const canvas = document.getElementById("physicsCanvas");
const ctx = canvas.getContext("2d");
const topicSearch = document.getElementById("topicSearch");
const domainTabs = document.getElementById("domainTabs");
const topicList = document.getElementById("topicList");
const domainLabel = document.getElementById("domainLabel");
const topicTitle = document.getElementById("topicTitle");
const topicSummary = document.getElementById("topicSummary");
const playPause = document.getElementById("playPause");
const resetScene = document.getElementById("resetScene");
const stepScene = document.getElementById("stepScene");
const resetControls = document.getElementById("resetControls");
const controlsPanel = document.getElementById("controlsPanel");
const metricsPanel = document.getElementById("metricsPanel");
const formulaPanel = document.getElementById("formulaPanel");
const canvasCaption = document.getElementById("canvasCaption");
const questionText = document.getElementById("questionText");
const observationText = document.getElementById("observationText");
const mistakeText = document.getElementById("mistakeText");

function init() {
  state.values = defaultsFor(topicById.get(state.topicId));
  setRunning(state.running);
  renderDomainTabs();
  renderTopicList();
  renderTopic();
  bindEvents();
  requestAnimationFrame(tick);
}

function bindEvents() {
  topicSearch.addEventListener("input", () => {
    state.query = topicSearch.value.trim().toLowerCase();
    renderTopicList();
  });

  playPause.addEventListener("click", () => {
    toggleRunning();
  });

  resetScene.addEventListener("click", () => {
    state.time = 0;
    renderScene();
  });

  stepScene.addEventListener("click", () => {
    setRunning(false);
    state.time += 1 / 24;
    renderScene();
  });

  resetControls.addEventListener("click", () => {
    state.values = defaultsFor(topicById.get(state.topicId));
    state.time = 0;
    renderTopic();
  });

  window.addEventListener("resize", renderScene);

  window.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || event.repeat || isTypingTarget(event.target)) return;
    event.preventDefault();
    toggleRunning();
  });
}

function toggleRunning() {
  setRunning(!state.running);
}

function setRunning(running) {
  state.running = running;
  playPause.textContent = running ? "Ⅱ" : "▶";
  playPause.title = running ? "暂停（空格键）" : "播放（空格键）";
  playPause.setAttribute("aria-label", running ? "暂停" : "播放");
}

function isTypingTarget(target) {
  const tagName = target?.tagName;
  return target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(tagName);
}

function renderDomainTabs() {
  domainTabs.innerHTML = "";
  domains.forEach((domain) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `domain-tab${domain === state.domain ? " active" : ""}`;
    button.textContent = domain;
    button.addEventListener("click", () => {
      state.domain = domain;
      renderDomainTabs();
      renderTopicList();
    });
    domainTabs.append(button);
  });
}

function renderTopicList() {
  topicList.innerHTML = "";
  const visibleTopics = topics.filter((topic) => {
    const inDomain = state.domain === "全部" || topic.domain === state.domain;
    const haystack = `${topic.title} ${topic.summary} ${topic.tags.join(" ")} ${topic.formulas.join(" ")}`.toLowerCase();
    return inDomain && (!state.query || haystack.includes(state.query));
  });

  if (!visibleTopics.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "没有找到匹配的主题。可以试试“电场”“透镜”“动量”或“PV”。";
    topicList.append(empty);
    return;
  }

  visibleTopics.forEach((topic) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `topic-button${topic.id === state.topicId ? " active" : ""}`;
    button.innerHTML = `<strong>${topic.title}</strong><span>${topic.tags.slice(0, 3).join(" · ")}</span>`;
    button.addEventListener("click", () => selectTopic(topic.id));
    topicList.append(button);
  });
}

function selectTopic(id) {
  if (state.topicId === id) return;
  state.topicId = id;
  state.values = defaultsFor(topicById.get(id));
  state.time = 0;
  setRunning(true);
  renderTopicList();
  renderTopic();
}

function renderTopic() {
  const topic = topicById.get(state.topicId);
  domainLabel.textContent = topic.domain;
  topicTitle.textContent = topic.title;
  topicSummary.textContent = topic.summary;
  questionText.textContent = topic.teaching.question;
  observationText.textContent = topic.teaching.observation;
  mistakeText.textContent = topic.teaching.mistake;
  renderControls(topic);
  renderFormulas(topic);
  renderScene();
}

function renderControls(topic) {
  controlsPanel.innerHTML = "";
  topic.controls.forEach((control) => {
    const wrap = document.createElement("label");
    wrap.className = "control";

    const header = document.createElement("div");
    header.className = "control-header";
    const label = document.createElement("strong");
    label.textContent = control.label;
    const value = document.createElement("span");
    value.className = "value-pill";
    value.textContent = controlValueLabel(control, state.values[control.key]);
    header.append(label, value);

    let input;
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
        value.textContent = controlValueLabel(control, input.value);
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
        value.textContent = controlValueLabel(control, state.values[control.key]);
        renderScene();
      });
    }

    wrap.append(header, input);
    controlsPanel.append(wrap);
  });
}

function renderFormulas(topic) {
  formulaPanel.innerHTML = "";
  topic.formulas.forEach((formula) => {
    const item = document.createElement("div");
    item.className = "formula";
    item.innerHTML = `<code>${formula}</code>`;
    formulaPanel.append(item);
  });
}

function renderScene() {
  const topic = topicById.get(state.topicId);
  const size = prepareCanvas();
  ctx.clearRect(0, 0, size.w, size.h);
  drawBackdrop(ctx, size.w, size.h);
  const result = renderers[topic.renderer](ctx, size, state.values, state.time);
  renderMetrics(result.metrics);
  canvasCaption.textContent = result.caption;
}

function renderMetrics(metrics) {
  metricsPanel.innerHTML = "";
  metrics.forEach((metric) => {
    const item = document.createElement("div");
    item.className = "metric";
    item.innerHTML = `<span>${metric.label}</span><strong>${metric.value}</strong>`;
    metricsPanel.append(item);
  });
}

function tick(now) {
  const dt = Math.min((now - state.lastFrame) / 1000, 0.05);
  state.lastFrame = now;
  if (state.running) {
    state.time += dt;
  }
  renderScene();
  requestAnimationFrame(tick);
}

function defaultsFor(topic) {
  return Object.fromEntries(topic.controls.map((control) => [control.key, control.default]));
}

function controlValueLabel(control, value) {
  if (control.type === "select") {
    return control.options.find((option) => option.value === value)?.label ?? value;
  }
  const decimals = decimalsFromStep(control.step);
  return `${format(value, decimals)}${control.unit ? ` ${control.unit}` : ""}`;
}

function decimalsFromStep(step) {
  const text = String(step);
  return text.includes(".") ? text.split(".")[1].length : 0;
}

function prepareCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(320, rect.width);
  const height = Math.max(360, rect.height);
  const targetWidth = Math.round(width * dpr);
  const targetHeight = Math.round(height * dpr);
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w: width, h: height };
}

function drawBackdrop(context, w, h) {
  const gradient = context.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(1, "#edf7f8");
  context.fillStyle = gradient;
  context.fillRect(0, 0, w, h);

  context.save();
  context.strokeStyle = "rgba(50, 105, 200, 0.08)";
  context.lineWidth = 1;
  for (let x = 0; x <= w; x += 40) {
    line(context, x, 0, x, h);
  }
  for (let y = 0; y <= h; y += 40) {
    line(context, 0, y, w, y);
  }
  context.restore();
}

const renderers = {
  projectile(ctx, size, v, t) {
    const w = size.w;
    const h = size.h;
    const g = v.gravity;
    const angle = toRad(v.angle);
    const vx = v.speed * Math.cos(angle);
    const vy0 = v.speed * Math.sin(angle);
    const flight = (vy0 + Math.sqrt(vy0 * vy0 + 2 * g * v.height)) / g;
    const maxHeight = v.height + (vy0 > 0 ? (vy0 * vy0) / (2 * g) : 0);
    const range = vx * flight;
    const simT = flight > 0 ? t % flight : 0;
    const x = vx * simT;
    const y = v.height + vy0 * simT - 0.5 * g * simT * simT;
    const vy = vy0 - g * simT;
    const groundY = h - 88;
    const origin = { x: 72, y: groundY - v.height * 14 };
    const scaleX = (w - 150) / Math.max(range * 1.08, 18);
    const scaleY = (h - 170) / Math.max(maxHeight + 3, 8);
    const scale = Math.min(scaleX, scaleY);

    ctx.save();
    drawGround(ctx, 44, groundY, w - 88);
    drawAxisLabel(ctx, "x", w - 54, groundY + 28);
    drawAxisLabel(ctx, "y", 52, 56);

    ctx.strokeStyle = "#3269c8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 120; i += 1) {
      const pt = (flight * i) / 120;
      const px = origin.x + vx * pt * scale;
      const py = groundY - (v.height + vy0 * pt - 0.5 * g * pt * pt) * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    const ballX = origin.x + x * scale;
    const ballY = groundY - y * scale;
    drawVector(ctx, ballX, ballY, ballX + vx * 3, ballY, "#007f8f", "vₓ");
    drawVector(ctx, ballX, ballY, ballX, ballY - vy * 3, "#db4c40", "vᵧ");
    drawVector(ctx, ballX, ballY, ballX + vx * 2.2, ballY - vy * 2.2, "#17212b", "v");
    drawVector(ctx, ballX, ballY, ballX, ballY + 56, "#e2a500", "g");
    drawBall(ctx, ballX, ballY, 13, "#db4c40");

    ctx.fillStyle = "rgba(0, 127, 143, 0.14)";
    ctx.fillRect(origin.x - 2, groundY - v.height * scale, 4, v.height * scale);
    label(ctx, "起点", origin.x - 20, groundY - v.height * scale - 18, "#17212b");
    label(ctx, `落点约 ${format(range, 1)} m`, origin.x + range * scale - 58, groundY + 44, "#17212b");
    ctx.restore();

    return {
      caption: "轨迹由横向匀速和竖直匀变速叠加得到；调节角度时，注意水平速度与竖直初速度同时改变。",
      metrics: [
        { label: "当前时间", value: `${format(simT, 2)} s` },
        { label: "水平位移", value: `${format(x, 2)} m` },
        { label: "竖直高度", value: `${format(Math.max(y, 0), 2)} m` },
        { label: "落点距离", value: `${format(range, 2)} m` },
        { label: "最高点", value: `${format(maxHeight, 2)} m` },
        { label: "当前 vᵧ", value: `${format(vy, 2)} m/s` }
      ]
    };
  },

  circular(ctx, size, v, t) {
    const w = size.w;
    const h = size.h;
    const center = { x: w * 0.5, y: h * 0.48 };
    const r = Math.min(w, h) * 0.26;
    const omega = v.speed / v.radius;
    const theta = omega * t;
    const px = center.x + r * Math.cos(theta);
    const py = center.y + r * Math.sin(theta);
    const tangent = theta + Math.PI / 2;
    const accel = (v.speed * v.speed) / v.radius;
    const force = v.mass * accel;
    const period = (2 * Math.PI) / omega;

    ctx.save();
    ctx.strokeStyle = "rgba(50, 105, 200, 0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
    ctx.stroke();
    dashedLine(ctx, center.x, center.y, px, py, "#627184");
    drawBall(ctx, center.x, center.y, 5, "#17212b");
    drawBall(ctx, px, py, 15, "#db4c40");
    drawVector(ctx, px, py, px + Math.cos(tangent) * 88, py + Math.sin(tangent) * 88, "#007f8f", "v");
    drawVector(ctx, px, py, px + Math.cos(theta + Math.PI) * 96, py + Math.sin(theta + Math.PI) * 96, "#e2a500", "aₙ");
    drawVector(ctx, px, py, px + Math.cos(theta + Math.PI) * 55, py + Math.sin(theta + Math.PI) * 55, "#db4c40", "Fₙ");
    label(ctx, `r = ${format(v.radius, 1)} m`, (center.x + px) / 2 + 8, (center.y + py) / 2, "#17212b");
    ctx.restore();

    return {
      caption: "速率不变并不等于速度不变；速度方向持续转动，所以向心加速度始终存在。",
      metrics: [
        { label: "角速度 ω", value: `${format(omega, 2)} rad/s` },
        { label: "周期 T", value: `${format(period, 2)} s` },
        { label: "向心加速度", value: `${format(accel, 2)} m/s²` },
        { label: "向心力", value: `${format(force, 2)} N` }
      ]
    };
  },

  shm(ctx, size, v, t) {
    const w = size.w;
    const h = size.h;
    const baseY = h * 0.42;
    const wallX = 80;
    const eqX = w * 0.43;
    const pxPerCm = Math.min(16, w / 64);
    const xCm = v.amplitude * Math.cos(v.omega * t);
    const velocity = -v.amplitude * v.omega * Math.sin(v.omega * t);
    const acceleration = -v.omega * v.omega * xCm;
    const massX = eqX + xCm * pxPerCm;
    const springEndX = massX - 42;
    const period = (2 * Math.PI) / v.omega;
    const k = v.mass * v.omega * v.omega;
    const totalEnergy = 0.5 * k * Math.pow(v.amplitude / 100, 2);

    ctx.save();
    ctx.fillStyle = "#d9e1e8";
    ctx.fillRect(wallX - 12, baseY - 82, 18, 164);
    drawSpring(ctx, wallX + 6, baseY, springEndX, baseY, 11, 20, "#3269c8");
    roundedRect(ctx, massX - 42, baseY - 30, 84, 60, 8, "#db4c40");
    label(ctx, "平衡位置", eqX - 32, baseY + 72, "#627184");
    dashedLine(ctx, eqX, baseY - 80, eqX, baseY + 80, "#627184");
    drawVector(ctx, massX, baseY - 42, massX - xCm * pxPerCm * 0.75, baseY - 42, "#e2a500", "F");

    const graphX = Math.max(w * 0.1, 70);
    const graphY = h * 0.73;
    const graphW = w * 0.78;
    const graphH = h * 0.18;
    drawGraphFrame(ctx, graphX, graphY, graphW, graphH, "x-t 图像");
    ctx.strokeStyle = "#007f8f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= graphW; i += 2) {
      const localT = t - (graphW - i) / 95;
      const y = graphY + graphH / 2 - Math.cos(v.omega * localT) * (graphH * 0.38);
      if (i === 0) ctx.moveTo(graphX + i, y);
      else ctx.lineTo(graphX + i, y);
    }
    ctx.stroke();
    ctx.restore();

    return {
      caption: "简谐运动的加速度与位移大小成正比、方向相反；图像能把周期和相位关系看得更清楚。",
      metrics: [
        { label: "位移 x", value: `${format(xCm, 2)} cm` },
        { label: "速度 v", value: `${format(velocity, 2)} cm/s` },
        { label: "加速度 a", value: `${format(acceleration, 2)} cm/s²` },
        { label: "周期 T", value: `${format(period, 2)} s` },
        { label: "等效劲度 k", value: `${format(k, 2)} N/m` },
        { label: "总能量", value: `${format(totalEnergy, 4)} J` }
      ]
    };
  },

  collision(ctx, size, v, t) {
    const w = size.w;
    const h = size.h;
    const m1 = v.m1;
    const m2 = v.m2;
    const u1 = v.v1;
    const u2 = v.v2;
    const e = v.e;
    const v1f = (m1 * u1 + m2 * u2 - m2 * e * (u1 - u2)) / (m1 + m2);
    const v2f = (m1 * u1 + m2 * u2 + m1 * e * (u1 - u2)) / (m1 + m2);
    const cycle = 6;
    const phase = t % cycle;
    const trackY = h * 0.54;
    const mid = w * 0.5;
    const before = phase < 2.4;
    const afterTime = Math.max(0, phase - 2.4);
    let x1;
    let x2;
    if (before) {
      const progress = phase / 2.4;
      x1 = lerp(mid - 280, mid - 58, progress);
      x2 = lerp(mid + 280, mid + 58, progress);
    } else {
      x1 = mid - 58 + v1f * 34 * afterTime;
      x2 = mid + 58 + v2f * 34 * afterTime;
    }
    const pBefore = m1 * u1 + m2 * u2;
    const pAfter = m1 * v1f + m2 * v2f;
    const kBefore = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
    const kAfter = 0.5 * m1 * v1f * v1f + 0.5 * m2 * v2f * v2f;

    ctx.save();
    drawGround(ctx, 62, trackY + 54, w - 124);
    drawCart(ctx, x1, trackY, "#3269c8", `m₁=${format(m1, 1)}kg`);
    drawCart(ctx, x2, trackY, "#db4c40", `m₂=${format(m2, 1)}kg`);
    drawVector(ctx, x1, trackY - 58, x1 + (before ? u1 : v1f) * 36, trackY - 58, "#3269c8", before ? "v₁" : "v₁'");
    drawVector(ctx, x2, trackY - 58, x2 + (before ? u2 : v2f) * 36, trackY - 58, "#db4c40", before ? "v₂" : "v₂'");
    if (phase > 2.25 && phase < 2.65) {
      ctx.fillStyle = "rgba(226, 165, 0, 0.25)";
      ctx.beginPath();
      ctx.arc(mid, trackY - 10, 56 + Math.sin(phase * 28) * 8, 0, Math.PI * 2);
      ctx.fill();
      label(ctx, "碰撞瞬间", mid - 35, trackY - 92, "#17212b");
    }
    drawBar(ctx, 92, 92, w * 0.32, 18, pBefore, pAfter, "总动量");
    drawBar(ctx, 92, 140, w * 0.32, 18, kBefore, kAfter, "总动能");
    ctx.restore();

    return {
      caption: "恢复系数越小，碰撞后两车相对速度越小；系统总动量仍保持一致。",
      metrics: [
        { label: "碰后 v₁'", value: `${format(v1f, 2)} m/s` },
        { label: "碰后 v₂'", value: `${format(v2f, 2)} m/s` },
        { label: "碰前总动量", value: `${format(pBefore, 2)} kg·m/s` },
        { label: "碰后总动量", value: `${format(pAfter, 2)} kg·m/s` },
        { label: "动能损失", value: `${format(Math.max(0, kBefore - kAfter), 2)} J` }
      ]
    };
  },

  electricField(ctx, size, v) {
    const w = size.w;
    const h = size.h;
    const center = { x: w * 0.5, y: h * 0.5 };
    const scale = Math.min(w / 13, h / 8);
    const q1 = { q: v.q1, x: center.x - (v.distance * scale) / 2, y: center.y };
    const q2 = { q: v.q2, x: center.x + (v.distance * scale) / 2, y: center.y };
    const probe = { x: center.x + v.probeX * scale, y: center.y - v.probeY * scale };
    const probeField = fieldAt(probe.x, probe.y, [q1, q2], scale);

    ctx.save();
    for (let y = 70; y < h - 70; y += 38) {
      for (let x = 70; x < w - 70; x += 38) {
        const field = fieldAt(x, y, [q1, q2], scale);
        const mag = Math.hypot(field.ex, field.ey);
        if (mag < 0.0001) continue;
        const length = clamp(7 + Math.log10(mag + 1) * 9, 7, 25);
        const color = mag > 18 ? "#db4c40" : mag > 8 ? "#e2a500" : "#007f8f";
        drawVector(ctx, x, y, x + (field.ex / mag) * length, y + (field.ey / mag) * length, color);
      }
    }
    drawCharge(ctx, q1.x, q1.y, q1.q);
    drawCharge(ctx, q2.x, q2.y, q2.q);
    drawBall(ctx, probe.x, probe.y, 8, "#17212b");
    drawVector(ctx, probe.x, probe.y, probe.x + probeField.ex * 9, probe.y + probeField.ey * 9, "#17212b", "E");
    label(ctx, "探针", probe.x + 12, probe.y - 12, "#17212b");
    ctx.restore();

    return {
      caption: "每个小箭头都表示该点正试探电荷的受力方向；总场强由两个点电荷的场强矢量相加得到。",
      metrics: [
        { label: "探针 |E|", value: `${format(Math.hypot(probeField.ex, probeField.ey), 2)} 相对单位` },
        { label: "Eₓ", value: `${format(probeField.ex, 2)}` },
        { label: "Eᵧ", value: `${format(-probeField.ey, 2)}` },
        { label: "电荷间距", value: `${format(v.distance, 1)} m` }
      ]
    };
  },

  circuit(ctx, size, v, t) {
    const w = size.w;
    const h = size.h;
    const series = v.mode === "series";
    const req = series ? v.r1 + v.r2 : 1 / (1 / v.r1 + 1 / v.r2);
    const current = v.voltage / req;
    const i1 = series ? current : v.voltage / v.r1;
    const i2 = series ? current : v.voltage / v.r2;
    const u1 = series ? current * v.r1 : v.voltage;
    const u2 = series ? current * v.r2 : v.voltage;
    const power = v.voltage * current;
    const left = w * 0.18;
    const right = w * 0.82;
    const top = h * 0.24;
    const bottom = h * 0.68;

    ctx.save();
    ctx.strokeStyle = "#17212b";
    ctx.lineWidth = 5;
    if (series) {
      polyline(ctx, [
        [left, bottom],
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom]
      ]);
      drawBattery(ctx, left, (top + bottom) / 2, v.voltage);
      drawResistor(ctx, w * 0.45, top, w * 0.58, top, `R₁ ${format(v.r1, 0)}Ω`);
      drawResistor(ctx, right, h * 0.43, right, h * 0.56, `R₂ ${format(v.r2, 0)}Ω`);
      animateCharges(ctx, [[left, bottom], [left, top], [right, top], [right, bottom], [left, bottom]], current, t);
    } else {
      polyline(ctx, [
        [left, bottom],
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom]
      ]);
      line(ctx, left, h * 0.42, right, h * 0.42);
      line(ctx, left, h * 0.55, right, h * 0.55);
      drawBattery(ctx, left, (top + bottom) / 2, v.voltage);
      drawResistor(ctx, w * 0.43, h * 0.42, w * 0.58, h * 0.42, `R₁ ${format(v.r1, 0)}Ω`);
      drawResistor(ctx, w * 0.43, h * 0.55, w * 0.58, h * 0.55, `R₂ ${format(v.r2, 0)}Ω`);
      animateCharges(ctx, [[left, bottom], [left, top], [right, top], [right, bottom], [left, bottom]], current, t);
      animateCharges(ctx, [[left, h * 0.42], [right, h * 0.42]], i1, t + 1);
      animateCharges(ctx, [[left, h * 0.55], [right, h * 0.55]], i2, t + 2);
    }
    label(ctx, `${series ? "串联" : "并联"}：Rₑq = ${format(req, 2)} Ω`, w * 0.34, h * 0.82, "#17212b");
    ctx.restore();

    return {
      caption: series ? "串联电路各处电流相等，电压按电阻比例分配。" : "并联电路各支路电压相等，总电流等于各支路电流之和。",
      metrics: [
        { label: "等效电阻", value: `${format(req, 2)} Ω` },
        { label: "总电流", value: `${format(current, 3)} A` },
        { label: "R₁ 电压/电流", value: `${format(u1, 2)} V / ${format(i1, 3)} A` },
        { label: "R₂ 电压/电流", value: `${format(u2, 2)} V / ${format(i2, 3)} A` },
        { label: "总功率", value: `${format(power, 2)} W` }
      ]
    };
  },

  induction(ctx, size, v, t) {
    const w = size.w;
    const h = size.h;
    const center = { x: w * 0.38, y: h * 0.45 };
    const theta = v.omega * t;
    const flux = v.field * v.area * Math.cos(theta);
    const emfMax = v.turns * v.field * v.area * v.omega;
    const emf = emfMax * Math.sin(theta);
    const coilW = 190 * Math.abs(Math.cos(theta)) + 26;
    const coilH = 150;

    ctx.save();
    label(ctx, "N", center.x - 250, center.y - 116, "#db4c40");
    label(ctx, "S", center.x + 218, center.y - 116, "#3269c8");
    roundedRect(ctx, center.x - 270, center.y - 95, 74, 190, 8, "#db4c40");
    roundedRect(ctx, center.x + 196, center.y - 95, 74, 190, 8, "#3269c8");
    for (let y = center.y - 72; y <= center.y + 72; y += 36) {
      drawVector(ctx, center.x - 176, y, center.x + 176, y, "#627184");
    }
    ctx.strokeStyle = "#007f8f";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, coilW / 2, coilH / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    drawVector(ctx, center.x, center.y, center.x + Math.cos(theta + Math.PI / 2) * 90, center.y + Math.sin(theta + Math.PI / 2) * 70, "#e2a500", "转动");

    const graphX = w * 0.57;
    const graphY = h * 0.28;
    const graphW = w * 0.34;
    const graphH = h * 0.38;
    drawGraphFrame(ctx, graphX, graphY, graphW, graphH, "ε-t");
    ctx.strokeStyle = "#db4c40";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= graphW; x += 2) {
      const local = t - (graphW - x) / 90;
      const y = graphY + graphH / 2 - Math.sin(v.omega * local) * graphH * 0.4;
      if (x === 0) ctx.moveTo(graphX + x, y);
      else ctx.lineTo(graphX + x, y);
    }
    ctx.stroke();
    drawBall(ctx, graphX + graphW - 2, graphY + graphH / 2 - Math.sin(theta) * graphH * 0.4, 5, "#db4c40");
    ctx.restore();

    return {
      caption: "线圈匀速转动时，磁通量按余弦变化，感应电动势按正弦变化，二者相差四分之一个周期。",
      metrics: [
        { label: "磁通量 Φ", value: `${format(flux, 3)} Wb` },
        { label: "瞬时电动势", value: `${format(emf, 3)} V` },
        { label: "最大电动势", value: `${format(emfMax, 3)} V` },
        { label: "频率", value: `${format(v.omega / (2 * Math.PI), 2)} Hz` }
      ]
    };
  },

  interference(ctx, size, v, t) {
    const w = size.w;
    const h = size.h;
    const sourceA = { x: w / 2, y: h / 2 - v.separation / 2 };
    const sourceB = { x: w / 2, y: h / 2 + v.separation / 2 };
    const phase = toRad(v.phase);
    const k = (2 * Math.PI) / v.wavelength;
    const omega = 2.4;
    const cell = Math.max(5, Math.floor(Math.min(w, h) / 115));

    ctx.save();
    for (let y = 0; y < h; y += cell) {
      for (let x = 0; x < w; x += cell) {
        const r1 = distance(x, y, sourceA.x, sourceA.y);
        const r2 = distance(x, y, sourceB.x, sourceB.y);
        const wave = v.amplitude * (Math.sin(k * r1 - omega * t) + Math.sin(k * r2 - omega * t + phase));
        const intensity = Math.min(1, Math.abs(wave) / (2 * v.amplitude));
        ctx.fillStyle = interferenceColor(wave, intensity);
        ctx.fillRect(x, y, cell + 1, cell + 1);
      }
    }
    drawBall(ctx, sourceA.x, sourceA.y, 11, "#db4c40");
    drawBall(ctx, sourceB.x, sourceB.y, 11, "#db4c40");
    label(ctx, "S₁", sourceA.x + 14, sourceA.y - 10, "#17212b");
    label(ctx, "S₂", sourceB.x + 14, sourceB.y + 18, "#17212b");
    const probe = { x: w * 0.75, y: h * 0.5 };
    drawBall(ctx, probe.x, probe.y, 7, "#17212b");
    const diff = Math.abs(distance(probe.x, probe.y, sourceA.x, sourceA.y) - distance(probe.x, probe.y, sourceB.x, sourceB.y));
    ctx.restore();

    return {
      caption: "颜色越暖表示此刻位移越偏正，越冷表示位移越偏负；稳定的条纹来自相长与相消位置。",
      metrics: [
        { label: "波长", value: `${format(v.wavelength, 0)} px` },
        { label: "波源相位差", value: `${format(v.phase, 0)}°` },
        { label: "探针波程差", value: `${format(diff, 1)} px` },
        { label: "Δr / λ", value: `${format(diff / v.wavelength, 2)}` }
      ]
    };
  },

  lens(ctx, size, v) {
    const w = size.w;
    const h = size.h;
    const axisY = h * 0.52;
    const lensX = w * 0.5;
    const scale = Math.min((w - 140) / 120, (h - 140) / 34);
    const u = v.object;
    const f = v.focal;
    const imageDistance = Math.abs(u - f) < 0.2 ? Infinity : (f * u) / (u - f);
    const magnification = Number.isFinite(imageDistance) ? -imageDistance / u : Infinity;
    const imageHeight = Number.isFinite(magnification) ? magnification * v.height : Infinity;
    const objectX = lensX - u * scale;
    const objectTop = axisY - v.height * scale;
    const fLeft = lensX - f * scale;
    const fRight = lensX + f * scale;
    const imageX = Number.isFinite(imageDistance) ? lensX + imageDistance * scale : w + 200;
    const imageTop = Number.isFinite(imageHeight) ? axisY - imageHeight * scale : axisY;
    const real = imageDistance > 0;

    ctx.save();
    line(ctx, 48, axisY, w - 48, axisY, "#627184", 2);
    drawLensShape(ctx, lensX, axisY, 92);
    drawFocus(ctx, fLeft, axisY, "F");
    drawFocus(ctx, fRight, axisY, "F");
    drawArrow(ctx, objectX, axisY, objectX, objectTop, "#db4c40", "物");
    if (Number.isFinite(imageDistance) && Math.abs(imageX) < w * 1.4) {
      drawArrow(ctx, imageX, axisY, imageX, imageTop, real ? "#3269c8" : "#007f8f", real ? "实像" : "虚像");
    }

    const parallelY = objectTop;
    line(ctx, objectX, parallelY, lensX, parallelY, "#db4c40", 2);
    if (real) {
      line(ctx, lensX, parallelY, imageX, imageTop, "#db4c40", 2);
      line(ctx, objectX, objectTop, imageX, imageTop, "#e2a500", 2);
      line(ctx, objectX, objectTop, lensX, axisY, "#007f8f", 2);
    } else {
      line(ctx, lensX, parallelY, w - 70, axisY + (axisY - parallelY) * 0.65, "#db4c40", 2);
      dashedLine(ctx, lensX, parallelY, imageX, imageTop, "#007f8f");
      dashedLine(ctx, lensX, axisY, imageX, imageTop, "#e2a500");
    }
    ctx.restore();

    const nature = !Number.isFinite(imageDistance)
      ? "无穷远处"
      : real
        ? `${imageHeight < 0 ? "倒立" : "正立"}实像`
        : "正立虚像";

    return {
      caption: "凸透镜成像可以用三条特殊光线快速定位；靠近焦点时，像距和放大率变化最剧烈。",
      metrics: [
        { label: "像距 v", value: Number.isFinite(imageDistance) ? `${format(imageDistance, 2)} cm` : "∞" },
        { label: "放大率 m", value: Number.isFinite(magnification) ? `${format(magnification, 2)}` : "∞" },
        { label: "像高 h'", value: Number.isFinite(imageHeight) ? `${format(imageHeight, 2)} cm` : "∞" },
        { label: "成像性质", value: nature }
      ]
    };
  },

  refraction(ctx, size, v) {
    const w = size.w;
    const h = size.h;
    const cx = w / 2;
    const cy = h / 2;
    const i = toRad(v.angle);
    const sinR = (v.n1 / v.n2) * Math.sin(i);
    const totalInternal = sinR > 1;
    const r = totalInternal ? null : Math.asin(sinR);
    const critical = v.n1 > v.n2 ? Math.asin(v.n2 / v.n1) : null;

    ctx.save();
    ctx.fillStyle = "rgba(50, 105, 200, 0.08)";
    ctx.fillRect(0, 0, w, cy);
    ctx.fillStyle = "rgba(0, 127, 143, 0.12)";
    ctx.fillRect(0, cy, w, h - cy);
    line(ctx, 46, cy, w - 46, cy, "#17212b", 3);
    dashedLine(ctx, cx, 70, cx, h - 70, "#627184");
    label(ctx, `n₁ = ${format(v.n1, 2)}`, 70, cy - 34, "#17212b");
    label(ctx, `n₂ = ${format(v.n2, 2)}`, 70, cy + 50, "#17212b");

    const rayLen = Math.min(w, h) * 0.34;
    const start = { x: cx - Math.sin(i) * rayLen, y: cy - Math.cos(i) * rayLen };
    drawVector(ctx, start.x, start.y, cx, cy, "#db4c40", "入射光");
    const reflectEnd = { x: cx + Math.sin(i) * rayLen, y: cy - Math.cos(i) * rayLen };
    drawVector(ctx, cx, cy, reflectEnd.x, reflectEnd.y, "#e2a500", "反射光");
    if (totalInternal) {
      label(ctx, "全反射", cx + 34, cy + 44, "#db4c40");
    } else {
      const end = { x: cx + Math.sin(r) * rayLen, y: cy + Math.cos(r) * rayLen };
      drawVector(ctx, cx, cy, end.x, end.y, "#3269c8", "折射光");
      drawAngle(ctx, cx, cy, -Math.PI / 2, -Math.PI / 2 - i, 42, "#db4c40", "i");
      drawAngle(ctx, cx, cy, Math.PI / 2, Math.PI / 2 - r, 58, "#3269c8", "r");
    }
    ctx.restore();

    return {
      caption: "折射角由两种介质的折射率共同决定；从光密介质到光疏介质时才可能出现全反射。",
      metrics: [
        { label: "折射角", value: totalInternal ? "无折射光" : `${format(toDeg(r), 2)}°` },
        { label: "是否全反射", value: totalInternal ? "是" : "否" },
        { label: "临界角", value: critical ? `${format(toDeg(critical), 2)}°` : "不存在" },
        { label: "n₁sin i", value: `${format(v.n1 * Math.sin(i), 3)}` }
      ]
    };
  },

  gas(ctx, size, v, t) {
    const w = size.w;
    const h = size.h;
    const R = 8.314;
    const volumeM3 = v.volume / 1000;
    const pressure = (v.amount * R * v.temperature) / volumeM3;
    const boxX = w * 0.25;
    const boxY = h * 0.18;
    const boxW = w * 0.5;
    const maxH = h * 0.58;
    const boxH = lerp(maxH * 0.45, maxH, (v.volume - 4) / 22);
    const pistonY = boxY + (maxH - boxH);
    const speedFactor = Math.sqrt(v.temperature / 300);
    const moleculeCount = Math.round(18 + v.amount * 16);

    ctx.save();
    ctx.strokeStyle = "#17212b";
    ctx.lineWidth = 4;
    ctx.strokeRect(boxX, pistonY, boxW, boxH);
    roundedRect(ctx, boxX - 12, pistonY - 18, boxW + 24, 18, 4, "#627184");
    drawVector(ctx, boxX + boxW + 38, pistonY + 10, boxX + boxW + 38, pistonY + 70, "#db4c40", "P");
    for (let i = 0; i < moleculeCount; i += 1) {
      const seedA = pseudo(i * 17.3);
      const seedB = pseudo(i * 41.9);
      const x = boxX + 12 + mod(seedA * boxW + Math.sin(t * speedFactor + i) * 50, boxW - 24);
      const y = pistonY + 16 + mod(seedB * boxH + Math.cos(t * speedFactor * 1.3 + i * 0.7) * 42, boxH - 32);
      drawBall(ctx, x, y, 4, i % 3 === 0 ? "#db4c40" : i % 3 === 1 ? "#3269c8" : "#007f8f");
    }
    label(ctx, `V = ${format(v.volume, 1)} L`, boxX + 18, pistonY + boxH + 30, "#17212b");
    label(ctx, `T = ${format(v.temperature, 0)} K`, boxX + boxW - 100, pistonY + boxH + 30, "#17212b");
    ctx.restore();

    return {
      caption: "理想气体模型把大量分子碰撞的宏观效果概括为压强、体积和温度的关系。",
      metrics: [
        { label: "压强 P", value: `${format(pressure / 1000, 2)} kPa` },
        { label: "PV", value: `${format((pressure * volumeM3), 2)} J` },
        { label: "nRT", value: `${format(v.amount * R * v.temperature, 2)} J` },
        { label: "相对均方速率", value: `${format(speedFactor, 2)} 倍` }
      ]
    };
  },

  photoelectric(ctx, size, v, t) {
    const w = size.w;
    const h = size.h;
    const photonEnergy = 0.41357 * v.frequency;
    const kinetic = Math.max(0, photonEnergy - v.work);
    const cutoff = v.work / 0.41357;
    const emits = kinetic > 0;
    const metalX = w * 0.48;
    const metalY = h * 0.25;
    const metalW = 56;
    const metalH = h * 0.5;

    ctx.save();
    roundedRect(ctx, metalX, metalY, metalW, metalH, 8, "#627184");
    label(ctx, "金属板", metalX - 6, metalY + metalH + 32, "#17212b");
    const count = 3 + v.intensity;
    for (let i = 0; i < count; i += 1) {
      const y = metalY + 26 + (i / count) * (metalH - 42);
      const offset = mod(t * 110 + i * 43, metalX - 80);
      const x = 34 + offset;
      drawPhoton(ctx, x, y, metalX - 10, y, "#e2a500");
    }
    if (emits) {
      const electronCount = Math.min(12, 3 + v.intensity);
      for (let i = 0; i < electronCount; i += 1) {
        const startY = metalY + 28 + (i / electronCount) * (metalH - 48);
        const travel = mod(t * (70 + kinetic * 28) + i * 54, w - metalX - 120);
        const ex = metalX + metalW + 18 + travel;
        const ey = startY + Math.sin(t * 3 + i) * 20;
        drawBall(ctx, ex, ey, 6, "#3269c8");
        drawVector(ctx, ex - 30, ey, ex + 10, ey, "#3269c8");
      }
    } else {
      label(ctx, "频率低于截止频率，无光电子逸出", metalX + 82, h * 0.5, "#db4c40");
    }
    drawEnergyBars(ctx, 78, h - 122, w - 156, photonEnergy, v.work, kinetic);
    ctx.restore();

    return {
      caption: "能否发生光电效应由光子能量和逸出功决定；光强主要改变单位时间内的光电子数。",
      metrics: [
        { label: "光子能量 hf", value: `${format(photonEnergy, 2)} eV` },
        { label: "最大初动能", value: `${format(kinetic, 2)} eV` },
        { label: "截止频率", value: `${format(cutoff, 2)} ×10¹⁴ Hz` },
        { label: "是否逸出", value: emits ? "能" : "不能" }
      ]
    };
  }
};

function drawGround(context, x, y, width) {
  line(context, x, y, x + width, y, "#17212b", 3);
  context.save();
  context.strokeStyle = "rgba(23, 33, 43, 0.28)";
  context.lineWidth = 1;
  for (let i = x; i < x + width; i += 18) {
    line(context, i, y, i - 12, y + 14);
  }
  context.restore();
}

function drawAxisLabel(context, text, x, y) {
  label(context, text, x, y, "#627184");
}

function drawBall(context, x, y, r, color) {
  context.save();
  const gradient = context.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.2, x, y, r);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.2, color);
  gradient.addColorStop(1, shade(color, -28));
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawVector(context, x1, y1, x2, y2, color, text = "") {
  drawArrow(context, x1, y1, x2, y2, color, text);
}

function drawArrow(context, x1, y1, x2, y2, color, text = "") {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const length = Math.hypot(x2 - x1, y2 - y1);
  if (length < 2) return;
  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 2.5;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  const head = Math.min(12, Math.max(7, length * 0.22));
  context.beginPath();
  context.moveTo(x2, y2);
  context.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
  context.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
  context.closePath();
  context.fill();
  if (text) {
    label(context, text, x2 + Math.cos(angle) * 10 + 2, y2 + Math.sin(angle) * 10 + 2, color);
  }
  context.restore();
}

function line(context, x1, y1, x2, y2, color = null, width = null) {
  context.save();
  if (color) context.strokeStyle = color;
  if (width) context.lineWidth = width;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.restore();
}

function dashedLine(context, x1, y1, x2, y2, color) {
  context.save();
  context.setLineDash([8, 7]);
  context.strokeStyle = color;
  context.lineWidth = 2;
  line(context, x1, y1, x2, y2);
  context.restore();
}

function polyline(context, points) {
  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();
}

function label(context, text, x, y, color) {
  context.save();
  context.fillStyle = color;
  context.font = "14px Microsoft YaHei, Arial, sans-serif";
  context.textBaseline = "middle";
  context.fillText(text, x, y);
  context.restore();
}

function roundedRect(context, x, y, w, h, radius, color) {
  context.save();
  context.fillStyle = color;
  context.beginPath();
  context.roundRect(x, y, w, h, radius);
  context.fill();
  context.restore();
}

function drawSpring(context, x1, y1, x2, y2, coils, amplitude, color) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(x1, y1);
  const length = x2 - x1;
  for (let i = 1; i <= coils * 2; i += 1) {
    const x = x1 + (length * i) / (coils * 2 + 1);
    const y = y1 + (i % 2 === 0 ? -amplitude : amplitude);
    context.lineTo(x, y);
  }
  context.lineTo(x2, y2);
  context.stroke();
  context.restore();
}

function drawGraphFrame(context, x, y, w, h, title) {
  context.save();
  context.strokeStyle = "rgba(98, 113, 132, 0.5)";
  context.lineWidth = 1.5;
  context.strokeRect(x, y, w, h);
  line(context, x, y + h / 2, x + w, y + h / 2, "rgba(98, 113, 132, 0.5)", 1);
  label(context, title, x + 8, y - 16, "#627184");
  context.restore();
}

function drawCart(context, x, y, color, text) {
  roundedRect(context, x - 58, y - 34, 116, 48, 8, color);
  drawBall(context, x - 34, y + 22, 10, "#17212b");
  drawBall(context, x + 34, y + 22, 10, "#17212b");
  label(context, text, x - 42, y - 10, "#ffffff");
}

function drawBar(context, x, y, w, h, before, after, title) {
  const max = Math.max(Math.abs(before), Math.abs(after), 1);
  label(context, title, x, y - 18, "#17212b");
  roundedRect(context, x, y, w, h, 4, "rgba(98, 113, 132, 0.18)");
  roundedRect(context, x, y, (Math.abs(before) / max) * w, h, 4, "#3269c8");
  roundedRect(context, x, y + 24, w, h, 4, "rgba(98, 113, 132, 0.18)");
  roundedRect(context, x, y + 24, (Math.abs(after) / max) * w, h, 4, "#db4c40");
  label(context, `前 ${format(before, 2)}`, x + w + 12, y + h / 2, "#3269c8");
  label(context, `后 ${format(after, 2)}`, x + w + 12, y + 24 + h / 2, "#db4c40");
}

function fieldAt(x, y, charges, scale) {
  let ex = 0;
  let ey = 0;
  charges.forEach((charge) => {
    const dx = x - charge.x;
    const dy = y - charge.y;
    const r2 = dx * dx + dy * dy;
    const soft = Math.max(r2, 16 * 16);
    const r = Math.sqrt(soft);
    const strength = (charge.q * scale * scale) / soft;
    ex += (strength * dx) / r;
    ey += (strength * dy) / r;
  });
  return { ex, ey };
}

function drawCharge(context, x, y, q) {
  const color = q >= 0 ? "#db4c40" : "#3269c8";
  drawBall(context, x, y, 22, color);
  label(context, q >= 0 ? "+" : "−", x - 5, y + 1, "#ffffff");
  label(context, `${format(q, 1)} μC`, x - 24, y + 38, "#17212b");
}

function drawBattery(context, x, y, voltage) {
  context.save();
  context.strokeStyle = "#17212b";
  context.lineWidth = 4;
  line(context, x - 22, y - 42, x - 22, y + 42);
  line(context, x + 12, y - 28, x + 12, y + 28);
  label(context, `${format(voltage, 1)} V`, x + 22, y, "#17212b");
  context.restore();
}

function drawResistor(context, x1, y1, x2, y2, text) {
  const horizontal = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
  context.save();
  context.strokeStyle = "#db4c40";
  context.lineWidth = 4;
  context.beginPath();
  if (horizontal) {
    const length = x2 - x1;
    context.moveTo(x1, y1);
    for (let i = 1; i <= 8; i += 1) {
      const x = x1 + (length * i) / 8;
      const y = y1 + (i % 2 ? -14 : 14);
      context.lineTo(x, y);
    }
    context.lineTo(x2, y2);
    label(context, text, (x1 + x2) / 2 - 38, y1 - 32, "#17212b");
  } else {
    const length = y2 - y1;
    context.moveTo(x1, y1);
    for (let i = 1; i <= 8; i += 1) {
      const x = x1 + (i % 2 ? -14 : 14);
      const y = y1 + (length * i) / 8;
      context.lineTo(x, y);
    }
    context.lineTo(x2, y2);
    label(context, text, x1 + 24, (y1 + y2) / 2, "#17212b");
  }
  context.stroke();
  context.restore();
}

function animateCharges(context, points, current, t) {
  const segments = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const length = distance(x1, y1, x2, y2);
    segments.push({ x1, y1, x2, y2, length, start: total });
    total += length;
  }
  const count = Math.max(8, Math.min(28, Math.round(current * 14)));
  const speed = 34 + current * 28;
  for (let i = 0; i < count; i += 1) {
    const d = mod(t * speed + (i / count) * total, total);
    const segment = segments.find((item) => d >= item.start && d <= item.start + item.length) ?? segments[0];
    const p = (d - segment.start) / segment.length;
    drawBall(context, lerp(segment.x1, segment.x2, p), lerp(segment.y1, segment.y2, p), 4, "#e2a500");
  }
}

function interferenceColor(wave, intensity) {
  const alpha = 0.18 + intensity * 0.62;
  if (wave >= 0) {
    return `rgba(219, 76, 64, ${alpha})`;
  }
  return `rgba(50, 105, 200, ${alpha})`;
}

function drawLensShape(context, x, y, height) {
  context.save();
  context.strokeStyle = "#007f8f";
  context.fillStyle = "rgba(0, 127, 143, 0.14)";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(x, y - height);
  context.bezierCurveTo(x + 42, y - height * 0.65, x + 42, y + height * 0.65, x, y + height);
  context.bezierCurveTo(x - 42, y + height * 0.65, x - 42, y - height * 0.65, x, y - height);
  context.fill();
  context.stroke();
  context.restore();
}

function drawFocus(context, x, y, text) {
  drawBall(context, x, y, 4, "#e2a500");
  label(context, text, x - 7, y + 22, "#17212b");
}

function drawAngle(context, x, y, a1, a2, radius, color, text) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.beginPath();
  context.arc(x, y, radius, a1, a2, a2 < a1);
  context.stroke();
  const mid = (a1 + a2) / 2;
  label(context, text, x + Math.cos(mid) * (radius + 13), y + Math.sin(mid) * (radius + 13), color);
  context.restore();
}

function drawPhoton(context, x1, y1, x2, y2, color) {
  const length = Math.min(distance(x1, y1, x2, y2), 60);
  const start = x1;
  const end = Math.min(x1 + length, x2);
  if (end - start < 4) return;
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.beginPath();
  for (let x = start; x <= end; x += 6) {
    const y = y2 + Math.sin((x - start) / 6) * 6;
    if (x === start) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
  drawArrow(context, end - 12, y2, end, y2, color);
  context.restore();
}

function drawEnergyBars(context, x, y, w, photonEnergy, work, kinetic) {
  const max = Math.max(photonEnergy, work + kinetic, 1);
  label(context, "能量分配", x, y - 20, "#17212b");
  roundedRect(context, x, y, w, 18, 4, "rgba(98, 113, 132, 0.16)");
  roundedRect(context, x, y, (photonEnergy / max) * w, 18, 4, "#e2a500");
  roundedRect(context, x, y + 32, w, 18, 4, "rgba(98, 113, 132, 0.16)");
  roundedRect(context, x, y + 32, (work / max) * w, 18, 4, "#627184");
  if (kinetic > 0) {
    roundedRect(context, x + (work / max) * w, y + 32, (kinetic / max) * w, 18, 4, "#3269c8");
  }
  label(context, `hf ${format(photonEnergy, 2)} eV`, x + w + 10, y + 9, "#e2a500");
  label(context, `W₀ + Eₖ`, x + w + 10, y + 41, "#17212b");
}

function format(value, digits = 2) {
  if (!Number.isFinite(value)) return "∞";
  const rounded = Number(value).toFixed(digits);
  return rounded.replace(/\.?0+$/, "");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function toDeg(radians) {
  return (radians * 180) / Math.PI;
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function pseudo(seed) {
  return Math.abs(Math.sin(seed) * 43758.5453) % 1;
}

function mod(value, base) {
  return ((value % base) + base) % base;
}

function shade(hex, amount) {
  const color = hex.replace("#", "");
  const num = parseInt(color, 16);
  const r = clamp((num >> 16) + amount, 0, 255);
  const g = clamp(((num >> 8) & 0x00ff) + amount, 0, 255);
  const b = clamp((num & 0x0000ff) + amount, 0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

init();
