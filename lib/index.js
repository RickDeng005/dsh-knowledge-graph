// dsh-knowledge-graph — 宿主半：枚举插件/技能/工具，监听工具调用，持久化到本地 JSON，
// 并通过 webServer 暴露 /kg-api/* HTTP 接口给浏览器半调用。

import { appendFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
const nodeRequire = createRequire(import.meta.url)

function dlog(msg) {
  try {
    const home = process.env.DSH_HOME || (process.env.USERPROFILE || '') + '/.dsh'
    appendFileSync(home + '/kg-debug.log', msg + '\n')
  } catch (e) {}
}

export const inject = ['webServer']

export function apply(ctx) {
  dlog('[kg] apply start')
  const nodes = new Map()
  let totalUses = 0
  let depEdgesCache = []
  const currentTurn = new Map()
  const CATALOG = {
    bash: 'dsh-tool-bash', pwsh: 'dsh-tool-pwsh',
    read: 'dsh-tool-fs', write: 'dsh-tool-fs', edit: 'dsh-tool-fs', glob: 'dsh-tool-fs', grep: 'dsh-tool-fs',
    web_search: 'dsh-tool-web', web_fetch: 'dsh-tool-web',
    skill: 'dsh-tool-skill', todo_write: 'dsh-tool-todo',
    subagent: 'dsh-tool-subagent', subagent_fork: 'dsh-tool-subagent',
    ask_user_question: 'dsh-tool-ask-user',
    create_goal: 'dsh-tool-goal', get_goal: 'dsh-tool-goal', update_goal: 'dsh-tool-goal',
    ssh_list: 'dsh-ssh', ssh_exec: 'dsh-ssh', ssh_upload: 'dsh-ssh', ssh_download: 'dsh-ssh', ssh_tunnel: 'dsh-ssh', ssh_cluster: 'dsh-ssh',
    cordis_define: 'dsh-tool-cordis', cordis_run: 'dsh-tool-cordis', cordis_stop: 'dsh-tool-cordis', cordis_undefine: 'dsh-tool-cordis', cordis_inspect_list: 'dsh-tool-cordis', cordis_inspect_query: 'dsh-tool-cordis', cordis_inspect_self: 'dsh-tool-cordis',
    workflow: 'dsh-tool-workflow', ralph: 'dsh-tool-ralph',
    job_kill: 'dsh-tool-jobs', job_list: 'dsh-tool-jobs', job_output: 'dsh-tool-jobs',
    list_agents: 'dsh-tool-subagent-control', send_message: 'dsh-tool-subagent-control', interrupt_agent: 'dsh-tool-subagent-control',
    describe_image: 'dsh-tool-describe-image', read_image: 'dsh-tool-describe-image',
    exit_plan_mode: 'dsh-plan-mode', str_replace_editor: 'dsh-tool-str-replace-editor', run_code: 'dsh-tools',
  }

  function s(v) { if (v === null || v === undefined) return ''; if (typeof v === 'string') return v; return String(v) }
  function first(o, keys) { if (!o || typeof o !== 'object') return ''; for (let i = 0; i < keys.length; i++) { const v = o[keys[i]]; if (v !== undefined && v !== null && v !== '') return v } return '' }

  function ensureNode(type, name, desc, source) {
    if (!name) return null
    const id = type + ':' + name
    let n = nodes.get(id)
    if (!n) { n = { id, type, name, description: '', source: '', count: 0, lastUsed: null, history: [], enabled: null, phase: null }; nodes.set(id, n) }
    if (!n.description && desc) n.description = s(desc)
    if (!n.source && source) n.source = s(source)
    return n
  }
  function touch(n, info) {
    if (!n) return
    n.count += 1
    n.lastUsed = Date.now()
    totalUses += 1
    if (info) { n.history.push({ t: n.lastUsed, sid: info.sid || '', turn: info.turn || 0 }); if (n.history.length > 40) n.history.shift() }
  }
  function findPlugin(fragment) {
    if (!fragment) return null
    for (const n of nodes.values()) {
      if (n.type !== 'plugin') continue
      const nm = n.name
      if (nm === fragment || nm.endsWith('/' + fragment) || nm.endsWith(fragment) || nm.indexOf('/' + fragment) >= 0) return n
    }
    return null
  }
  function ensureCatalogPlugins() {
    const frags = new Set()
    for (const name in CATALOG) frags.add(CATALOG[name])
    frags.add('dsh-browser')
    frags.add('hindsight-coding-agents')
    for (const f of frags) {
      if (!findPlugin(f)) ensureNode('plugin', f, '', '')
    }
  }
  function addSkill(it) {
    const name = s(first(it, ['name', 'id', 'key']))
    if (!name) return
    ensureNode('skill', name, s(first(it, ['description', 'desc', 'summary'])), s(first(it, ['source', 'scope', 'layer'])))
  }
  function addTool(it) {
    const name = s(first(it, ['name', 'id', 'key']))
    if (!name) return
    ensureNode('tool', name, s(first(it, ['description', 'desc', 'summary'])), '')
  }
  function pluginForTool(name) {
    if (CATALOG[name]) return CATALOG[name]
    if (name.indexOf('browser_') === 0) return 'dsh-browser'
    if (name.indexOf('hindsight_') === 0) return 'hindsight-coding-agents'
    if (name.indexOf('ssh_') === 0) return 'dsh-ssh'
    if (name.indexOf('cordis_') === 0) return 'dsh-tool-cordis'
    if (name.indexOf('job_') === 0) return 'dsh-tool-jobs'
    return ''
  }

  // ---- 插件依赖边：读 peerDependencies ----
  function packageNameOf(nm) {
    if (!nm) return ''
    if (nm.indexOf('@') === 0) { const parts = nm.split('/'); return parts.length >= 2 ? parts[0] + '/' + parts[1] : nm }
    return nm.split('/')[0]
  }
  function readPackageDeps(nm) {
    const empty = { peer: [], deps: [], description: '' }
    try {
      const pkg = packageNameOf(nm)
      if (!pkg) return empty
      const pj = nodeRequire.resolve(pkg + '/package.json')
      const data = JSON.parse(readFileSync(pj, 'utf8'))
      const peer = (data && data.peerDependencies && typeof data.peerDependencies === 'object') ? Object.keys(data.peerDependencies) : []
      const deps = (data && data.dependencies && typeof data.dependencies === 'object') ? Object.keys(data.dependencies) : []
      const description = (data && typeof data.description === 'string') ? data.description : ''
      return { peer, deps, description }
    } catch (e) { return empty }
  }
  function analyzeDependencies() {
    const byPackage = new Map()
    for (const n of nodes.values()) {
      if (n.type !== 'plugin') continue
      const pkg = packageNameOf(n.name)
      if (pkg && !byPackage.has(pkg)) byPackage.set(pkg, n)
    }
    const out = []
    for (const n of nodes.values()) {
      if (n.type !== 'plugin') continue
      const { peer, deps, description } = readPackageDeps(n.name)
      // 补插件描述（来自 package.json 的 description），让详情框能显示「它是干嘛的」
      if (!n.description && description) n.description = description
      for (const dep of peer) {
        const target = byPackage.get(dep)
        if (target && target.id !== n.id) out.push({ source: n.id, target: target.id, kind: 'depends' })
      }
      // 只对「第三方全家桶」（非核心 @deepseek-ai/*）生成「包含」边；
      // 核心框架的内部依赖不算「全家桶」，避免 dsh-web-app 这类主程序包生成巨型气泡。
      if (n.name.indexOf('@deepseek-ai/') === 0) continue
      for (const dep of deps) {
        const target = byPackage.get(dep)
        if (target && target.id !== n.id) out.push({ source: n.id, target: target.id, kind: 'contains' })
      }
    }
    return out
  }

  // ---- 持久化 ----
  let dshHome = ''
  function resolveDshHome() {
    try { if (process.env && process.env.DSH_HOME) { dshHome = process.env.DSH_HOME; return } } catch (e) {}
    try { if (process.env && process.env.USERPROFILE) { dshHome = process.env.USERPROFILE + '/.dsh'; return } } catch (e) {}
    const sp = ctx.get('sandboxPolicy')
    if (sp && typeof sp.workspaceRoot === 'string' && sp.workspaceRoot) dshHome = sp.workspaceRoot
  }
  function jsonPath() { return dshHome ? dshHome + '/kg-knowledge-graph.json' : '' }
  function serialize() {
    const arr = []
    for (const n of nodes.values()) arr.push({ id: n.id, type: n.type, name: n.name, description: n.description, source: n.source, count: n.count, lastUsed: n.lastUsed, history: n.history || [] })
    return { totalUses, nodes: arr }
  }
  async function persist() {
    const path = jsonPath()
    if (!path) return
    try { writeFileSync(path, JSON.stringify(serialize())) } catch (e) { dlog('[kg] persist err ' + (e && e.message)) }
  }
  const timer = ctx.get('timer')
  let persistPending = false
  function schedulePersist() {
    if (!dshHome) return
    if (persistPending) return
    persistPending = true
    if (timer && typeof timer.timeout === 'function') { timer.timeout(function () { persistPending = false; persist() }, 2500) } else { persistPending = false; persist() }
  }
  async function loadPersisted() {
    const path = jsonPath()
    if (!path) return
    try {
      if (!existsSync(path)) return
      const text = readFileSync(path, 'utf8')
      if (!text) return
      const data = JSON.parse(text)
      if (data && typeof data.totalUses === 'number') totalUses = data.totalUses
      if (data && Array.isArray(data.nodes)) {
        for (const d of data.nodes) {
          if (d.type === 'plugin' && d.name && (d.name.indexOf('./') === 0 || d.name.indexOf('../') === 0)) continue
          const node = ensureNode(d.type, d.name, d.description, d.source)
          if (!node) continue
          if (typeof d.count === 'number') node.count = d.count
          if (d.lastUsed != null) node.lastUsed = d.lastUsed
          if (Array.isArray(d.history)) node.history = d.history
        }
      }
    } catch (e) { dlog('[kg] load err ' + (e && e.message)) }
  }

  // ---- 枚举 ----
  function enumeratePlugins() {
    let done = false
    const inv = ctx.get('pluginInventory')
    if (!done && inv && typeof inv.list === 'function') {
      try { const snap = inv.list(); const arr = snap && snap.entries; if (Array.isArray(arr)) { for (const e of arr) { const nm = s(e && e.moduleName); if (nm && nm.indexOf('cordis:') !== 0 && nm.indexOf('./') !== 0 && nm.indexOf('../') !== 0) { const node = ensureNode('plugin', nm, '', ''); if (node) { node.enabled = (e && typeof e.enabled === 'boolean') ? e.enabled : null; node.phase = (e && e.fiberPhase) ? s(e.fiberPhase) : null } } } done = true } } catch (e) { dlog('[kg] inventory err ' + (e && e.message)) }
    }
    const loader = ctx.get('loader')
    if (!done && loader && typeof loader.entries === 'function') {
      try { for (const entry of loader.entries()) { if (entry && entry.options && entry.options.group) continue; const nm = s(entry && entry.options && entry.options.name); if (nm && nm.indexOf('cordis:') !== 0 && nm.indexOf('./') !== 0 && nm.indexOf('../') !== 0) ensureNode('plugin', nm, '', '') } done = true } catch (e) { dlog('[kg] loader err ' + (e && e.message)) }
    }
    const typert = ctx.get('typert')
    if (!done && typert) {
      try { const pkgs = typert.listPackages(); if (Array.isArray(pkgs)) { for (const it of pkgs) { const name = s(first(it, ['package', 'packageName', 'name', 'id', 'key'])); if (!name) continue; ensureNode('plugin', name, s(first(it, ['description', 'desc', 'summary'])), '') } } } catch (e) { dlog('[kg] typert err ' + (e && e.message)) }
    }
  }
  function parseCompositionNames(text) {
    const out = new Set()
    const re = /name:\s*(['"]?)([^'"\n]+)\1/g
    let m
    while ((m = re.exec(text))) {
      const nm = (m[2] || '').trim()
      if (!nm) continue
      if (nm.indexOf('cordis:') === 0) continue
      if (nm.indexOf('./') === 0 || nm.indexOf('../') === 0) continue
      out.add(nm)
    }
    return out
  }
  async function enumeratePresetPlugins() {
    const presets = ctx.get('agentPresets')
    if (!presets || typeof presets.list !== 'function' || typeof presets.read !== 'function') return
    let plist = []
    try { plist = await presets.list() } catch (e) { dlog('[kg] presets list err ' + (e && e.message)) }
    if (!Array.isArray(plist)) return
    for (const p of plist) {
      const pid = s(p && p.id)
      if (!pid) continue
      let text = ''
      try { text = await presets.read(pid) } catch (e) { dlog('[kg] presets read ' + pid + ' err ' + (e && e.message)) }
      if (!text) continue
      for (const nm of parseCompositionNames(text)) { const pn = ensureNode('plugin', nm, '', 'preset:' + pid); if (pn) { pn.enabled = null; pn.phase = null } }
    }
  }
  async function enumerateSkills() {
    const skills = ctx.get('skills')
    if (!skills) { dlog('[kg] skills service MISSING'); return }
    try { const g = await skills.list(); if (Array.isArray(g)) for (const it of g) addSkill(it) } catch (e) { dlog('[kg] skills global err ' + (e && e.message)) }
    const presets = ctx.get('agentPresets')
    if (presets && typeof presets.list === 'function' && typeof presets.standingKeyFor === 'function') {
      let plist = []
      try { plist = await presets.list() } catch (e) {}
      if (Array.isArray(plist)) {
        for (const p of plist) {
          const pid = s(p && p.id)
          if (!pid) continue
          try { const key = await presets.standingKeyFor(pid); if (key === undefined || key === null) continue; const scoped = await skills.list({ scope: key }); if (Array.isArray(scoped)) for (const it of scoped) addSkill(it) } catch (e) { dlog('[kg] skills preset ' + pid + ' err ' + (e && e.message)) }
        }
      }
    }
    const agents = ctx.get('agents')
    if (agents && typeof agents.list === 'function') {
      let alist = []
      try { alist = agents.list() } catch (e) {}
      if (Array.isArray(alist)) {
        for (const agent of alist) {
          let cwd = ''
          try { cwd = s(agent && agent.session && agent.session.header && agent.session.header.cwd) } catch (e) {}
          try { const opts = cwd ? { scope: agent, cwd } : { scope: agent }; const scoped = await skills.list(opts); if (Array.isArray(scoped)) for (const it of scoped) addSkill(it) } catch (e) { dlog('[kg] skills agent err ' + (e && e.message)) }
        }
      }
    }
  }
  async function enumerateTools() {
    const tools = ctx.get('tools')
    if (!tools) return
    try { const g = tools.schemas(); if (Array.isArray(g)) for (const it of g) addTool(it) } catch (e) { dlog('[kg] tools global err ' + (e && e.message)) }
    const presets = ctx.get('agentPresets')
    if (presets && typeof presets.list === 'function' && typeof presets.standingKeyFor === 'function') {
      let plist = []
      try { plist = await presets.list() } catch (e) {}
      if (Array.isArray(plist)) {
        for (const p of plist) {
          const pid = s(p && p.id)
          if (!pid) continue
          try { const key = await presets.standingKeyFor(pid); if (key === undefined || key === null) continue; const scoped = tools.schemas(key); if (Array.isArray(scoped)) for (const it of scoped) addTool(it) } catch (e) { dlog('[kg] tools preset ' + pid + ' err ' + (e && e.message)) }
        }
      }
    }
    const agents = ctx.get('agents')
    if (agents && typeof agents.list === 'function') {
      let alist = []
      try { alist = agents.list() } catch (e) {}
      if (Array.isArray(alist)) {
        for (const agent of alist) {
          try { const scoped = tools.schemas(agent); if (Array.isArray(scoped)) for (const it of scoped) addTool(it) } catch (e) { dlog('[kg] tools agent err ' + (e && e.message)) }
        }
      }
    }
  }
  async function refresh() {
    enumeratePlugins()
    await enumeratePresetPlugins()
    await enumerateSkills()
    await enumerateTools()
    ensureCatalogPlugins()
    depEdgesCache = analyzeDependencies()
    dlog('[kg] refresh done: plugins=' + countOf('plugin') + ' skills=' + countOf('skill') + ' tools=' + countOf('tool') + ' depEdges=' + depEdgesCache.length)
  }
  function countOf(type) { let c = 0; for (const n of nodes.values()) if (n.type === type) c++; return c }

  // ---- 事件 ----
  ctx.on('agent/inbox/claimed', function (payload) {
    try { const agent = payload && payload.agent; const sid = s(agent && first(agent, ['id', 'sessionId'])); const turn = payload && payload.turn; if (sid && turn != null) currentTurn.set(sid, turn) } catch (e) { dlog('[kg] turn err ' + (e && e.message)) }
  })
  function onToolResult(exec) {
    try {
      let name = s(first(exec, ['name', 'toolName', 'tool']))
      if (!name) { const def = exec && exec.definition; name = s(first(def, ['name'])) }
      if (!name) return
      const agent = exec && exec.agent
      const sid = s(agent && first(agent, ['id', 'sessionId']))
      const turn = sid ? (currentTurn.get(sid) || 0) : 0
      const info = { sid, turn }
      touch(ensureNode('tool', name, '', ''), info)
      const frag = pluginForTool(name)
      if (frag) { const p = findPlugin(frag); if (p) touch(p, info) }
      if (name === 'skill' || name === 'load-skill' || name === 'load_skill') { const input = first(exec, ['input', 'args', 'arguments', 'params']); const skillName = s(typeof input === 'object' && input ? first(input, ['name', 'skill']) : input); if (skillName) touch(ensureNode('skill', skillName, '', ''), info) }
      schedulePersist()
    } catch (e) { dlog('[kg] result err ' + (e && e.message)) }
  }
  ctx.on('tools/result', onToolResult)
  let refreshQueued = false
  function queueRefresh() {
    if (refreshQueued) return
    refreshQueued = true
    const t = ctx.get('timer')
    if (t && typeof t.timeout === 'function') { t.timeout(function () { refreshQueued = false; refresh() }, 2000) }
    else { refreshQueued = false; refresh() }
  }
  ctx.on('tools/change', queueRefresh)
  ctx.on('skills/change', queueRefresh)

  function buildModel() {
    const list = []
    const counts = { plugin: 0, skill: 0, tool: 0, edge: 0, uses: totalUses }
    for (const n of nodes.values()) { list.push({ id: n.id, type: n.type, name: n.name, description: n.description, source: n.source, count: n.count, lastUsed: n.lastUsed, history: n.history || [], enabled: n.enabled, phase: n.phase }); counts[n.type] = (counts[n.type] || 0) + 1 }
    const edges = []
    for (const n of nodes.values()) {
      if (n.type !== 'tool') continue
      const frag = pluginForTool(n.name)
      if (!frag) continue
      const p = findPlugin(frag)
      if (!p) continue
      edges.push({ source: p.id, target: n.id, kind: 'provides' })
    }
    // 技能 ← skill 工具（调用关系）：把孤立的技能节点接进图谱
    let skillTool = null
    for (const n of nodes.values()) { if (n.type === 'tool' && (n.name === 'skill' || n.name === 'skill_load' || n.name === 'load_skill')) { skillTool = n; break } }
    if (skillTool) {
      for (const n of nodes.values()) { if (n.type === 'skill') edges.push({ source: skillTool.id, target: n.id, kind: 'calls' }) }
    }
    // 插件依赖边（缓存自 refresh）
    for (const e of depEdgesCache) edges.push(e)
    counts.edge = edges.length
    return { nodes: list, edges, counts }
  }

  // ---- 每轮思考过程：从 session 事件日志重建「思考→工具→回复」序列 ----
  function truncate(t, n) {
    if (t === null || t === undefined) return ''
    const str = String(t)
    return str.length > n ? str.slice(0, n) + '…' : str
  }
  function messageText(msg) {
    if (!msg || !Array.isArray(msg.content)) return ''
    let out = ''
    for (const b of msg.content) {
      if (b && (b.type === 'text' || b.type === 'reasoning') && b.text) out += b.text
    }
    return out
  }
  function toolResultText(msg) {
    if (!msg || !Array.isArray(msg.content)) return ''
    const block = msg.content[0]
    if (!block || !Array.isArray(block.content)) return ''
    let out = ''
    for (const b of block.content) {
      if (b && (b.type === 'text' || b.type === 'reasoning') && b.text) out += b.text
    }
    return out
  }
  function buildTurnsFromSessions(slist) {
    const all = []
    for (const session of slist) {
      let sid = ''
      try { sid = s(session && session.id) } catch (e) {}
      const events = (session && Array.isArray(session.events)) ? session.events : []
      const turns = new Map()
      let pendingPrompt = ''
      function ensureTurn(turn) {
        let t = turns.get(turn)
        if (!t) {
          t = { session: sid, turn: turn, prompt: pendingPrompt || '', items: [], toolByCallId: new Map() }
          turns.set(turn, t)
          pendingPrompt = ''
        }
        return t
      }
      for (const ev of events) {
        const type = ev && ev.type
        const data = ev && ev.data
        if (type === 'user/message') {
          if (data && data.source && data.source.kind === 'user') {
            const txt = messageText(data)
            if (txt) pendingPrompt = txt
          }
          continue
        }
        if (type === 'turn/start') {
          const turn = data && data.turn
          if (turn !== undefined && turn !== null) ensureTurn(turn)
          continue
        }
        if (type === 'assistant/message') {
          const turn = data && data.turn
          if (turn === undefined || turn === null) continue
          const step = data && data.step
          const t = ensureTurn(turn)
          const blocks = (data && data.message && Array.isArray(data.message.content)) ? data.message.content : []
          for (const b of blocks) {
            if (!b) continue
            if (b.type === 'reasoning') {
              if (b.text) t.items.push({ kind: 'thinking', step: step, text: truncate(s(b.text), 12000) })
            } else if (b.type === 'text') {
              if (b.text) t.items.push({ kind: 'reply', step: step, text: truncate(s(b.text), 12000) })
            } else if (b.type === 'tool-call') {
              const item = { kind: 'tool', step: step, name: s(b.name), callId: s(b.id), args: truncate(s(b.arguments), 500), result: '' }
              t.items.push(item)
              if (item.callId) t.toolByCallId.set(item.callId, item)
            }
          }
          continue
        }
        if (type === 'tool/result') {
          const turn = data && data.turn
          const t = (turn === undefined || turn === null) ? null : turns.get(turn)
          if (!t) continue
          const msg = data && data.message
          let callId = ''
          if (msg && msg.source && msg.source.callId) callId = s(msg.source.callId)
          if (!callId && msg && Array.isArray(msg.content) && msg.content[0]) callId = s(msg.content[0].toolCallId)
          if (callId && t.toolByCallId.has(callId)) {
            const item = t.toolByCallId.get(callId)
            item.result = truncate(toolResultText(msg), 2000)
          }
          continue
        }
      }
      for (const t of turns.values()) {
        all.push({ session: t.session, turn: t.turn, prompt: t.prompt, items: t.items })
      }
    }
    return all
  }
  let turnsCache = []
  let turnsCacheSig = ''
  function mainSessionId(slist) {
    let best = ''
    let bestScore = -1
    for (const session of slist) {
      const id = s(session && session.id)
      let human = 0
      const events = (session && Array.isArray(session.events)) ? session.events : []
      for (const ev of events) {
        if (ev && ev.type === 'user/message' && ev.data && ev.data.source && ev.data.source.kind === 'user') human++
      }
      if (human > bestScore) { bestScore = human; best = id }
    }
    return best
  }
  function collectTurns() {
    const sessions = ctx.get('sessions')
    if (!sessions || typeof sessions.list !== 'function') return []
    let slist = []
    try { slist = sessions.list() } catch (e) {}
    if (!Array.isArray(slist)) return []
    let sig = ''
    for (const session of slist) {
      const id = s(session && session.id)
      const seq = (session && typeof session.seq === 'number') ? session.seq : 0
      sig += id + ':' + seq + ';'
    }
    if (sig === turnsCacheSig) return turnsCache
    turnsCacheSig = sig
    const all = buildTurnsFromSessions(slist)
    const mainId = mainSessionId(slist)
    // 只保留「主会话」（与用户对话的那个）的轮次，避免子代理会话混进来
    turnsCache = all.filter(function (t) { return t.session === mainId })
    turnsCache.sort(function (a, b) { return a.turn - b.turn })
    return turnsCache
  }
  function turnSummary(t) {
    let toolCount = 0
    let thinkCount = 0
    let reply = ''
    const tools = []
    for (const it of t.items) {
      if (it.kind === 'tool') { toolCount++; if (it.name && tools.indexOf(it.name) < 0) tools.push(it.name) }
      else if (it.kind === 'thinking') thinkCount++
      else if (it.kind === 'reply' && !reply) reply = it.text
    }
    return { session: t.session, turn: t.turn, prompt: truncate(t.prompt, 60), toolCount: toolCount, thinkCount: thinkCount, tools: tools, replyPreview: truncate(reply, 60) }
  }
  function queryOf(req) {
    const out = {}
    try {
      const u = (req && req.url) || ''
      const qi = u.indexOf('?')
      if (qi < 0) return out
      const qs = u.slice(qi + 1)
      for (const part of qs.split('&')) {
        const ei = part.indexOf('=')
        if (ei < 0) continue
        out[decodeURIComponent(part.slice(0, ei))] = decodeURIComponent(part.slice(ei + 1))
      }
    } catch (e) {}
    return out
  }

  // ---- HTTP 接口（webServer 已注入）----
  ctx.effect(function () {
    return ctx.webServer.register({ kind: 'exact', path: '/kg-api/get-model', handler: function (req, res) { res.statusCode = 200; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(buildModel())) } })
  }, 'kg: get-model')
  ctx.effect(function () {
    return ctx.webServer.register({ kind: 'exact', path: '/kg-api/refresh', handler: async function (req, res) { await refresh(); await persist(); res.statusCode = 200; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ ok: true })) } })
  }, 'kg: refresh')
  ctx.effect(function () {
    return ctx.webServer.register({ kind: 'exact', path: '/kg-api/get-turns', handler: function (req, res) {
      const turns = collectTurns()
      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ turns: turns.map(turnSummary) }))
    } })
  }, 'kg: get-turns')
  ctx.effect(function () {
    return ctx.webServer.register({ kind: 'exact', path: '/kg-api/get-turn', handler: function (req, res) {
      const q = queryOf(req)
      const turn = parseInt(q.turn, 10)
      const turns = collectTurns()
      let found = null
      for (const t of turns) {
        if (t.turn !== turn) continue
        if (q.session && t.session !== q.session) continue
        found = t
        break
      }
      if (!found) { res.statusCode = 404; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ error: 'not found' })); return }
      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ turn: { session: found.session, turn: found.turn, prompt: found.prompt, items: found.items.map(function (it) { return { kind: it.kind, step: it.step, name: it.name, callId: it.callId, args: it.args, result: it.result, text: it.text } }) } }))
    } })
  }, 'kg: get-turn')
  dlog('[kg] routes registered')

  resolveDshHome()
  ;(async function init() { await loadPersisted(); await refresh(); dlog('[kg] init done') })()
}
