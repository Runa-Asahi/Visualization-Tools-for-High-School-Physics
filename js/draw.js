/**
 * Canvas 绘图基元 / Canvas drawing primitives shared by all renderers.
 */
(function (root) {
  "use strict";
  const PV = (root.PhysicsViz = root.PhysicsViz || {});
  const { format, lerp, distance, mod, shade } = PV.utils;

  /** 统一调色板，与 styles.css 中的 CSS 变量保持一致。 */
  const THEMES = Object.freeze({
    light: Object.freeze({
      ink: "#17212b",
      muted: "#627184",
      teal: "#007f8f",
      red: "#db4c40",
      amber: "#e2a500",
      blue: "#3269c8",
      wheel: "#17212b",
      wall: "#d9e1e8",
      bgTop: "#ffffff",
      bgBottom: "#edf7f8",
      grid: "rgba(50, 105, 200, 0.08)",
      hatch: "rgba(23, 33, 43, 0.28)",
      frame: "rgba(98, 113, 132, 0.5)",
      track: "rgba(98, 113, 132, 0.18)"
    }),
    dark: Object.freeze({
      ink: "#e6edf3",
      muted: "#9fb0c2",
      teal: "#2cc4d3",
      red: "#ff6b5e",
      amber: "#f5c136",
      blue: "#6b9bff",
      wheel: "#0b1419",
      wall: "#3a4a57",
      bgTop: "#122029",
      bgBottom: "#0c171d",
      grid: "rgba(120, 170, 255, 0.09)",
      hatch: "rgba(230, 237, 243, 0.25)",
      frame: "rgba(159, 176, 194, 0.5)",
      track: "rgba(159, 176, 194, 0.2)"
    })
  });

  /** 当前调色板（可变对象，渲染器在绘制时读取属性，因此切换主题即时生效）。 */
  const COLORS = { ...THEMES.light };
  function setTheme(name) {
    Object.assign(COLORS, THEMES[name] || THEMES.light);
  }
  const LABEL_FONT = '14px "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", Arial, sans-serif';

  function drawBackdrop(context, w, h) {
    const gradient = context.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, COLORS.bgTop);
    gradient.addColorStop(1, COLORS.bgBottom);
    context.fillStyle = gradient;
    context.fillRect(0, 0, w, h);

    context.save();
    context.strokeStyle = COLORS.grid;
    context.lineWidth = 1;
    context.beginPath(); // 单条路径批量描边，比逐线 stroke 更快
    for (let x = 0; x <= w; x += 40) {
      context.moveTo(x + 0.5, 0);
      context.lineTo(x + 0.5, h);
    }
    for (let y = 0; y <= h; y += 40) {
      context.moveTo(0, y + 0.5);
      context.lineTo(w, y + 0.5);
    }
    context.stroke();
    context.restore();
  }

  function drawGround(context, x, y, width) {
    line(context, x, y, x + width, y, COLORS.ink, 3);
    context.save();
    context.strokeStyle = COLORS.hatch;
    context.lineWidth = 1;
    for (let i = x; i < x + width; i += 18) {
      line(context, i, y, i - 12, y + 14);
    }
    context.restore();
  }

  function drawAxisLabel(context, text, x, y) {
    label(context, text, x, y, COLORS.muted);
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
    context.font = LABEL_FONT;
    context.textBaseline = "middle";
    context.fillText(text, x, y);
    context.restore();
  }

  function roundedRect(context, x, y, w, h, radius, color) {
    context.save();
    context.fillStyle = color;
    context.beginPath();
    if (w <= 0 || h <= 0) {
      context.restore();
      return;
    }
    if (typeof context.roundRect === "function") {
      context.roundRect(x, y, w, h, Math.min(radius, w / 2, h / 2));
    } else {
      context.rect(x, y, w, h); // 旧浏览器降级 / fallback for browsers without roundRect
    }
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
    context.strokeStyle = COLORS.frame;
    context.lineWidth = 1.5;
    context.strokeRect(x, y, w, h);
    line(context, x, y + h / 2, x + w, y + h / 2, COLORS.frame, 1);
    label(context, title, x + 8, y - 16, COLORS.muted);
    context.restore();
  }

  function drawCart(context, x, y, color, text) {
    roundedRect(context, x - 58, y - 34, 116, 48, 8, color);
    drawBall(context, x - 34, y + 22, 10, COLORS.wheel);
    drawBall(context, x + 34, y + 22, 10, COLORS.wheel);
    label(context, text, x - 42, y - 10, "#ffffff");
  }

  function drawBar(context, x, y, w, h, before, after, title) {
    const max = Math.max(Math.abs(before), Math.abs(after), 1);
    label(context, title, x, y - 18, COLORS.ink);
    roundedRect(context, x, y, w, h, 4, COLORS.track);
    roundedRect(context, x, y, (Math.abs(before) / max) * w, h, 4, COLORS.blue);
    roundedRect(context, x, y + 24, w, h, 4, COLORS.track);
    roundedRect(context, x, y + 24, (Math.abs(after) / max) * w, h, 4, COLORS.red);
    label(context, `前 ${format(before, 2)}`, x + w + 12, y + h / 2, COLORS.blue);
    label(context, `后 ${format(after, 2)}`, x + w + 12, y + 24 + h / 2, COLORS.red);
  }

  function drawCharge(context, x, y, q) {
    const color = q >= 0 ? COLORS.red : COLORS.blue;
    drawBall(context, x, y, 22, color);
    label(context, q >= 0 ? "+" : "−", x - 5, y + 1, "#ffffff");
    label(context, `${format(q, 1)} μC`, x - 24, y + 38, COLORS.ink);
  }

  function drawBattery(context, x, y, voltage) {
    context.save();
    context.strokeStyle = COLORS.ink;
    context.lineWidth = 4;
    line(context, x - 22, y - 42, x - 22, y + 42);
    line(context, x + 12, y - 28, x + 12, y + 28);
    label(context, `${format(voltage, 1)} V`, x + 22, y, COLORS.ink);
    context.restore();
  }

  function drawResistor(context, x1, y1, x2, y2, text) {
    const horizontal = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
    context.save();
    context.strokeStyle = COLORS.red;
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
      label(context, text, (x1 + x2) / 2 - 38, y1 - 32, COLORS.ink);
    } else {
      const length = y2 - y1;
      context.moveTo(x1, y1);
      for (let i = 1; i <= 8; i += 1) {
        const x = x1 + (i % 2 ? -14 : 14);
        const y = y1 + (length * i) / 8;
        context.lineTo(x, y);
      }
      context.lineTo(x2, y2);
      label(context, text, x1 + 24, (y1 + y2) / 2, COLORS.ink);
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
      drawBall(context, lerp(segment.x1, segment.x2, p), lerp(segment.y1, segment.y2, p), 4, COLORS.amber);
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
    context.strokeStyle = COLORS.teal;
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
    drawBall(context, x, y, 4, COLORS.amber);
    label(context, text, x - 7, y + 22, COLORS.ink);
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
    label(context, "能量分配", x, y - 20, COLORS.ink);
    roundedRect(context, x, y, w, 18, 4, COLORS.track);
    roundedRect(context, x, y, (photonEnergy / max) * w, 18, 4, COLORS.amber);
    roundedRect(context, x, y + 32, w, 18, 4, COLORS.track);
    roundedRect(context, x, y + 32, (work / max) * w, 18, 4, COLORS.muted);
    if (kinetic > 0) {
      roundedRect(context, x + (work / max) * w, y + 32, (kinetic / max) * w, 18, 4, COLORS.blue);
    }
    label(context, `hf ${format(photonEnergy, 2)} eV`, x + w + 10, y + 9, COLORS.amber);
    label(context, `W₀ + Eₖ`, x + w + 10, y + 41, COLORS.ink);
  }

  /** 不绘制任何内容的上下文，用于只取渲染器的数值结果（例如实时图像的候选量）。 */
  const gradientStub = { addColorStop() {} };
  const nullContext = new Proxy(
    {},
    {
      get(target, key) {
        if (key in target) return target[key];
        if (key === "createLinearGradient" || key === "createRadialGradient") return () => gradientStub;
        return () => {};
      },
      set(target, key, value) {
        target[key] = value;
        return true;
      }
    }
  );

  PV.nullContext = nullContext;
  PV.COLORS = COLORS;
  PV.THEMES = THEMES;
  PV.setTheme = setTheme;
  PV.draw = {
    drawBackdrop,
    drawGround,
    drawAxisLabel,
    drawBall,
    drawArrow,
    line,
    dashedLine,
    polyline,
    label,
    roundedRect,
    drawSpring,
    drawGraphFrame,
    drawCart,
    drawBar,
    drawCharge,
    drawBattery,
    drawResistor,
    animateCharges,
    interferenceColor,
    drawLensShape,
    drawFocus,
    drawAngle,
    drawPhoton,
    drawEnergyBars,
    drawVector: drawArrow
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
