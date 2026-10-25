const test = require("node:test");
const assert = require("node:assert/strict");
const { loadPhysicsViz, mockContext } = require("./load");

const PV = loadPhysicsViz();

test("topic data is well-formed", () => {
  const ids = new Set();
  for (const topic of PV.topics) {
    assert.ok(!ids.has(topic.id), `duplicate id ${topic.id}`);
    ids.add(topic.id);
    assert.ok(PV.domains.includes(topic.domain), `${topic.id}: unknown domain`);
    assert.equal(typeof PV.renderers[topic.renderer], "function", `${topic.id}: missing renderer`);
    for (const key of ["question", "observation", "mistake"]) assert.ok(topic.teaching[key]);
    for (const c of topic.controls) {
      if (c.type === "select") {
        assert.ok(c.options.some((o) => o.value === c.default), `${topic.id}.${c.key} default`);
      } else {
        assert.ok(c.min <= c.default && c.default <= c.max, `${topic.id}.${c.key} default out of range`);
        assert.ok(c.step > 0);
      }
    }
  }
});

/** 生成每个参数取 最小 / 默认 / 最大 的组合样本。 */
function samples(topic) {
  const base = Object.fromEntries(topic.controls.map((c) => [c.key, c.default]));
  const out = [base];
  for (const c of topic.controls) {
    const values = c.type === "select" ? c.options.map((o) => o.value) : [c.min, c.max];
    for (const value of values) out.push({ ...base, [c.key]: value });
  }
  out.push(Object.fromEntries(topic.controls.map((c) => [c.key, c.type === "select" ? c.default : c.min])));
  out.push(Object.fromEntries(topic.controls.map((c) => [c.key, c.type === "select" ? c.default : c.max])));
  return out;
}

for (const topic of PV.topics) {
  test(`renderer "${topic.renderer}" works across parameter extremes`, () => {
    for (const values of samples(topic)) {
      for (const t of [0, 0.37, 2.5, 13.1]) {
        for (const size of [{ w: 320, h: 360 }, { w: 1200, h: 760 }]) {
          const ctx = mockContext();
          const result = PV.renderers[topic.renderer](ctx, size, values, t);
          assert.equal(typeof result.caption, "string");
          assert.ok(result.metrics.length > 0);
          for (const m of result.metrics) {
            assert.equal(typeof m.value, "string");
            assert.ok(!/NaN|undefined/.test(m.value), `${topic.id} ${m.label}=${m.value} for ${JSON.stringify(values)}`);
          }
          assert.deepEqual(ctx.__calls.nonFinite, [], `${topic.id}: non-finite gradient`);
        }
      }
    }
  });
}
