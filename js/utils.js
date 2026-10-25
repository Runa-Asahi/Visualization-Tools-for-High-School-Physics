/**
 * 通用数学与格式化工具 / Generic math & formatting helpers.
 * 所有模块通过全局命名空间 PhysicsViz 共享，保证双击 index.html（file://）也能运行。
 */
(function (root) {
  "use strict";
  const PV = (root.PhysicsViz = root.PhysicsViz || {});

  /** 保留 digits 位小数并去掉多余的 0；非有限数显示为 ∞。 */
  function format(value, digits = 2) {
    if (!Number.isFinite(value)) return "∞";
    let rounded = Number(value).toFixed(digits);
    // 只去掉小数部分末尾的 0。原实现会把整数 "300" 误裁成 "3"。
    if (rounded.includes(".")) rounded = rounded.replace(/\.?0+$/, "");
    return rounded === "-0" ? "0" : rounded;
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const toDeg = (radians) => (radians * 180) / Math.PI;
  const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  /** 确定性伪随机数，范围 [0, 1)。 */
  const pseudo = (seed) => Math.abs(Math.sin(seed) * 43758.5453) % 1;
  /** 始终返回非负结果的取模。 */
  const mod = (value, base) => ((value % base) + base) % base;

  /** 将 #rrggbb 颜色整体加/减亮度。 */
  function shade(hex, amount) {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = clamp((num >> 16) + amount, 0, 255);
    const g = clamp(((num >> 8) & 0xff) + amount, 0, 255);
    const b = clamp((num & 0xff) + amount, 0, 255);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /** 根据滑块步长推断显示的小数位数。 */
  function decimalsFromStep(step) {
    const text = String(step);
    return text.includes(".") ? text.split(".")[1].length : 0;
  }

  /** 带单位的格式化，如 withUnit(1.234, 2, "m") → "1.23 m"。 */
  const withUnit = (value, digits, unit) => `${format(value, digits)}${unit ? ` ${unit}` : ""}`;

  PV.utils = { format, clamp, lerp, toRad, toDeg, distance, pseudo, mod, shade, decimalsFromStep, withUnit };
})(typeof globalThis !== "undefined" ? globalThis : window);
