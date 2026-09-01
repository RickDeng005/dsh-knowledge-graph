// dsh-knowledge-graph — 浏览器半：注册为 dsh-better-sidebar 的侧栏 tab（无 workbench 时回退漂浮面板）。
// 图谱用 Canvas 2D 渲染 + d3-force 式「速度/惯性/弹簧/阻尼」持续仿真，达到丝滑的「活图」效果。

window.__ModuleLoader__.load({
  id: 'dsh-knowledge-graph',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    var React = require('react')

    function injectStyle(css) {
      var el = document.createElement('style')
      el.textContent = css
      document.head.appendChild(el)
    }
    injectStyle([
      '.kg-body { display: flex; flex-direction: column; height: 100%; min-height: 0; background: var(--dsw-alias-bg-base, #17171f); color: var(--dsw-alias-label-primary, #e5e7eb); }',
      '.kg-head { display: flex; align-items: center; gap: 6px; padding: 10px 12px; border-bottom: 1px solid var(--dsw-alias-border-l1, #333); }',
      '.kg-title { font-weight: 600; font-size: 14px; flex: 1; }',
      '.kg-toggle { background: transparent; color: var(--dsw-alias-label-secondary, #9ca3af); border: 1px solid var(--dsw-alias-border-l1, #333); border-radius: 6px; padding: 3px 9px; cursor: pointer; font-size: 12px; }',
      '.kg-toggle.on { color: var(--dsw-alias-label-primary, #fff); background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.15)); border-color: var(--dsw-alias-border-l2, #555); }',
      '.kg-btn-sm { background: var(--dsw-alias-brand-primary, #2563eb); color: #fff; border: none; border-radius: 6px; padding: 4px 10px; cursor: pointer; font-size: 12px; }',
      '.kg-reset { background: transparent; color: var(--dsw-alias-label-secondary, #9ca3af); border: 1px solid var(--dsw-alias-border-l1, #333); border-radius: 6px; padding: 2px 8px; cursor: pointer; font-size: 11px; margin-left: auto; }',
      '.kg-summary { padding: 5px 12px; font-size: 11px; color: var(--dsw-alias-label-tertiary, #6b7280); border-bottom: 1px solid var(--dsw-alias-border-l1, #333); }',
      '.kg-toolbar { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-bottom: 1px solid var(--dsw-alias-border-l1, #333); }',
      '.kg-search { flex: 1; min-width: 0; background: var(--dsw-alias-bg-layer-1, #1f1f2b); border: 1px solid var(--dsw-alias-border-l1, #333); border-radius: 6px; padding: 5px 10px; color: var(--dsw-alias-label-primary, #e5e7eb); font-size: 12px; outline: none; }',
      '.kg-search::placeholder { color: var(--dsw-alias-label-tertiary, #6b7280); }',
      '.kg-layerbar { display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-bottom: 1px solid var(--dsw-alias-border-l1, #333); }',
      '.kg-layerlabel { font-size: 12px; color: var(--dsw-alias-label-tertiary, #6b7280); margin-right: 2px; }',
      '.kg-tabbar { display: flex; border-bottom: 1px solid var(--dsw-alias-border-l1, #333); }',
      '.kg-tab { flex: 1; padding: 8px 0; text-align: center; cursor: pointer; background: transparent; color: var(--dsw-alias-label-secondary, #9ca3af); border: none; font-size: 13px; }',
      '.kg-tab:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.12)); }',
      '.kg-tab.on { color: var(--dsw-alias-label-primary, #fff); border-bottom: 2px solid var(--dsw-alias-brand-primary, #2563eb); font-weight: 600; }',
      '.kg-list { flex: 1; overflow: auto; padding: 8px 10px; min-height: 0; }',
      '.kg-row { padding: 8px 10px; border-radius: 8px; margin-bottom: 6px; background: var(--dsw-alias-bg-layer-1, #1f1f2b); border: 1px solid var(--dsw-alias-border-l1, #2a2a3a); }',
      '.kg-row.dormant { opacity: .55; }',
      '.kg-row-name { font-weight: 600; font-size: 13px; word-break: break-all; }',
      '.kg-row-desc { font-size: 12px; color: var(--dsw-alias-label-secondary, #9ca3af); margin-top: 2px; }',
      '.kg-row-meta { font-size: 11px; color: var(--dsw-alias-label-tertiary, #6b7280); margin-top: 4px; }',
      '.kg-empty { color: var(--dsw-alias-label-tertiary, #6b7280); text-align: center; padding: 24px 0; font-size: 13px; }',
      '.kg-legend { display: flex; align-items: center; gap: 14px; padding: 6px 12px; border-bottom: 1px solid var(--dsw-alias-border-l1, #333); font-size: 11px; color: var(--dsw-alias-label-secondary, #9ca3af); }',
      '.kg-legend-item { display: inline-flex; align-items: center; gap: 5px; }',
      '.kg-legend-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }',
      '.kg-legend-line { width: 14px; height: 0; border-top: 2px solid #666; display: inline-block; }',
      '.kg-legend-ring { width: 9px; height: 9px; border-radius: 50%; border: 2px solid #888; display: inline-block; background: transparent; }',
      '.kg-graph { flex: 1; overflow: hidden; min-height: 0; position: relative; }',
      '.kg-graph canvas { display: block; width: 100%; height: 100%; cursor: grab; touch-action: none; }',
      '.kg-graph canvas:active { cursor: grabbing; }',
      '.kg-graphslot { flex: 1; min-height: 0; display: flex; flex-direction: column; }',
      '.kg-detail { margin: 8px 10px; padding: 8px 10px; border-radius: 8px; background: var(--dsw-alias-bg-layer-1, #1f1f2b); border: 1px solid var(--dsw-alias-border-l1, #2a2a3a); }',
      '.kg-detail-title { font-size: 11px; color: var(--dsw-alias-label-tertiary, #6b7280); margin: 6px 0 2px; }',
      '.kg-turnbar { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-bottom: 1px solid var(--dsw-alias-border-l1, #333); font-size: 12px; }',
      '.kg-turnbar select { flex: 1; min-width: 0; background: var(--dsw-alias-bg-layer-1, #1f1f2b); border: 1px solid var(--dsw-alias-border-l1, #333); border-radius: 6px; padding: 4px 8px; color: var(--dsw-alias-label-primary, #e5e7eb); font-size: 12px; outline: none; }',
      '.kg-turnbtn { background: var(--dsw-alias-bg-layer-1, #1f1f2b); color: var(--dsw-alias-label-secondary, #9ca3af); border: 1px solid var(--dsw-alias-border-l1, #333); border-radius: 6px; padding: 3px 8px; cursor: pointer; font-size: 12px; white-space: nowrap; }',
      '.kg-turnbtn:disabled { opacity: .4; cursor: default; }',
      '.kg-trace-hint { font-size: 12px; color: var(--dsw-alias-label-tertiary, #6b7280); padding: 6px 12px; border-bottom: 1px solid var(--dsw-alias-border-l1, #333); }',
      '.kg-bubble-tip { position: absolute; z-index: 30; max-width: 330px; max-height: 280px; overflow: auto; background: var(--dsw-alias-bg-layer-1, #1f1f2b); border: 1px solid var(--dsw-alias-border-l2, #555); border-radius: 8px; padding: 8px 10px; box-shadow: 0 6px 24px rgba(0,0,0,.4); }',
      '.kg-bubble-tip.thinking { border-left: 3px solid #a78bfa; }',
      '.kg-bubble-tip.reply { border-left: 3px solid #22c55e; }',
      '.kg-bubble-tip-head { font-size: 11px; color: var(--dsw-alias-label-secondary, #9ca3af); margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; }',
      '.kg-bubble-tip-body { font-size: 12px; color: var(--dsw-alias-label-primary, #e5e7eb); white-space: pre-wrap; word-break: break-word; }',
      '.kg-bubble-tip-close { background: transparent; border: none; color: var(--dsw-alias-label-secondary, #9ca3af); cursor: pointer; font-size: 14px; padding: 0 2px; line-height: 1; }',
      '.kg-btn { position: fixed; right: 0; top: 45%; width: 26px; padding: 14px 0; background: var(--dsw-alias-brand-primary, #2563eb); color: #fff; border: none; border-radius: 6px 0 0 6px; cursor: pointer; writing-mode: vertical-rl; letter-spacing: 2px; font-size: 12px; z-index: 9999; pointer-events: auto; }',
      '.kg-panel { position: fixed; right: 0; top: 0; bottom: 0; width: 420px; max-width: 92vw; z-index: 9999; pointer-events: auto; background: var(--dsw-alias-bg-base, #17171f); border-left: 1px solid var(--dsw-alias-border-l2, #444); }',
    ].join('\n'))

    function fmtLastUsed(ts) {
      if (!ts) return '从未使用'
      try { const d = new Date(ts); const p = function (n) { return (n < 10 ? '0' + n : '' + n) }; return p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) } catch (e) { return String(ts) }
    }
    function shortName(name, max) { return (name && name.length > max) ? name.slice(0, max) + '…' : name }
    function oneLine(text, max) { if (!text) return ''; const s = String(text).replace(/\s+/g, ' ').trim(); return s.length > max ? s.slice(0, max) + '…' : s }
    function shortText(text, max) { if (!text) return ''; const s = String(text).replace(/\s+/g, ' ').trim(); return s.length > max ? s.slice(0, max) + '…' : s }
    function usedInTurn(n, t) { return t > 0 && n && Array.isArray(n.history) && n.history.some(function (h) { return h && h.turn === t }) }

    // ---- 中文用途对照表（跟随系统语言；没有条目的退回英文）----
    var isZh = false
    try { isZh = (navigator.language || '').toLowerCase().indexOf('zh') === 0 } catch (e) {}
    var ZH = {
      read: '读取文件', write: '写入文件', edit: '编辑文件', glob: '查找文件', grep: '搜索文件内容',
      pwsh: '执行 PowerShell 命令', bash: '执行 bash 命令', str_replace_editor: '编辑文件（精确替换）',
      web_search: '上网搜索', web_fetch: '抓取网页内容', skill: '加载技能', todo_write: '更新任务清单',
      subagent: '派发子代理', subagent_fork: '派发继承会话的子代理', ask_user_question: '向用户提问',
      create_goal: '创建长期目标', get_goal: '查看当前目标', update_goal: '更新目标',
      ssh_list: '列出 SSH 服务器', ssh_exec: '远程执行命令', ssh_upload: '上传文件到远程', ssh_download: '下载远程文件', ssh_tunnel: '建立端口隧道', ssh_cluster: '批量在多个服务器执行',
      cordis_define: '定义动态插件', cordis_run: '运行动态插件', cordis_stop: '停止动态插件', cordis_undefine: '删除动态插件',
      cordis_inspect_list: '查看可查询的插件接口', cordis_inspect_query: '查询插件接口信息', cordis_inspect_self: '查看自身插件状态',
      workflow: '运行多代理工作流', ralph: '运行 Ralph 迭代循环',
      job_kill: '终止后台任务', job_list: '查看后台任务', job_output: '读取后台任务输出',
      list_agents: '查看子代理', send_message: '给子代理发消息', interrupt_agent: '打断子代理',
      describe_image: '描述图片内容', read_image: '读取图片', exit_plan_mode: '提交计划',
      browser_open: '打开浏览器', browser_navigate: '打开网页', browser_click: '点击页面元素', browser_type: '输入文字',
      browser_select: '选择下拉框', browser_screenshot: '截图', browser_eval: '在页面执行 JS', browser_get_text: '读取页面文本',
      browser_get_html: '读取页面 HTML', browser_wait: '等待', browser_close: '关闭浏览器', browser_install: '安装浏览器',
      hindsight_sync_status: '查看记忆同步状态', hindsight_diagnose: '诊断记忆服务', hindsight_search_knowledge_pages: '搜索项目知识页',
      hindsight_list_knowledge_pages: '列出项目知识页', hindsight_read_knowledge_page: '读取知识页', hindsight_reflect: '深度记忆推理',
      hindsight_capture_initiative: '记录项目计划', hindsight_ingest_document: '存入文档到记忆',
      run_code: '执行代码', 
      'dsh-knowledge-graph': '插件图谱（本插件）：展示已装插件/技能/工具与使用统计',
      'dsh-browser': '浏览器自动化插件', 'dsh-wake': '唤醒插件', 'dshmarket': '插件市场：浏览/安装社区插件',
      'dsh-agent-skills': '技能加载支持', 'dsh-better-sidebar': '增强侧栏（文件/任务/终端等）',
      '@vectorize-io/hindsight-coding-agents/dsh': '项目记忆与知识库',
      '@linxin666/dsh-web-ui-all': 'DSH 界面全家桶（侧栏/任务板/皮肤/市场等）',
      '@linxin666/dsh-ssh': 'SSH 远程管理工具',
      '@linxin666/dsh-client-ui-skin-center': '皮肤中心', '@linxin666/dsh-client-ui-market': '插件市场界面',
      '@linxin666/dsh-client-ui-task-board': '任务板', '@linxin666/dsh-pet': '桌面宠物', '@linxin666/dsh-liangshen': '梁神模式（极致编程预设）',
      '@linxin666/dsh-tool-describe-image': '图片描述工具', '@linxin666/dsh-desktop-launcher': '桌面启动器',
      '@deepseek-ai/dsh-tool-fs': '文件读写工具（读/写/编辑/搜索）', '@deepseek-ai/dsh-tool-fs-search': '文件搜索工具',
      '@deepseek-ai/dsh-tool-web': '联网搜索工具', '@deepseek-ai/dsh-tool-bash': 'bash 命令工具', '@deepseek-ai/dsh-tool-pwsh': 'PowerShell 命令工具',
      '@deepseek-ai/dsh-tool-subagent': '子代理工具', '@deepseek-ai/dsh-tool-subagent-control': '子代理控制工具',
      '@deepseek-ai/dsh-tool-todo': '任务清单工具', '@deepseek-ai/dsh-tool-goal': '目标工具', '@deepseek-ai/dsh-tool-ask-user': '提问工具',
      '@deepseek-ai/dsh-tool-cordis': '动态插件管理工具', '@deepseek-ai/dsh-tool-jobs': '后台任务工具',
      '@deepseek-ai/dsh-tool-skill': '技能加载工具', '@deepseek-ai/dsh-tool-workflow': '工作流工具', '@deepseek-ai/dsh-tool-ralph': 'Ralph 循环工具',
      '@deepseek-ai/dsh-plan-mode': '计划模式', '@deepseek-ai/dsh-tools': '工具注册核心',
      '@deepseek-ai/dsh-web': '联网搜索服务', '@deepseek-ai/dsh-llm': '大模型接入', '@deepseek-ai/dsh-session': '会话管理',
      '@deepseek-ai/dsh-attachment-local': '本地附件存储', '@deepseek-ai/dsh-sandbox-local': '本地沙箱', '@deepseek-ai/dsh-pwsh-sandbox': 'PowerShell 沙箱',
      '@deepseek-ai/dsh-agent': 'Agent 核心', '@deepseek-ai/dsh-tool-str-replace-editor': '文件精确编辑工具',
      '@deepseek-ai/dsh-client-locale': '客户端语言设置', '@deepseek-ai/dsh-client-ui-directory-picker-native': '原生目录选择器',
      '@deepseek-ai/dsh-client-ui-slots': '客户端界面插槽', '@deepseek-ai/dsh-client-ui-primitives': '客户端界面基础组件',
      // superpowers 技能
      'brainstorming': '头脑风暴：动手前理清需求与设计', 'writing-plans': '编写实施计划', 'executing-plans': '执行实施计划',
      'test-driven-development': '测试驱动开发', 'systematic-debugging': '系统性排查 bug', 'verification-before-completion': '完成前验证',
      'requesting-code-review': '请求代码审查', 'receiving-code-review': '接收代码审查反馈', 'writing-skills': '编写技能',
      'subagent-driven-development': '子代理驱动开发', 'dispatching-parallel-agents': '并行派发子代理', 'using-git-worktrees': '使用 Git 工作树',
      'finishing-a-development-branch': '收尾开发分支', 'using-superpowers': 'Superpowers 技能框架入口',
      'editing-cordis-compositions': '编辑 Cordis 组合配置', 'cordis-plugin-development': '开发 Cordis 插件',
    }
    var ZH_SEG = {
      dsh: 'DSH', client: '客户端', ui: '界面', tool: '工具', local: '本地', native: '原生',
      web: '网络', host: '宿主', settings: '设置', session: '会话', agent: '代理', model: '模型',
      llm: '大模型', file: '文件', fs: '文件系统', sandbox: '沙箱', shell: '命令', ssh: 'SSH',
      task: '任务', board: '看板', skill: '技能', market: '市场', theme: '主题', skin: '皮肤',
      center: '中心', directory: '目录', picker: '选择器', locale: '语言', attachment: '附件',
      storage: '存储', plugin: '插件', manager: '管理器', plan: '计划', mode: '模式', debug: '调试',
      graph: '图谱', knowledge: '知识', preset: '预设', profile: '配置', api: '接口', gateway: '网关',
      editor: '编辑', search: '搜索', code: '代码', runtime: '运行时', remote: '远程', system: '系统',
      prompt: '提示词', command: '命令', recovery: '恢复', chat: '对话', explorer: '探索器', launcher: '启动器',
      doctor: '诊断', community: '社区', archive: '归档', image: '图片', wake: '唤醒', sidebar: '侧栏',
      projection: '投影', persistence: '持久化', telemetry: '遥测', subprocess: '子进程', policy: '策略',
      registry: '注册表', worker: '工作线程', spill: '溢出', retry: '重试', credentials: '凭证', brand: '品牌',
      invariants: '不变量', home: '主目录', paths: '路径', output: '输出', retention: '保留', compaction: '压缩',
      // 技能类
      writing: '编写', plans: '计划', brainstorming: '头脑风暴', debugging: '调试', test: '测试',
      driven: '驱动', development: '开发', review: '审查', systematic: '系统性', verification: '验证',
      completion: '完成', parallel: '并行', agents: '代理', worktrees: '工作树', executing: '执行',
      skills: '技能', receiving: '接收', requesting: '请求', using: '使用', branch: '分支',
      finishing: '收尾', dispatching: '派发', subagent: '子代理', editing: '编辑', compositions: '组合',
      before: '前置', cordis: 'Cordis',
    }
    function zhFromName(name) {
      if (!name) return ''
      var seg = String(name).split('/').pop() || ''
      var parts = seg.split(/[-_]/)
      var out = []
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]
        if (!p) continue
        out.push(ZH_SEG[p] || p)
      }
      return out.join(' ')
    }
    function purposeText(n) {
      if (!n) return ''
      if (isZh) {
        if (ZH[n.name]) return ZH[n.name]
        const fb = zhFromName(n.name)
        if (fb) return fb
      }
      return n.description || ''
    }
    // 吃灰 = 可被调用的东西（工具/技能/提供工具的插件）从未用过；UI/系统服务插件不吃灰
    function isDormant(n, toolProviders) {
      if (n.type === 'tool' || n.type === 'skill') return n.count === 0
      if (n.type === 'plugin') return n.count === 0 && toolProviders.has(n.id)
      return false
    }
    function resolveColor(varName, fallback) {
      try {
        const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
        if (v) return v
      } catch (e) {}
      return fallback
    }

    function GraphIcon(size) {
      return React.createElement('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        React.createElement('circle', { cx: 3.5, cy: 4.5, r: 1.7, fill: 'currentColor' }),
        React.createElement('circle', { cx: 12.5, cy: 4.5, r: 1.7, fill: 'currentColor' }),
        React.createElement('circle', { cx: 8, cy: 12, r: 1.7, fill: 'currentColor' }),
        React.createElement('path', { d: 'M3.5 4.5 L12.5 4.5 M3.5 4.5 L8 12 M12.5 4.5 L8 12', stroke: 'currentColor', strokeWidth: 1.3 }))
    }

    const LABEL_MIN_SCALE = 1.15

    // ---- 物理参数 ----
    const WORLD = { W: 900, H: 640 }
    const PHYS = {
      damping: 0.55,        // 强阻尼，快速收敛、不振荡
      repulsion: 2500,      // 节点斥力强度（降低，避免推到边框）
      linkLen: 80,          // 连线弹簧目标长度（依赖/调用等松弛关系）
      linkStrength: 0.012,  // 弹簧强度
      providesLen: 44,      // 「提供」边目标长度（更短，工具贴紧插件）
      providesStrength: 0.05, // 「提供」边弹簧强度（更强，减少线条穿插）
      containsLen: 45,      // 「包含」边目标长度（更短，聚成一簇）
      containsStrength: 0.08, // 「包含」边弹簧强度（够硬，压住依赖边的拉扯）
      gravity: 0.008,       // 向心引力（调小，让各家族在空间上拉开）
      clusterRepel: 80,     // 家族质心互斥强度（让气泡不重叠）
      collide: 0.25,        // 柔和碰撞推开系数
      jitter: 0.004,        // 微流动噪声
      dragStrength: 0.2,    // 拖拽弹簧强度
      maxV: 18,             // 速度上限，防止大幅跳跃
    }

    function nodeRadius(n) {
      if (n.type === 'hub') return 17
      return n.count > 0 ? Math.min(7 + n.count * 1.6, 22) : 6
    }

    function initPositions(nodes) {
      const cx = WORLD.W / 2, cy = WORLD.H / 2
      const pos = {}
      const n = nodes.length
      for (let i = 0; i < n; i++) {
        const node = nodes[i]
        if (node.type === 'hub') { pos[node.id] = { x: cx, y: cy } }
        else { const angle = (i / Math.max(n, 1)) * Math.PI * 2 + (i * 2.399); const r = 110 + ((i * 61) % 190); pos[node.id] = { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r } }
      }
      return pos
    }

    function ensureVel(vel, id) {
      if (!vel[id]) vel[id] = { vx: 0, vy: 0 }
      return vel[id]
    }

    function convexHull(points) {
      const pts = points.slice().sort(function (a, b) { return a.x === b.x ? a.y - b.y : a.x - b.x })
      if (pts.length < 3) return pts
      const cross = function (o, a, b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x) }
      const lower = []
      for (const p of pts) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop()
        lower.push(p)
      }
      const upper = []
      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i]
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop()
        upper.push(p)
      }
      lower.pop(); upper.pop()
      return lower.concat(upper)
    }

    function roundRect(ctx, x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2)
      ctx.beginPath()
      ctx.moveTo(x + rr, y)
      ctx.arcTo(x + w, y, x + w, y + h, rr)
      ctx.arcTo(x + w, y + h, x, y + h, rr)
      ctx.arcTo(x, y + h, x, y, rr)
      ctx.arcTo(x, y, x + w, y, rr)
      ctx.closePath()
    }

    function simulateStep(nodes, edges, pos, vel, drag, jitterOn, clusterOf) {
      const n = nodes.length
      const cx = WORLD.W / 2, cy = WORLD.H / 2
      const fx = {}, fy = {}
      for (const node of nodes) { fx[node.id] = 0; fy[node.id] = 0 }

      // 斥力 + 柔和碰撞（O(n²)，当前约 240 节点，每帧 2ms 左右，尚无需优化）
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const a = nodes[i], b = nodes[j]
          const pa = pos[a.id], pb = pos[b.id]
          if (!pa || !pb) continue
          const dx = pb.x - pa.x, dy = pb.y - pa.y
          let d2 = dx * dx + dy * dy
          if (d2 < 1) d2 = 1
          const d = Math.sqrt(d2)
          const ux = dx / d, uy = dy / d
          const fr = (function () {
            let f = PHYS.repulsion / d2
            if (clusterOf) {
              const ca = clusterOf[a.id], cb = clusterOf[b.id]
              if (ca && cb && ca !== cb) f *= 3  // 不同家族之间斥力更强，推开不重合
            }
            return f
          })()
          fx[a.id] -= ux * fr; fy[a.id] -= uy * fr
          fx[b.id] += ux * fr; fy[b.id] += uy * fr
          const minD = nodeRadius(a) + nodeRadius(b)
          if (d < minD) {
            const push = (minD - d) * PHYS.collide
            fx[a.id] -= ux * push; fy[a.id] -= uy * push
            fx[b.id] += ux * push; fy[b.id] += uy * push
          }
        }
      }

      // 家族质心互斥：让不同家族的气泡不重叠
      if (clusterOf) {
        const groups = new Map()
        for (const node of nodes) {
          const cid = clusterOf[node.id]
          if (!cid) continue
          if (!groups.has(cid)) groups.set(cid, [])
          groups.get(cid).push(node.id)
        }
        const cids = Array.from(groups.keys())
        for (let i = 0; i < cids.length; i++) {
          for (let j = i + 1; j < cids.length; j++) {
            const A = groups.get(cids[i]), B = groups.get(cids[j])
            let ax = 0, ay = 0, bx = 0, by = 0
            for (const id of A) { const p = pos[id]; if (p) { ax += p.x; ay += p.y } }
            for (const id of B) { const p = pos[id]; if (p) { bx += p.x; by += p.y } }
            ax /= A.length; ay /= A.length; bx /= B.length; by /= B.length
            const dx = bx - ax, dy = by - ay
            let d2 = dx * dx + dy * dy
            if (d2 < 1) d2 = 1
            const d = Math.sqrt(d2)
            const ux = dx / d, uy = dy / d
            const f = PHYS.clusterRepel / d
            for (const id of A) { const p = pos[id]; if (p) { fx[id] -= ux * f; fy[id] -= uy * f } }
            for (const id of B) { const p = pos[id]; if (p) { fx[id] += ux * f; fy[id] += uy * f } }
          }
        }
      }

      // 气泡隔离带：把非家族节点推离家族气泡（含上方标签区），不穿插
      if (clusterOf) {
        const infoMap = new Map()
        for (const node of nodes) {
          const cid = clusterOf[node.id]
          if (!cid) continue
          const p = pos[node.id]
          if (!p) continue
          if (!infoMap.has(cid)) infoMap.set(cid, { cx: 0, cy: 0, r: 0, members: [] })
          infoMap.get(cid).members.push(node.id)
        }
        for (const info of infoMap.values()) {
          info.cx = 0; info.cy = 0
          for (const id of info.members) { const p = pos[id]; if (p) { info.cx += p.x; info.cy += p.y } }
          info.cx /= info.members.length; info.cy /= info.members.length
          info.r = 0
          for (const id of info.members) { const p = pos[id]; if (p) { const dx = p.x - info.cx, dy = p.y - info.cy; const dd = Math.sqrt(dx * dx + dy * dy); if (dd > info.r) info.r = dd } }
        }
        const margin = 55
        for (const node of nodes) {
          if (clusterOf[node.id]) continue
          const p = pos[node.id]
          if (!p) continue
          for (const info of infoMap.values()) {
            const dx = p.x - info.cx, dy = p.y - info.cy
            const d = Math.sqrt(dx * dx + dy * dy) || 1
            const limit = info.r + margin
            if (d < limit) {
              const push = (limit - d) * 0.07
              fx[node.id] += (dx / d) * push
              fy[node.id] += (dy / d) * push
            }
          }
        }
      }

      // 连线弹簧
      for (const e of edges) {
        if (e.kind === 'depends') continue  // 依赖边不施加弹簧力，仅作视觉关系
        const pa = pos[e.source], pb = pos[e.target]
        if (!pa || !pb) continue
        const dx = pb.x - pa.x, dy = pb.y - pa.y
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        const isContains = e.kind === 'contains'
        const isProvides = e.kind === 'provides'
        const len = isContains ? PHYS.containsLen : (isProvides ? PHYS.providesLen : PHYS.linkLen)
        const strength = isContains ? PHYS.containsStrength : (isProvides ? PHYS.providesStrength : PHYS.linkStrength)
        const f = (d - len) * strength
        const ux = dx / d, uy = dy / d
        fx[e.source] += ux * f; fy[e.source] += uy * f
        fx[e.target] -= ux * f; fy[e.target] -= uy * f
      }

      // 拖拽弹簧
      if (drag && drag.type === 'node') {
        const p = pos[drag.id]
        if (p) {
          fx[drag.id] += (drag.wx - p.x) * PHYS.dragStrength
          fy[drag.id] += (drag.wy - p.y) * PHYS.dragStrength
        }
      }

      // 积分（半隐式欧拉）
      for (const node of nodes) {
        const v = ensureVel(vel, node.id)
        const p = pos[node.id]
        if (!p) continue
        const isHub = node.type === 'hub'
        const isDragged = drag && drag.type === 'node' && drag.id === node.id
        if (isHub) { p.x = cx; p.y = cy; v.vx = 0; v.vy = 0; continue }
        let gx = (cx - p.x) * PHYS.gravity
        let gy = (cy - p.y) * PHYS.gravity
        let jx = 0, jy = 0
        if (jitterOn && !isDragged) { jx = (Math.random() - 0.5) * PHYS.jitter; jy = (Math.random() - 0.5) * PHYS.jitter }
        v.vx = (v.vx + fx[node.id] + gx + jx) * PHYS.damping
        v.vy = (v.vy + fy[node.id] + gy + jy) * PHYS.damping
        if (v.vx > PHYS.maxV) v.vx = PHYS.maxV
        if (v.vx < -PHYS.maxV) v.vx = -PHYS.maxV
        if (v.vy > PHYS.maxV) v.vy = PHYS.maxV
        if (v.vy < -PHYS.maxV) v.vy = -PHYS.maxV
        p.x += v.vx
        p.y += v.vy
      }
    }

    function GraphView(props) {
      const nodes = props.nodes || []
      const edges = props.edges || []
      const query = (props.query || '').trim().toLowerCase()
      const lastTurnOnly = !!props.lastTurnOnly
      const lastTurn = props.lastTurn || 0
      const showAllDeps = !!props.showAllDeps
      const layer = props.layer || null
      const traceTools = props.traceTools || []
      const traceSteps = props.traceSteps || []
      const [selected, setSelectedState] = React.useState(null)
      const selectedRef = React.useRef(null)
      const [openBubble, setOpenBubble] = React.useState(null)
      function setSelected(v) { selectedRef.current = v; setSelectedState(v) }
      const canvasRef = React.useRef(null)
      const wrapRef = React.useRef(null)
      const posRef = React.useRef({})
      const velRef = React.useRef({})
      const viewRef = React.useRef({ k: 1, tx: 0, ty: 0 })
      const dragRef = React.useRef(null)
      const hoverRef = React.useRef(null)
      const nodesRef = React.useRef([])
      const edgesRef = React.useRef([])
      const neighRef = React.useRef({})
      const colorsRef = React.useRef({})
      const rafRef = React.useRef(0)
      const queryRef = React.useRef('')
      const lastTurnOnlyRef = React.useRef(false)
      const lastTurnRef = React.useRef(0)
      const showAllDepsRef = React.useRef(false)
      const layerRef = React.useRef(null)
      const skipRef = React.useRef({})
      const clustersRef = React.useRef([])
      const clusterOfRef = React.useRef({})
      const toolProvidersRef = React.useRef(new Set())
      const traceToolsRef = React.useRef([])
      const traceStepsRef = React.useRef([])
      const bubbleHitRef = React.useRef([])

      const allNodes = nodes
      const allEdges = edges

      function fitAll() {
        const canvas = canvasRef.current
        const cw = (canvas && canvas.clientWidth) || 400
        const ch = (canvas && canvas.clientHeight) || 400
        const pos = posRef.current
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        for (const id in pos) {
          const p = pos[id]
          if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x
          if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y
        }
        if (minX === Infinity) { viewRef.current = { k: 1, tx: 0, ty: 0 }; return }
        const pad = 50
        const k = Math.min(cw / ((maxX - minX) + pad * 2), ch / ((maxY - minY) + pad * 2), 2)
        const tx = cw / 2 - ((minX + maxX) / 2) * k
        const ty = ch / 2 - ((minY + maxY) / 2) * k
        viewRef.current = { k, tx, ty }
      }

      function draw() {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1
        const cw = canvas.width / dpr
        const ch = canvas.height / dpr
        const view = viewRef.current
        const pos = posRef.current
        const nodesArr = nodesRef.current
        const edgesArr = edgesRef.current
        const neigh = neighRef.current
        const C = colorsRef.current
        const hovered = hoverRef.current
        const focus = hovered || selectedRef.current
        const focusSet = focus ? (neigh[focus] || new Set()) : null
        const showLabels = view.k >= LABEL_MIN_SCALE
        const q = queryRef.current
        const ltOnly = lastTurnOnlyRef.current
        const lt = lastTurnRef.current
        const showAllDeps = showAllDepsRef.current
        const layer = layerRef.current
        const match = {}
        if (q) { for (const n of nodesArr) match[n.id] = n.type === 'hub' || n.name.toLowerCase().indexOf(q) >= 0 }
        const skip = {}
        for (const n of nodesArr) {
          if (n.type === 'hub') continue
          if (ltOnly && !usedInTurn(n, lt)) { skip[n.id] = true; continue }
          if (layer && n.type !== layer) skip[n.id] = true
        }
        skipRef.current = skip
        const radiusById = {}
        for (const n of nodesArr) radiusById[n.id] = nodeRadius(n)
        // 思考轨迹：把本轮回调用的工具名解析成节点 id（traceByNode: id → 首次序号）
        const trace = traceToolsRef.current || []
        const traceByNode = new Map()
        const traceNameToId = {}
        if (trace.length) {
          for (const n of nodesArr) {
            if (n.type !== 'tool') continue
            if (!traceNameToId[n.name]) traceNameToId[n.name] = n.id
            const base = (n.name.split('/').pop() || '')
            if (base && !traceNameToId[base]) traceNameToId[base] = n.id
          }
          for (const tt of trace) {
            const id = traceNameToId[tt.name]
            if (!id) continue
            if (!traceByNode.has(id)) traceByNode.set(id, tt.seq)
          }
        }
        // 轨迹聚焦：trace 工具 + 提供它们的插件保持明亮，其余节点淡出（让思考信息在全局窗口里也清晰）
        const traceFocusSet = new Set()
        if (traceByNode.size) {
          traceByNode.forEach(function (seq, id) { traceFocusSet.add(id) })
          for (const e of edgesArr) {
            if (e.kind === 'provides' && traceByNode.has(e.target)) traceFocusSet.add(e.source)
          }
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, cw, ch)
        ctx.save()
        ctx.translate(view.tx, view.ty)
        ctx.scale(view.k, view.k)

        // 先画「包含」家族的气泡（凸包 + 虚线边框 + 标签，圈出一簇）
        for (const cl of clustersRef.current) {
          const pts = []
          for (const id of cl.members) {
            const p = pos[id]
            if (!p) continue
            if (skip[id]) continue
            pts.push({ x: p.x, y: p.y })
          }
          if (pts.length < 3) continue
          const hull = convexHull(pts)
          if (hull.length < 3) continue
          let gx = 0, gy = 0
          for (const p of hull) { gx += p.x; gy += p.y }
          gx /= hull.length; gy /= hull.length
          const exp = hull.map(function (p) { return { x: gx + (p.x - gx) * 1.24, y: gy + (p.y - gy) * 1.24 } })
          ctx.globalAlpha = 1
          ctx.fillStyle = C.hull
          ctx.strokeStyle = C.hullBorder
          ctx.lineWidth = 1.2
          ctx.setLineDash([5, 4])
          ctx.beginPath()
          const hn = exp.length
          ctx.moveTo((exp[0].x + exp[hn - 1].x) / 2, (exp[0].y + exp[hn - 1].y) / 2)
          for (let i = 0; i < hn; i++) {
            const p = exp[i], q = exp[(i + 1) % hn]
            ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2)
          }
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          ctx.setLineDash([])
          const bn = nodesRef.current.find(function (n) { return n.id === cl.id })
          if (bn) {
            const lbl = shortName(bn.name, 26)
            ctx.font = '10px system-ui, sans-serif'
            const tw = ctx.measureText(lbl).width
            let topY = Infinity
            for (const p of exp) { if (p.y < topY) topY = p.y }
            ctx.globalAlpha = 0.85
            ctx.fillStyle = C.label
            ctx.fillText(lbl, gx - tw / 2, topY - 7)
          }
        }

        for (const e of edgesArr) {
          const a = pos[e.source], b = pos[e.target]
          if (!a || !b) continue
          if (skip[e.source] || skip[e.target]) continue
          if (e.kind === 'contains') continue  // 包含线不画，靠空间聚类表达
          const isDep = e.kind === 'depends'
          // 依赖边默认隐藏：仅当「全显依赖」或焦点在端点时才画
          if (isDep && !showAllDeps && !(focus && (e.source === focus || e.target === focus))) continue
          let opacity, stroke, lineWidth
          if (isDep) {
            stroke = C.depends
            opacity = 0.55
            lineWidth = 1.4
          } else if (e.kind === 'usage') {
            const w = Math.max(1, e.weight || 1)
            const h = Math.log(1 + w)
            opacity = Math.min(0.12 + h * 0.16, 0.85)
            stroke = C.usage
            lineWidth = Math.min(0.6 + h * 0.7, 3.2)
          } else {
            opacity = e.kind === 'installed' ? 0.22 : (e.kind === 'calls' ? 0.4 : 0.28)
            stroke = e.kind === 'installed' ? C.plugin : (e.kind === 'calls' ? C.skill : C.gray)
            lineWidth = e.kind === 'installed' ? 1.3 : 1
          }
          if (q && match[e.source] === false && match[e.target] === false) opacity *= 0.05
          if (focus) { if (e.source === focus || e.target === focus) { opacity = 0.85 } else opacity = 0.06 }
          ctx.strokeStyle = stroke
          ctx.globalAlpha = opacity
          ctx.lineWidth = lineWidth
          if (isDep) {
            // 画箭头（指向被依赖方）
            const tr = radiusById[e.target] || 8
            const dx = b.x - a.x, dy = b.y - a.y
            const d = Math.sqrt(dx * dx + dy * dy) || 1
            const ux = dx / d, uy = dy / d
            const ex = b.x - ux * (tr + 5), ey = b.y - uy * (tr + 5)
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(ex, ey)
            ctx.stroke()
            const hl = 7, hw = 3.5
            const bx2 = ex - ux * hl, by2 = ey - uy * hl
            const px = -uy * hw, py = ux * hw
            ctx.fillStyle = stroke
            ctx.globalAlpha = opacity
            ctx.beginPath()
            ctx.moveTo(ex, ey)
            ctx.lineTo(bx2 + px, by2 + py)
            ctx.lineTo(bx2 - px, by2 - py)
            ctx.closePath()
            ctx.fill()
          } else {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }

        for (const n of nodesArr) {
          const p = pos[n.id]
          if (!p) continue
          const isHub = n.type === 'hub'
          if (skip[n.id]) continue
          const r = nodeRadius(n)
          const baseFill = isHub ? C.hub : (C[n.type] || '#888')
          let opacity = isDormant(n, toolProvidersRef.current) ? 0.45 : 1
          if (!isHub && q && match[n.id] === false) opacity = Math.min(opacity, 0.08)
          if (focus && !isHub) { if (n.id === focus) opacity = 1; else if (focusSet && focusSet.has(n.id)) opacity = 0.95; else opacity = 0.2 }
          if (traceByNode.size && !isHub && !traceFocusSet.has(n.id)) opacity = Math.min(opacity, 0.12)
          ctx.globalAlpha = opacity
          ctx.fillStyle = baseFill
          ctx.beginPath()
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
          ctx.fill()
          // 问题外圈（红=加载失败, 灰=被禁用），只画在插件上
          let ringColor = null
          if (!isHub && n.type === 'plugin') {
            if (n.phase === 'failed') ringColor = C.failed
            else if (n.enabled === false) ringColor = C.disabled
          }
          if (ringColor) {
            ctx.globalAlpha = opacity
            ctx.strokeStyle = ringColor
            ctx.lineWidth = 2.5
            ctx.beginPath()
            ctx.arc(p.x, p.y, r + 3, 0, Math.PI * 2)
            ctx.stroke()
          }
          if (n.id === focus) {
            ctx.globalAlpha = 1
            ctx.strokeStyle = C.plugin
            ctx.lineWidth = 2
            ctx.stroke()
          }
          if (showLabels) {
            ctx.globalAlpha = opacity
            ctx.fillStyle = isHub ? C.hub : C.label
            ctx.font = (isHub ? '600 12px ' : '10px ') + 'system-ui, sans-serif'
            ctx.fillText(isHub ? n.name : shortName(n.name, 20), p.x + r + 4, p.y + 3)
            // 用途小字：只给工具/技能，且有描述时显示
            if (!isHub && (n.type === 'tool' || n.type === 'skill')) {
              const desc = oneLine(purposeText(n), 24)
              if (desc) {
                ctx.globalAlpha = opacity * 0.6
                ctx.fillStyle = C.label
                ctx.font = '9px system-ui, sans-serif'
                ctx.fillText(desc, p.x + r + 4, p.y + 3 + 11)
              }
            }
          }
        }
        // 思考轨迹：调用顺序箭头 + 高亮环 + 序号徽标
        if (traceByNode.size) {
          let prevId = null
          for (const tt of trace) {
            const id = traceNameToId[tt.name]
            if (!id) { prevId = null; continue }
            if (prevId && prevId !== id) {
              const a = pos[prevId], b = pos[id]
              if (a && b && !skip[prevId] && !skip[id]) {
                const tr = radiusById[id] || 8
                const dx = b.x - a.x, dy = b.y - a.y
                const d = Math.sqrt(dx * dx + dy * dy) || 1
                const ux = dx / d, uy = dy / d
                const ex = b.x - ux * (tr + 4), ey = b.y - uy * (tr + 4)
                ctx.globalAlpha = 0.9
                ctx.strokeStyle = C.trace
                ctx.lineWidth = 2.2
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(ex, ey); ctx.stroke()
                const hl = 8, hw = 4
                const bx2 = ex - ux * hl, by2 = ey - uy * hl
                const px2 = -uy * hw, py2 = ux * hw
                ctx.fillStyle = C.trace
                ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(bx2 + px2, by2 + py2); ctx.lineTo(bx2 - px2, by2 - py2); ctx.closePath(); ctx.fill()
              }
            }
            prevId = id
          }
          traceByNode.forEach(function (seq, id) {
            const p = pos[id]
            if (!p || skip[id]) return
            const r = radiusById[id] || 8
            ctx.globalAlpha = 1
            ctx.strokeStyle = C.trace
            ctx.lineWidth = 2.6
            ctx.beginPath(); ctx.arc(p.x, p.y, r + 4.5, 0, Math.PI * 2); ctx.stroke()
            const bx = p.x + r * 0.72, by = p.y - r * 0.72
            ctx.fillStyle = C.trace
            ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#0b0b12'
            ctx.font = '700 9px system-ui, sans-serif'
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
            ctx.fillText(String(seq), bx, by + 0.5)
            ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'
          })
        }
        // 思考/回复气泡：画在调用路径旁（截断），点开看全文；避让节点与已放置气泡
        const steps = traceStepsRef.current || []
        if (steps.length) {
          const toolSeqIds = []
          for (const st of steps) { if (st.kind === 'tool') toolSeqIds.push(traceNameToId[st.name] || null) }
          // 预计算所有可见节点的包围盒，用于气泡避让（不和插件/技能/工具重叠）
          const nodeBoxes = []
          for (const n of nodesArr) {
            if (n.type === 'hub') continue
            const p = pos[n.id]
            if (!p || skip[n.id]) continue
            const r = radiusById[n.id] || 8
            const pad = 4
            nodeBoxes.push({ x0: p.x - r - pad, y0: p.y - r - pad, x1: p.x + r + pad, y1: p.y + r + pad })
          }
          let toolCursor = 0
          const hit = []
          const placed = []
          function hitsNodeBox(x, y, w, h) {
            for (const b of nodeBoxes) { if (x < b.x1 && x + w > b.x0 && y < b.y1 && y + h > b.y0) return true }
            return false
          }
          function hitsPlaced(x, y, w, h) {
            for (const b of placed) { if (x < b.x + b.w + 6 && x + w > b.x - 6 && y < b.y + b.h + 6 && y + h > b.y - 6) return true }
            return false
          }
          for (const st of steps) {
            if (st.kind === 'tool') { toolCursor++; continue }
            if (st.kind !== 'thinking' && st.kind !== 'reply') continue
            let anchorId = null
            for (let k = toolCursor; k < toolSeqIds.length; k++) { if (toolSeqIds[k]) { anchorId = toolSeqIds[k]; break } }
            if (!anchorId) for (let k = toolSeqIds.length - 1; k >= 0; k--) { if (toolSeqIds[k]) { anchorId = toolSeqIds[k]; break } }
            const ap = anchorId ? pos[anchorId] : null
            const label = (st.kind === 'thinking' ? '💭 ' : '💬 ') + shortText(st.text, 20)
            ctx.font = '10px system-ui, sans-serif'
            const tw = ctx.measureText(label).width
            const bw = Math.max(tw + 14, 26), bh = 20
            let sx0, sy0
            if (ap && !skip[anchorId]) {
              const r = radiusById[anchorId] || 8
              sx0 = ap.x + r + 8
              sy0 = ap.y - r - 2
            } else {
              sx0 = WORLD.W / 2 - 120
              sy0 = WORLD.H / 2 - 130
            }
            // 垂直向下扫描找空位（不压节点、不压已放置气泡）；每 24 步换一列
            let bx = sx0, by = sy0
            let guard = 0
            while ((hitsNodeBox(bx, by, bw, bh) || hitsPlaced(bx, by, bw, bh)) && guard < 60) {
              by += bh + 6
              guard++
              if (guard % 24 === 0) { by = sy0; bx += 44 }
            }
            placed.push({ x: bx, y: by, w: bw, h: bh })
            // 点击某个工具节点时，锚定到它的思考/回复气泡也一起高亮（与节点选中一致的品牌蓝描边）
            const isAnchorFocus = anchorId && focus && anchorId === focus
            if (isAnchorFocus) {
              ctx.globalAlpha = 1
              ctx.fillStyle = st.kind === 'thinking' ? 'rgba(167,139,250,0.55)' : 'rgba(34,197,94,0.50)'
              ctx.strokeStyle = C.plugin
              ctx.lineWidth = 2.5
              ctx.shadowBlur = 0
            } else {
              ctx.globalAlpha = 0.95
              ctx.fillStyle = st.kind === 'thinking' ? 'rgba(167,139,250,0.18)' : 'rgba(34,197,94,0.16)'
              ctx.strokeStyle = st.kind === 'thinking' ? 'rgba(167,139,250,0.7)' : 'rgba(34,197,94,0.6)'
              ctx.lineWidth = 1
              ctx.shadowBlur = 0
            }
            roundRect(ctx, bx, by, bw, bh, 7)
            ctx.fill(); ctx.stroke()
            ctx.shadowBlur = 0
            ctx.fillStyle = isAnchorFocus ? '#ffffff' : C.label
            if (isAnchorFocus) ctx.font = '700 10px system-ui, sans-serif'
            ctx.fillText(label, bx + 7, by + 14)
            if (isAnchorFocus) ctx.font = '10px system-ui, sans-serif'
            const sx = view.tx + bx * view.k, sy = view.ty + by * view.k
            hit.push({ x: sx, y: sy, w: bw * view.k, h: bh * view.k, kind: st.kind, full: st.text || '' })
          }
          bubbleHitRef.current = hit
        } else {
          bubbleHitRef.current = []
        }
        ctx.globalAlpha = 1
        ctx.restore()
      }

      function frame() {
        simulateStep(nodesRef.current, edgesRef.current, posRef.current, velRef.current, dragRef.current, true, clusterOfRef.current)
        draw()
        rafRef.current = requestAnimationFrame(frame)
      }

      function resize() {
        const canvas = canvasRef.current
        const wrap = wrapRef.current
        if (!canvas || !wrap) return
        const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1
        canvas.width = Math.max(1, Math.floor(wrap.clientWidth * dpr))
        canvas.height = Math.max(1, Math.floor(wrap.clientHeight * dpr))
      }

      React.useEffect(function () {
        nodesRef.current = allNodes
        edgesRef.current = allEdges
        const neigh = {}
        allEdges.forEach(function (e) { (neigh[e.source] = neigh[e.source] || new Set()).add(e.target); (neigh[e.target] = neigh[e.target] || new Set()).add(e.source) })
        neighRef.current = neigh
        // 计算「包含」家族：全家桶 → 子插件 → 子插件提供的工具（完整族谱）
        const toolsByPlugin = new Map()
        allEdges.forEach(function (e) {
          if (e.kind !== 'provides') return
          if (!toolsByPlugin.has(e.source)) toolsByPlugin.set(e.source, new Set())
          toolsByPlugin.get(e.source).add(e.target)
        })
        const bundleMap = new Map()
        allEdges.forEach(function (e) {
          if (e.kind !== 'contains') return
          if (!bundleMap.has(e.source)) bundleMap.set(e.source, new Set())
          bundleMap.get(e.source).add(e.target)
        })
        const clusters = []
        bundleMap.forEach(function (subs, bundleId) {
          const members = new Set();
          members.add(bundleId)
          for (const subId of subs) {
            members.add(subId)
            const tools = toolsByPlugin.get(subId)
            if (tools) for (const t of tools) members.add(t)
          }
          clusters.push({ id: bundleId, members: Array.from(members) })
        })
        clustersRef.current = clusters
        const clusterOf = {}
        clusters.forEach(function (cl) { cl.members.forEach(function (mid) { clusterOf[mid] = cl.id }) })
        clusterOfRef.current = clusterOf
        const toolProviders = new Set();
        allEdges.forEach(function (e) { if (e.kind === 'provides') toolProviders.add(e.source) })
        toolProvidersRef.current = toolProviders
        colorsRef.current = {
          plugin: resolveColor('--dsw-alias-brand-primary', '#3b82f6'),
          skill: resolveColor('--dsw-alias-state-success-primary', '#22c55e'),
          tool: resolveColor('--dsw-alias-state-warn-primary', '#f59e0b'),
          hub: resolveColor('--dsw-alias-brand-primary', '#3b82f6'),
          gray: resolveColor('--dsw-alias-label-tertiary', '#6b7280'),
          label: resolveColor('--dsw-alias-label-secondary', '#9ca3af'),
          usage: resolveColor('--dsw-alias-state-error-primary', '#f87171'),
          depends: '#a78bfa',
          failed: '#ef4444',
          disabled: '#9ca3af',
          hull: 'rgba(129, 140, 248, 0.07)',
          hullBorder: 'rgba(165, 180, 252, 0.45)',
          trace: '#22d3ee',
        }
        posRef.current = posRef.current || {}
        const prevPos = posRef.current
        const hasPos = Object.keys(prevPos).length > 0
        resize()
        if (hasPos) {
          // 更新：只为新节点补位置，保留现有布局与视角（不重排、不 fit）
          const cx = WORLD.W / 2, cy = WORLD.H / 2
          for (const n of allNodes) {
            if (!prevPos[n.id]) prevPos[n.id] = { x: cx + (Math.random() - 0.5) * 80, y: cy + (Math.random() - 0.5) * 80 }
          }
        } else {
          // 首次：初始化 + 预收敛 160 步 + 适配视图，避免一打开就乱飞
          posRef.current = initPositions(allNodes)
          velRef.current = {}
          for (let i = 0; i < 160; i++) simulateStep(allNodes, allEdges, posRef.current, velRef.current, null, false, clusterOfRef.current)
          fitAll()
        }
        cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(frame)
        const ro = new ResizeObserver(function () { resize(); draw() })
        if (wrapRef.current) ro.observe(wrapRef.current)
        return function () { cancelAnimationFrame(rafRef.current); ro.disconnect() }
      }, [props.nodes, props.edges])

      React.useEffect(function () {
        queryRef.current = query
        lastTurnOnlyRef.current = lastTurnOnly
        lastTurnRef.current = lastTurn
        showAllDepsRef.current = showAllDeps
        layerRef.current = layer
        traceToolsRef.current = traceTools
        traceStepsRef.current = traceSteps
      }, [query, lastTurnOnly, lastTurn, showAllDeps, layer, traceTools, traceSteps])

      // 仅当「当前轮次」真正切换时关闭浮层（traceSteps 引用在轮次不变时保持稳定，不会被 4s 轮询误关）
      React.useEffect(function () {
        setOpenBubble(null)
      }, [traceSteps])

      function toWorld(e) {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const view = viewRef.current
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        return { wx: (mx - view.tx) / view.k, wy: (my - view.ty) / view.k, mx, my }
      }

      function hitTest(e) {
        const w = toWorld(e)
        const pos = posRef.current
        const view = viewRef.current
        const nodesArr = nodesRef.current
        const skip = skipRef.current
        for (let i = nodesArr.length - 1; i >= 0; i--) {
          const n = nodesArr[i]
          const p = pos[n.id]
          if (!p) continue
          if (skip[n.id]) continue
          const r = Math.max(nodeRadius(n), 8 / view.k)
          const dx = p.x - w.wx, dy = p.y - w.wy
          if (dx * dx + dy * dy <= r * r) return n
        }
        return null
      }

      function hitBubble(e) {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        const hits = bubbleHitRef.current || []
        for (let i = hits.length - 1; i >= 0; i--) {
          const h = hits[i]
          if (mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) return h
        }
        return null
      }

      function onWheel(e) {
        e.preventDefault()
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        const factor = e.deltaY < 0 ? 1.12 : 0.9
        const prev = viewRef.current
        const k2 = Math.max(0.15, Math.min(8, prev.k * factor))
        const kk = k2 / prev.k
        viewRef.current = { k: k2, tx: mx - kk * (mx - prev.tx), ty: my - kk * (my - prev.ty) }
        draw()
      }

      function onMouseDown(e) {
        const b = hitBubble(e)
        if (b) {
          const graph = wrapRef.current
          const gw = graph ? graph.clientWidth : 400
          const gh = graph ? graph.clientHeight : 400
          const tw = Math.min(330, gw - 16)
          const th = 280
          let vx = Math.max(4, Math.min(b.x, gw - tw - 4))
          let vy = b.y + b.h + 6
          if (vy + th > gh - 4) vy = Math.max(4, b.y - th - 6)
          setOpenBubble({ kind: b.kind, full: b.full, vx: vx, vy: vy })
          dragRef.current = null
          return
        }
        setOpenBubble(null)
        const n = hitTest(e)
        if (n) {
          const w = toWorld(e)
          dragRef.current = { type: 'node', id: n.id, wx: w.wx, wy: w.wy, moved: false }
          setSelected(selectedRef.current === n.id ? null : n.id)
        } else {
          dragRef.current = { type: 'pan', startX: e.clientX, startY: e.clientY, tx: viewRef.current.tx, ty: viewRef.current.ty, moved: false }
        }
      }

      function onMouseMove(e) {
        const d = dragRef.current
        if (d) {
          d.moved = true
          if (d.type === 'pan') {
            viewRef.current = { k: viewRef.current.k, tx: d.tx + (e.clientX - d.startX), ty: d.ty + (e.clientY - d.startY) }
          } else if (d.type === 'node') {
            const w = toWorld(e)
            d.wx = w.wx; d.wy = w.wy
          }
        } else {
          const n = hitTest(e)
          hoverRef.current = n ? n.id : null
        }
      }

      function onMouseUp(e) {
        const d = dragRef.current
        if (d && d.type === 'pan' && !d.moved) {
          setSelected(null)
        }
        dragRef.current = null
      }

      function onMouseLeave() {
        dragRef.current = null
        hoverRef.current = null
      }

      const sel = selected ? allNodes.find(function (n) { return n.id === selected }) : null
      const selReal = sel && sel.id !== 'kg-hub' ? sel : null
      const hist = selReal && selReal.history && selReal.history.length ? selReal.history.slice().reverse().slice(0, 8) : []
      const problems = []
      if (selReal && selReal.type === 'plugin') {
        if (selReal.phase === 'failed') problems.push('加载失败（fiber failed）')
        if (selReal.enabled === false) problems.push('被禁用（未启用）')
      }

      return React.createElement('div', { className: 'kg-body' },
        React.createElement('div', { className: 'kg-legend' },
          React.createElement('span', { className: 'kg-legend-item' }, React.createElement('i', { className: 'kg-legend-dot', style: { background: colorsRef.current.plugin || '#3b82f6' } }), '插件'),
          React.createElement('span', { className: 'kg-legend-item' }, React.createElement('i', { className: 'kg-legend-dot', style: { background: colorsRef.current.skill || '#22c55e' } }), '技能'),
          React.createElement('span', { className: 'kg-legend-item' }, React.createElement('i', { className: 'kg-legend-dot', style: { background: colorsRef.current.tool || '#f59e0b' } }), '工具'),
          React.createElement('span', { className: 'kg-legend-item' }, React.createElement('i', { className: 'kg-legend-dot', style: { background: colorsRef.current.gray || '#6b7280', opacity: 0.45, transform: 'scale(0.7)' } }), '吃灰（小·淡）'),
          React.createElement('span', { className: 'kg-legend-item' }, React.createElement('i', { className: 'kg-legend-line', style: { borderColor: colorsRef.current.gray || '#6b7280' } }), '提供'),
          React.createElement('span', { className: 'kg-legend-item' }, React.createElement('i', { className: 'kg-legend-line', style: { borderColor: colorsRef.current.skill || '#22c55e' } }), '调用'),
          React.createElement('span', { className: 'kg-legend-item' }, React.createElement('i', { className: 'kg-legend-line', style: { borderColor: colorsRef.current.depends || '#a78bfa' } }), '依赖'),
          React.createElement('span', { className: 'kg-legend-item' }, React.createElement('i', { className: 'kg-legend-ring', style: { borderColor: colorsRef.current.failed || '#ef4444' } }), '加载失败'),
          React.createElement('span', { className: 'kg-legend-item' }, React.createElement('i', { className: 'kg-legend-ring', style: { borderColor: colorsRef.current.disabled || '#9ca3af' } }), '被禁用'),
          React.createElement('button', { className: 'kg-reset', onClick: function () { fitAll(); draw() } }, '重置视图')
        ),
        React.createElement('div', { className: 'kg-graph', ref: wrapRef },
          React.createElement('canvas', { ref: canvasRef, onWheel: onWheel, onMouseDown: onMouseDown, onMouseMove: onMouseMove, onMouseUp: onMouseUp, onMouseLeave: onMouseLeave }),
          openBubble ? React.createElement('div', { className: 'kg-bubble-tip ' + openBubble.kind, style: { left: openBubble.vx + 'px', top: openBubble.vy + 'px' }, onClick: function (ev) { ev.stopPropagation() } },
            React.createElement('div', { className: 'kg-bubble-tip-head' },
              React.createElement('span', null, openBubble.kind === 'thinking' ? '💭 思考全文' : '💬 回复全文'),
              React.createElement('button', { className: 'kg-bubble-tip-close', onClick: function () { setOpenBubble(null) } }, '×')),
            React.createElement('div', { className: 'kg-bubble-tip-body' }, openBubble.full || '（无内容）')) : null
        ),
        selReal ? React.createElement('div', { className: 'kg-detail' },
          React.createElement('div', { className: 'kg-row-name' }, selReal.name),
          purposeText(selReal) ? React.createElement('div', { className: 'kg-detail-title' }, '用途') : null,
          purposeText(selReal) ? React.createElement('div', { className: 'kg-row-desc' }, purposeText(selReal)) : null,
          React.createElement('div', { className: 'kg-row-meta' }, '用过 ' + selReal.count + ' 次 · 最近 ' + fmtLastUsed(selReal.lastUsed) + (selReal.source ? ' · ' + selReal.source : '')),
          problems.length ? React.createElement('div', { className: 'kg-detail-title' }, '问题诊断') : null,
          problems.map(function (p, i) { return React.createElement('div', { key: 'p' + i, className: 'kg-row-meta', style: { color: '#f87171' } }, p) }),
          hist.length ? React.createElement('div', { className: 'kg-detail-title' }, '最近使用（第几轮 · 时间）') : null,
          hist.map(function (e, i) { return React.createElement('div', { key: i, className: 'kg-row-meta' }, (e.turn ? '第 ' + e.turn + ' 轮 · ' : '') + fmtLastUsed(e.t) + (e.sid ? ' · ' + String(e.sid).slice(0, 8) : '')) })) : null)
    }

    function KnowledgeTab() {
      const [model, setModel] = React.useState({ nodes: [], edges: [], counts: {} })
      const [tab, setTab] = React.useState('plugin')
      const [view, setView] = React.useState('graph')
      const [query, setQuery] = React.useState('')
      const [lastTurnOnly, setLastTurnOnly] = React.useState(false)
      const [showAllDeps, setShowAllDeps] = React.useState(false)
      const [layer, setLayer] = React.useState(null)
      const [turns, setTurns] = React.useState([])
      const [traceTurn, setTraceTurn] = React.useState(null)
      const [trace, setTrace] = React.useState(null)
      const lastSigRef = React.useRef('')
      const loadTraceSeqRef = React.useRef(0)
      const load = function () {
        fetch('/kg-api/get-model').then(function (r) { return r.json() }).then(function (m) {
          m = m || { nodes: [], edges: [], counts: {} }
          const sig = JSON.stringify({ c: m.counts, n: (m.nodes || []).map(function (n) { return n.id + '|' + n.count + '|' + n.lastUsed + '|' + (n.phase || '') + '|' + (n.enabled ? '1' : '0') }) })
          if (sig === lastSigRef.current) return
          lastSigRef.current = sig
          setModel(m)
        }).catch(function (e) { console.error('[kg] getModel', e) })
      }
      const loadTurns = function () {
        fetch('/kg-api/get-turns').then(function (r) { return r.json() }).then(function (d) {
          const list = (d && Array.isArray(d.turns)) ? d.turns : []
          setTurns(list)
        }).catch(function (e) { console.error('[kg] getTurns', e) })
      }
      const loadTrace = function (turn) {
        const seq = ++loadTraceSeqRef.current
        if (turn === null || turn === undefined) { setTrace(null); return }
        fetch('/kg-api/get-turn?turn=' + encodeURIComponent(turn)).then(function (r) { return r.json() }).then(function (d) {
          if (seq !== loadTraceSeqRef.current) return
          setTrace((d && d.turn) ? d.turn : null)
        }).catch(function (e) { if (seq !== loadTraceSeqRef.current) return; console.error('[kg] getTurn', e); setTrace(null) })
      }
      function selectTurn(turn) { setTraceTurn(turn) }
      function toggleLastTurn() {
        const next = !lastTurnOnly
        setLastTurnOnly(next)
        if (next && turns.length) selectTurn(turns[turns.length - 1].turn)
        else if (!next) selectTurn(null)
      }
      const refreshAll = function () {
        fetch('/kg-api/refresh').then(function () { load(); loadTurns() }).catch(function (e) { console.error('[kg] refresh', e) })
      }
      function buildReport() {
        const c = model.counts || {}
        const ns = model.nodes || []
        const plugins = ns.filter(function (n) { return n.type === 'plugin' })
        const skills = ns.filter(function (n) { return n.type === 'skill' })
        const tools = ns.filter(function (n) { return n.type === 'tool' })
        const failed = plugins.filter(function (n) { return n.phase === 'failed' })
        const disabled = plugins.filter(function (n) { return n.enabled === false })
        const toolProviders = new Set();
        (model.edges || []).forEach(function (e) { if (e.kind === 'provides') toolProviders.add(e.source) })
        const dormant = ns.filter(function (n) { return isDormant(n, toolProviders) })
        const used = ns.filter(function (n) { return n.count > 0 }).sort(function (a, b) { return b.count - a.count })
        const L = []
        L.push('# DSH 插件图谱使用报告')
        L.push('')
        L.push('生成时间：' + new Date().toLocaleString())
        L.push('')
        L.push('## 概览')
        L.push('- 插件：' + plugins.length)
        L.push('- 技能：' + skills.length)
        L.push('- 工具：' + tools.length)
        L.push('- 总使用次数：' + (c.uses != null ? c.uses : 0))
        L.push('- 依赖关系边：' + (c.edge != null ? c.edge : 0))
        L.push('')
        L.push('## 问题插件（' + (failed.length + disabled.length) + ' 个）')
        if (failed.length || disabled.length) {
          failed.forEach(function (n) { L.push('- 🔴 加载失败：' + n.name) })
          disabled.forEach(function (n) { L.push('- ⚪ 被禁用：' + n.name) })
        } else {
          L.push('（无）')
        }
        L.push('')
        L.push('## 吃灰清单（从未使用，共 ' + dormant.length + ' 个）')
        dormant.slice(0, 200).forEach(function (n) { L.push('- [' + n.type + '] ' + n.name) })
        L.push('')
        L.push('## 使用排行（Top 20）')
        if (used.length === 0) L.push('（暂无使用记录）')
        else used.slice(0, 20).forEach(function (n, i) { L.push((i + 1) + '. ' + n.name + ' — ' + n.count + ' 次') })
        L.push('')
        return L.join('\n')
      }
      function downloadReport() {
        try {
          const text = buildReport()
          const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'dsl-插件图谱报告.md'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          setTimeout(function () { URL.revokeObjectURL(url) }, 1000)
        } catch (e) { console.error('[kg] report', e) }
      }
      React.useEffect(function () {
        load()
        loadTurns()
        const t = setInterval(function () { load(); loadTurns() }, 4000)
        return function () { clearInterval(t) }
      }, [])
      React.useEffect(function () {
        loadTrace(traceTurn)
      }, [traceTurn])
      let rendered
      try {
        const tabs = [['plugin', '插件'], ['skill', '技能'], ['tool', '工具']]
        const ql = query.trim().toLowerCase()
        const lastTurn = (model.nodes || []).reduce(function (m, n) { (n.history || []).forEach(function (h) { if (typeof h.turn === 'number' && h.turn > m) m = h.turn }); return m }, 0)
        const listToolProviders = new Set();
        (model.edges || []).forEach(function (e) { if (e.kind === 'provides') listToolProviders.add(e.source) })
        const list = (model.nodes || []).filter(function (n) { return n.type === tab && (!lastTurnOnly || usedInTurn(n, lastTurn)) && (!ql || n.name.toLowerCase().indexOf(ql) >= 0) }).sort(function (a, b) { return b.count - a.count })
        const tabEls = tabs.map(function (t) { return React.createElement('button', { key: t[0], className: 'kg-tab' + (tab === t[0] ? ' on' : ''), onClick: function () { setTab(t[0]) } }, t[1]) })
        const rows = list.length === 0 ? React.createElement('div', { className: 'kg-empty' }, '暂无数据，点右上角刷新') : list.map(function (n) { return React.createElement('div', { key: n.id, className: 'kg-row' + (isDormant(n, listToolProviders) ? ' dormant' : '') }, React.createElement('div', { className: 'kg-row-name' }, n.name), purposeText(n) ? React.createElement('div', { className: 'kg-row-desc' }, purposeText(n)) : null, React.createElement('div', { className: 'kg-row-meta' }, '用过 ' + n.count + ' 次 · 最近 ' + fmtLastUsed(n.lastUsed) + (n.source ? ' · ' + n.source : ''))) })
        const c = model.counts || {}
        const summary = '插件 ' + (c.plugin != null ? c.plugin : '?') + ' · 技能 ' + (c.skill != null ? c.skill : '?') + ' · 工具 ' + (c.tool != null ? c.tool : '?') + ' · 连线 ' + (c.edge != null ? c.edge : '?') + ' · 使用 ' + (c.uses != null ? c.uses : '?')
        const layerDefs = [['全部', null], ['插件', 'plugin'], ['技能', 'skill'], ['工具', 'tool']]
        const layerEls = layerDefs.map(function (d) { return React.createElement('button', { key: d[1] || 'all', className: 'kg-toggle' + (layer === d[1] ? ' on' : ''), onClick: function () { setLayer(d[1]) } }, d[0]) })
        // 思考轨迹：当前轮次工具调用序列（序号从 1 起，用于图谱高亮）
        const traceTools = trace ? (trace.items || []).filter(function (it) { return it.kind === 'tool' }).map(function (it, i) { return { name: it.name, seq: i + 1 } }) : []
        const turnIdx = turns.length ? turns.findIndex(function (t) { return t.turn === traceTurn }) : -1
        const turnOpts = [React.createElement('option', { key: '__none', value: '' }, '—— 查看某轮的思考 ——')].concat(turns.map(function (t) { return React.createElement('option', { key: t.session + ':' + t.turn, value: String(t.turn) }, '第 ' + t.turn + ' 轮' + (t.prompt ? ' · ' + shortText(t.prompt, 18) : '') + '（' + t.toolCount + ' 工具）') }))
        const turnbar = React.createElement('div', { className: 'kg-turnbar' },
          React.createElement('button', { className: 'kg-turnbtn', disabled: turnIdx <= 0, onClick: function () { if (turnIdx > 0) selectTurn(turns[turnIdx - 1].turn) } }, '‹ 上一轮'),
          React.createElement('select', { value: traceTurn === null ? '' : String(traceTurn), onChange: function (e) { const v = e.target.value; selectTurn(v === '' ? null : parseInt(v, 10)) } }, turnOpts),
          React.createElement('button', { className: 'kg-turnbtn', disabled: turnIdx < 0 || turnIdx >= turns.length - 1, onClick: function () { if (turnIdx >= 0 && turnIdx < turns.length - 1) selectTurn(turns[turnIdx + 1].turn) } }, '下一轮 ›'),
          React.createElement('span', { className: 'kg-turnbtn', style: { border: 'none', background: 'transparent', cursor: 'default' } }, '共 ' + turns.length + ' 轮'))
        const turnbarEl = turns.length ? turnbar : React.createElement('div', { className: 'kg-trace-hint' }, '还没有对话轮次 — 先和助手聊几句，再回来这里看每轮的思考过程')
        const traceSteps = trace ? (trace.items || []) : []
        const graphContent = React.createElement(React.Fragment, null,
          turnbarEl,
          React.createElement('div', { className: 'kg-graphslot' },
            React.createElement(GraphView, { nodes: model.nodes, edges: model.edges, query: query, lastTurnOnly: lastTurnOnly, lastTurn: lastTurn, showAllDeps: showAllDeps, layer: layer, traceTools: traceTools, traceSteps: traceSteps })))
        const listContent = React.createElement('div', { className: 'kg-body' }, React.createElement('div', { className: 'kg-tabbar' }, tabEls), React.createElement('div', { className: 'kg-list' }, rows))
        rendered = React.createElement('div', { className: 'kg-body' },
          React.createElement('div', { className: 'kg-head' },
            React.createElement('span', { className: 'kg-title' }, '插件图谱'),
            React.createElement('button', { className: 'kg-toggle' + (view === 'list' ? ' on' : ''), onClick: function () { setView('list') } }, '清单'),
            React.createElement('button', { className: 'kg-toggle' + (view === 'graph' ? ' on' : ''), onClick: function () { setView('graph') } }, '图谱'),
            React.createElement('button', { className: 'kg-btn-sm', onClick: refreshAll }, '刷新'),
            React.createElement('button', { className: 'kg-btn-sm', onClick: downloadReport }, '导出报告')),
          React.createElement('div', { className: 'kg-summary' }, summary),
          React.createElement('div', { className: 'kg-toolbar' },
            React.createElement('input', { className: 'kg-search', placeholder: '搜索插件 / 技能 / 工具…', value: query, onChange: function (e) { setQuery(e.target.value) } }),
            React.createElement('button', { className: 'kg-toggle' + (lastTurnOnly ? ' on' : ''), onClick: toggleLastTurn }, '上一轮调用'),
            React.createElement('button', { className: 'kg-toggle' + (showAllDeps ? ' on' : ''), onClick: function () { setShowAllDeps(!showAllDeps) } }, '全显依赖')),
          view === 'graph' ? React.createElement('div', { className: 'kg-layerbar' }, React.createElement('span', { className: 'kg-layerlabel' }, '图层'), layerEls) : null,
          view === 'graph' ? graphContent : listContent)
      } catch (e) {
        window.__kgRenderErr = { message: e.message, stack: e.stack }
        rendered = React.createElement('div', { className: 'kg-body' }, React.createElement('div', { className: 'kg-empty' }, '渲染出错：' + (e && e.message)))
      }
      return rendered
    }

    let tabRegistered = false
    let tabListeners = []
    function setTabRegistered(v) {
      tabRegistered = v
      const ls = tabListeners
      tabListeners = []
      for (const l of ls) l(v)
    }

    function FloatingPanel() {
      const [tabReg, setTabReg] = React.useState(tabRegistered)
      const [open, setOpen] = React.useState(false)
      React.useEffect(function () {
        function on(v) { setTabReg(v) }
        tabListeners.push(on)
        return function () { tabListeners = tabListeners.filter(function (x) { return x !== on }) }
      }, [])
      if (tabReg) return null
      if (!open) return React.createElement('button', { className: 'kg-btn', onClick: function () { setOpen(true) } }, '插件图谱')
      return React.createElement('div', { className: 'kg-panel' }, React.createElement(KnowledgeTab, null), React.createElement('button', { className: 'kg-btn', style: { position: 'absolute', top: 0, right: 0, writingMode: 'horizontal-tb', width: 'auto', padding: '4px 10px' }, onClick: function () { setOpen(false) } }, '×'))
    }

    function apply(ctx) {
      try {
        ctx.inject(['betterSidebar'], function (sctx) {
          try {
            if (tabRegistered) return
            const bs = sctx.get('betterSidebar')
            if (bs && typeof bs.registerTab === 'function') {
              bs.registerTab({ id: 'kg-knowledge-graph', title: '插件图谱', icon: GraphIcon, order: 200, single: true, component: KnowledgeTab })
              setTabRegistered(true)
            }
          } catch (e) { console.error('[kg] registerTab 失败', e) }
        })
      } catch (e) { console.error('[kg] inject betterSidebar 失败', e) }
      try {
        const slots = ctx.get('slots')
        if (slots !== undefined) slots.inject('shell.overlay', function () { return slots.register({ name: 'shell.overlay', id: 'dsh-kg-panel' }, function () { return React.createElement(FloatingPanel) }) })
      } catch (e) { console.error('[kg] slots 失败', e) }
    }

    exports.apply = apply
    return module.exports
  },
})
