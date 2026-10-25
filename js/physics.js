/**
 * 纯物理计算（不涉及绘图），便于单元测试。
 * Pure physics models used by the renderers; no DOM / canvas access here.
 */
(function (root) {
  "use strict";
  const PV = (root.PhysicsViz = root.PhysicsViz || {});
  const { toRad, mod } = PV.utils;

  const R_GAS = 8.314; // J/(mol·K)
  const PLANCK_EV_1E14 = 0.41357; // h = 4.1357e-15 eV·s，频率单位为 1e14 Hz

  /** 平抛/斜抛：返回整体量与 t 时刻的状态（t 按飞行时间循环）。 */
  function projectile({ speed, angle, height, gravity: g }, t = 0) {
    const a = toRad(angle);
    const vx = speed * Math.cos(a);
    const vy0 = speed * Math.sin(a);
    const flight = (vy0 + Math.sqrt(vy0 * vy0 + 2 * g * height)) / g;
    const maxHeight = height + (vy0 > 0 ? (vy0 * vy0) / (2 * g) : 0);
    const range = vx * flight;
    const simT = flight > 0 ? mod(t, flight) : 0;
    const positionAt = (time) => ({ x: vx * time, y: height + vy0 * time - 0.5 * g * time * time });
    const { x, y } = positionAt(simT);
    return { vx, vy0, flight, maxHeight, range, simT, x, y, vy: vy0 - g * simT, positionAt };
  }

  function circular({ radius, speed, mass }) {
    const omega = speed / radius;
    const accel = (speed * speed) / radius;
    return { omega, accel, force: mass * accel, period: (2 * Math.PI) / omega };
  }

  /** 简谐运动；振幅单位 cm。 */
  function shm({ amplitude, omega, mass }, t = 0) {
    const x = amplitude * Math.cos(omega * t);
    const k = mass * omega * omega;
    return {
      x,
      velocity: -amplitude * omega * Math.sin(omega * t),
      acceleration: -omega * omega * x,
      period: (2 * Math.PI) / omega,
      k,
      energy: 0.5 * k * Math.pow(amplitude / 100, 2)
    };
  }

  /**
   * 一维碰撞（恢复系数 e）。若左车不比右车快（u1 <= u2），两车不会相碰，速度保持不变。
   */
  function collision({ m1, m2, v1: u1, v2: u2, e }) {
    const willCollide = u1 > u2;
    const total = m1 + m2;
    const v1f = willCollide ? (m1 * u1 + m2 * u2 - m2 * e * (u1 - u2)) / total : u1;
    const v2f = willCollide ? (m1 * u1 + m2 * u2 + m1 * e * (u1 - u2)) / total : u2;
    const ke = (a, b) => 0.5 * m1 * a * a + 0.5 * m2 * b * b;
    return {
      willCollide,
      v1f,
      v2f,
      pBefore: m1 * u1 + m2 * u2,
      pAfter: m1 * v1f + m2 * v2f,
      kBefore: ke(u1, u2),
      kAfter: ke(v1f, v2f)
    };
  }

  /** 点电荷场（画布坐标、相对单位），带软化避免奇点。 */
  function fieldAt(x, y, charges, scale, softening = 16) {
    let ex = 0;
    let ey = 0;
    const soft2 = softening * softening;
    const s2 = scale * scale;
    for (let i = 0; i < charges.length; i += 1) {
      const c = charges[i];
      const dx = x - c.x;
      const dy = y - c.y;
      const r2 = Math.max(dx * dx + dy * dy, soft2);
      const strength = (c.q * s2) / (r2 * Math.sqrt(r2));
      ex += strength * dx;
      ey += strength * dy;
    }
    return { ex, ey };
  }

  function circuit({ mode, voltage, r1, r2 }) {
    const series = mode === "series";
    const req = series ? r1 + r2 : (r1 * r2) / (r1 + r2);
    const current = voltage / req;
    return {
      series,
      req,
      current,
      i1: series ? current : voltage / r1,
      i2: series ? current : voltage / r2,
      u1: series ? current * r1 : voltage,
      u2: series ? current * r2 : voltage,
      power: voltage * current
    };
  }

  function induction({ turns, field, area, omega }, t = 0) {
    const theta = omega * t;
    const emfMax = turns * field * area * omega;
    return {
      theta,
      flux: field * area * Math.cos(theta),
      emfMax,
      emf: emfMax * Math.sin(theta),
      frequency: omega / (2 * Math.PI)
    };
  }

  /** 凸透镜成像（实物 u>0，v>0 为实像）。u≈f 时像在无穷远。 */
  function lens({ focal: f, object: u, height }) {
    const atInfinity = Math.abs(u - f) < 0.2;
    const imageDistance = atInfinity ? Infinity : (f * u) / (u - f);
    const magnification = atInfinity ? Infinity : -imageDistance / u;
    const imageHeight = atInfinity ? Infinity : magnification * height;
    const real = !atInfinity && imageDistance > 0;
    let nature = "无穷远处（不成像）";
    if (!atInfinity) nature = real ? `${imageHeight < 0 ? "倒立" : "正立"}${Math.abs(magnification) > 1 ? "放大" : Math.abs(magnification) < 1 ? "缩小" : "等大"}实像` : "正立放大虚像";
    return { atInfinity, imageDistance, magnification, imageHeight, real, nature };
  }

  function refraction({ n1, n2, angle }) {
    const i = toRad(angle);
    const sinR = (n1 / n2) * Math.sin(i);
    const totalInternal = sinR > 1;
    return {
      i,
      r: totalInternal ? null : Math.asin(sinR),
      totalInternal,
      critical: n1 > n2 ? Math.asin(n2 / n1) : null,
      n1SinI: n1 * Math.sin(i)
    };
  }

  /** 理想气体；体积单位 L，压强单位 Pa。 */
  function gas({ temperature, volume, amount }) {
    const volumeM3 = volume / 1000;
    const nRT = amount * R_GAS * temperature;
    return { pressure: nRT / volumeM3, nRT, volumeM3, speedFactor: Math.sqrt(temperature / 300) };
  }

  /** 光电效应；频率单位 1e14 Hz，能量单位 eV。 */
  function photoelectric({ frequency, work }) {
    const photonEnergy = PLANCK_EV_1E14 * frequency;
    const kinetic = Math.max(0, photonEnergy - work);
    return { photonEnergy, kinetic, cutoff: work / PLANCK_EV_1E14, emits: photonEnergy > work, stoppingVoltage: kinetic };
  }

  /** 双源干涉某点的叠加位移。 */
  function waveSuperposition(r1, r2, { k, omega, phase, amplitude }, t) {
    return amplitude * (Math.sin(k * r1 - omega * t) + Math.sin(k * r2 - omega * t + phase));
  }

  PV.physics = { R_GAS, PLANCK_EV_1E14, projectile, circular, shm, collision, fieldAt, circuit, induction, lens, refraction, gas, photoelectric, waveSuperposition };
})(typeof globalThis !== "undefined" ? globalThis : window);
