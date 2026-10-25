// 在 Node 中按浏览器顺序加载共享脚本（不含依赖 DOM 的 app.js）。
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadPhysicsViz() {
  const context = vm.createContext({ Math, Number, String, Object, Map, Set, Array, console });
  context.globalThis = context;
  for (const file of ["utils.js", "physics.js", "topics.js", "draw.js", "renderers.js"]) {
    const code = fs.readFileSync(path.join(__dirname, "..", "js", file), "utf8");
    vm.runInContext(code, context, { filename: file });
  }
  return context.PhysicsViz;
}

/** 记录调用但不绘制的伪 CanvasRenderingContext2D。 */
function mockContext() {
  const calls = { count: 0, nonFinite: [] };
  const target = {
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: (...args) => {
      if (args.some((a) => !Number.isFinite(a))) calls.nonFinite.push(["createRadialGradient", args]);
      return { addColorStop() {} };
    }
  };
  const proxy = new Proxy(target, {
    get(obj, key) {
      if (key in obj) return obj[key];
      if (key === "__calls") return calls;
      return (...args) => {
        calls.count += 1;
      };
    },
    set(obj, key, value) {
      obj[key] = value;
      return true;
    }
  });
  return proxy;
}

module.exports = { loadPhysicsViz, mockContext };
