// 生成可离线分发的压缩包 dist/PhysicsTeachTool.zip。
// 依次尝试：zip 命令 → PowerShell Compress-Archive（Windows）→ python3 zipfile。
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const out = path.join(root, "dist", "PhysicsTeachTool.zip");
const entries = ["index.html", "styles.css", "js", "README.md"];
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.rmSync(out, { force: true });

const attempts = [
  ["zip", ["-r", "-X", "-q", out, ...entries]],
  ["powershell", ["-NoProfile", "-Command", `Compress-Archive -Path ${entries.join(",")} -DestinationPath '${out}'`]],
  ["python3", ["-c", `import zipfile,os,sys
with zipfile.ZipFile(sys.argv[1],'w',zipfile.ZIP_DEFLATED) as z:
  for e in sys.argv[2:]:
    paths=[e] if os.path.isfile(e) else sorted(os.path.join(d,f) for d,_,fs in os.walk(e) for f in fs)
    for p in paths: z.write(p, p.replace(os.sep,'/'))`, out, ...entries]]
];

for (const [cmd, args] of attempts) {
  try {
    execFileSync(cmd, args, { cwd: root, stdio: "pipe" });
    console.log(`✓ ${path.relative(root, out)} (via ${cmd})`);
    process.exit(0);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
console.error("✗ 未找到 zip / powershell / python3，无法打包");
process.exit(1);
