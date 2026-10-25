/**
 * 课堂实用工具的纯函数部分（无 DOM）：分享链接编解码、CSV 生成、数值解析。
 * Pure helpers for classroom tools: share-link encoding, CSV export, number parsing.
 */
(function (root) {
  "use strict";
  const PV = (root.PhysicsViz = root.PhysicsViz || {});
  const { decimalsFromStep } = PV.utils;

  /** 把滑块值吸附到 [min, max] 内最近的步长格点上。 */
  function snapToControl(control, raw) {
    if (control.type === "select") {
      return control.options.some((o) => o.value === raw) ? raw : control.default;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) return control.default;
    const clamped = Math.min(control.max, Math.max(control.min, n));
    const steps = Math.round((clamped - control.min) / control.step);
    const snapped = Math.min(control.max, control.min + steps * control.step);
    return Number(snapped.toFixed(decimalsFromStep(control.step)));
  }

  /** 生成 hash，例如 "lens?focal=16&object=24"；只写入与默认值不同的参数。 */
  function encodeState(topic, values) {
    const parts = [];
    topic.controls.forEach((c) => {
      const v = values[c.key];
      if (v !== undefined && v !== c.default) parts.push(`${encodeURIComponent(c.key)}=${encodeURIComponent(v)}`);
    });
    return parts.length ? `${topic.id}?${parts.join("&")}` : topic.id;
  }

  /**
   * 解析 hash（可带或不带 #）。未知主题返回 null；参数会被校验、限幅、吸附到步长。
   * @returns {{ id: string, values: object, hasParams: boolean } | null}
   */
  function decodeState(hash, topicById) {
    let text = String(hash || "").replace(/^#/, "");
    try {
      text = decodeURIComponent(text);
    } catch (error) {
      /* 保留原文 */
    }
    const [id, query = ""] = text.split("?");
    const topic = topicById.get(id);
    if (!topic) return null;
    const values = Object.fromEntries(topic.controls.map((c) => [c.key, c.default]));
    let hasParams = false;
    query.split("&").filter(Boolean).forEach((pair) => {
      const [k, v = ""] = pair.split("=");
      const control = topic.controls.find((c) => c.key === k);
      if (!control) return;
      values[k] = snapToControl(control, v);
      hasParams = true;
    });
    return { id, values, hasParams };
  }

  /** 生成 CSV（带 UTF-8 BOM，Excel 打开中文不乱码）。 */
  function toCSV(headers, rows) {
    const esc = (cell) => {
      const s = cell === null || cell === undefined ? "" : String(cell);
      return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return "\uFEFF" + [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  }

  /** 从 "12.5 m/s"、"-2.09 m/s"、"0.5 V / 0.25 A" 中取第一个数；没有数字时返回 NaN。 */
  function parseMetricNumber(text) {
    const m = String(text).replace(/−/g, "-").match(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/i);
    return m ? Number(m[0]) : NaN;
  }

  /** 去掉数值部分，得到单位，例如 "12.5 m/s" → "m/s"。 */
  function metricUnit(text) {
    const m = String(text).match(/^-?\d+(?:\.\d+)?\s*(.*)$/);
    return m ? m[1].trim() : "";
  }

  const CODE_KEYS = {
    Space: " ",
    Period: ".",
    NumpadDecimal: ".",
    Slash: "/",
    BracketLeft: "[",
    BracketRight: "]",
    Escape: "escape",
    ArrowLeft: "arrowleft",
    ArrowRight: "arrowright"
  };

  /**
   * 把键盘事件归一化成快捷键名（小写字母、"?"、"/"、"["、"]"、"."、" "、"escape" 等）。
   * 中文输入法开启时 keydown 的 key 是 "Process"（或全角字符），CapsLock / Shift 会得到大写，
   * 因此字母键优先使用与布局无关的 event.code（KeyP → "p"）。
   */
  function shortcutKey(event) {
    const code = event.code || "";
    if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
    if (code === "Slash" && event.shiftKey) return "?";
    if (CODE_KEYS[code] !== undefined) return CODE_KEYS[code];
    let key = String(event.key || "");
    // 全角字符 → 半角（如 ｐ → p、？ → ?、［ → [）
    key = key.replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
    if (key === "。") key = ".";
    if (key === "、") key = "/";
    if (key === "【") key = "[";
    if (key === "】") key = "]";
    if (key.length === 1) return key.toLowerCase();
    return key.toLowerCase();
  }

  PV.classroom = { shortcutKey, snapToControl, encodeState, decodeState, toCSV, parseMetricNumber, metricUnit };
})(typeof globalThis !== "undefined" ? globalThis : window);
