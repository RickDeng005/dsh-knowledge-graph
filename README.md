# dsh-knowledge-graph · DSH 知识图谱插件

把「你装了哪些插件 / 技能 / 工具、它们之间的依赖关系、以及每轮对话里调用了什么、想了什么」可视化出来。

Visualize the plugins / skills / tools you have installed, their dependency relations, and what each conversation turn actually called and reasoned about.

[![Listed on dsh-plugin.org](https://dsh-plugin.org/badges/listed.svg)](https://dsh-plugin.org/plugins/rickdeng005/dsh-knowledge-graph)

## 功能 · Features

- **力导向图谱 · Force-directed graph**：插件 / 技能 / 工具以节点呈现，丝滑物理仿真布局；依赖（`depends`）与全家桶包含关系（`contains`）以连线 + 凸包气泡圈出。
- **清单视图 · List view**：插件 / 技能 / 工具三个页签，可搜索、按图层过滤。
- **每轮思考过程 · Per-turn thinking**：选中某个对话轮次后，高亮该轮调用的工具（序号徽标 + 调用箭头），并把思考（💭）与回复（💬）画成气泡；点气泡看全文、点空白收起。
- **使用统计 · Usage stats**：每个节点显示调用次数、最近使用时间；「上一轮调用」一键聚焦最新一轮。
- **健康诊断 · Health diagnosis**：加载失败 🔴 / 被禁用 ⚪ 在外环标注。
- **导出报告 · Export report**：一键导出 Markdown 使用报告。
- **本地持久化 · Local persistence**：统计与历史保存在本地，重启不丢。

## 安装 · Install

```bash
dsh plugin --profile web add dsh-knowledge-graph
```

## 使用 · Usage

安装后在右侧栏打开「**插件图谱**」页签（没有 web-ui 侧栏的环境会自动退化为右下角悬浮入口）。

Open the "插件图谱" tab in the right sidebar after installing (falls back to a floating button if no web-ui sidebar is present).

- 顶部工具栏：搜索、`上一轮调用`、`全显依赖`、图层切换、`刷新`、`导出报告`。
- 图谱底部：`‹ 上一轮 / 下拉选轮 / 下一轮 ›` 轮次选择器，选中轮次即展示思考气泡与调用轨迹。

## 兼容性与权限 · Compatibility & Permissions

- **平台 · Platform**：Web（`platform: web`），适配带侧栏的 web-ui，无 web-ui 时自动退化悬浮面板。
- **宿主侧 · Host**：只读枚举插件/技能/工具的清单与 schema、监听工具调用与技能变化、读取当前会话事件以重建每轮思考轨迹；向本地 `~/.dsh/kg-knowledge-graph.json` 写入使用统计（本地持久化）；注册 `/kg-api/*` 本地接口供浏览器端读取；写 `~/.dsh/kg-debug.log` 诊断日志。
- **客户端 · Client**：注册侧栏页签 / 悬浮面板，通过 `fetch` 访问本机 `/kg-api/*` 接口。
- **无遥测 · No telemetry**：不向任何外部服务发送数据，所有数据只留在本机。
- **外部服务 · External services**：无（不联网）。

## 依赖 · Dependencies

- 宿主侧 · Host：`@deepseek-ai/cordis`
- 客户端 · Client：`react` (^18.2.0)

## License

MIT
