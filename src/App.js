import { useState, useEffect, useRef } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const today = () => new Date().toISOString().split("T")[0];

const CATEGORIES = ["All", "Personal", "Study", "Work"];
const PRIORITIES = ["High", "Medium", "Low"];

const CAT_COLORS = {
  Personal: { bg: "#fce7f3", text: "#9d174d", dot: "#ec4899" },
  Study:    { bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6" },
  Work:     { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
};
const PRI_COLORS = {
  High:   { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
  Medium: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  Low:    { bg: "#dcfce7", text: "#166534", dot: "#22c55e" },
};

const DEFAULTS = [
  { id: uid(), text: "Read DSA chapter 3", category: "Study", priority: "High", due: today(), done: false, order: 0 },
  { id: uid(), text: "Push code to GitHub", category: "Work", priority: "Medium", due: "", done: true, order: 1 },
  { id: uid(), text: "Call mom", category: "Personal", priority: "Low", due: "", done: false, order: 2 },
];

// ── confetti ──────────────────────────────────────────────────────────────────
function Confetti({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: 8 + Math.random() * 8,
      h: 4 + Math.random() * 6,
      color: ["#6366f1","#ec4899","#f59e0b","#22c55e","#3b82f6","#8b5cf6"][Math.floor(Math.random()*6)],
      vx: (Math.random()-0.5)*4,
      vy: 3 + Math.random()*5,
      angle: Math.random()*360,
      va: (Math.random()-0.5)*8,
    }));
    let frame;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      let done = true;
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.angle += p.va;
        if (p.y < canvas.height + 20) done = false;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI)/180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      });
      if (done) { onDone(); return; }
      frame = requestAnimationFrame(draw);
    };
    draw();
    const t = setTimeout(onDone, 3000);
    return () => { cancelAnimationFrame(frame); clearTimeout(t); };
  }, [active]);
  if (!active) return null;
  return <canvas ref={ref} style={{ position:"fixed", top:0, left:0, pointerEvents:"none", zIndex:9999 }} />;
}

// ── main ──────────────────────────────────────────────────────────────────────
export default function TodoApp() {
  const [dark, setDark] = useState(() => localStorage.getItem("todo-dark") === "true");
  const [todos, setTodos] = useState(() => {
    try { return JSON.parse(localStorage.getItem("todo-items")) || DEFAULTS; }
    catch { return DEFAULTS; }
  });
  const [input, setInput]     = useState("");
  const [cat, setCat]         = useState("Study");
  const [pri, setPri]         = useState("Medium");
  const [due, setDue]         = useState("");
  const [filter, setFilter]   = useState("All");
  const [priFilter, setPriFilter] = useState("All");
  const [search, setSearch]   = useState("");
  const [editId, setEditId]   = useState(null);
  const [editText, setEditText] = useState("");
  const [confetti, setConfetti] = useState(false);
  const [dragId, setDragId]   = useState(null);
  const [dragOver, setDragOver] = useState(null);

  // persist
  useEffect(() => { localStorage.setItem("todo-items", JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem("todo-dark", dark); }, [dark]);

  const save = (fn) => setTodos(fn);

  const addTodo = () => {
    const t = input.trim();
    if (!t) return;
    save(prev => [{ id: uid(), text: t, category: cat, priority: pri, due, done: false, order: prev.length }, ...prev]);
    setInput(""); setDue("");
  };

  const toggle = (id) => {
    let justCompleted = false;
    save(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (!t.done) justCompleted = true;
      return { ...t, done: !t.done };
    }));
    if (justCompleted) setConfetti(true);
  };

  const remove = (id) => save(prev => prev.filter(t => t.id !== id));

  const startEdit = (t) => { setEditId(t.id); setEditText(t.text); };
  const saveEdit = (id) => {
    if (!editText.trim()) return;
    save(prev => prev.map(t => t.id === id ? { ...t, text: editText.trim() } : t));
    setEditId(null);
  };

  // drag & drop
  const onDragStart = (id) => setDragId(id);
  const onDragOver  = (e, id) => { e.preventDefault(); setDragOver(id); };
  const onDrop      = (targetId) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOver(null); return; }
    save(prev => {
      const arr = [...prev];
      const from = arr.findIndex(t => t.id === dragId);
      const to   = arr.findIndex(t => t.id === targetId);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr.map((t, i) => ({ ...t, order: i }));
    });
    setDragId(null); setDragOver(null);
  };

  // filtered list
  const visible = todos.filter(t => {
    if (filter !== "All" && t.category !== filter) return false;
    if (priFilter !== "All" && t.priority !== priFilter) return false;
    if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const done  = todos.filter(t => t.done).length;
  const total = todos.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;
  const overdue = todos.filter(t => !t.done && t.due && t.due < today()).length;

  // theme vars
  const theme = {
    "--bg":    dark ? "#0f0f13" : "#f4f3ff",
    "--card":  dark ? "#1a1a24" : "#ffffff",
    "--text":  dark ? "#e8e6f0" : "#1a1a2e",
    "--muted": dark ? "#6b6880" : "#9ca3af",
    "--border":dark ? "#2d2b3d" : "#e5e3f0",
    "--input": dark ? "#12121a" : "#f9f8ff",
    "--accent":"#6366f1",
  };

  const s = styles(dark);

  return (
    <div style={{ ...s.page, ...theme }}>
      <Confetti active={confetti} onDone={() => setConfetti(false)} />

      {/* background blobs */}
      <div style={s.blob1} /><div style={s.blob2} />

      <div style={s.card}>

        {/* ── header ── */}
        <div style={s.header}>
          <div>
            <div style={s.title}>My Tasks ✦</div>
            <div style={s.subtitle}>{done}/{total} done
              {overdue > 0 && <span style={s.overdueBadge}> · {overdue} overdue</span>}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* progress ring */}
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke={dark?"#2d2b3d":"#e5e3f0"} strokeWidth="4"/>
              <circle cx="24" cy="24" r="20" fill="none" stroke="#6366f1" strokeWidth="4"
                strokeDasharray={`${2*Math.PI*20}`}
                strokeDashoffset={`${2*Math.PI*20*(1-pct/100)}`}
                strokeLinecap="round" transform="rotate(-90 24 24)"
                style={{ transition:"stroke-dashoffset 0.5s ease" }}/>
              <text x="24" y="28" textAnchor="middle" fontSize="10" fontWeight="700" fill="#6366f1">{pct}%</text>
            </svg>
            {/* dark mode toggle */}
            <button style={s.darkBtn} onClick={() => setDark(d => !d)} title="Toggle dark mode">
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* ── stats bar ── */}
        <div style={s.statsBar}>
          {[
            { label:"Total", val: total, color:"#6366f1" },
            { label:"Done",  val: done,  color:"#22c55e" },
            { label:"Left",  val: total-done, color:"#f59e0b" },
            { label:"Overdue", val: overdue, color:"#ef4444" },
          ].map(({ label, val, color }) => (
            <div key={label} style={s.statBox}>
              <div style={{ ...s.statNum, color }}>{val}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── search ── */}
        <div style={s.searchRow}>
          <span style={s.searchIcon}>🔍</span>
          <input style={s.searchInput} placeholder="Search tasks..."
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button style={s.clearSearch} onClick={() => setSearch("")}>✕</button>}
        </div>

        {/* ── add task ── */}
        <div style={s.addBox}>
          <input style={s.input} placeholder="Add a new task..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()} />
          <div style={s.addRow2}>
            <select style={s.sel} value={cat} onChange={e => setCat(e.target.value)}>
              {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select>
            <select style={s.sel} value={pri} onChange={e => setPri(e.target.value)}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
            <input type="date" style={s.sel} value={due} onChange={e => setDue(e.target.value)} />
            <button style={s.addBtn} onClick={addTodo}>+ Add</button>
          </div>
        </div>

        {/* ── filters ── */}
        <div style={s.filterSection}>
          <div style={s.filterRow}>
            {CATEGORIES.map(c => (
              <button key={c} style={{ ...s.chip, ...(filter===c ? s.chipActive : {}) }}
                onClick={() => setFilter(c)}>{c}</button>
            ))}
          </div>
          <div style={s.filterRow}>
            {["All","High","Medium","Low"].map(p => (
              <button key={p} style={{ ...s.chip, ...(priFilter===p ? s.chipActive : {}),
                fontSize:11, padding:"3px 10px" }}
                onClick={() => setPriFilter(p)}>{p}</button>
            ))}
          </div>
        </div>

        {/* ── task list ── */}
        <div style={s.list}>
          {visible.length === 0 && (
            <div style={s.empty}>
              {search ? `No tasks matching "${search}"` : "No tasks here — add one above! 🎉"}
            </div>
          )}
          {visible.map(todo => {
            const cc = CAT_COLORS[todo.category];
            const pc = PRI_COLORS[todo.priority];
            const isOverdue = !todo.done && todo.due && todo.due < today();
            const isDragTarget = dragOver === todo.id;
            return (
              <div key={todo.id}
                draggable
                onDragStart={() => onDragStart(todo.id)}
                onDragOver={e => onDragOver(e, todo.id)}
                onDrop={() => onDrop(todo.id)}
                onDragEnd={() => { setDragId(null); setDragOver(null); }}
                style={{
                  ...s.row,
                  ...(todo.done ? s.rowDone : {}),
                  ...(isDragTarget ? s.rowDragOver : {}),
                  opacity: dragId === todo.id ? 0.4 : 1,
                }}>

                {/* drag handle */}
                <span style={s.dragHandle}>⠿</span>

                {/* checkbox */}
                <div style={{ ...s.checkbox, ...(todo.done ? s.checkDone : {}) }}
                  onClick={() => toggle(todo.id)}>
                  {todo.done && <span style={{ color:"#fff", fontSize:10, lineHeight:1 }}>✓</span>}
                </div>

                {/* text / edit */}
                <div style={{ flex:1, minWidth:0 }}>
                  {editId === todo.id ? (
                    <input autoFocus style={s.editInput}
                      value={editText} onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => { if(e.key==="Enter") saveEdit(todo.id); if(e.key==="Escape") setEditId(null); }}
                      onBlur={() => saveEdit(todo.id)} />
                  ) : (
                    <span style={{ ...s.taskText, ...(todo.done ? s.taskDone : {}) }}
                      onDoubleClick={() => startEdit(todo)}>{todo.text}</span>
                  )}
                  <div style={s.metaRow}>
                    {todo.due && (
                      <span style={{ ...s.duePill, ...(isOverdue ? s.dueOverdue : {}) }}>
                        📅 {todo.due}
                      </span>
                    )}
                  </div>
                </div>

                {/* badges */}
                <span style={{ ...s.badge, background: pc.bg, color: pc.text }}>
                  <span style={{ ...s.dot, background: pc.dot }} />{todo.priority}
                </span>
                <span style={{ ...s.badge, background: cc.bg, color: cc.text }}>
                  <span style={{ ...s.dot, background: cc.dot }} />{todo.category}
                </span>

                {/* actions */}
                <button style={s.iconBtn} title="Edit" onClick={() => startEdit(todo)}>✏️</button>
                <button style={s.iconBtn} title="Delete" onClick={() => remove(todo.id)}>🗑</button>
              </div>
            );
          })}
        </div>

        {/* ── footer ── */}
        {todos.some(t => t.done) && (
          <button style={s.clearBtn}
            onClick={() => save(prev => prev.filter(t => !t.done))}>
            Clear completed ({todos.filter(t=>t.done).length})
          </button>
        )}
        <div style={s.hint}>💡 Drag to reorder · Double-click to edit · ✓ to complete</div>
      </div>
    </div>
  );
}

// ── styles factory ────────────────────────────────────────────────────────────
const styles = (dark) => ({
  page: {
    minHeight:"100vh", display:"flex", alignItems:"flex-start", justifyContent:"center",
    fontFamily:"'Segoe UI',system-ui,sans-serif", padding:"32px 16px",
    position:"relative", overflow:"hidden", background:"var(--bg)",
    transition:"background 0.3s",
  },
  blob1: { position:"fixed", top:"-100px", left:"-100px", width:"400px", height:"400px",
    borderRadius:"50%", background: dark ? "radial-gradient(circle,#3730a322 0%,transparent 70%)"
      : "radial-gradient(circle,#c7d2fe55 0%,transparent 70%)", pointerEvents:"none" },
  blob2: { position:"fixed", bottom:"-80px", right:"-80px", width:"350px", height:"350px",
    borderRadius:"50%", background: dark ? "radial-gradient(circle,#06402222 0%,transparent 70%)"
      : "radial-gradient(circle,#bbf7d044 0%,transparent 70%)", pointerEvents:"none" },
  card: {
    background:"var(--card)", borderRadius:24,
    boxShadow: dark ? "0 8px 48px rgba(0,0,0,0.5)" : "0 8px 40px rgba(99,102,241,0.10)",
    padding:28, width:"100%", maxWidth:560, position:"relative", zIndex:1,
    transition:"background 0.3s, box-shadow 0.3s",
  },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 },
  title:  { fontSize:22, fontWeight:700, color:"var(--text)", letterSpacing:"-0.5px" },
  subtitle: { fontSize:13, color:"var(--muted)", marginTop:2 },
  overdueBadge: { color:"#ef4444", fontWeight:600 },
  darkBtn: { background:"var(--input)", border:"1.5px solid var(--border)", borderRadius:10,
    width:38, height:38, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center",
    justifyContent:"center" },

  statsBar: { display:"flex", gap:8, marginBottom:16 },
  statBox:  { flex:1, background:"var(--input)", borderRadius:12, padding:"10px 8px",
    textAlign:"center", border:"1px solid var(--border)" },
  statNum:  { fontSize:20, fontWeight:700, lineHeight:1 },
  statLabel:{ fontSize:11, color:"var(--muted)", marginTop:3 },

  searchRow: { display:"flex", alignItems:"center", gap:8, background:"var(--input)",
    border:"1.5px solid var(--border)", borderRadius:12, padding:"8px 12px", marginBottom:12 },
  searchIcon: { fontSize:14 },
  searchInput: { flex:1, background:"transparent", border:"none", outline:"none",
    fontSize:14, color:"var(--text)" },
  clearSearch: { background:"transparent", border:"none", color:"var(--muted)",
    cursor:"pointer", fontSize:13 },

  addBox: { background:"var(--input)", border:"1.5px solid var(--border)", borderRadius:14,
    padding:14, marginBottom:14 },
  input: { width:"100%", background:"transparent", border:"none", outline:"none",
    fontSize:15, color:"var(--text)", marginBottom:10, boxSizing:"border-box" },
  addRow2: { display:"flex", gap:8, flexWrap:"wrap" },
  sel: { padding:"7px 10px", border:"1.5px solid var(--border)", borderRadius:9,
    fontSize:13, color:"var(--text)", background:"var(--card)", cursor:"pointer", outline:"none",
    flex:1, minWidth:80 },
  addBtn: { background:"#6366f1", color:"#fff", border:"none", borderRadius:9,
    padding:"7px 18px", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" },

  filterSection: { marginBottom:14, display:"flex", flexDirection:"column", gap:6 },
  filterRow: { display:"flex", gap:6, flexWrap:"wrap" },
  chip: { padding:"5px 14px", borderRadius:20, border:"1.5px solid var(--border)",
    background:"transparent", fontSize:13, color:"var(--muted)", cursor:"pointer",
    transition:"all 0.15s" },
  chipActive: { background:"#6366f1", color:"#fff", borderColor:"#6366f1", fontWeight:600 },

  list: { display:"flex", flexDirection:"column", gap:8, maxHeight:420, overflowY:"auto" },
  empty: { textAlign:"center", color:"var(--muted)", fontSize:14, padding:"32px 0" },

  row: { display:"flex", alignItems:"center", gap:8, padding:"11px 12px", borderRadius:13,
    border:"1.5px solid var(--border)", background:"var(--input)", cursor:"grab",
    transition:"border-color 0.15s, box-shadow 0.15s" },
  rowDone: { opacity:0.55 },
  rowDragOver: { borderColor:"#6366f1", boxShadow:"0 0 0 2px #6366f133" },

  dragHandle: { color:"var(--muted)", fontSize:14, cursor:"grab", userSelect:"none",
    flexShrink:0 },
  checkbox: { width:20, height:20, borderRadius:6, border:"2px solid var(--border)",
    flexShrink:0, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
    transition:"all 0.15s" },
  checkDone: { background:"#6366f1", borderColor:"#6366f1" },
  taskText: { fontSize:14, color:"var(--text)", wordBreak:"break-word" },
  taskDone: { textDecoration:"line-through", color:"var(--muted)" },
  metaRow:  { display:"flex", gap:6, marginTop:3, flexWrap:"wrap" },
  duePill:  { fontSize:11, color:"var(--muted)", background:"var(--card)",
    border:"1px solid var(--border)", borderRadius:6, padding:"1px 6px" },
  dueOverdue: { color:"#ef4444", borderColor:"#fecaca", background:"#fee2e2" },

  editInput: { width:"100%", background:"var(--card)", border:"1.5px solid #6366f1",
    borderRadius:7, padding:"4px 8px", fontSize:14, color:"var(--text)", outline:"none",
    boxSizing:"border-box" },

  badge: { fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:20,
    display:"flex", alignItems:"center", gap:4, flexShrink:0, whiteSpace:"nowrap" },
  dot:   { width:6, height:6, borderRadius:"50%", flexShrink:0 },

  iconBtn: { background:"transparent", border:"none", cursor:"pointer", fontSize:14,
    padding:"3px 4px", borderRadius:6, flexShrink:0, opacity:0.6 },

  clearBtn: { marginTop:14, width:"100%", background:"transparent",
    border:"1.5px dashed var(--border)", borderRadius:10, padding:9,
    fontSize:13, color:"var(--muted)", cursor:"pointer" },
  hint: { textAlign:"center", fontSize:11, color:"var(--muted)", marginTop:10, opacity:0.7 },
});
