/**
 * 演示主题数据：新增主题只需在此追加一项，并在 renderers.js 中实现同名渲染器。
 * Topic definitions. To add a topic, append an entry here and add a renderer with the same `renderer` key.
 */
(function (root) {
  "use strict";
  const PV = (root.PhysicsViz = root.PhysicsViz || {});

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

  PV.domains = domains;
  PV.topics = topics;
})(typeof globalThis !== "undefined" ? globalThis : window);
