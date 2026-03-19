import { useState, useEffect } from "react";

const categories = ["All", "Personal", "Study", "Work"];
const categoryColors = {
  Personal: { bg: "#fce7f3", text: "#9d174d", dot: "#ec4899" },
  Study:    { bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6" },
  Work:     { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
};

export default function TodoApp() {

  // ✅ LOCALSTORAGE: Load saved todos on first render
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("my-todos");
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Read DSA chapter 3", category: "Study", done: false },
      { id: 2, text: "Push code to GitHub", category: "Work", done: true },
      { id: 3, text: "Call mom", category: "Personal", done: false },
    ];
  });

  const [input, setInput] = useState("");
  const [category, setCategory] = useState("Study");
  const [filter, setFilter] = useState("All");
  const [nextId, setNextId] = useState(() => {
    const saved = localStorage.getItem("my-todos-nextid");
    return saved ? parseInt(saved) : 10;
  });

  // ✅ LOCALSTORAGE: Save to localStorage every time todos changes
  useEffect(() => {
    localStorage.setItem("my-todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("my-todos-nextid", nextId.toString());
  }, [nextId]);

  const addTodo = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTodos([{ id: nextId, text: trimmed, category, done: false }, ...todos]);
    setNextId(nextId + 1);
    setInput("");
  };

  const toggleTodo = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTodo = (id) => setTodos(todos.filter((t) => t.id !== id));

  const filtered =
    filter === "All" ? todos : todos.filter((t) => t.category === filter);

  const done = todos.filter((t) => t.done).length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <div style={styles.greeting}>My Tasks ✦</div>
            <div style={styles.subtext}>{done} of {todos.length} completed · saved locally 💾</div>
          </div>
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="22" fill="none" stroke="#e5e7eb" strokeWidth="4" />
            <circle cx="26" cy="26" r="22" fill="none" stroke="#6366f1" strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
              strokeLinecap="round" transform="rotate(-90 26 26)"
              style={{ transition: "stroke-dashoffset 0.5s ease" }} />
            <text x="26" y="30" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6366f1">{pct}%</text>
          </svg>
        </div>

        <div style={styles.inputRow}>
          <input style={styles.input} placeholder="Add a new task..."
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()} />
          <select style={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
          </select>
          <button style={styles.addBtn} onClick={addTodo}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        <div style={styles.filterRow}>
          {categories.map((c) => (
            <button key={c}
              style={{ ...styles.filterBtn, ...(filter === c ? styles.filterBtnActive : {}) }}
              onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>

        <div style={styles.list}>
          {filtered.length === 0 && <div style={styles.empty}>No tasks here. Add one above! 🎉</div>}
          {filtered.map((todo) => {
            const col = categoryColors[todo.category];
            return (
              <div key={todo.id} style={{ ...styles.taskRow, ...(todo.done ? styles.taskDone : {}) }}>
                <div style={{ ...styles.checkbox, ...(todo.done ? styles.checkboxDone : {}) }}
                  onClick={() => toggleTodo(todo.id)}>
                  {todo.done && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span style={{ ...styles.taskText, ...(todo.done ? styles.taskTextDone : {}) }}>{todo.text}</span>
                <span style={{ ...styles.badge, background: col.bg, color: col.text }}>
                  <span style={{ ...styles.dot, background: col.dot }} />{todo.category}
                </span>
                <button style={styles.deleteBtn} onClick={() => deleteTodo(todo.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {todos.filter(t => t.done).length > 0 && (
          <button style={styles.clearBtn} onClick={() => setTodos(todos.filter(t => !t.done))}>
            Clear completed ({todos.filter(t => t.done).length})
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:"100vh", background:"linear-gradient(135deg,#f0f4ff 0%,#faf5ff 50%,#f0fdf4 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',system-ui,sans-serif", padding:"24px 16px", position:"relative", overflow:"hidden" },
  blob1: { position:"absolute", top:"-80px", left:"-80px", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle,#c7d2fe88 0%,transparent 70%)", pointerEvents:"none" },
  blob2: { position:"absolute", bottom:"-60px", right:"-60px", width:"260px", height:"260px", borderRadius:"50%", background:"radial-gradient(circle,#bbf7d088 0%,transparent 70%)", pointerEvents:"none" },
  card: { background:"#fff", borderRadius:"24px", boxShadow:"0 8px 40px rgba(0,0,0,0.10)", padding:"28px", width:"100%", maxWidth:"480px", position:"relative", zIndex:1 },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"22px" },
  greeting: { fontSize:"22px", fontWeight:"700", color:"#111827", letterSpacing:"-0.5px" },
  subtext: { fontSize:"13px", color:"#9ca3af", marginTop:"2px" },
  inputRow: { display:"flex", gap:"8px", marginBottom:"14px" },
  input: { flex:1, padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", color:"#111827", outline:"none", background:"#fafafa" },
  select: { padding:"10px", border:"1.5px solid #e5e7eb", borderRadius:"10px", fontSize:"13px", color:"#374151", background:"#fafafa", cursor:"pointer", outline:"none" },
  addBtn: { background:"#6366f1", border:"none", borderRadius:"10px", width:"42px", height:"42px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 },
  filterRow: { display:"flex", gap:"6px", marginBottom:"16px", flexWrap:"wrap" },
  filterBtn: { padding:"5px 14px", borderRadius:"20px", border:"1.5px solid #e5e7eb", background:"transparent", fontSize:"13px", color:"#6b7280", cursor:"pointer" },
  filterBtnActive: { background:"#6366f1", color:"#fff", borderColor:"#6366f1", fontWeight:"600" },
  list: { display:"flex", flexDirection:"column", gap:"8px", maxHeight:"340px", overflowY:"auto" },
  empty: { textAlign:"center", color:"#9ca3af", fontSize:"14px", padding:"32px 0" },
  taskRow: { display:"flex", alignItems:"center", gap:"10px", padding:"11px 12px", borderRadius:"12px", border:"1.5px solid #f3f4f6", background:"#fafafa" },
  taskDone: { opacity:0.6 },
  checkbox: { width:"20px", height:"20px", borderRadius:"6px", border:"2px solid #d1d5db", flexShrink:0, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" },
  checkboxDone: { background:"#6366f1", borderColor:"#6366f1" },
  taskText: { flex:1, fontSize:"14px", color:"#111827" },
  taskTextDone: { textDecoration:"line-through", color:"#9ca3af" },
  badge: { fontSize:"11px", fontWeight:"600", padding:"3px 8px", borderRadius:"20px", display:"flex", alignItems:"center", gap:"4px", flexShrink:0 },
  dot: { width:"6px", height:"6px", borderRadius:"50%", flexShrink:0 },
  deleteBtn: { background:"transparent", border:"none", color:"#d1d5db", cursor:"pointer", display:"flex", alignItems:"center", padding:"4px", borderRadius:"6px", flexShrink:0 },
  clearBtn: { marginTop:"14px", width:"100%", background:"transparent", border:"1.5px dashed #e5e7eb", borderRadius:"10px", padding:"9px", fontSize:"13px", color:"#9ca3af", cursor:"pointer" },
};

