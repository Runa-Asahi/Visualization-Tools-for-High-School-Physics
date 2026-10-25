const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { loadPhysicsViz } = require("./load");

const PV = loadPhysicsViz();
// classroom.js 依赖 utils，单独加载到同一上下文
const ctx = vm.createContext({ Math, Number, String, Object, Map, Set, Array, RegExp, decodeURIComponent, encodeURIComponent, PhysicsViz: PV });
ctx.globalThis = ctx;
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "js", "classroom.js"), "utf8"), ctx);
const C = PV.classroom;
const topicById = new Map(PV.topics.map((t) => [t.id, t]));

test("encodeState only writes non-default values", () => {
  const lens = topicById.get("lens");
  const defaults = Object.fromEntries(lens.controls.map((c) => [c.key, c.default]));
  assert.equal(C.encodeState(lens, defaults), "lens");
  assert.equal(C.encodeState(lens, { ...defaults, object: 24 }), "lens?object=24");
});

test("decodeState round-trips and validates", () => {
  const r = C.decodeState("#lens?object=24&focal=10", topicById);
  assert.equal(r.id, "lens");
  assert.equal(r.values.object, 24);
  assert.equal(r.values.focal, 10);
  assert.equal(r.hasParams, true);
  assert.equal(C.decodeState("#nope", topicById), null);
  const clamped = C.decodeState("lens?object=999&focal=abc&evil=1", topicById);
  assert.equal(clamped.values.object, 70);
  assert.equal(clamped.values.focal, 16);
  const snapped = C.decodeState("collision?e=0.83", topicById);
  assert.equal(snapped.values.e, 0.85);
  const sel = C.decodeState("circuit?mode=parallel", topicById);
  assert.equal(sel.values.mode, "parallel");
  assert.equal(C.decodeState("circuit?mode=xx", topicById).values.mode, "series");
  assert.equal(C.decodeState("lens", topicById).hasParams, false);
});

test("every topic round-trips its presets through the URL", () => {
  for (const topic of PV.topics) {
    for (const preset of topic.presets) {
      const values = { ...Object.fromEntries(topic.controls.map((c) => [c.key, c.default])), ...preset.values };
      const back = C.decodeState(C.encodeState(topic, values), topicById);
      assert.deepEqual({ ...back.values }, values, `${topic.id}/${preset.label}`);
    }
  }
});

test("toCSV escapes and adds BOM", () => {
  const csv = C.toCSV(["a", "b"], [["1,2", 'say "hi"'], [3, null]]);
  assert.equal(csv, '\uFEFFa,b\r\n"1,2","say ""hi"""\r\n3,');
});

test("parseMetricNumber / metricUnit", () => {
  assert.equal(C.parseMetricNumber("12.5 m/s"), 12.5);
  assert.equal(C.parseMetricNumber("-2.09 m/s"), -2.09);
  assert.equal(C.parseMetricNumber("4.5 V / 0.25 A"), 4.5);
  assert.ok(Number.isNaN(C.parseMetricNumber("是")));
  assert.equal(C.metricUnit("12.5 m/s"), "m/s");
  assert.equal(C.metricUnit("0"), "");
});
