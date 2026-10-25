# 更新日志 / Changelog

## [1.1.0] - 2026-10-25

### 重构 / Refactor
- 将 1500+ 行的单文件 `app.js` 拆分为 `js/utils.js`、`physics.js`、`topics.js`、`draw.js`、`renderers.js`、`app.js`。
- 物理计算抽离为无 DOM 的纯函数（`PhysicsViz.physics`），渲染器只负责绘图。
- 统一调色板 `PhysicsViz.COLORS`，移除重复代码（滚动曲线、串并联电路公共回路等）。

### 修复 / Fixed
- **数值显示错误**：`format()` 会把整数末尾的 0 去掉，导致 `300 K` 显示为 `3 K`、`30 匝` 显示为 `3 匝`、`10.0` 等整数值显示错误。
- **碰撞**：当左车速度不大于右车（如 v₁ = 0.5 m/s、v₂ = 1 m/s）时，原来仍会演示“碰撞”并按碰撞公式计算；现在显示“不会相碰”并保持原速度。
- **碰撞**：“总动能”柱状图与“总动量”柱状图重叠。
- **凸透镜虚像**：折射后的平行光线现在正确经过像方焦点，并补画过光心的光线。
- **折射**：全反射时也会标出入射角 i。
- **电场**：探针处场强箭头长度加上限，靠近电荷时不再冲出画布。
- 页面初始标题与第一个主题名称不一致（“平抛运动” → “平抛与斜抛运动”）。
- 旧浏览器不支持 `CanvasRenderingContext2D.roundRect` 时自动降级。

### 性能 / Performance
- 干涉图改用低分辨率 `ImageData` + 一次放大绘制，替代每帧数万次 `fillRect`。
- 静态场景（电场、透镜、折射）和暂停状态下不再逐帧重绘。
- 实时量面板只在数值变化时更新 DOM；背景网格合并为一次描边；搜索索引缓存。
- 使用 `ResizeObserver` 感知画布尺寸变化。

### 体验与无障碍 / UX & Accessibility
- 新增 URL 深链接（`#lens` 等）与动态页面标题。
- 新增快捷键：`R` 重置、`.` 单步、`/` 搜索、搜索框内 `Enter`/`Esc`；双击滑块恢复默认值。
- 滑块与标签正确关联，增加 `aria-valuetext`、`aria-pressed`、`aria-current`、`aria-live` 等属性。
- 光电效应新增“遏止电压”，透镜成像性质细化为“放大/缩小/等大”。
- 增加 favicon、meta 描述、`noscript` 提示、打印样式。

### 工程 / Tooling
- 新增 `package.json` 脚本、`node:test` 测试（物理公式单元测试 + 所有渲染器在参数极值下的冒烟测试）、GitHub Actions CI、`.editorconfig`、`.gitignore`。
- README 全面重写（中英双语），新增 CONTRIBUTING 与 CHANGELOG。

## [1.0.0] - 2026-06-29
- 首个版本。
