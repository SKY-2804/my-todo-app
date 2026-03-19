import { useState, useEffect, useRef, useCallback } from "react";

// ── helpers ───────────────────────────────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const todayStr = () => new Date().toISOString().split("T")[0];

const CATEGORIES = ["All", "Personal", "Study", "Work"];
const PRIORITIES  = ["High", "Medium", "Low"];

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
  { id: "a1", text: "Read DSA chapter 3",   category: "Study",    priority: "High",   due: todayStr(), done: false, order: 0 },
  { id: "a2", text: "Push code to GitHub",  category: "Work",     priority: "Medium", due: "",         done: true,  order: 1 },
  { id: "a3", text: "Call mom",             category: "Personal", priority: "Low",    due: "",         done: false, order: 2 },
];

// ── Confetti ──────────────────────────────────────────────────────────────────
function Confetti({ active, onDone }) {
  const ref = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#6366f1","#ec4899","#f59e0b","#22c55e","#3b82f6","#8b5cf6"];
    const pieces = Array.from({ length: 120 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * -canvas.height,
      w:     8  + Math.random() * 8,
      h:     4  + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx:    (Math.random() - 0.5) * 4,
      vy:    3  + Math.random() * 5,
      angle: Math.random() * 360,
      va:    (Math.random() - 0.5) * 8,
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let allDone = true;
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.angle += p.va;
        if (p.y < canvas.height + 20) allDone = false;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (allDone) { doneRef.current(); return; }
      frame = requestAnimationFrame(draw);
    };
    draw();
    const t = setTimeout(() => doneRef.current(), 3500);
    return () => { cancelAnimationFrame(frame); clearTimeout(t); };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9999 }}
    />
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function TodoApp() {
  const [dark, setDark] = useState(() => localStorage.getItem("todo-dark") === "true");

  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem("todo-items");
      return saved ? JSON.parse(saved) : DEFAULTS;
    } catch (e) {
      return DEFAULTS;
    }
  });

  const [input,     setInput]     = useState("");
  const [cat,       setCat]       = useState("Study");
  const [pri,       setPri]       = useState("Medium");
  const [due,       setDue]       = useState("");
  const [filter,    setFilter]    = useState("All");
  const [priFilter, setPriFilter] = useState("All");
  const [search,    setSearch]    = useState("");
  const [editId,    setEditId]    = useState(null);
  const [editText,  setEditText]  = useState("");
  const [confetti,  setConfetti]  = useState(false);
  const [dragId,    setDragId]    = useState(null);
  const [dragOver,  setDragOver]  = useState(null);

  // ── persist ────────────────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("todo-items", JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem("todo-dark",  String(dark)); },         [dark]);

  // ── actions ────────────────────────────────────────────────────────────────
  const addTodo = useCallback(() => {
    const t = input.trim();
    if (!t) return;
    setTodos(prev => [
      { id: uid(), text: t, category: cat, priority: pri, due, done: false, order: prev.length },
      ...prev,
    ]);
    setInput(""); setDue("");
  }, [input, cat, pri, due]);

  const toggleTodo = useCallback((id) => {
    let justDone = false;
    setTodos(prev => prev.map(todo => {
      if (todo.id !== id) return todo;
      if (!todo.done) justDone = true;
      return { ...todo, done: !todo.done };
    }));
    if (justDone) setConfetti(true);
  }, []);

  const removeTodo = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const startEdit = useCallback((todo) => {
    setEditId(todo.id);
    setEditText(todo.text);
  }, []);

  const saveEdit = useCallback((id) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: trimmed } : t));
    setEditId(null);
  }, [editText]);

  // ── drag & drop ────────────────────────────────────────────────────────────
  const onDragStart = (id) => setDragId(id);
  const onDragOver  = (e, id) => { e.preventDefault(); setDragOver(id); };
  const onDrop      = (targetId) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOver(null); return; }
    setTodos(prev => {
      const arr  = [...prev];
      const from = arr.findIndex(t => t.id === dragId);
      const to   = arr.findIndex(t => t.id === targetId);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr.map((t, i) => ({ ...t, order: i }));
    });
    setDragId(null); setDragOver(null);
  };

  // ── filtered list ──────────────────────────────────────────────────────────
  const visible = todos.filter(t => {
    if (filter    !== "All" && t.category !== filter)   return false;
    if (priFilter !== "All" && t.priority !== priFilter) return false;
    if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const doneCnt   = todos.filter(t => t.done).length;
  const total     = todos.length;
  const pct       = total ? Math.round((doneCnt / total) * 100) : 0;
  const overdueCnt = todos.filter(t => !t.done && t.due && t.due < todayStr()).length;

  // ── styles ─────────────────────────────────────────────────────────────────
  const c = {
    bg:     dark ? "#0f0f13" : "#f0f0ff",
    card:   dark ? "#1a1a24" : "#ffffff",
    text:   dark ? "#e8e6f0" : "#1a1a2e",
    muted:  dark ? "#6b6880" : "#9ca3af",
    border: dark ? "#2d2b3d" : "#e5e3f0",
    input:  dark ? "#12121a" : "#f9f8ff",
  };

  const base = {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: c.text,
    transition: "background 0.3s, color 0.3s",
  };

  return (
    <div style={{
      ...base,
      minHeight: "100vh",
      background: c.bg,
      display: "flex",
      justifyContent: "center",
      padding: "32px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* bg blobs */}
      <div style={{ position:"fixed", top:"-100px", left:"-100px", width:"400px", height:"400px",
        borderRadius:"50%", background: dark ? "radial-gradient(circle,#3730a322,transparent 70%)"
        : "radial-gradient(circle,#c7d2fe44,transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-80px", right:"-80px", width:"350px", height:"350px",
        borderRadius:"50%", background: dark ? "radial-gradient(circle,#06402222,transparent 70%)"
        : "radial-gradient(circle,#bbf7d033,transparent 70%)", pointerEvents:"none" }} />

      <Confetti active={confetti} onDone={() => setConfetti(false)} />

      <div style={{
        background: c.card,
        borderRadius: 24,
        boxShadow: dark ? "0 8px 48px rgba(0,0,0,0.5)" : "0 8px 40px rgba(99,102,241,0.12)",
        padding: 28,
        width: "100%",
        maxWidth: 560,
        height: "fit-content",
        position: "relative",
        zIndex: 1,
      }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.5px" }}>My Tasks ✦</div>
            <div style={{ fontSize:13, color:c.muted, marginTop:2 }}>
              {doneCnt}/{total} completed · saved locally 💾
              {overdueCnt > 0 && <span style={{ color:"#ef4444", fontWeight:600 }}> · {overdueCnt} overdue</span>}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* Progress ring */}
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke={c.border} strokeWidth="4" />
              <circle cx="24" cy="24" r="20" fill="none" stroke="#6366f1" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
                strokeLinecap="round" transform="rotate(-90 24 24)"
                style={{ transition:"stroke-dashoffset 0.5s ease" }} />
              <text x="24" y="28" textAnchor="middle" fontSize="10" fontWeight="700" fill="#6366f1">{pct}%</text>
            </svg>
            {/* Dark mode toggle */}
            <button onClick={() => setDark(d => !d)} style={{
              background: c.input, border:`1.5px solid ${c.border}`, borderRadius:10,
              width:38, height:38, cursor:"pointer", fontSize:18,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[
            { label:"Total",   val: total,            color:"#6366f1" },
            { label:"Done",    val: doneCnt,           color:"#22c55e" },
            { label:"Left",    val: total - doneCnt,   color:"#f59e0b" },
            { label:"Overdue", val: overdueCnt,        color:"#ef4444" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{
              flex:1, background:c.input, borderRadius:12,
              padding:"10px 8px", textAlign:"center", border:`1px solid ${c.border}`,
            }}>
              <div style={{ fontSize:20, fontWeight:700, color, lineHeight:1 }}>{val}</div>
              <div style={{ fontSize:11, color:c.muted, marginTop:3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background:c.input, border:`1.5px solid ${c.border}`,
          borderRadius:12, padding:"8px 12px", marginBottom:12,
        }}>
          <span style={{ fontSize:14 }}>🔍</span>
          <input
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex:1, background:"transparent", border:"none", outline:"none",
              fontSize:14, color:c.text }}
          />
          {search && (
            <button onClick={() => setSearch("")}
              style={{ background:"transparent", border:"none", color:c.muted, cursor:"pointer", fontSize:13 }}>
              ✕
            </button>
          )}
        </div>

        {/* ── Add task ── */}
        <div style={{
          background:c.input, border:`1.5px solid ${c.border}`,
          borderRadius:14, padding:14, marginBottom:14,
        }}>
          <input
            placeholder="Add a new task... (press Enter)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
            style={{ width:"100%", background:"transparent", border:"none", outline:"none",
              fontSize:15, color:c.text, marginBottom:10, boxSizing:"border-box" }}
          />
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[
              { val:cat, set:setCat, opts: CATEGORIES.filter(x => x !== "All") },
              { val:pri, set:setPri, opts: PRIORITIES },
            ].map((sel, i) => (
              <select key={i} value={sel.val} onChange={e => sel.set(e.target.value)} style={{
                padding:"7px 10px", border:`1.5px solid ${c.border}`, borderRadius:9,
                fontSize:13, color:c.text, background:c.card, cursor:"pointer",
                outline:"none", flex:1, minWidth:80,
              }}>
                {sel.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
            <input
              type="date"
              value={due}
              onChange={e => setDue(e.target.value)}
              style={{
                padding:"7px 10px", border:`1.5px solid ${c.border}`, borderRadius:9,
                fontSize:13, color:c.text, background:c.card, outline:"none", flex:1, minWidth:100,
              }}
            />
            <button onClick={addTodo} style={{
              background:"#6366f1", color:"#fff", border:"none", borderRadius:9,
              padding:"7px 18px", fontSize:13, fontWeight:600, cursor:"pointer",
            }}>
              + Add
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:14 }}>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {CATEGORIES.map(c2 => (
              <button key={c2} onClick={() => setFilter(c2)} style={{
                padding:"5px 14px", borderRadius:20,
                border:`1.5px solid ${filter === c2 ? "#6366f1" : c.border}`,
                background: filter === c2 ? "#6366f1" : "transparent",
                color: filter === c2 ? "#fff" : c.muted,
                fontSize:13, fontWeight: filter === c2 ? 600 : 400, cursor:"pointer",
              }}>{c2}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {["All", ...PRIORITIES].map(p => (
              <button key={p} onClick={() => setPriFilter(p)} style={{
                padding:"3px 10px", borderRadius:20,
                border:`1.5px solid ${priFilter === p ? "#6366f1" : c.border}`,
                background: priFilter === p ? "#6366f1" : "transparent",
                color: priFilter === p ? "#fff" : c.muted,
                fontSize:11, fontWeight: priFilter === p ? 600 : 400, cursor:"pointer",
              }}>{p}</button>
            ))}
          </div>
        </div>

        {/* ── Task list ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:400, overflowY:"auto" }}>
          {visible.length === 0 && (
            <div style={{ textAlign:"center", color:c.muted, fontSize:14, padding:"32px 0" }}>
              {search ? `No tasks matching "${search}"` : "No tasks here — add one above! 🎉"}
            </div>
          )}

          {visible.map(todo => {
            const cc = CAT_COLORS[todo.category];
            const pc = PRI_COLORS[todo.priority];
            const isOverdue = !todo.done && todo.due && todo.due < todayStr();
            const isDragTarget = dragOver === todo.id;

            return (
              <div
                key={todo.id}
                draggable
                onDragStart={() => onDragStart(todo.id)}
                onDragOver={e  => onDragOver(e, todo.id)}
                onDrop={()     => onDrop(todo.id)}
                onDragEnd={()  => { setDragId(null); setDragOver(null); }}
                style={{
                  display:"flex", alignItems:"center", gap:8,
                  padding:"11px 12px", borderRadius:13,
                  border:`1.5px solid ${isDragTarget ? "#6366f1" : c.border}`,
                  background: c.input,
                  boxShadow: isDragTarget ? "0 0 0 2px #6366f133" : "none",
                  opacity: dragId === todo.id ? 0.4 : (todo.done ? 0.6 : 1),
                  cursor:"grab", transition:"border-color 0.15s, opacity 0.15s",
                }}
              >
                {/* Drag handle */}
                <span style={{ color:c.muted, fontSize:14, cursor:"grab", userSelect:"none", flexShrink:0 }}>⠿</span>

                {/* Checkbox */}
                <div
                  onClick={() => toggleTodo(todo.id)}
                  style={{
                    width:20, height:20, borderRadius:6, flexShrink:0, cursor:"pointer",
                    border: todo.done ? "2px solid #6366f1" : `2px solid ${c.border}`,
                    background: todo.done ? "#6366f1" : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all 0.15s",
                  }}
                >
                  {todo.done && <span style={{ color:"#fff", fontSize:11, lineHeight:1 }}>✓</span>}
                </div>

                {/* Text / Edit */}
                <div style={{ flex:1, minWidth:0 }}>
                  {editId === todo.id ? (
                    <input
                      autoFocus
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter")  saveEdit(todo.id);
                        if (e.key === "Escape") setEditId(null);
                      }}
                      onBlur={() => saveEdit(todo.id)}
                      style={{
                        width:"100%", background:c.card, border:"1.5px solid #6366f1",
                        borderRadius:7, padding:"4px 8px", fontSize:14, color:c.text,
                        outline:"none", boxSizing:"border-box",
                      }}
                    />
                  ) : (
                    <span
                      onDoubleClick={() => startEdit(todo)}
                      style={{
                        fontSize:14, wordBreak:"break-word",
                        textDecoration: todo.done ? "line-through" : "none",
                        color: todo.done ? c.muted : c.text,
                      }}
                    >
                      {todo.text}
                    </span>
                  )}
                  {todo.due && (
                    <div style={{ marginTop:3 }}>
                      <span style={{
                        fontSize:11, padding:"1px 6px", borderRadius:6,
                        border:`1px solid ${isOverdue ? "#fecaca" : c.border}`,
                        background: isOverdue ? "#fee2e2" : c.card,
                        color: isOverdue ? "#ef4444" : c.muted,
                      }}>
                        📅 {todo.due}
                      </span>
                    </div>
                  )}
                </div>

                {/* Priority badge */}
                <span style={{
                  fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:20,
                  display:"flex", alignItems:"center", gap:4, flexShrink:0,
                  background:pc.bg, color:pc.text,
                }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:pc.dot, flexShrink:0 }} />
                  {todo.priority}
                </span>

                {/* Category badge */}
                <span style={{
                  fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:20,
                  display:"flex", alignItems:"center", gap:4, flexShrink:0,
                  background:cc.bg, color:cc.text,
                }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:cc.dot, flexShrink:0 }} />
                  {todo.category}
                </span>

                {/* Edit & Delete */}
                <button onClick={() => startEdit(todo)}
                  style={{ background:"transparent", border:"none", cursor:"pointer",
                    fontSize:14, padding:"3px 4px", borderRadius:6, opacity:0.6, flexShrink:0 }}>
                  ✏️
                </button>
                <button onClick={() => removeTodo(todo.id)}
                  style={{ background:"transparent", border:"none", cursor:"pointer",
                    fontSize:14, padding:"3px 4px", borderRadius:6, opacity:0.6, flexShrink:0 }}>
                  🗑️
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        {todos.some(t => t.done) && (
          <button
            onClick={() => setTodos(prev => prev.filter(t => !t.done))}
            style={{
              marginTop:14, width:"100%", background:"transparent",
              border:`1.5px dashed ${c.border}`, borderRadius:10,
              padding:9, fontSize:13, color:c.muted, cursor:"pointer",
            }}
          >
            Clear completed ({todos.filter(t => t.done).length})
          </button>
        )}
        <div style={{ textAlign:"center", fontSize:11, color:c.muted, marginTop:10, opacity:0.7 }}>
          💡 Drag ⠿ to reorder · Double-click to edit · Click ✓ to complete
        </div>
      </div>
    </div>
  );
}
