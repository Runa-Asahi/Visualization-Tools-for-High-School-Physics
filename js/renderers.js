/**
 * 各主题的画布渲染器。每个渲染器签名为 (ctx, size, values, time) => { caption, metrics }。
 * Scene renderers: each returns a caption and a list of live metrics.
 * `animated: false` 表示静态场景，暂停时无需逐帧重绘。
 */
(function (root) {
  "use strict";
  const PV = (root.PhysicsViz = root.PhysicsViz || {});
  const { format, clamp, lerp, toDeg, distance, pseudo, mod, withUnit } = PV.utils;
  const P = PV.physics;
  const C = PV.COLORS;
  const {
    drawGround, drawAxisLabel, drawBall, drawVector, drawArrow, line, dashedLine, polyline, label,
    roundedRect, drawSpring, drawGraphFrame, drawCart, drawBar, drawCharge, drawBattery, drawResistor,
    animateCharges, drawLensShape, drawFocus, drawAngle, drawPhoton, drawEnergyBars
  } = PV.draw;

  const metric = (labelText, value) => ({ label: labelText, value });

  /** 在图框中绘制随时间滚动的曲线 fn(localTime) ∈ [-1, 1]。 */
  function scrollingCurve(ctx, x, y, w, h, t, pxPerSecond, amp, fn, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= w; i += 2) {
      const py = y + h / 2 - fn(t - (w - i) / pxPerSecond) * h * amp;
      if (i === 0) ctx.moveTo(x + i, py);
      else ctx.lineTo(x + i, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ---- 干涉图离屏缓冲 / offscreen buffer for the interference field ----
  let waveBuffer = null;
  function getWaveBuffer(cols, rows) {
    if (typeof document === "undefined") return null;
    if (!waveBuffer) waveBuffer = { canvas: document.createElement("canvas") };
    const b = waveBuffer;
    if (b.canvas.width !== cols || b.canvas.height !== rows) {
      b.canvas.width = cols;
      b.canvas.height = rows;
      b.ctx = b.canvas.getContext("2d");
      b.image = b.ctx && typeof b.ctx.createImageData === "function" ? b.ctx.createImageData(cols, rows) : null;
    }
    return b.ctx && b.image ? b : null;
  }

  const renderers = {
    projectile(ctx, { w, h }, v, t) {
      const s = P.projectile(v, t);
      const groundY = h - 88;
      const originX = 72;
      const scale = Math.min((w - 150) / Math.max(s.range * 1.08, 18), (h - 170) / Math.max(s.maxHeight + 3, 8));

      drawGround(ctx, 44, groundY, w - 88);
      drawAxisLabel(ctx, "x", w - 54, groundY + 28);
      drawAxisLabel(ctx, "y", 52, 56);

      ctx.save();
      ctx.strokeStyle = C.blue;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= 120; i += 1) {
        const p = s.positionAt((s.flight * i) / 120);
        const px = originX + p.x * scale;
        const py = groundY - p.y * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      const ballX = originX + s.x * scale;
      const ballY = groundY - s.y * scale;
      drawVector(ctx, ballX, ballY, ballX + s.vx * 3, ballY, C.teal, "vₓ");
      drawVector(ctx, ballX, ballY, ballX, ballY - s.vy * 3, C.red, "vᵧ");
      drawVector(ctx, ballX, ballY, ballX + s.vx * 2.2, ballY - s.vy * 2.2, C.ink, "v");
      drawVector(ctx, ballX, ballY, ballX, ballY + 56, C.amber, "g");
      drawBall(ctx, ballX, ballY, 13, C.red);

      ctx.fillStyle = "rgba(0, 127, 143, 0.14)";
      ctx.fillRect(originX - 2, groundY - v.height * scale, 4, v.height * scale);
      ctx.restore();
      label(ctx, "起点", originX - 20, groundY - v.height * scale - 18, C.ink);
      label(ctx, `落点约 ${format(s.range, 1)} m`, originX + s.range * scale - 58, groundY + 44, C.ink);

      return {
        caption: "轨迹由横向匀速和竖直匀变速叠加得到；调节角度时，注意水平速度与竖直初速度同时改变。",
        metrics: [
          metric("当前时间", withUnit(s.simT, 2, "s")),
          metric("水平位移", withUnit(s.x, 2, "m")),
          metric("竖直高度", withUnit(Math.max(s.y, 0), 2, "m")),
          metric("落点距离", withUnit(s.range, 2, "m")),
          metric("最高点", withUnit(s.maxHeight, 2, "m")),
          metric("当前 vᵧ", withUnit(s.vy, 2, "m/s"))
        ]
      };
    },

    circular(ctx, { w, h }, v, t) {
      const s = P.circular(v);
      const center = { x: w * 0.5, y: h * 0.48 };
      const r = Math.min(w, h) * 0.26;
      const theta = s.omega * t;
      const px = center.x + r * Math.cos(theta);
      const py = center.y + r * Math.sin(theta);
      const tangent = theta + Math.PI / 2;
      const inward = theta + Math.PI;

      ctx.save();
      ctx.strokeStyle = "rgba(50, 105, 200, 0.45)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      dashedLine(ctx, center.x, center.y, px, py, C.muted);
      drawBall(ctx, center.x, center.y, 5, C.ink);
      drawBall(ctx, px, py, 15, C.red);
      drawVector(ctx, px, py, px + Math.cos(tangent) * 88, py + Math.sin(tangent) * 88, C.teal, "v");
      drawVector(ctx, px, py, px + Math.cos(inward) * 96, py + Math.sin(inward) * 96, C.amber, "aₙ");
      drawVector(ctx, px, py, px + Math.cos(inward) * 55, py + Math.sin(inward) * 55, C.red, "Fₙ");
      label(ctx, `r = ${format(v.radius, 1)} m`, (center.x + px) / 2 + 8, (center.y + py) / 2, C.ink);

      return {
        caption: "速率不变并不等于速度不变；速度方向持续转动，所以向心加速度始终存在。",
        metrics: [
          metric("角速度 ω", withUnit(s.omega, 2, "rad/s")),
          metric("周期 T", withUnit(s.period, 2, "s")),
          metric("向心加速度", withUnit(s.accel, 2, "m/s²")),
          metric("向心力", withUnit(s.force, 2, "N"))
        ]
      };
    },

    shm(ctx, { w, h }, v, t) {
      const s = P.shm(v, t);
      const baseY = h * 0.42;
      const wallX = 80;
      const eqX = w * 0.43;
      const pxPerCm = Math.min(16, w / 64);
      const massX = eqX + s.x * pxPerCm;

      ctx.save();
      ctx.fillStyle = C.wall;
      ctx.fillRect(wallX - 12, baseY - 82, 18, 164);
      ctx.restore();
      drawSpring(ctx, wallX + 6, baseY, massX - 42, baseY, 11, 20, C.blue);
      roundedRect(ctx, massX - 42, baseY - 30, 84, 60, 8, C.red);
      label(ctx, "平衡位置", eqX - 32, baseY + 72, C.muted);
      dashedLine(ctx, eqX, baseY - 80, eqX, baseY + 80, C.muted);
      drawVector(ctx, massX, baseY - 42, massX - s.x * pxPerCm * 0.75, baseY - 42, C.amber, "F");

      const graphX = Math.max(w * 0.1, 70);
      const graphY = h * 0.73;
      const graphW = w * 0.78;
      const graphH = h * 0.18;
      drawGraphFrame(ctx, graphX, graphY, graphW, graphH, "x-t 图像");
      scrollingCurve(ctx, graphX, graphY, graphW, graphH, t, 95, 0.38, (lt) => Math.cos(v.omega * lt), C.teal);

      return {
        caption: "简谐运动的加速度与位移大小成正比、方向相反；图像能把周期和相位关系看得更清楚。",
        metrics: [
          metric("位移 x", withUnit(s.x, 2, "cm")),
          metric("速度 v", withUnit(s.velocity, 2, "cm/s")),
          metric("加速度 a", withUnit(s.acceleration, 2, "cm/s²")),
          metric("周期 T", withUnit(s.period, 2, "s")),
          metric("等效劲度 k", withUnit(s.k, 2, "N/m")),
          metric("总能量", withUnit(s.energy, 4, "J"))
        ]
      };
    },

    collision(ctx, { w, h }, v, t) {
      const s = P.collision(v);
      const cycle = 6;
      const approach = 2.4;
      const phase = mod(t, cycle);
      const trackY = h * 0.54;
      const mid = w * 0.5;
      const before = phase < approach || !s.willCollide;
      const after = Math.max(0, phase - approach);
      const pxPerMs = 34;
      let x1;
      let x2;
      if (!s.willCollide) {
        // 不相碰：两车各自匀速运动 / no collision, each cart keeps moving
        x1 = mid - 200 + v.v1 * pxPerMs * (phase - cycle / 2) * 0.5;
        x2 = mid + 200 + v.v2 * pxPerMs * (phase - cycle / 2) * 0.5;
      } else if (phase < approach) {
        const progress = phase / approach;
        x1 = lerp(mid - 280, mid - 58, progress);
        x2 = lerp(mid + 280, mid + 58, progress);
      } else {
        x1 = mid - 58 + s.v1f * pxPerMs * after;
        x2 = mid + 58 + s.v2f * pxPerMs * after;
      }

      drawGround(ctx, 62, trackY + 54, w - 124);
      drawCart(ctx, x1, trackY, C.blue, `m₁=${format(v.m1, 1)}kg`);
      drawCart(ctx, x2, trackY, C.red, `m₂=${format(v.m2, 1)}kg`);
      drawVector(ctx, x1, trackY - 58, x1 + (before ? v.v1 : s.v1f) * 36, trackY - 58, C.blue, before ? "v₁" : "v₁'");
      drawVector(ctx, x2, trackY - 58, x2 + (before ? v.v2 : s.v2f) * 36, trackY - 58, C.red, before ? "v₂" : "v₂'");
      if (s.willCollide && phase > approach - 0.15 && phase < approach + 0.25) {
        ctx.save();
        ctx.fillStyle = "rgba(226, 165, 0, 0.25)";
        ctx.beginPath();
        ctx.arc(mid, trackY - 10, 56 + Math.sin(phase * 28) * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        label(ctx, "碰撞瞬间", mid - 35, trackY - 92, C.ink);
      }
      if (!s.willCollide) {
        label(ctx, "左车速度不大于右车，两车不会相碰", mid - 120, trackY - 110, C.red);
      }
      drawBar(ctx, 92, 92, w * 0.32, 18, s.pBefore, s.pAfter, "总动量");
      drawBar(ctx, 92, 172, w * 0.32, 18, s.kBefore, s.kAfter, "总动能");

      return {
        caption: "恢复系数越小，碰撞后两车相对速度越小；系统总动量仍保持一致。",
        metrics: [
          metric("碰后 v₁'", withUnit(s.v1f, 2, "m/s")),
          metric("碰后 v₂'", withUnit(s.v2f, 2, "m/s")),
          metric("碰前总动量", withUnit(s.pBefore, 2, "kg·m/s")),
          metric("碰后总动量", withUnit(s.pAfter, 2, "kg·m/s")),
          metric("动能损失", withUnit(Math.max(0, s.kBefore - s.kAfter), 2, "J"))
        ]
      };
    },

    electricField(ctx, { w, h }, v) {
      const center = { x: w * 0.5, y: h * 0.5 };
      const scale = Math.min(w / 13, h / 8);
      const charges = [
        { q: v.q1, x: center.x - (v.distance * scale) / 2, y: center.y },
        { q: v.q2, x: center.x + (v.distance * scale) / 2, y: center.y }
      ];
      const probe = { x: center.x + v.probeX * scale, y: center.y - v.probeY * scale };
      const probeField = P.fieldAt(probe.x, probe.y, charges, scale);
      const probeMag = Math.hypot(probeField.ex, probeField.ey);

      for (let y = 70; y < h - 70; y += 38) {
        for (let x = 70; x < w - 70; x += 38) {
          const f = P.fieldAt(x, y, charges, scale);
          const mag = Math.hypot(f.ex, f.ey);
          if (mag < 0.0001) continue;
          const length = clamp(7 + Math.log10(mag + 1) * 9, 7, 25);
          const color = mag > 18 ? C.red : mag > 8 ? C.amber : C.teal;
          drawVector(ctx, x, y, x + (f.ex / mag) * length, y + (f.ey / mag) * length, color);
        }
      }
      charges.forEach((c) => drawCharge(ctx, c.x, c.y, c.q));
      drawBall(ctx, probe.x, probe.y, 8, C.ink);
      // 探针箭头长度做上限，避免靠近电荷时冲出画布 / cap the probe arrow length
      const probeLen = Math.min(probeMag * 9, 160);
      if (probeMag > 0) {
        drawVector(ctx, probe.x, probe.y, probe.x + (probeField.ex / probeMag) * probeLen, probe.y + (probeField.ey / probeMag) * probeLen, C.ink, "E");
      }
      label(ctx, "探针", probe.x + 12, probe.y - 12, C.ink);

      return {
        caption: "每个小箭头都表示该点正试探电荷的受力方向；总场强由两个点电荷的场强矢量相加得到。",
        metrics: [
          metric("探针 |E|", `${format(probeMag, 2)} 相对单位`),
          metric("Eₓ", format(probeField.ex, 2)),
          metric("Eᵧ", format(-probeField.ey, 2)),
          metric("电荷间距", withUnit(v.distance, 1, "m"))
        ]
      };
    },

    circuit(ctx, { w, h }, v, t) {
      const s = P.circuit(v);
      const left = w * 0.18;
      const right = w * 0.82;
      const top = h * 0.24;
      const bottom = h * 0.68;
      const loop = [[left, bottom], [left, top], [right, top], [right, bottom], [left, bottom]];

      ctx.save();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 5;
      polyline(ctx, loop);
      if (s.series) {
        drawBattery(ctx, left, (top + bottom) / 2, v.voltage);
        drawResistor(ctx, w * 0.45, top, w * 0.58, top, `R₁ ${format(v.r1, 0)}Ω`);
        drawResistor(ctx, right, h * 0.43, right, h * 0.56, `R₂ ${format(v.r2, 0)}Ω`);
        animateCharges(ctx, loop, s.current, t);
      } else {
        line(ctx, left, h * 0.42, right, h * 0.42);
        line(ctx, left, h * 0.55, right, h * 0.55);
        drawBattery(ctx, left, (top + bottom) / 2, v.voltage);
        drawResistor(ctx, w * 0.43, h * 0.42, w * 0.58, h * 0.42, `R₁ ${format(v.r1, 0)}Ω`);
        drawResistor(ctx, w * 0.43, h * 0.55, w * 0.58, h * 0.55, `R₂ ${format(v.r2, 0)}Ω`);
        animateCharges(ctx, loop, s.current, t);
        animateCharges(ctx, [[left, h * 0.42], [right, h * 0.42]], s.i1, t + 1);
        animateCharges(ctx, [[left, h * 0.55], [right, h * 0.55]], s.i2, t + 2);
      }
      ctx.restore();
      label(ctx, `${s.series ? "串联" : "并联"}：R等效 = ${format(s.req, 2)} Ω`, w * 0.34, h * 0.82, C.ink);

      return {
        caption: s.series ? "串联电路各处电流相等，电压按电阻比例分配。" : "并联电路各支路电压相等，总电流等于各支路电流之和。",
        metrics: [
          metric("等效电阻", withUnit(s.req, 2, "Ω")),
          metric("总电流", withUnit(s.current, 3, "A")),
          metric("R₁ 电压/电流", `${withUnit(s.u1, 2, "V")} / ${withUnit(s.i1, 3, "A")}`),
          metric("R₂ 电压/电流", `${withUnit(s.u2, 2, "V")} / ${withUnit(s.i2, 3, "A")}`),
          metric("总功率", withUnit(s.power, 2, "W"))
        ]
      };
    },

    induction(ctx, { w, h }, v, t) {
      const s = P.induction(v, t);
      // 磁铁+线圈区域按可用宽度缩放，避免窄画布中与 ε-t 图重叠
      const k = Math.min(1, (w * 0.54) / 560, (h * 0.8) / 260);
      const center = { x: w * 0.3, y: h * 0.45 };
      const coilW = 190 * Math.abs(Math.cos(s.theta)) + 26;
      const coilH = 150;

      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.scale(k, k);
      ctx.translate(-center.x, -center.y);
      label(ctx, "N", center.x - 250, center.y - 116, C.red);
      label(ctx, "S", center.x + 218, center.y - 116, C.blue);
      roundedRect(ctx, center.x - 270, center.y - 95, 74, 190, 8, C.red);
      roundedRect(ctx, center.x + 196, center.y - 95, 74, 190, 8, C.blue);
      for (let y = center.y - 72; y <= center.y + 72; y += 36) {
        drawVector(ctx, center.x - 176, y, center.x + 176, y, C.muted);
      }
      ctx.save();
      ctx.strokeStyle = C.teal;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(center.x, center.y, coilW / 2, coilH / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      drawVector(ctx, center.x, center.y, center.x + Math.cos(s.theta + Math.PI / 2) * 90, center.y + Math.sin(s.theta + Math.PI / 2) * 70, C.amber, "转动");
      ctx.restore();

      const graphX = w * 0.6;
      const graphY = h * 0.28;
      const graphW = w * 0.34;
      const graphH = h * 0.38;
      drawGraphFrame(ctx, graphX, graphY, graphW, graphH, "ε-t");
      scrollingCurve(ctx, graphX, graphY, graphW, graphH, t, 90, 0.4, (lt) => Math.sin(v.omega * lt), C.red);
      drawBall(ctx, graphX + graphW - 2, graphY + graphH / 2 - Math.sin(s.theta) * graphH * 0.4, 5, C.red);

      return {
        caption: "线圈匀速转动时，磁通量按余弦变化，感应电动势按正弦变化，二者相差四分之一个周期。",
        metrics: [
          metric("磁通量 Φ", withUnit(s.flux, 3, "Wb")),
          metric("瞬时电动势", withUnit(s.emf, 3, "V")),
          metric("最大电动势", withUnit(s.emfMax, 3, "V")),
          metric("频率", withUnit(s.frequency, 2, "Hz"))
        ]
      };
    },

    interference(ctx, { w, h }, v, t) {
      const sourceA = { x: w / 2, y: h / 2 - v.separation / 2 };
      const sourceB = { x: w / 2, y: h / 2 + v.separation / 2 };
      const wave = { k: (2 * Math.PI) / v.wavelength, omega: 2.4, phase: (v.phase * Math.PI) / 180, amplitude: v.amplitude };
      const cell = Math.max(5, Math.floor(Math.min(w, h) / 115));
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      const buffer = getWaveBuffer(cols, rows);

      if (buffer) {
        // 性能优化：在低分辨率 ImageData 中逐像素计算，再一次性放大绘制，
        // 取代原先每帧数万次 fillRect + 颜色字符串拼接。
        const data = buffer.image.data;
        let idx = 0;
        for (let row = 0; row < rows; row += 1) {
          const y = row * cell;
          for (let col = 0; col < cols; col += 1) {
            const x = col * cell;
            const value = P.waveSuperposition(distance(x, y, sourceA.x, sourceA.y), distance(x, y, sourceB.x, sourceB.y), wave, t);
            const alpha = 0.18 + Math.min(1, Math.abs(value) / (2 * v.amplitude)) * 0.62;
            if (value >= 0) {
              data[idx] = 219; data[idx + 1] = 76; data[idx + 2] = 64;
            } else {
              data[idx] = 50; data[idx + 1] = 105; data[idx + 2] = 200;
            }
            data[idx + 3] = Math.round(alpha * 255);
            idx += 4;
          }
        }
        buffer.ctx.putImageData(buffer.image, 0, 0);
        ctx.save();
        ctx.imageSmoothingEnabled = true; // 双线性插值放大，条纹更平滑
        ctx.drawImage(buffer.canvas, 0, 0, cols * cell, rows * cell);
        ctx.restore();
      } else {
        for (let y = 0; y < h; y += cell) {
          for (let x = 0; x < w; x += cell) {
            const value = P.waveSuperposition(distance(x, y, sourceA.x, sourceA.y), distance(x, y, sourceB.x, sourceB.y), wave, t);
            const alpha = 0.18 + Math.min(1, Math.abs(value) / (2 * v.amplitude)) * 0.62;
            ctx.fillStyle = value >= 0 ? `rgba(219, 76, 64, ${alpha})` : `rgba(50, 105, 200, ${alpha})`;
            ctx.fillRect(x, y, cell + 1, cell + 1);
          }
        }
      }

      drawBall(ctx, sourceA.x, sourceA.y, 11, C.red);
      drawBall(ctx, sourceB.x, sourceB.y, 11, C.red);
      label(ctx, "S₁", sourceA.x + 14, sourceA.y - 10, C.ink);
      label(ctx, "S₂", sourceB.x + 14, sourceB.y + 18, C.ink);
      const probe = { x: w * 0.75, y: h * 0.5 };
      drawBall(ctx, probe.x, probe.y, 7, C.ink);
      label(ctx, "探针 P", probe.x + 12, probe.y - 12, C.ink);
      const diff = Math.abs(distance(probe.x, probe.y, sourceA.x, sourceA.y) - distance(probe.x, probe.y, sourceB.x, sourceB.y));

      return {
        caption: "颜色越暖表示此刻位移越偏正，越冷表示位移越偏负；稳定的条纹来自相长与相消位置。",
        metrics: [
          metric("波长", withUnit(v.wavelength, 0, "px")),
          metric("波源相位差", `${format(v.phase, 0)}°`),
          metric("探针波程差", withUnit(diff, 1, "px")),
          metric("Δr / λ", format(diff / v.wavelength, 2))
        ]
      };
    },

    lens(ctx, { w, h }, v) {
      const s = P.lens(v);
      const axisY = h * 0.52;
      const lensX = w * 0.5;
      const scale = Math.min((w - 140) / 120, (h - 140) / 34);
      const objectX = lensX - v.object * scale;
      const objectTop = axisY - v.height * scale;
      const finite = !s.atInfinity;
      const imageX = finite ? lensX + s.imageDistance * scale : w + 200;
      const imageTop = finite ? axisY - s.imageHeight * scale : axisY;

      line(ctx, 48, axisY, w - 48, axisY, C.muted, 2);
      drawLensShape(ctx, lensX, axisY, 92);
      drawFocus(ctx, lensX - v.focal * scale, axisY, "F");
      drawFocus(ctx, lensX + v.focal * scale, axisY, "F");
      drawArrow(ctx, objectX, axisY, objectX, objectTop, C.red, "物");
      if (finite && Math.abs(imageX) < w * 1.4) {
        drawArrow(ctx, imageX, axisY, imageX, imageTop, s.real ? C.blue : C.teal, s.real ? "实像" : "虚像");
      }

      // 平行于主光轴的光线 / ray parallel to the axis
      line(ctx, objectX, objectTop, lensX, objectTop, C.red, 2);
      if (s.real) {
        line(ctx, lensX, objectTop, imageX, imageTop, C.red, 2);
        line(ctx, objectX, objectTop, imageX, imageTop, C.amber, 2);
      } else {
        // 折射后经过右焦点的实际光线 + 反向延长线
        const fx = lensX + v.focal * scale;
        const slope = (axisY - objectTop) / (fx - lensX);
        line(ctx, lensX, objectTop, w - 60, objectTop + slope * (w - 60 - lensX), C.red, 2);
        // 过光心的光线（实际光线 + 反向延长线）
        const cSlope = (axisY - objectTop) / (lensX - objectX);
        line(ctx, objectX, objectTop, w - 60, objectTop + cSlope * (w - 60 - objectX), C.amber, 2);
        if (finite) {
          dashedLine(ctx, lensX, objectTop, imageX, imageTop, C.teal);
          dashedLine(ctx, lensX, axisY, imageX, imageTop, C.amber);
        }
      }

      return {
        caption: "凸透镜成像可以用三条特殊光线快速定位；靠近焦点时，像距和放大率变化最剧烈。",
        metrics: [
          metric("像距 v", finite ? withUnit(s.imageDistance, 2, "cm") : "∞"),
          metric("放大率 m", finite ? format(s.magnification, 2) : "∞"),
          metric("像高 h'", finite ? withUnit(s.imageHeight, 2, "cm") : "∞"),
          metric("成像性质", s.nature)
        ]
      };
    },

    refraction(ctx, { w, h }, v) {
      const s = P.refraction(v);
      const cx = w / 2;
      const cy = h / 2;

      ctx.save();
      ctx.fillStyle = "rgba(50, 105, 200, 0.08)";
      ctx.fillRect(0, 0, w, cy);
      ctx.fillStyle = "rgba(0, 127, 143, 0.12)";
      ctx.fillRect(0, cy, w, h - cy);
      ctx.restore();
      line(ctx, 46, cy, w - 46, cy, C.ink, 3);
      dashedLine(ctx, cx, 70, cx, h - 70, C.muted);
      label(ctx, `n₁ = ${format(v.n1, 2)}`, 70, cy - 34, C.ink);
      label(ctx, `n₂ = ${format(v.n2, 2)}`, 70, cy + 50, C.ink);

      const rayLen = Math.min(w, h) * 0.34;
      const sinI = Math.sin(s.i);
      const cosI = Math.cos(s.i);
      drawVector(ctx, cx - sinI * rayLen, cy - cosI * rayLen, cx, cy, C.red, "入射光");
      drawVector(ctx, cx, cy, cx + sinI * rayLen, cy - cosI * rayLen, C.amber, "反射光");
      if (v.angle > 0) drawAngle(ctx, cx, cy, -Math.PI / 2, -Math.PI / 2 - s.i, 42, C.red, "i");
      if (s.totalInternal) {
        label(ctx, "全反射", cx + 34, cy + 44, C.red);
      } else {
        drawVector(ctx, cx, cy, cx + Math.sin(s.r) * rayLen, cy + Math.cos(s.r) * rayLen, C.blue, "折射光");
        drawAngle(ctx, cx, cy, Math.PI / 2, Math.PI / 2 - s.r, 58, C.blue, "r");
      }

      return {
        caption: "折射角由两种介质的折射率共同决定；从光密介质到光疏介质时才可能出现全反射。",
        metrics: [
          metric("折射角", s.totalInternal ? "无折射光" : `${format(toDeg(s.r), 2)}°`),
          metric("是否全反射", s.totalInternal ? "是" : "否"),
          metric("临界角", s.critical !== null ? `${format(toDeg(s.critical), 2)}°` : "不存在"),
          metric("n₁sin i", format(s.n1SinI, 3))
        ]
      };
    },

    gas(ctx, { w, h }, v, t) {
      const s = P.gas(v);
      const boxX = w * 0.25;
      const boxY = h * 0.18;
      const boxW = w * 0.5;
      const maxH = h * 0.58;
      const boxH = lerp(maxH * 0.45, maxH, (v.volume - 4) / 22);
      const pistonY = boxY + (maxH - boxH);
      const moleculeCount = Math.round(18 + v.amount * 16);
      const palette = [C.red, C.blue, C.teal];

      ctx.save();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4;
      ctx.strokeRect(boxX, pistonY, boxW, boxH);
      ctx.restore();
      roundedRect(ctx, boxX - 12, pistonY - 18, boxW + 24, 18, 4, C.muted);
      drawVector(ctx, boxX + boxW + 38, pistonY + 10, boxX + boxW + 38, pistonY + 70, C.red, "P");
      for (let i = 0; i < moleculeCount; i += 1) {
        const x = boxX + 12 + mod(pseudo(i * 17.3) * boxW + Math.sin(t * s.speedFactor + i) * 50, boxW - 24);
        const y = pistonY + 16 + mod(pseudo(i * 41.9) * boxH + Math.cos(t * s.speedFactor * 1.3 + i * 0.7) * 42, boxH - 32);
        drawBall(ctx, x, y, 4, palette[i % 3]);
      }
      label(ctx, `V = ${format(v.volume, 1)} L`, boxX + 18, pistonY + boxH + 30, C.ink);
      label(ctx, `T = ${format(v.temperature, 0)} K`, boxX + boxW - 100, pistonY + boxH + 30, C.ink);

      return {
        caption: "理想气体模型把大量分子碰撞的宏观效果概括为压强、体积和温度的关系。",
        metrics: [
          metric("压强 P", withUnit(s.pressure / 1000, 2, "kPa")),
          metric("PV", withUnit(s.pressure * s.volumeM3, 2, "J")),
          metric("nRT", withUnit(s.nRT, 2, "J")),
          metric("相对方均根速率", `${format(s.speedFactor, 2)} 倍`)
        ]
      };
    },

    photoelectric(ctx, { w, h }, v, t) {
      const s = P.photoelectric(v);
      const metalX = w * 0.48;
      const metalY = h * 0.25;
      const metalW = 56;
      const metalH = h * 0.5;

      roundedRect(ctx, metalX, metalY, metalW, metalH, 8, C.muted);
      label(ctx, "金属板", metalX - 6, metalY + metalH + 32, C.ink);
      const count = 3 + v.intensity;
      for (let i = 0; i < count; i += 1) {
        const y = metalY + 26 + (i / count) * (metalH - 42);
        drawPhoton(ctx, 34 + mod(t * 110 + i * 43, metalX - 80), y, metalX - 10, y, C.amber);
      }
      if (s.emits) {
        const electronCount = Math.min(12, 3 + v.intensity);
        for (let i = 0; i < electronCount; i += 1) {
          const startY = metalY + 28 + (i / electronCount) * (metalH - 48);
          const travel = mod(t * (70 + s.kinetic * 28) + i * 54, Math.max(1, w - metalX - 120));
          const ex = metalX + metalW + 18 + travel;
          const ey = startY + Math.sin(t * 3 + i) * 20;
          drawBall(ctx, ex, ey, 6, C.blue);
          drawVector(ctx, ex - 30, ey, ex + 10, ey, C.blue);
        }
      } else {
        label(ctx, "频率低于截止频率，无光电子逸出", metalX + 82, h * 0.5, C.red);
      }
      drawEnergyBars(ctx, 78, h - 122, w - 156, s.photonEnergy, v.work, s.kinetic);

      return {
        caption: "能否发生光电效应由光子能量和逸出功决定；光强主要改变单位时间内的光电子数。",
        metrics: [
          metric("光子能量 hf", withUnit(s.photonEnergy, 2, "eV")),
          metric("最大初动能", withUnit(s.kinetic, 2, "eV")),
          metric("遏止电压", withUnit(s.stoppingVoltage, 2, "V")),
          metric("截止频率", `${format(s.cutoff, 2)} ×10¹⁴ Hz`),
          metric("是否逸出", s.emits ? "能" : "不能")
        ]
      };
    }
  };

  /** 无时间依赖的静态场景：暂停或空闲时无需逐帧重绘。 */
  const staticRenderers = new Set(["electricField", "lens", "refraction"]);

  PV.renderers = renderers;
  PV.staticRenderers = staticRenderers;
})(typeof globalThis !== "undefined" ? globalThis : window);
