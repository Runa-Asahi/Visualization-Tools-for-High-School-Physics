# 贡献指南 / Contributing

感谢你愿意改进这个项目！ / Thanks for helping improve this project!

## 基本原则

- **保持零依赖、零构建**：页面必须能通过双击 `index.html`（`file://`）直接运行，因此脚本使用普通 `<script>` 而非 ES Module。
- **物理计算与绘图分离**：公式放在 `js/physics.js`（纯函数，可测试），绘图放在 `js/renderers.js` / `js/draw.js`。
- **面向课堂**：界面文字使用简体中文，物理量写明单位，公式与人教版教材符号保持一致。
- **颜色**：使用 `PV.COLORS`（`js/draw.js`）中的调色板，与 `styles.css` 的 CSS 变量保持一致。

## 开发流程

```bash
git checkout -b feature/my-topic
npm run check        # 提交前必须通过
```

1. 修改代码并在浏览器中打开 `index.html` 手动检查（建议同时检查窄屏 / 移动端宽度）。
2. 为新增的物理计算在 `tests/physics.test.js` 中添加测试。
3. 如修改了页面外观，请更新 `docs/screenshots/` 中对应截图。
4. 如需更新离线包，运行 `npm run build:zip` 并用 `dist/PhysicsTeachTool.zip` 替换根目录的压缩包。
5. 在 `CHANGELOG.md` 中记录变化，然后发起 Pull Request。

## 代码风格

- 2 空格缩进、双引号、语句末尾加分号（见 `.editorconfig`）。
- 每个文件以 IIFE 包裹并开启 `"use strict"`，通过 `globalThis.PhysicsViz` 共享模块。
- 渲染器内部使用 `ctx.save()/restore()` 成对包裹对上下文状态的修改。
