const test = require("node:test");
const assert = require("node:assert/strict");
const { loadPhysicsViz } = require("./load");

const PV = loadPhysicsViz();
const P = PV.physics;
const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test("format trims trailing zeros and handles infinity / negative zero", () => {
  const { format } = PV.utils;
  assert.equal(format(1.5, 2), "1.5");
  assert.equal(format(2, 2), "2");
  assert.equal(format(Infinity), "∞");
  assert.equal(format(-0.0001, 2), "0");
  assert.equal(format(10, 0), "10");
  assert.equal(format(300, 0), "300");
  assert.equal(format(20, 2), "20");
  assert.equal(format(1.20, 2), "1.2");
});

test("decimalsFromStep", () => {
  assert.equal(PV.utils.decimalsFromStep(1), 0);
  assert.equal(PV.utils.decimalsFromStep(0.05), 2);
});

test("projectile: horizontal launch from height", () => {
  const s = P.projectile({ speed: 10, angle: 0, height: 4.9, gravity: 9.8 });
  close(s.flight, 1);
  close(s.range, 10);
  close(s.maxHeight, 4.9);
});

test("projectile: 45° from ground has range v²/g", () => {
  const s = P.projectile({ speed: 20, angle: 45, height: 0, gravity: 10 });
  close(s.range, 40, 1e-9);
  close(s.maxHeight, 10, 1e-9);
});

test("circular motion", () => {
  const s = P.circular({ radius: 2, speed: 4, mass: 3 });
  close(s.omega, 2);
  close(s.accel, 8);
  close(s.force, 24);
  close(s.period, Math.PI);
});

test("shm energy and period", () => {
  const s = P.shm({ amplitude: 10, omega: 2, mass: 1 }, 0);
  close(s.x, 10);
  close(s.k, 4);
  close(s.energy, 0.5 * 4 * 0.01);
  close(s.period, Math.PI);
});

test("collision conserves momentum for any e", () => {
  for (const e of [0, 0.5, 1]) {
    const s = P.collision({ m1: 1.4, m2: 2, v1: 4, v2: -1.6, e });
    close(s.pBefore, s.pAfter, 1e-9);
    close(s.v2f - s.v1f, e * (4 - -1.6), 1e-9);
  }
  const elastic = P.collision({ m1: 1, m2: 1, v1: 3, v2: -1, e: 1 });
  close(elastic.v1f, -1);
  close(elastic.v2f, 3);
  close(elastic.kBefore, elastic.kAfter);
});

test("collision: no impact when left cart is not faster", () => {
  const s = P.collision({ m1: 1, m2: 1, v1: 0.5, v2: 1, e: 0.5 });
  assert.equal(s.willCollide, false);
  assert.equal(s.v1f, 0.5);
  assert.equal(s.v2f, 1);
});

test("circuit series / parallel", () => {
  const s = P.circuit({ mode: "series", voltage: 12, r1: 4, r2: 8 });
  close(s.req, 12);
  close(s.current, 1);
  close(s.u1 + s.u2, 12);
  const p = P.circuit({ mode: "parallel", voltage: 12, r1: 6, r2: 3 });
  close(p.req, 2);
  close(p.i1 + p.i2, p.current);
});

test("electric field superposition is symmetric for equal charges", () => {
  const charges = [{ q: 1, x: -10, y: 0 }, { q: 1, x: 10, y: 0 }];
  const f = P.fieldAt(0, 0, charges, 1);
  close(f.ex, 0);
  close(f.ey, 0);
});

test("induction emf is 90° out of phase with flux", () => {
  const s = P.induction({ turns: 10, field: 1, area: 0.1, omega: 2 }, 0);
  close(s.flux, 0.1);
  close(s.emf, 0);
  close(s.emfMax, 2);
});

test("lens: thin lens equation and image nature", () => {
  const s = P.lens({ focal: 10, object: 30, height: 4 });
  close(s.imageDistance, 15);
  close(s.magnification, -0.5);
  assert.equal(s.real, true);
  assert.equal(s.nature, "倒立缩小实像");
  const v = P.lens({ focal: 20, object: 10, height: 4 });
  assert.equal(v.real, false);
  assert.ok(v.magnification > 1);
  assert.equal(P.lens({ focal: 16, object: 16, height: 4 }).atInfinity, true);
});

test("refraction and total internal reflection", () => {
  const s = P.refraction({ n1: 1, n2: 1.5, angle: 30 });
  close(Math.sin(s.r), 0.5 / 1.5);
  assert.equal(s.critical, null);
  const t = P.refraction({ n1: 1.5, n2: 1, angle: 60 });
  assert.equal(t.totalInternal, true);
  close(t.critical, Math.asin(1 / 1.5));
});

test("ideal gas", () => {
  const s = P.gas({ temperature: 300, volume: 24.942, amount: 1 });
  close(s.pressure, 100000, 1);
  close(s.speedFactor, 1);
});

test("photoelectric threshold", () => {
  const s = P.photoelectric({ frequency: 8, work: 2.3 });
  assert.equal(s.emits, true);
  close(s.kinetic, 0.41357 * 8 - 2.3);
  const n = P.photoelectric({ frequency: 3, work: 5 });
  assert.equal(n.emits, false);
  assert.equal(n.kinetic, 0);
});
