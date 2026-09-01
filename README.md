# dsh-knowledge-graph · DSH 知识图谱插件

把「你装了哪些插件 / 技能 / 工具、它们之间是什么关系、以及每轮对话里到底调用了什么、想了什么」全部可视化出来。

Visualize what plugins / skills / tools you have installed, how they relate to each other, and exactly what each conversation turn called and reasoned about.

[![Listed on dsh-plugin.org](https://dsh-plugin.org/badges/listed.svg)](https://dsh-plugin.org/plugins/rickdeng005/dsh-knowledge-graph)

---

## 它解决了什么问题 · Why this plugin

**中文**

DeepSeek Harness 是「一切皆插件」。用久了之后，你会遇到这些麻烦：

1. **装了什么心里没数** —— 插件、技能、工具越装越多，几十上百个，根本记不清自己装了啥、哪个是干嘛的。
2. **看不见依赖关系** —— 插件之间有 `peerDependencies`（依赖）和「全家桶包含」关系，少了某个依赖，功能莫名其妙就坏了，但你不知道哪里断了。
3. **不知道 AI 到底干了什么** —— 每轮对话里，助手调用了哪些工具、思考了什么、最后怎么回复的，全是黑盒；想排查问题或理解行为只能靠猜。
4. **装了一堆「吃灰」的东西** —— 有些插件/工具装上后从没用过，白白占着，还干扰判断。

这个插件把这四件事一次性解决：**一张图谱看懂全局，一条轨迹看懂每一轮。**

**English**

DeepSeek Harness treats everything as a plugin. As your environment grows, you run into these problems:

1. **No overview of what's installed** — plugins, skills and tools pile up to dozens or hundreds; you can't remember what you installed or what each one does.
2. **Invisible dependencies** — plugins have `peerDependencies` and "bundle contains" relations. A missing dependency breaks things silently, and you can't tell where the chain is broken.
3. **A black-box agent** — which tools the assistant called, what it reasoned, and how it finally replied each turn is opaque; debugging or understanding its behavior becomes guesswork.
4. **Dead-weight plugins** — some plugins/tools were installed but never used, cluttering the environment and your judgment.

This plugin solves all four at once: **one graph to see the whole picture, one trace to understand every turn.**

---

## 功能特性 · Features

**中文**

- **力导向图谱**：插件 / 技能 / 工具以节点呈现，丝滑物理仿真布局；依赖（`depends`）以连线表示，「全家桶包含关系」（`contains`）用凸包气泡圈成一簇，一眼看清哪些是一家人。
- **清单视图**：插件 / 技能 / 工具三个页签，支持按名称搜索、按图层过滤，适合精确查找。
- **每轮思考过程**：选中某个对话轮次后，高亮该轮调用的工具（序号徽标 + 调用箭头），并把思考（💭）与回复（💬）画成气泡；点气泡看全文、点空白收起；点工具节点，它对应的思考气泡会一起高亮。
- **使用统计**：每个节点显示「用过几次、最近什么时候用的、最近在哪些轮次被调用」；「上一轮调用」一键聚焦最新一轮。
- **健康诊断**：加载失败 🔴 / 被禁用 ⚪ 在节点外环标出，一眼定位坏掉的插件。
- **导出报告**：一键导出 Markdown 报告（概览 / 问题插件 / 吃灰清单 / 使用排行）。
- **本地持久化**：统计与历史保存在本地（`~/.dsh/kg-knowledge-graph.json`），重启不丢。

**English**

- **Force-directed graph**: plugins / skills / tools as nodes with a smooth physics layout; `depends` edges drawn as lines, `contains` (bundle) relations drawn as convex-hull bubbles.
- **List view**: three tabs (plugins / skills / tools) with search and layer filtering for precise lookup.
- **Per-turn thinking**: pick a turn to highlight the tools it called (sequence badges + call arrows), with reasoning (💭) and reply (💬) drawn as bubbles; click a bubble for full text, click empty space to collapse; clicking a tool node also highlights its related bubbles.
- **Usage stats**: per-node call count, last-used time, and recent turns it was called in; "上一轮调用" focuses the latest turn.
- **Health diagnosis**: failed 🔴 / disabled ⚪ plugins marked with colored outer rings.
- **Export report**: one-click Markdown report (overview / problem plugins / dormant list / usage ranking).
- **Local persistence**: stats and history stored locally (`~/.dsh/kg-knowledge-graph.json`), surviving restarts.

---

## 使用场景 · Use Cases

**中文**

- **盘点 / 审计**：想知道环境里装了多少插件、技能、工具，哪些加载失败、哪些被禁用 —— 打开图谱一目了然。
- **排查依赖问题**：功能不工作，怀疑依赖断了 —— 开「全显依赖」看关系边，或看某插件的依赖气泡。
- **复盘对话**：想知道 AI 某一轮「调用了哪些工具、怎么一步步思考的」—— 用轮次选择器回看任意一轮的思考轨迹。
- **清理「吃灰」**：找出从没用过的插件/工具，卸载瘦身 —— 用「吃灰清单」或导出报告。
- **学习 DSH 生态**：新手快速了解 DSH 有哪些能力、工具长什么样、中文用途说明。

**English**

- **Audit your environment**: see how many plugins / skills / tools are installed, which failed to load, which are disabled.
- **Debug dependencies**: when something breaks, open "全显依赖" to inspect relation edges or a plugin's dependency bubble.
- **Review conversations**: understand which tools a turn called and how it reasoned, step by step, via the turn selector.
- **Clean up dormant items**: find never-used plugins/tools and uninstall them.
- **Learn the DSH ecosystem**: quickly see what capabilities DSH offers, with Chinese descriptions.

---

## 安装 · Install

```bash
dsh plugin --profile web add dsh-knowledge-graph
```

## 快速上手 · Quick Start

**中文**

1. 安装后，在右侧栏打开「插件图谱」页签（无 web-ui 侧栏时自动退化为右下角悬浮按钮）。
2. 默认是「图谱」视图：滚轮缩放、拖拽平移、点节点看详情。
3. 点底部「上一轮调用」或下拉框选一个轮次，查看该轮思考气泡与调用轨迹。

**English**

1. After installing, open the "插件图谱" tab in the right sidebar (falls back to a floating button without web-ui).
2. The default "graph" view: scroll to zoom, drag to pan, click a node for details.
3. Click "上一轮调用" or pick a turn from the dropdown to view that turn's thinking bubbles and call trace.

## 详细使用说明 · Usage

**中文**

- **顶部工具栏**：搜索框（过滤节点）、`上一轮调用`（聚焦最新一轮）、`全显依赖`（显示/隐藏依赖边）、图层切换（插件/技能/工具）、`刷新`（重新枚举）、`导出报告`（下载 Markdown）。
- **图谱交互**：滚轮缩放、按住空白拖拽平移、点节点选中看详情（用途 / 次数 / 最近使用 / 问题诊断）、`重置视图`回到全图。
- **轮次选择器**（图谱底部）：`‹ 上一轮 / 下拉选轮 / 下一轮 ›`；选中轮次后，该轮工具高亮 + 序号 + 箭头，思考/回复以气泡显示，点气泡看全文。
- **图例**：图谱顶部图例说明节点颜色、连线类型、问题外环的含义。

**English**

- **Toolbar**: search box, `上一轮调用` (focus latest turn), `全显依赖` (toggle dependency edges), layer switch, `刷新` (re-enumerate), `导出报告` (download Markdown).
- **Graph interaction**: scroll to zoom, drag empty space to pan, click a node to inspect details, `重置视图` to reset view.
- **Turn selector** (bottom): `‹ prev / dropdown / next ›`; selecting a turn highlights its tools with sequence badges and arrows, shows reasoning/reply bubbles, and clicking a bubble expands full text.
- **Legend**: top legend explains node colors, edge types, and problem rings.

---

## 兼容性与权限 · Compatibility & Permissions

**中文**

- **平台**：Web（`platform: web`），适配带侧栏的 web-ui，无 web-ui 时自动退化悬浮面板。
- **宿主侧**：只读枚举插件/技能/工具的清单与 schema、监听工具调用与技能变化、读取当前会话事件以重建每轮思考轨迹；向本地 `~/.dsh/kg-knowledge-graph.json` 写入使用统计；注册 `/kg-api/*` 本地接口；写 `~/.dsh/kg-debug.log` 诊断日志。
- **客户端**：注册侧栏页签 / 悬浮面板，通过 `fetch` 访问本机 `/kg-api/*` 接口。
- **无遥测**：不向任何外部服务发送数据，数据只留在本机。
- **外部服务**：无（不联网）。

**English**

- **Platform**: Web (`platform: web`); adapts to web-ui sidebar, falls back to a floating panel without it.
- **Host**: read-only enumeration of plugin/skill/tool inventories and schemas, listens to tool-call and skill changes, reads session events to rebuild per-turn traces; writes usage stats to local `~/.dsh/kg-knowledge-graph.json`; registers local `/kg-api/*` routes; writes `~/.dsh/kg-debug.log`.
- **Client**: registers a sidebar tab / floating panel; fetches local `/kg-api/*` endpoints.
- **No telemetry**: nothing is sent to external services; all data stays local.
- **External services**: none (fully offline).

## 依赖 · Dependencies

- 宿主侧 · Host：`@deepseek-ai/cordis`
- 客户端 · Client：`react` (^18.2.0)

## License

MIT
