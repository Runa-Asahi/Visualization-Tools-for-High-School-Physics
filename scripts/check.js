// 轻量静态检查：语法检查 + index.html 引用的脚本/样式均存在。无需安装任何依赖。
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
let failed = false;
const jsFiles = ["js", "tests", "scripts"].flatMap((dir) =>
  fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith(".js")).map((f) => path.join(dir, f))
);
for (const file of jsFiles) {
  try {
    execFileSync(process.execPath, ["--check", path.join(root, file)], { stdio: "pipe" });
  } catch (error) {
    failed = true;
    console.error(`✗ ${file}\n${error.stderr}`);
  }
}
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const [, ref] of html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)) {
  if (!fs.existsSync(path.join(root, ref))) {
    failed = true;
    console.error(`✗ index.html references missing file: ${ref}`);
  }
}
for (const file of jsFiles.filter((f) => f.startsWith("js"))) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (/\bconsole\.log\(/.test(text)) {
    failed = true;
    console.error(`✗ ${file}: stray console.log`);
  }
}
if (failed) process.exit(1);
console.log(`✓ ${jsFiles.length} JS files OK, index.html references resolved`);
