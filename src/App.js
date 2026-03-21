import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const getUsers = () => {
  try { return JSON.parse(localStorage.getItem("todo-users") || "[]"); } catch { return []; }
};
const saveUsers = (u) => localStorage.setItem("todo-users", JSON.stringify(u));
const getSession = () => {
  try { return JSON.parse(localStorage.getItem("todo-session") || "null"); } catch { return null; }
};
const saveSession = (u) => localStorage.setItem("todo-session", JSON.stringify(u));
const clearSession = () => localStorage.removeItem("todo-session");

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function AuthScreen({ onLogin, dark }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const T = {
    bg: dark ? "#0b0b14" : "#f4f3ff",
    card: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.92)",
    text: dark ? "#ede9fe" : "#1e1b4b",
    muted: dark ? "#9ca3af" : "#6b7280",
    bord: dark ? "rgba(139,92,246,0.2)" : "rgba(99,102,241,0.2)",
    inp: dark ? "rgba(255,255,255,0.07)" : "#fff",
    sub: "#7c3aed",
  };

  const handle = () => {
    setError("");
    const emailTrim = email.trim().toLowerCase();
    if (!emailTrim) { setError("Email is required."); return; }
    if (mode === "signup") {
      if (!name.trim()) { setError("Name is required."); return; }
      const users = getUsers();
      if (users.find((u) => u.email === emailTrim)) { setError("Email already registered. Please log in."); return; }
      const newUser = { id: Date.now().toString(36), name: name.trim(), email: emailTrim };
      saveUsers([...users, newUser]);
      saveSession(newUser);
      onLogin(newUser);
    } else {
      const users = getUsers();
      const found = users.find((u) => u.email === emailTrim);
      if (!found) { setError("Email not found. Please sign up first."); return; }
      saveSession(found);
      onLogin(found);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Segoe UI',system-ui,sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {[{ top: "-20%", left: "-10%", s: 600, c: dark ? "rgba(99,102,241,0.14)" : "rgba(99,102,241,0.18)" }, { bottom: "-15%", right: "-10%", s: 500, c: dark ? "rgba(236,72,153,0.09)" : "rgba(236,72,153,0.13)" }].map((o, i) => (
          <div key={i} style={{ position: "absolute", ...(o.top ? { top: o.top } : { bottom: o.bottom }), ...(o.left ? { left: o.left } : { right: o.right }), width: o.s, height: o.s, borderRadius: "50%", background: `radial-gradient(circle,${o.c},transparent 70%)` }} />
        ))}
      </div>
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", background: "linear-gradient(90deg,#6366f1,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>✦ TASK MANAGER ✦</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: "-1.5px", background: dark ? "linear-gradient(135deg,#c4b5fd,#f9a8d4)" : "linear-gradient(135deg,#4338ca,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>My Workspace</h1>
          <p style={{ fontSize: 13, color: T.muted, margin: "8px 0 0", fontWeight: 500 }}>Your tasks, your world 🌙</p>
        </div>
        <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 28, border: `1.5px solid ${T.bord}`, padding: "32px 28px", boxShadow: dark ? "0 24px 80px rgba(0,0,0,0.5)" : "0 24px 80px rgba(99,102,241,0.13)" }}>
          <div style={{ display: "flex", gap: 4, background: dark ? "rgba(255,255,255,0.05)" : "#f0eeff", borderRadius: 14, padding: 4, marginBottom: 24 }}>
            {["login", "signup"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.2s", background: mode === m ? "linear-gradient(135deg,#6366f1,#ec4899)" : "transparent", color: mode === m ? "#fff" : T.muted, boxShadow: mode === m ? "0 4px 14px rgba(99,102,241,0.35)" : "none" }}>
                {m === "login" ? "🔑 Log In" : "✨ Sign Up"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Your Name</div>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Name" onKeyDown={(e) => e.key === "Enter" && handle()} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${T.bord}`, background: T.inp, color: T.text, fontSize: 15, fontWeight: 500, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            )}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Email Address</div>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" onKeyDown={(e) => e.key === "Enter" && handle()} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${T.bord}`, background: T.inp, color: T.text, fontSize: 15, fontWeight: 500, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            {error && <div style={{ background: dark ? "rgba(244,63,94,0.15)" : "#fff1f2", border: "1px solid #fecdd3", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#f43f5e", fontWeight: 600 }}>⚠️ {error}</div>}
            <button onClick={handle} style={{ marginTop: 4, width: "100%", padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#6366f1,#ec4899)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(99,102,241,0.4)", letterSpacing: 0.3 }}>
              {mode === "login" ? "Log In →" : "Create Account →"}
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: T.muted, marginTop: 20, lineHeight: 1.8 }}>
            {mode === "login" ? "No account? " : "Already have one? "}
            <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} style={{ color: T.sub, fontWeight: 700, cursor: "pointer" }}>
              {mode === "login" ? "Sign up free" : "Log in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE PAGE
// ─────────────────────────────────────────────────────────────────────────────
function ProfilePage({ user, todos, dark, onLogout, onClose }) {
  const done = todos.filter((t) => t.done).length;
  const total = todos.length;
  const T = { bg: dark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.9)", text: dark ? "#ede9fe" : "#1e1b4b", muted: dark ? "#9ca3af" : "#6b7280", bord: dark ? "rgba(139,92,246,0.15)" : "rgba(99,102,241,0.15)" };
  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10002, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: dark ? "#13131f" : "#fff", borderRadius: 28, padding: 28, maxWidth: 380, width: "100%", border: `1.5px solid ${T.bord}`, boxShadow: "0 24px 80px rgba(0,0,0,0.5)", animation: "popIn 0.35s cubic-bezier(.34,1.56,.64,1)", fontFamily: "'Segoe UI',system-ui,sans-serif" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 auto 14px", boxShadow: "0 8px 28px rgba(99,102,241,0.4)" }}>{initials}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: "-0.5px" }}>{user.name}</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>{user.email}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[{ n: total, l: "Total", c: "#6366f1", bg: dark ? "rgba(99,102,241,0.18)" : "#eef2ff" }, { n: done, l: "Done", c: "#10b981", bg: dark ? "rgba(16,185,129,0.18)" : "#ecfdf5" }, { n: total - done, l: "Left", c: "#f59e0b", bg: dark ? "rgba(245,158,11,0.18)" : "#fefce8" }].map(({ n, l, c, bg }) => (
            <div key={l} style={{ background: bg, borderRadius: 16, padding: "14px 8px", textAlign: "center", border: `1px solid ${c}22` }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: c, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1px solid ${T.bord}`, background: "transparent", color: T.muted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Close</button>
          <button onClick={onLogout} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#f43f5e,#ec4899)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(244,63,94,0.35)" }}>🚪 Log Out</button>
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.75) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const todayStr = () => new Date().toISOString().split("T")[0];
const nowTimeStr = () => { const d = new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };

const CATEGORIES = ["All", "Personal", "Study", "Work"];
const PRIORITIES = ["High", "Medium", "Low"];
const CAT_META = {
  Personal: { icon: "🌸", gradient: "linear-gradient(135deg,#f472b6,#ec4899)", glow: "rgba(244,114,182,0.3)" },
  Study: { icon: "📚", gradient: "linear-gradient(135deg,#818cf8,#6366f1)", glow: "rgba(129,140,248,0.3)" },
  Work: { icon: "💼", gradient: "linear-gradient(135deg,#38bdf8,#0ea5e9)", glow: "rgba(56,189,248,0.3)" },
};
const PRI_META = {
  High: { color: "#f43f5e", bg: "#fff1f2", border: "#fecdd3", label: "🔴 High" },
  Medium: { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "🟡 Medium" },
  Low: { color: "#10b981", bg: "#f0fdf4", border: "#a7f3d0", label: "🟢 Low" },
};
const DEFAULTS = [
  { id: "d1", text: "Study DSA chapter 3", category: "Study", priority: "High", due: todayStr(), alarm: "", voiceType: "male", alarmFired: false, done: false },
  { id: "d2", text: "Team standup meeting", category: "Work", priority: "Medium", due: "", alarm: "", voiceType: "male", alarmFired: false, done: false },
  { id: "d3", text: "Call mom", category: "Personal", priority: "Low", due: "", alarm: "", voiceType: "female", alarmFired: false, done: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// VOICE ENGINE
// ─────────────────────────────────────────────────────────────────────────────
const MALE_VOICES = ["Google UK English Male","Microsoft David Desktop - English (United States)","Microsoft David","Daniel","Alex","Fred","Microsoft George - English (United Kingdom)","Rishi","Google US English"];
const FEMALE_VOICES = ["Google UK English Female","Samantha","Karen","Moira","Tessa","Microsoft Zira Desktop - English (United States)","Microsoft Zira","Victoria","Google US English"];

function getBestVoice(type = "male") {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const list = type === "female" ? FEMALE_VOICES : MALE_VOICES;
  for (const name of list) { const v = voices.find((v) => v.name === name); if (v) return v; }
  if (type === "female") return voices.find((v) => v.lang.startsWith("en") && (v.name.toLowerCase().includes("female") || v.name.includes("Zira") || v.name.includes("Samantha"))) || voices.find((v) => v.lang.startsWith("en")) || voices[0];
  return voices.find((v) => v.lang.startsWith("en") && (v.name.toLowerCase().includes("male") || v.name.includes("David") || v.name.includes("Daniel"))) || voices.find((v) => v.lang.startsWith("en")) || voices[0];
}

function playBeep() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    [[660,0.0,0.18],[660,0.25,0.18],[880,0.5,0.3]].forEach(([f,t,d]) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination); o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.7, ac.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + d);
      o.start(ac.currentTime + t); o.stop(ac.currentTime + t + d + 0.05);
    });
  } catch(e) {}
}

function speakAlarm(taskText, voiceType = "male") {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  playBeep();
  setTimeout(() => {
    const say = () => {
      const utt = new SpeechSynthesisUtterance(taskText);
      utt.voice = getBestVoice(voiceType); utt.rate = voiceType === "female" ? 0.85 : 0.8; utt.pitch = voiceType === "female" ? 1.1 : 0.7; utt.volume = 1.0;
      utt.onend = () => { setTimeout(() => { const u2 = new SpeechSynthesisUtterance(taskText); u2.voice = getBestVoice(voiceType); u2.rate = voiceType === "female" ? 0.85 : 0.8; u2.pitch = voiceType === "female" ? 1.1 : 0.7; u2.volume = 1.0; window.speechSynthesis.speak(u2); }, 900); };
      window.speechSynthesis.speak(utt);
    };
    getBestVoice(voiceType) ? say() : setTimeout(say, 500);
  }, 900);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────────────────────────────────────
function Confetti({ active, onDone }) {
  const ref = useRef(null);
  const cb = useRef(onDone);
  cb.current = onDone;
  useEffect(() => {
    if (!active) return;
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    const cols = ["#6366f1","#ec4899","#f59e0b","#10b981","#38bdf8","#a855f7","#f43f5e"];
    const pp = Array.from({ length: 160 }, () => ({ x: Math.random()*cv.width, y: -20, w: 5+Math.random()*10, h: 3+Math.random()*7, color: cols[Math.floor(Math.random()*cols.length)], vx: (Math.random()-0.5)*5, vy: 2+Math.random()*6, angle: Math.random()*360, va: (Math.random()-0.5)*10 }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,cv.width,cv.height); let done = true;
      pp.forEach((p) => { p.x+=p.vx; p.y+=p.vy; p.angle+=p.va; if(p.y<cv.height+20) done=false; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.angle*Math.PI/180); ctx.fillStyle=p.color; ctx.globalAlpha=Math.max(0,1-p.y/cv.height); ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore(); });
      if(done){cb.current();return;} raf=requestAnimationFrame(draw);
    };
    draw();
    const t = setTimeout(()=>cb.current(),4500);
    return ()=>{cancelAnimationFrame(raf);clearTimeout(t);};
  },[active]);
  if(!active)return null;
  return <canvas ref={ref} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999}}/>;
}

// ─────────────────────────────────────────────────────────────────────────────
// ALARM POPUP
// ─────────────────────────────────────────────────────────────────────────────
function AlarmPopup({ alarms, onDismiss, onSnooze, dark }) {
  const [tick,setTick]=useState(0);
  useEffect(()=>{if(!alarms.length)return;const t=setInterval(()=>setTick(n=>n+1),500);return()=>clearInterval(t);},[alarms.length]);
  if(!alarms.length)return null;
  const todo=alarms[0]; const cm=CAT_META[todo.category];
  return (
    <div style={{position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:dark?"#13131f":"#fff",borderRadius:32,padding:"36px 28px",maxWidth:400,width:"100%",border:"2px solid #7c3aed",boxShadow:"0 0 0 8px rgba(124,58,237,0.12),0 32px 80px rgba(0,0,0,0.6)",textAlign:"center",animation:"popIn 0.45s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{width:90,height:90,borderRadius:"50%",margin:"0 auto 20px",background:"linear-gradient(135deg,#7c3aed,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,boxShadow:`0 0 0 ${tick%2===0?16:8}px rgba(124,58,237,${tick%2===0?0.2:0.08})`,transition:"box-shadow 0.5s ease",transform:`rotate(${tick%2===0?-14:14}deg)`}}>🔔</div>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:4,color:"#7c3aed",textTransform:"uppercase",marginBottom:10}}>⏰ ALARM RINGING</div>
        <div style={{fontSize:28,fontWeight:900,color:dark?"#f1f0fb":"#1e1b4b",lineHeight:1.25,marginBottom:14,letterSpacing:"-0.5px"}}>{todo.text}</div>
        <button onClick={()=>speakAlarm(todo.text,todo.voiceType||"male")} style={{width:"100%",padding:"13px",borderRadius:14,marginBottom:10,border:"2px solid #7c3aed",background:dark?"rgba(124,58,237,0.15)":"#faf5ff",color:"#7c3aed",fontSize:14,fontWeight:700,cursor:"pointer"}}>🔊 Speak Again</button>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>onSnooze(todo.id)} style={{flex:1,padding:"13px",borderRadius:14,border:`1px solid ${dark?"rgba(255,255,255,0.1)":"#e0e7ff"}`,background:dark?"rgba(255,255,255,0.05)":"#f0f4ff",color:dark?"#a5b4fc":"#6366f1",fontSize:13,fontWeight:700,cursor:"pointer"}}>😴 Snooze 5 min</button>
          <button onClick={()=>onDismiss(todo.id)} style={{flex:1,padding:"13px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#6366f1,#ec4899)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 20px rgba(99,102,241,0.45)"}}>✅ Got it!</button>
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.75) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function EditModal({ todo, onSave, onClose, dark }) {
  const [text,setText]=useState(todo.text);
  const [category,setCategory]=useState(todo.category);
  const [priority,setPriority]=useState(todo.priority);
  const [due,setDue]=useState(todo.due||"");
  const [alarm,setAlarm]=useState(todo.alarm||"");
  const [voiceType,setVoiceType]=useState(todo.voiceType||"male");
  const T={bg:dark?"#13131f":"#fff",text:dark?"#f1f0fb":"#1e1b4b",muted:dark?"#9ca3af":"#6b7280",bord:dark?"rgba(139,92,246,0.2)":"rgba(99,102,241,0.2)",inp:dark?"rgba(255,255,255,0.07)":"#f9f8ff",sub:"#7c3aed"};
  return (
    <div style={{position:"fixed",inset:0,zIndex:10001,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:T.bg,borderRadius:28,padding:28,maxWidth:460,width:"100%",border:`1.5px solid ${T.bord}`,boxShadow:"0 24px 80px rgba(0,0,0,0.5)",animation:"popIn 0.35s cubic-bezier(.34,1.56,.64,1)"}} onClick={(e)=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:18,fontWeight:800,color:T.text}}>✏️ Edit Task</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:T.muted}}>✕</button>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T.sub,marginBottom:6,letterSpacing:1,textTransform:"uppercase"}}>Task Name</div>
          <input value={text} onChange={(e)=>setText(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`1.5px solid ${T.bord}`,background:T.inp,color:T.text,fontSize:15,fontWeight:600,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:14}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:700,color:T.sub,marginBottom:6,letterSpacing:1,textTransform:"uppercase"}}>📁 Category</div>
            <select value={category} onChange={(e)=>setCategory(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:12,border:`1.5px solid ${T.bord}`,background:T.inp,color:T.text,fontSize:13,fontWeight:600,outline:"none",fontFamily:"inherit"}}>
              {CATEGORIES.filter((c)=>c!=="All").map((c)=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:700,color:T.sub,marginBottom:6,letterSpacing:1,textTransform:"uppercase"}}>⚡ Priority</div>
            <select value={priority} onChange={(e)=>setPriority(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:12,border:`1.5px solid ${T.bord}`,background:T.inp,color:T.text,fontSize:13,fontWeight:600,outline:"none",fontFamily:"inherit"}}>
              {PRIORITIES.map((p)=><option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:14}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:700,color:T.sub,marginBottom:6,letterSpacing:1,textTransform:"uppercase"}}>📅 Due Date</div>
            <input type="date" value={due} onChange={(e)=>setDue(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:12,border:`1.5px solid ${T.bord}`,background:T.inp,color:T.text,fontSize:13,fontWeight:600,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:700,color:T.sub,marginBottom:6,letterSpacing:1,textTransform:"uppercase"}}>⏰ Alarm Time</div>
            <input type="time" value={alarm} onChange={(e)=>setAlarm(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:12,border:`2px solid ${alarm?"#7c3aed":T.bord}`,background:T.inp,color:T.text,fontSize:14,fontWeight:700,outline:"none",fontFamily:"inherit",boxSizing:"border-box",letterSpacing:1}}/>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:700,color:T.sub,marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>🔊 Alarm Voice</div>
          <div style={{display:"flex",gap:10}}>
            {[{val:"male",icon:"👨",label:"Male Voice",color:"#3b82f6",bg:dark?"rgba(59,130,246,0.15)":"#eff6ff"},{val:"female",icon:"👩",label:"Female Voice",color:"#ec4899",bg:dark?"rgba(236,72,153,0.15)":"#fdf2f8"}].map((v)=>(
              <button key={v.val} onClick={()=>setVoiceType(v.val)} style={{flex:1,padding:"12px 8px",borderRadius:14,cursor:"pointer",border:`2px solid ${voiceType===v.val?v.color:T.bord}`,background:voiceType===v.val?v.bg:dark?"transparent":"#fafafa",transition:"all 0.2s"}}>
                <div style={{fontSize:24,marginBottom:4}}>{v.icon}</div>
                <div style={{fontSize:12,fontWeight:700,color:voiceType===v.val?v.color:T.muted}}>{v.label}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"13px",borderRadius:14,border:`1px solid ${T.bord}`,background:"transparent",color:T.muted,fontSize:14,fontWeight:700,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>onSave({text:text.trim()||todo.text,category,priority,due,alarm,voiceType})} style={{flex:2,padding:"13px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#6366f1,#ec4899)",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",boxShadow:"0 6px 20px rgba(99,102,241,0.4)"}}>💾 Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ★ NEW: POMODORO TIMER
// ─────────────────────────────────────────────────────────────────────────────
function PomodoroTimer({ todos, dark }) {
  const WORK_MIN = 25, BREAK_MIN = 5, LONG_BREAK_MIN = 15;
  const [phase, setPhase] = useState("work"); // work | break | longBreak
  const [seconds, setSeconds] = useState(WORK_MIN * 60);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState(1);
  const [linkedTask, setLinkedTask] = useState("");
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef(null);

  const T = {
    card: dark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.9)",
    text: dark ? "#ede9fe" : "#1e1b4b",
    muted: dark ? "#9ca3af" : "#6b7280",
    bord: dark ? "rgba(139,92,246,0.15)" : "rgba(99,102,241,0.15)",
    inp: dark ? "rgba(255,255,255,0.07)" : "#fff",
    shadow: dark ? "0 12px 40px rgba(0,0,0,0.5)" : "0 12px 40px rgba(99,102,241,0.12)",
  };

  const phaseConfig = {
    work: { label: "Focus Time", color: "#6366f1", bg: dark ? "rgba(99,102,241,0.15)" : "#eef2ff", emoji: "🎯", duration: WORK_MIN * 60 },
    break: { label: "Short Break", color: "#10b981", bg: dark ? "rgba(16,185,129,0.15)" : "#ecfdf5", emoji: "☕", duration: BREAK_MIN * 60 },
    longBreak: { label: "Long Break", color: "#f59e0b", bg: dark ? "rgba(245,158,11,0.15)" : "#fefce8", emoji: "🌴", duration: LONG_BREAK_MIN * 60 },
  };

  const pc = phaseConfig[phase];
  const totalSecs = pc.duration;
  const progress = ((totalSecs - seconds) / totalSecs) * 100;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const switchPhase = useCallback((newPhase) => {
    setRunning(false);
    setPhase(newPhase);
    setSeconds(phaseConfig[newPhase].duration);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            playBeep();
            if (phase === "work") {
              const newCompleted = completedSessions + 1;
              setCompletedSessions(newCompleted);
              setSession((prev) => prev + 1);
              if (newCompleted % 4 === 0) switchPhase("longBreak");
              else switchPhase("break");
            } else {
              switchPhase("work");
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, phase, completedSessions, switchPhase]);

  const reset = () => { setRunning(false); setSeconds(pc.duration); };
  const circumference = 2 * Math.PI * 54;
  const strokeDash = circumference - (progress / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Main timer card */}
      <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 28, border: `1.5px solid ${pc.color}44`, padding: 28, boxShadow: T.shadow, textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: pc.color, marginBottom: 8 }}>
          {pc.emoji} {pc.label} — Session #{session}
        </div>

        {/* Circular progress */}
        <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 20px" }}>
          <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="80" cy="80" r="54" fill="none" stroke={dark ? "rgba(255,255,255,0.08)" : "#e0e7ff"} strokeWidth="10" />
            <circle cx="80" cy="80" r="54" fill="none" stroke={pc.color} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={strokeDash} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: T.text, letterSpacing: "-2px", fontVariantNumeric: "tabular-nums" }}>
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Phase dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: completedSessions % 4 >= i ? pc.color : dark ? "rgba(255,255,255,0.1)" : "#e0e7ff", transition: "background 0.3s" }} />
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 16 }}>
          <button onClick={reset} style={{ width: 48, height: 48, borderRadius: 14, border: `1px solid ${T.bord}`, background: dark ? "rgba(255,255,255,0.05)" : "#f5f3ff", color: T.muted, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>↺</button>
          <button onClick={() => setRunning((r) => !r)} style={{ height: 48, padding: "0 32px", borderRadius: 14, border: "none", background: running ? "linear-gradient(135deg,#f43f5e,#ec4899)" : `linear-gradient(135deg,${pc.color},${pc.color}cc)`, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 20px ${pc.color}44`, minWidth: 120 }}>
            {running ? "⏸ Pause" : "▶ Start"}
          </button>
          <button onClick={() => switchPhase(phase === "work" ? "break" : "work")} style={{ width: 48, height: 48, borderRadius: 14, border: `1px solid ${T.bord}`, background: dark ? "rgba(255,255,255,0.05)" : "#f5f3ff", color: T.muted, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>⏭</button>
        </div>

        {/* Phase switcher */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {Object.entries(phaseConfig).map(([key, cfg]) => (
            <button key={key} onClick={() => switchPhase(key)} style={{ padding: "6px 14px", borderRadius: 10, border: `1.5px solid ${phase === key ? cfg.color : T.bord}`, background: phase === key ? cfg.bg : "transparent", color: phase === key ? cfg.color : T.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
              {cfg.emoji} {cfg.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Link to task */}
      <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 20, border: `1px solid ${T.bord}`, padding: 18, boxShadow: T.shadow }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>🔗 Working On</div>
        <select value={linkedTask} onChange={(e) => setLinkedTask(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${T.bord}`, background: T.inp, color: T.text, fontSize: 13, fontWeight: 600, outline: "none", fontFamily: "inherit" }}>
          <option value="">— Select a task —</option>
          {todos.filter((t) => !t.done).map((t) => <option key={t.id} value={t.id}>{t.text}</option>)}
        </select>
        {linkedTask && (
          <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: dark ? "rgba(99,102,241,0.1)" : "#eef2ff", fontSize: 13, color: "#6366f1", fontWeight: 600 }}>
            🎯 Focusing on: {todos.find((t) => t.id === linkedTask)?.text}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[{ n: completedSessions, l: "Sessions", c: "#6366f1", e: "🍅" }, { n: Math.round(completedSessions * WORK_MIN), l: "Minutes", c: "#10b981", e: "⏱️" }, { n: Math.floor(completedSessions / 4), l: "Cycles", c: "#f59e0b", e: "🔄" }].map(({ n, l, c, e }) => (
          <div key={l} style={{ background: T.card, backdropFilter: "blur(10px)", borderRadius: 16, padding: "14px 8px", textAlign: "center", border: `1px solid ${c}22`, boxShadow: T.shadow }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{e}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: c, lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ★ NEW: HABIT TRACKER
// ─────────────────────────────────────────────────────────────────────────────
function HabitTracker({ habits, setHabits, dark }) {
  const [showAdd, setShowAdd] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [habitEmoji, setHabitEmoji] = useState("⭐");

  const T = {
    card: dark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.9)",
    glass: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)",
    text: dark ? "#ede9fe" : "#1e1b4b",
    muted: dark ? "#9ca3af" : "#6b7280",
    bord: dark ? "rgba(139,92,246,0.15)" : "rgba(99,102,241,0.15)",
    inp: dark ? "rgba(255,255,255,0.07)" : "#fff",
    shadow: dark ? "0 12px 40px rgba(0,0,0,0.5)" : "0 12px 40px rgba(99,102,241,0.12)",
  };

  const EMOJIS = ["⭐","💪","📖","🏃","💧","🧘","🥗","😴","🎯","✍️","🎵","🌿"];

  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  const getStreak = (habit) => {
    let streak = 0;
    const today = todayStr();
    let checkDay = new Date();
    while (true) {
      const dayStr = checkDay.toISOString().split("T")[0];
      if (habit.completedDays.includes(dayStr)) {
        streak++;
        checkDay.setDate(checkDay.getDate() - 1);
      } else if (dayStr === today) {
        checkDay.setDate(checkDay.getDate() - 1);
      } else break;
    }
    return streak;
  };

  const toggleDay = (habitId, day) => {
    setHabits((prev) => prev.map((h) => {
      if (h.id !== habitId) return h;
      const has = h.completedDays.includes(day);
      return { ...h, completedDays: has ? h.completedDays.filter((d) => d !== day) : [...h.completedDays, day] };
    }));
  };

  const addHabit = () => {
    if (!habitName.trim()) return;
    setHabits((prev) => [...prev, { id: uid(), name: habitName.trim(), emoji: habitEmoji, completedDays: [], createdAt: todayStr() }]);
    setHabitName(""); setHabitEmoji("⭐"); setShowAdd(false);
  };

  const deleteHabit = (id) => setHabits((prev) => prev.filter((h) => h.id !== id));

  const last30 = getLast30Days();
  const today = todayStr();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header stats */}
      {habits.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { n: habits.length, l: "Habits", c: "#6366f1", e: "📋" },
            { n: habits.filter((h) => h.completedDays.includes(today)).length, l: "Done Today", c: "#10b981", e: "✅" },
            { n: Math.max(...habits.map((h) => getStreak(h)), 0), l: "Best Streak", c: "#f59e0b", e: "🔥" },
          ].map(({ n, l, c, e }) => (
            <div key={l} style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 18, padding: "16px 10px", textAlign: "center", border: `1px solid ${c}22`, boxShadow: T.shadow }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{e}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: c, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add habit */}
      <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 24, border: `1.5px solid ${showAdd ? "#7c3aed" : T.bord}`, overflow: "hidden", boxShadow: T.shadow, transition: "all 0.3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", cursor: "pointer" }} onClick={() => setShowAdd((s) => !s)}>
          <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff", fontWeight: 700, boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>
            {showAdd ? "−" : "+"}
          </div>
          <span style={{ fontSize: 16, color: T.text, fontWeight: 500 }}>Add a new habit</span>
        </div>
        {showAdd && (
          <div style={{ padding: "4px 18px 18px", borderTop: `1px solid ${T.bord}` }}>
            <div style={{ marginTop: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Pick an Emoji</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => setHabitEmoji(e)} style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${habitEmoji === e ? "#7c3aed" : T.bord}`, background: habitEmoji === e ? (dark ? "rgba(124,58,237,0.2)" : "#ede9fe") : "transparent", fontSize: 20, cursor: "pointer" }}>{e}</button>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Habit Name</div>
            <input value={habitName} onChange={(e) => setHabitName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addHabit()} placeholder="e.g. Drink 8 glasses of water" style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${T.bord}`, background: T.inp, color: T.text, fontSize: 14, fontWeight: 600, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12 }} />
            <button onClick={addHabit} style={{ width: "100%", padding: "13px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(99,102,241,0.35)" }}>
              ✨ Create Habit
            </button>
          </div>
        )}
      </div>

      {habits.length === 0 && (
        <div style={{ textAlign: "center", padding: "56px 24px", background: T.glass, backdropFilter: "blur(20px)", borderRadius: 24, border: `1px solid ${T.bord}` }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🌱</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>No habits yet!</div>
          <div style={{ fontSize: 13, color: T.muted }}>Build positive routines, one day at a time</div>
        </div>
      )}

      {/* Habit list */}
      {habits.map((habit) => {
        const streak = getStreak(habit);
        const doneToday = habit.completedDays.includes(today);
        const completion30 = last30.filter((d) => habit.completedDays.includes(d)).length;
        const completionPct = Math.round((completion30 / 30) * 100);

        return (
          <div key={habit.id} style={{ background: doneToday ? (dark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.05)") : T.card, backdropFilter: "blur(20px)", borderRadius: 22, border: `1.5px solid ${doneToday ? "#10b981" : T.bord}`, padding: 18, boxShadow: T.shadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: doneToday ? "linear-gradient(135deg,#10b981,#6366f1)" : (dark ? "rgba(255,255,255,0.08)" : "#f5f3ff"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, boxShadow: doneToday ? "0 4px 14px rgba(16,185,129,0.3)" : "none", transition: "all 0.3s" }}>
                {habit.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{habit.name}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  {streak > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>🔥 {streak} day streak</span>}
                  <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{completionPct}% last 30d</span>
                </div>
              </div>
              <button onClick={() => toggleDay(habit.id, today)} style={{ width: 44, height: 44, borderRadius: 14, border: `2px solid ${doneToday ? "#10b981" : T.bord}`, background: doneToday ? "linear-gradient(135deg,#10b981,#6366f1)" : "transparent", color: doneToday ? "#fff" : T.muted, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0, boxShadow: doneToday ? "0 4px 14px rgba(16,185,129,0.35)" : "none" }}>
                {doneToday ? "✓" : "○"}
              </button>
              <button onClick={() => deleteHabit(habit.id)} style={{ width: 34, height: 34, borderRadius: 10, border: "1.5px solid #fecdd3", background: dark ? "rgba(244,63,94,0.1)" : "#fff1f2", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#f43f5e", flexShrink: 0 }}>🗑️</button>
            </div>

            {/* Heatmap - last 30 days */}
            <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Last 30 Days</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4 }}>
              {last30.map((day) => {
                const done = habit.completedDays.includes(day);
                const isToday = day === today;
                return (
                  <div key={day} onClick={() => toggleDay(habit.id, day)} title={day} style={{ height: 20, borderRadius: 5, background: done ? (dark ? "rgba(99,102,241,0.8)" : "#6366f1") : (dark ? "rgba(255,255,255,0.06)" : "#e0e7ff"), cursor: "pointer", border: isToday ? "2px solid #ec4899" : "1.5px solid transparent", transition: "all 0.15s", transform: "scale(1)", opacity: done ? 1 : 0.5 }} />
                );
              })}
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: 10, height: 6, background: dark ? "rgba(255,255,255,0.06)" : "#e0e7ff", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${completionPct}%`, background: "linear-gradient(90deg,#6366f1,#10b981)", borderRadius: 99, transition: "width 0.5s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ★ NEW: TASK ANALYTICS DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function AnalyticsDashboard({ todos, dark }) {
  const T = {
    card: dark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.9)",
    text: dark ? "#ede9fe" : "#1e1b4b",
    muted: dark ? "#9ca3af" : "#6b7280",
    bord: dark ? "rgba(139,92,246,0.15)" : "rgba(99,102,241,0.15)",
    shadow: dark ? "0 12px 40px rgba(0,0,0,0.5)" : "0 12px 40px rgba(99,102,241,0.12)",
  };

  // Category breakdown
  const catData = ["Personal", "Study", "Work"].map((cat) => {
    const catTodos = todos.filter((t) => t.category === cat);
    const done = catTodos.filter((t) => t.done).length;
    return { cat, total: catTodos.length, done, pct: catTodos.length ? Math.round((done / catTodos.length) * 100) : 0 };
  });

  // Priority breakdown
  const priData = ["High", "Medium", "Low"].map((pri) => {
    const priTodos = todos.filter((t) => t.priority === pri);
    const done = priTodos.filter((t) => t.done).length;
    return { pri, total: priTodos.length, done };
  });

  // Completion rate over last 7 days (simulated from due dates)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en", { weekday: "short" });
      const doneCount = todos.filter((t) => t.done && t.due === str).length;
      const totalCount = todos.filter((t) => t.due === str).length;
      days.push({ str, dayName, doneCount, totalCount });
    }
    return days;
  };

  const last7 = getLast7Days();
  const maxCount = Math.max(...last7.map((d) => d.totalCount), 1);

  // Overall stats
  const totalDone = todos.filter((t) => t.done).length;
  const totalTasks = todos.length;
  const withAlarm = todos.filter((t) => t.alarm).length;
  const overdue = todos.filter((t) => !t.done && t.due && t.due < todayStr()).length;

  const catColors = { Personal: "#ec4899", Study: "#6366f1", Work: "#38bdf8" };
  const priColors = { High: "#f43f5e", Medium: "#f59e0b", Low: "#10b981" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Completion Rate", value: totalTasks ? `${Math.round((totalDone / totalTasks) * 100)}%` : "0%", sub: `${totalDone} of ${totalTasks} done`, color: "#6366f1", emoji: "📊" },
          { label: "Tasks with Alarm", value: withAlarm, sub: "voice reminders set", color: "#a855f7", emoji: "🔔" },
          { label: "Overdue Tasks", value: overdue, sub: overdue === 0 ? "all caught up! 🎉" : "need attention", color: overdue > 0 ? "#f43f5e" : "#10b981", emoji: "⚠️" },
          { label: "Total Tasks", value: totalTasks, sub: `${totalTasks - totalDone} remaining`, color: "#f59e0b", emoji: "📋" },
        ].map(({ label, value, sub, color, emoji }) => (
          <div key={label} style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 20, border: `1px solid ${color}22`, padding: 18, boxShadow: T.shadow }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, color: T.muted }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Weekly activity chart */}
      <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 24, border: `1px solid ${T.bord}`, padding: 22, boxShadow: T.shadow }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 16 }}>📅 Weekly Activity (by due date)</div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 100 }}>
          {last7.map(({ dayName, doneCount, totalCount }) => {
            const barH = totalCount > 0 ? Math.max((totalCount / maxCount) * 80, 8) : 4;
            const doneH = totalCount > 0 ? (doneCount / totalCount) * barH : 0;
            return (
              <div key={dayName} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  <div style={{ width: "100%", position: "relative", height: barH, borderRadius: 6, background: dark ? "rgba(99,102,241,0.2)" : "#e0e7ff", overflow: "hidden" }}>
                    <div style={{ position: "absolute", bottom: 0, width: "100%", height: doneH, background: "linear-gradient(180deg,#6366f1,#a855f7)", borderRadius: 6, transition: "height 0.5s ease" }} />
                  </div>
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>{dayName}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#6366f1" }}>{doneCount}/{totalCount}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: "linear-gradient(135deg,#6366f1,#a855f7)" }} /><span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>Completed</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: dark ? "rgba(99,102,241,0.2)" : "#e0e7ff" }} /><span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>Total</span></div>
        </div>
      </div>

      {/* Category breakdown */}
      <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 24, border: `1px solid ${T.bord}`, padding: 22, boxShadow: T.shadow }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 16 }}>📁 Category Breakdown</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {catData.map(({ cat, total, done, pct }) => (
            <div key={cat}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{CAT_META[cat]?.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{cat}</span>
                  <span style={{ fontSize: 11, color: T.muted }}>({done}/{total})</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 900, color: catColors[cat] }}>{pct}%</span>
              </div>
              <div style={{ height: 8, background: dark ? "rgba(255,255,255,0.06)" : "#e0e7ff", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: catColors[cat], borderRadius: 99, transition: "width 0.5s ease", boxShadow: `0 2px 6px ${catColors[cat]}44` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority breakdown */}
      <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 24, border: `1px solid ${T.bord}`, padding: 22, boxShadow: T.shadow }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 16 }}>⚡ Priority Distribution</div>
        <div style={{ display: "flex", gap: 10 }}>
          {priData.map(({ pri, total, done }) => {
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <div key={pri} style={{ flex: 1, background: dark ? "rgba(255,255,255,0.04)" : "#fafafa", borderRadius: 16, padding: "14px 10px", textAlign: "center", border: `1.5px solid ${priColors[pri]}33` }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: priColors[pri], marginBottom: 6 }}>{PRI_META[pri].label}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: priColors[pri], lineHeight: 1 }}>{total}</div>
                <div style={{ fontSize: 10, color: T.muted, marginBottom: 8, fontWeight: 600 }}>tasks</div>
                <div style={{ height: 6, background: dark ? "rgba(255,255,255,0.06)" : "#e0e7ff", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: priColors[pri], borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontWeight: 600 }}>{pct}% done</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ★ NEW: WEEKLY REVIEW
// ─────────────────────────────────────────────────────────────────────────────
function WeeklyReview({ todos, dark }) {
  const T = {
    card: dark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.9)",
    glass: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)",
    text: dark ? "#ede9fe" : "#1e1b4b",
    muted: dark ? "#9ca3af" : "#6b7280",
    bord: dark ? "rgba(139,92,246,0.15)" : "rgba(99,102,241,0.15)",
    shadow: dark ? "0 12px 40px rgba(0,0,0,0.5)" : "0 12px 40px rgba(99,102,241,0.12)",
  };

  const getWeekDates = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  const weekDates = getWeekDates();
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const completedThisWeek = todos.filter((t) => t.done && t.due && t.due >= weekStart && t.due <= weekEnd);
  const missedThisWeek = todos.filter((t) => !t.done && t.due && t.due >= weekStart && t.due < todayStr());
  const dueThisWeek = todos.filter((t) => t.due && t.due >= weekStart && t.due <= weekEnd);
  const completionRate = dueThisWeek.length ? Math.round((completedThisWeek.length / dueThisWeek.length) * 100) : 0;

  const getMood = () => {
    if (completionRate >= 80) return { emoji: "🌟", label: "Excellent week!", color: "#10b981" };
    if (completionRate >= 60) return { emoji: "😊", label: "Good progress!", color: "#6366f1" };
    if (completionRate >= 40) return { emoji: "💪", label: "Keep pushing!", color: "#f59e0b" };
    return { emoji: "🌱", label: "Room to grow!", color: "#f43f5e" };
  };

  const mood = getMood();

  const catBreakdown = ["Personal", "Study", "Work"].map((cat) => ({
    cat,
    done: completedThisWeek.filter((t) => t.category === cat).length,
    missed: missedThisWeek.filter((t) => t.category === cat).length,
  })).filter((c) => c.done > 0 || c.missed > 0);

  const getInsights = () => {
    const insights = [];
    if (completedThisWeek.length === 0) insights.push({ icon: "💡", text: "No tasks completed with due dates this week. Try setting due dates to track better!", color: "#6366f1" });
    if (missedThisWeek.length > 0) insights.push({ icon: "⚠️", text: `${missedThisWeek.length} task${missedThisWeek.length > 1 ? "s" : ""} missed their deadline. Consider breaking them into smaller steps.`, color: "#f43f5e" });
    if (completionRate >= 80) insights.push({ icon: "🏆", text: "Outstanding! You completed 80%+ of your weekly tasks. Keep up the momentum!", color: "#10b981" });
    const highPriDone = completedThisWeek.filter((t) => t.priority === "High").length;
    if (highPriDone > 0) insights.push({ icon: "🎯", text: `Crushed ${highPriDone} high-priority task${highPriDone > 1 ? "s" : ""}! Great focus on what matters.`, color: "#6366f1" });
    if (insights.length === 0) insights.push({ icon: "📝", text: "Set due dates on your tasks to unlock detailed weekly insights!", color: T.muted });
    return insights;
  };

  const insights = getInsights();

  const formatDate = (str) => {
    const d = new Date(str + "T00:00:00");
    return d.toLocaleDateString("en", { month: "short", day: "numeric" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Week header */}
      <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 28, border: `1.5px solid ${mood.color}33`, padding: 24, textAlign: "center", boxShadow: T.shadow }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>{mood.emoji}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: mood.color, marginBottom: 4 }}>{mood.label}</div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>
          Week of {formatDate(weekStart)} – {formatDate(weekEnd)}
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: T.text, lineHeight: 1, marginBottom: 4 }}>{completionRate}%</div>
        <div style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>completion rate</div>
        <div style={{ marginTop: 16, height: 12, background: dark ? "rgba(255,255,255,0.08)" : "#e0e7ff", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${completionRate}%`, background: `linear-gradient(90deg,${mood.color},#a855f7)`, borderRadius: 99, transition: "width 1s ease", boxShadow: `0 2px 8px ${mood.color}44` }} />
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { n: dueThisWeek.length, l: "Due This Week", c: "#6366f1", e: "📅" },
          { n: completedThisWeek.length, l: "Completed", c: "#10b981", e: "✅" },
          { n: missedThisWeek.length, l: "Missed", c: missedThisWeek.length > 0 ? "#f43f5e" : "#10b981", e: missedThisWeek.length > 0 ? "❌" : "🎉" },
        ].map(({ n, l, c, e }) => (
          <div key={l} style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 18, padding: "16px 10px", textAlign: "center", border: `1px solid ${c}22`, boxShadow: T.shadow }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{e}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: c, lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Daily breakdown */}
      <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 24, border: `1px solid ${T.bord}`, padding: 22, boxShadow: T.shadow }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 16 }}>📆 Day-by-Day</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {weekDates.map((day) => {
            const dayTodos = todos.filter((t) => t.due === day);
            const doneTodos = dayTodos.filter((t) => t.done);
            const isToday = day === todayStr();
            const isPast = day < todayStr();
            const dayLabel = new Date(day + "T00:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
            return (
              <div key={day} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 14, background: isToday ? (dark ? "rgba(99,102,241,0.12)" : "#eef2ff") : "transparent", border: isToday ? `1.5px solid #6366f1` : `1px solid ${T.bord}` }}>
                <div style={{ width: 70, fontSize: 12, fontWeight: 700, color: isToday ? "#6366f1" : T.muted, flexShrink: 0 }}>{dayLabel}</div>
                {dayTodos.length === 0 ? (
                  <span style={{ fontSize: 12, color: T.muted }}>No tasks due</span>
                ) : (
                  <div style={{ flex: 1, display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {doneTodos.map((t) => <span key={t.id} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, background: dark ? "rgba(16,185,129,0.15)" : "#ecfdf5", color: "#10b981", fontWeight: 600, textDecoration: "line-through" }}>{t.text.slice(0, 20)}{t.text.length > 20 ? "…" : ""}</span>)}
                    {dayTodos.filter((t) => !t.done).map((t) => <span key={t.id} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, background: isPast ? (dark ? "rgba(244,63,94,0.15)" : "#fff1f2") : (dark ? "rgba(255,255,255,0.06)" : "#f5f3ff"), color: isPast ? "#f43f5e" : T.muted, fontWeight: 600 }}>{t.text.slice(0, 20)}{t.text.length > 20 ? "…" : ""}</span>)}
                  </div>
                )}
                {dayTodos.length > 0 && (
                  <div style={{ fontSize: 12, fontWeight: 800, color: doneTodos.length === dayTodos.length ? "#10b981" : T.muted, flexShrink: 0 }}>{doneTodos.length}/{dayTodos.length}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category summary */}
      {catBreakdown.length > 0 && (
        <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 24, border: `1px solid ${T.bord}`, padding: 22, boxShadow: T.shadow }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 14 }}>📁 Category Summary</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {catBreakdown.map(({ cat, done, missed }) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>{CAT_META[cat]?.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text, flex: 1 }}>{cat}</span>
                {done > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981", background: dark ? "rgba(16,185,129,0.15)" : "#ecfdf5", padding: "4px 10px", borderRadius: 99, border: "1px solid #a7f3d0" }}>✅ {done} done</span>}
                {missed > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#f43f5e", background: dark ? "rgba(244,63,94,0.15)" : "#fff1f2", padding: "4px 10px", borderRadius: 99, border: "1px solid #fecdd3" }}>❌ {missed} missed</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI-style insights */}
      <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 24, border: `1px solid ${T.bord}`, padding: 22, boxShadow: T.shadow }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 14 }}>💡 Weekly Insights</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {insights.map((ins, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 14, background: dark ? "rgba(255,255,255,0.03)" : "#fafafa", border: `1px solid ${T.bord}` }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{ins.icon}</span>
              <span style={{ fontSize: 13, color: T.text, fontWeight: 500, lineHeight: 1.5 }}>{ins.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next week prep */}
      <div style={{ background: `linear-gradient(135deg,${dark ? "rgba(99,102,241,0.15)" : "#eef2ff"},${dark ? "rgba(236,72,153,0.1)" : "#fdf2f8"})`, borderRadius: 24, border: `1.5px solid ${dark ? "rgba(99,102,241,0.25)" : "#c7d2fe"}`, padding: 22, boxShadow: T.shadow }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 8 }}>🚀 Looking Ahead</div>
        <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.7 }}>
          {todos.filter((t) => !t.done && t.due > weekEnd).length > 0
            ? `You have ${todos.filter((t) => !t.done && t.due > weekEnd).length} task${todos.filter((t) => !t.done && t.due > weekEnd).length > 1 ? "s" : ""} scheduled for next week. Stay focused and keep the momentum going! 💪`
            : "No upcoming tasks scheduled yet. Plan your next week to stay ahead of the game! 🗓️"
          }
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDY TRACKER
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// AI ASSISTANT — Smart Suggestions, Motivational Coach, Auto-Priority
// ─────────────────────────────────────────────────────────────────────────────
function AIAssistant({ todos, onAddTasks, dark }) {
  const [activeFeature, setActiveFeature] = useState("suggest"); // suggest | coach | priority
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [coachMsg, setCoachMsg] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [priorityInput, setPriorityInput] = useState("");
  const [priorityResult, setPriorityResult] = useState(null);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);

  const T = {
    card: dark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.9)",
    glass: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)",
    text: dark ? "#ede9fe" : "#1e1b4b",
    muted: dark ? "#9ca3af" : "#6b7280",
    bord: dark ? "rgba(139,92,246,0.15)" : "rgba(99,102,241,0.15)",
    inp: dark ? "rgba(255,255,255,0.07)" : "#fff",
    sub: "#7c3aed",
    shadow: dark ? "0 12px 40px rgba(0,0,0,0.5)" : "0 12px 40px rgba(99,102,241,0.12)",
  };

  const callClaude = async (prompt, systemPrompt) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    return data.content[0].text;
  };

  // ── FEATURE 1: Smart Task Suggestions ──
  const getSubtasks = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSelectedSubtasks([]);
    try {
      const text = await callClaude(
        `Break this goal into clear, actionable subtasks: "${input.trim()}"`,
        `You are a productivity assistant. When given a vague goal, break it into 4-7 specific, actionable subtasks.
Return ONLY a JSON array like this (no markdown, no explanation):
[
  {"text": "subtask description", "category": "Study", "priority": "High"},
  ...
]
Categories must be one of: Personal, Study, Work
Priorities must be one of: High, Medium, Low
Keep each subtask concise (under 60 chars). Return valid JSON only.`
      );
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setSelectedSubtasks(parsed.map((_, i) => i));
    } catch (e) {
      setError("Could not parse AI response. Try again.");
    }
    setLoading(false);
  };

  const addSelectedSubtasks = () => {
    if (!result) return;
    const tasksToAdd = result.filter((_, i) => selectedSubtasks.includes(i));
    onAddTasks(tasksToAdd);
    setResult(null);
    setInput("");
    setSelectedSubtasks([]);
  };

  const toggleSubtask = (i) => {
    setSelectedSubtasks((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  // ── FEATURE 2: Motivational Coach ──
  const getMotivation = async () => {
    setCoachLoading(true);
    setError("");
    setCoachMsg(null);
    try {
      const pending = todos.filter((t) => !t.done);
      const done = todos.filter((t) => t.done);
      const overdue = pending.filter((t) => t.due && t.due < new Date().toISOString().split("T")[0]);
      const highPri = pending.filter((t) => t.priority === "High");
      const prompt = `My task status today:
- Total tasks: ${todos.length}
- Completed: ${done.length}
- Pending: ${pending.length}
- Overdue: ${overdue.length}
- High priority pending: ${highPri.length}
- Top pending tasks: ${pending.slice(0, 3).map((t) => t.text).join(", ") || "none"}

Give me a personalized motivational pep talk!`;
      const msg = await callClaude(prompt,
        `You are an enthusiastic, warm productivity coach. Give a short (3-5 sentences) personalized motivational message based on the user's task data. Be specific, uplifting, and end with one concrete tip. Use 1-2 emojis naturally. Don't be generic.`
      );
      setCoachMsg(msg);
    } catch (e) {
      setError("Could not get motivation. Try again.");
    }
    setCoachLoading(false);
  };

  // ── FEATURE 3: Auto-Priority Suggester ──
  const getPriority = async () => {
    if (!priorityInput.trim()) return;
    setPriorityLoading(true);
    setError("");
    setPriorityResult(null);
    try {
      const text = await callClaude(
        `Analyze this task and suggest the best priority and category: "${priorityInput.trim()}"`,
        `You are a task management expert. Analyze a task description and suggest:
- priority: High, Medium, or Low
- category: Personal, Study, or Work
- reason: one sentence explaining why
- tip: one short actionable tip to complete this task

Return ONLY valid JSON like:
{"priority": "High", "category": "Work", "reason": "...", "tip": "..."}
No markdown, no explanation, just JSON.`
      );
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setPriorityResult(parsed);
    } catch (e) {
      setError("Could not analyze task. Try again.");
    }
    setPriorityLoading(false);
  };

  const PRI_COLORS = { High: "#f43f5e", Medium: "#f59e0b", Low: "#10b981" };
  const CAT_ICONS = { Personal: "🌸", Study: "📚", Work: "💼" };

  return (
    <div>
      {/* Feature Tabs */}
      <div style={{ display: "flex", gap: 6, background: dark ? "rgba(255,255,255,0.05)" : "#ede9fe", borderRadius: 16, padding: 4, marginBottom: 16 }}>
        {[
          { id: "suggest", label: "🧠 Task Splitter" },
          { id: "coach", label: "💪 Coach" },
          { id: "priority", label: "⚡ Auto-Priority" },
        ].map((f) => (
          <button key={f.id} onClick={() => { setActiveFeature(f.id); setError(""); setResult(null); setCoachMsg(null); setPriorityResult(null); }}
            style={{ flex: 1, padding: "10px 6px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.2s", whiteSpace: "nowrap", background: activeFeature === f.id ? "linear-gradient(135deg,#6366f1,#ec4899)" : "transparent", color: activeFeature === f.id ? "#fff" : T.muted, boxShadow: activeFeature === f.id ? "0 4px 14px rgba(99,102,241,0.35)" : "none" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* ── FEATURE 1: Smart Task Suggestions ── */}
      {activeFeature === "suggest" && (
        <div>
          <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 24, border: `1.5px solid ${T.bord}`, padding: 22, marginBottom: 14, boxShadow: T.shadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 6px 18px rgba(99,102,241,0.4)", flexShrink: 0 }}>🧠</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Smart Task Splitter</div>
                <div style={{ fontSize: 12, color: T.muted }}>Type a vague goal → Claude breaks it into subtasks</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Your Goal</div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && getSubtasks()}
              placeholder='e.g. "Prepare for my exam next week"'
              style={{ width: "100%", padding: "13px 16px", borderRadius: 14, border: `1.5px solid ${T.bord}`, background: T.inp, color: T.text, fontSize: 15, fontWeight: 500, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12 }}
            />
            <button onClick={getSubtasks} disabled={loading || !input.trim()}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: loading ? (dark ? "rgba(99,102,241,0.3)" : "#c7d2fe") : "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: loading || !input.trim() ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 6px 20px rgba(99,102,241,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? (
                <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Thinking...</>
              ) : "✨ Break Into Subtasks"}
            </button>
          </div>

          {result && (
            <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 24, border: "1.5px solid #6366f1", padding: 22, boxShadow: "0 12px 40px rgba(99,102,241,0.18)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>✅ {result.length} subtasks found</div>
                <div style={{ fontSize: 12, color: T.muted }}>{selectedSubtasks.length} selected</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {result.map((task, i) => {
                  const sel = selectedSubtasks.includes(i);
                  const pc = PRI_COLORS[task.priority] || "#6366f1";
                  const ci = CAT_ICONS[task.category] || "✨";
                  return (
                    <div key={i} onClick={() => toggleSubtask(i)}
                      style={{ padding: "12px 14px", borderRadius: 14, border: `1.5px solid ${sel ? "#6366f1" : T.bord}`, background: sel ? (dark ? "rgba(99,102,241,0.15)" : "#eef2ff") : T.glass, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${sel ? "#6366f1" : T.bord}`, background: sel ? "#6366f1" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                        {sel && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: T.text }}>{task.text}</div>
                      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, color: "#fff", background: `linear-gradient(135deg,${pc},${pc}99)` }}>{task.priority}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, color: T.muted, background: T.glass, border: `1px solid ${T.bord}` }}>{ci} {task.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setSelectedSubtasks(selectedSubtasks.length === result.length ? [] : result.map((_, i) => i))}
                  style={{ flex: 1, padding: "12px", borderRadius: 14, border: `1px solid ${T.bord}`, background: "transparent", color: T.muted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {selectedSubtasks.length === result.length ? "Deselect All" : "Select All"}
                </button>
                <button onClick={addSelectedSubtasks} disabled={selectedSubtasks.length === 0}
                  style={{ flex: 2, padding: "12px", borderRadius: 14, border: "none", background: selectedSubtasks.length === 0 ? (dark ? "rgba(99,102,241,0.2)" : "#c7d2fe") : "linear-gradient(135deg,#6366f1,#ec4899)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: selectedSubtasks.length === 0 ? "not-allowed" : "pointer", boxShadow: selectedSubtasks.length === 0 ? "none" : "0 6px 20px rgba(99,102,241,0.4)" }}>
                  ➕ Add {selectedSubtasks.length} Task{selectedSubtasks.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FEATURE 2: Motivational Coach ── */}
      {activeFeature === "coach" && (
        <div>
          <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 24, border: `1.5px solid ${T.bord}`, padding: 22, marginBottom: 14, boxShadow: T.shadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg,#f59e0b,#f43f5e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 6px 18px rgba(245,158,11,0.4)", flexShrink: 0 }}>💪</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Motivational Coach</div>
                <div style={{ fontSize: 12, color: T.muted }}>Claude reads your tasks and gives you a pep talk</div>
              </div>
            </div>
            {/* Quick stats for context */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                { n: todos.filter(t => t.done).length, l: "Done today", c: "#10b981", bg: dark ? "rgba(16,185,129,0.15)" : "#ecfdf5" },
                { n: todos.filter(t => !t.done).length, l: "Pending", c: "#f59e0b", bg: dark ? "rgba(245,158,11,0.15)" : "#fefce8" },
                { n: todos.filter(t => !t.done && t.priority === "High").length, l: "High Pri", c: "#f43f5e", bg: dark ? "rgba(244,63,94,0.15)" : "#fff1f2" },
              ].map(({ n, l, c, bg }) => (
                <div key={l} style={{ background: bg, borderRadius: 14, padding: "12px 8px", textAlign: "center", border: `1px solid ${c}22` }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: c, lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 4, fontWeight: 600, textTransform: "uppercase" }}>{l}</div>
                </div>
              ))}
            </div>
            <button onClick={getMotivation} disabled={coachLoading}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: coachLoading ? (dark ? "rgba(245,158,11,0.3)" : "#fde68a") : "linear-gradient(135deg,#f59e0b,#f43f5e)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: coachLoading ? "not-allowed" : "pointer", boxShadow: coachLoading ? "none" : "0 6px 20px rgba(245,158,11,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {coachLoading ? (
                <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Getting your pep talk...</>
              ) : "🎯 Motivate Me!"}
            </button>
          </div>

          {coachMsg && (
            <div style={{ background: dark ? "rgba(245,158,11,0.08)" : "#fffbeb", backdropFilter: "blur(20px)", borderRadius: 24, border: "1.5px solid #fbbf24", padding: 24, boxShadow: "0 12px 40px rgba(245,158,11,0.15)" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ fontSize: 32, flexShrink: 0 }}>🤖</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Your AI Coach Says</div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, color: T.text, fontWeight: 500 }}>{coachMsg}</div>
                </div>
              </div>
              <button onClick={getMotivation}
                style={{ marginTop: 16, width: "100%", padding: "11px", borderRadius: 12, border: "1.5px solid #fbbf24", background: "transparent", color: "#f59e0b", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                🔄 Get Another Pep Talk
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── FEATURE 3: Auto-Priority Suggester ── */}
      {activeFeature === "priority" && (
        <div>
          <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 24, border: `1.5px solid ${T.bord}`, padding: 22, marginBottom: 14, boxShadow: T.shadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg,#10b981,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 6px 18px rgba(16,185,129,0.4)", flexShrink: 0 }}>⚡</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Auto-Priority Suggester</div>
                <div style={{ fontSize: 12, color: T.muted }}>Describe a task → Claude suggests priority & category</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Task Description</div>
            <textarea
              value={priorityInput}
              onChange={(e) => setPriorityInput(e.target.value)}
              placeholder='e.g. "Submit assignment due tomorrow, 40% of my grade"'
              rows={3}
              style={{ width: "100%", padding: "13px 16px", borderRadius: 14, border: `1.5px solid ${T.bord}`, background: T.inp, color: T.text, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12, resize: "vertical", lineHeight: 1.6 }}
            />
            <button onClick={getPriority} disabled={priorityLoading || !priorityInput.trim()}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: priorityLoading ? (dark ? "rgba(16,185,129,0.3)" : "#a7f3d0") : "linear-gradient(135deg,#10b981,#6366f1)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: priorityLoading || !priorityInput.trim() ? "not-allowed" : "pointer", boxShadow: priorityLoading ? "none" : "0 6px 20px rgba(16,185,129,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {priorityLoading ? (
                <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Analyzing...</>
              ) : "🔍 Analyze Task"}
            </button>
          </div>

          {priorityResult && (
            <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 24, border: `1.5px solid ${PRI_COLORS[priorityResult.priority] || "#6366f1"}`, padding: 24, boxShadow: `0 12px 40px ${PRI_COLORS[priorityResult.priority] || "#6366f1"}22` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>AI Recommendation</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, background: dark ? `rgba(${priorityResult.priority === "High" ? "244,63,94" : priorityResult.priority === "Medium" ? "245,158,11" : "16,185,129"},0.15)` : `${PRI_COLORS[priorityResult.priority]}11`, borderRadius: 16, padding: "16px 14px", textAlign: "center", border: `1.5px solid ${PRI_COLORS[priorityResult.priority]}44` }}>
                  <div style={{ fontSize: 28 }}>{priorityResult.priority === "High" ? "🔴" : priorityResult.priority === "Medium" ? "🟡" : "🟢"}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: PRI_COLORS[priorityResult.priority], marginTop: 4 }}>{priorityResult.priority}</div>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Priority</div>
                </div>
                <div style={{ flex: 1, background: dark ? "rgba(99,102,241,0.15)" : "#eef2ff", borderRadius: 16, padding: "16px 14px", textAlign: "center", border: "1.5px solid #c7d2fe" }}>
                  <div style={{ fontSize: 28 }}>{CAT_ICONS[priorityResult.category] || "✨"}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#6366f1", marginTop: 4 }}>{priorityResult.category}</div>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Category</div>
                </div>
              </div>
              <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "#f9f8ff", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>💡 Why</div>
                <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>{priorityResult.reason}</div>
              </div>
              <div style={{ background: dark ? "rgba(16,185,129,0.08)" : "#ecfdf5", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>🚀 Pro Tip</div>
                <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>{priorityResult.tip}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 14, background: dark ? "rgba(244,63,94,0.1)" : "#fff1f2", border: "1px solid #fecdd3", color: "#f43f5e", fontSize: 13, fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function StudyTracker({ subjects, setSubjects, dark, showAddSubject, setShowAddSubject, subjectName, setSubjectName, subjectTotal, setSubjectTotal }) {
  const T = {
    card: dark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.9)",
    glass: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)",
    text: dark ? "#ede9fe" : "#1e1b4b",
    muted: dark ? "#6b7280" : "#9ca3af",
    bord: dark ? "rgba(139,92,246,0.15)" : "rgba(99,102,241,0.15)",
    inp: dark ? "rgba(255,255,255,0.07)" : "#fff",
    sub: "#7c3aed",
    shadow: dark ? "0 12px 40px rgba(0,0,0,0.5)" : "0 12px 40px rgba(99,102,241,0.12)",
  };
  const uid2 = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
  const addSubject = () => {
    const n = subjectName.trim(); const t = parseInt(subjectTotal);
    if (!n || !t || t < 1) return;
    setSubjects((p) => [...p, { id: uid2(), name: n, total: t, completed: 0 }]);
    setSubjectName(""); setSubjectTotal(""); setShowAddSubject(false);
  };
  const markTopic = (id, delta) => setSubjects((p) => p.map((s) => s.id !== id ? s : { ...s, completed: Math.min(s.total, Math.max(0, s.completed + delta)) }));
  const deleteSubject = (id) => setSubjects((p) => p.filter((s) => s.id !== id));
  const totalTopics = subjects.reduce((a, s) => a + s.total, 0);
  const doneTopics = subjects.reduce((a, s) => a + s.completed, 0);
  const overallPct = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;

  return (
    <div>
      {subjects.length > 0 && (
        <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 28, border: `1px solid ${T.bord}`, padding: 22, marginBottom: 16, boxShadow: T.shadow }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>📚 Overall Study Progress</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#6366f1" }}>{overallPct}%</span>
          </div>
          <div style={{ height: 10, background: dark ? "rgba(255,255,255,0.08)" : "#ede9fe", borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ height: "100%", borderRadius: 99, width: `${overallPct}%`, background: "linear-gradient(90deg,#6366f1,#a855f7,#10b981)", transition: "width 0.7s cubic-bezier(.4,0,.2,1)", boxShadow: "0 2px 8px rgba(99,102,241,0.4)" }} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {[{ v: doneTopics, l: "done", c: "#10b981", bg: dark ? "rgba(16,185,129,0.15)" : "#ecfdf5", bord: "#a7f3d0" }, { v: totalTopics, l: "total", c: "#6366f1", bg: dark ? "rgba(99,102,241,0.15)" : "#eef2ff", bord: "#c7d2fe" }, { v: totalTopics - doneTopics, l: "left", c: "#f59e0b", bg: dark ? "rgba(245,158,11,0.15)" : "#fefce8", bord: "#fde68a" }].map(({ v, l, c, bg, bord }) => (
              <span key={l} style={{ fontSize: 13, fontWeight: 700, color: c, background: bg, padding: "5px 14px", borderRadius: 99, border: `1px solid ${bord}` }}>{v} {l}</span>
            ))}
          </div>
        </div>
      )}
      <div style={{ background: T.card, backdropFilter: "blur(20px)", marginBottom: 14, border: `1.5px solid ${showAddSubject ? "#7c3aed" : T.bord}`, borderRadius: 24, overflow: "hidden", boxShadow: showAddSubject ? "0 12px 40px rgba(124,58,237,0.2)" : T.shadow, transition: "all 0.3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", cursor: "pointer" }} onClick={() => setShowAddSubject((s) => !s)}>
          <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg,#6366f1,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff", fontWeight: 700, boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>{showAddSubject ? "−" : "+"}</div>
          <span style={{ fontSize: 16, color: T.text, fontWeight: 500 }}>Add a new subject</span>
        </div>
        {showAddSubject && (
          <div style={{ padding: "4px 18px 18px", borderTop: `1px solid ${T.bord}` }}>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <div style={{ flex: 2 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Subject Name</div>
                <input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSubject()} placeholder="e.g. Mathematics" style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${T.bord}`, background: T.inp, color: T.text, fontSize: 14, fontWeight: 600, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Total Topics</div>
                <input value={subjectTotal} onChange={(e) => setSubjectTotal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSubject()} placeholder="10" type="number" min="1" style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${T.bord}`, background: T.inp, color: T.text, fontSize: 14, fontWeight: 600, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            </div>
            <button onClick={addSubject} style={{ marginTop: 12, width: "100%", padding: "13px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#6366f1,#10b981)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(99,102,241,0.35)" }}>📚 Add Subject</button>
          </div>
        )}
      </div>
      {subjects.length === 0 && (
        <div style={{ textAlign: "center", padding: "56px 24px", background: T.glass, backdropFilter: "blur(20px)", borderRadius: 24, border: `1px solid ${T.bord}` }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>📚</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>No subjects yet!</div>
          <div style={{ fontSize: 13, color: T.muted }}>Add your first subject above to start tracking</div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {subjects.map((s) => {
          const pct = s.total ? Math.round((s.completed / s.total) * 100) : 0;
          const isDone = s.completed === s.total;
          return (
            <div key={s.id} style={{ background: isDone ? dark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.06)" : T.card, backdropFilter: "blur(20px)", borderRadius: 20, border: `1.5px solid ${isDone ? "#10b981" : T.bord}`, padding: "18px 18px", boxShadow: T.shadow, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: isDone ? "linear-gradient(180deg,#10b981,#6366f1)" : "linear-gradient(180deg,#6366f1,#a855f7)", borderRadius: "20px 0 0 20px" }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, paddingLeft: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{isDone ? "✅" : "📖"} {s.name}</span>
                    {isDone && <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", background: dark ? "rgba(16,185,129,0.2)" : "#ecfdf5", padding: "2px 8px", borderRadius: 99, border: "1px solid #a7f3d0" }}>COMPLETED!</span>}
                  </div>
                  <div style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>{s.completed}/{s.total} topics · {pct}%</div>
                </div>
                <button onClick={() => deleteSubject(s.id)} style={{ width: 32, height: 32, borderRadius: 10, border: "1.5px solid #fecdd3", background: dark ? "rgba(244,63,94,0.1)" : "#fff1f2", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#f43f5e", flexShrink: 0 }}>🗑️</button>
              </div>
              <div style={{ height: 8, background: dark ? "rgba(255,255,255,0.08)" : "#ede9fe", borderRadius: 99, overflow: "hidden", marginBottom: 14, marginLeft: 8 }}>
                <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: isDone ? "linear-gradient(90deg,#10b981,#6366f1)" : "linear-gradient(90deg,#6366f1,#a855f7)", transition: "width 0.5s cubic-bezier(.4,0,.2,1)", boxShadow: "0 2px 6px rgba(99,102,241,0.35)" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 8 }}>
                <button onClick={() => markTopic(s.id, -1)} disabled={s.completed === 0} style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${T.bord}`, background: T.glass, cursor: s.completed === 0 ? "not-allowed" : "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: s.completed === 0 ? T.muted : "#f43f5e", opacity: s.completed === 0 ? 0.4 : 1 }}>−</button>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: isDone ? "#10b981" : "#6366f1", lineHeight: 1 }}>{s.completed}<span style={{ fontSize: 14, color: T.muted, fontWeight: 600 }}>/{s.total}</span></div>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>topics done</div>
                </div>
                <button onClick={() => markTopic(s.id, 1)} disabled={s.completed === s.total} style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${T.bord}`, background: s.completed === s.total ? T.glass : "linear-gradient(135deg,#6366f1,#10b981)", cursor: s.completed === s.total ? "not-allowed" : "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: s.completed === s.total ? T.muted : "#fff", opacity: s.completed === s.total ? 0.4 : 1, boxShadow: s.completed === s.total ? "none" : "0 4px 12px rgba(99,102,241,0.35)" }}>+</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function TodoApp() {
  const [currentUser, setCurrentUser] = useState(() => getSession());
  const [showProfile, setShowProfile] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("todo-dark") === "true");

  const todosKey = currentUser ? `todo-v6-${currentUser.id}` : "todo-v6";

  const [todos, setTodos] = useState(() => {
    if (!currentUser) return DEFAULTS;
    try { return JSON.parse(localStorage.getItem(`todo-v6-${currentUser.id}`)) || DEFAULTS; } catch { return DEFAULTS; }
  });
  const [input, setInput] = useState("");
  const [cat, setCat] = useState("Study");
  const [pri, setPri] = useState("Medium");
  const [due, setDue] = useState("");
  const [alarm, setAlarm] = useState("");
  const [voiceType, setVoiceType] = useState("male");
  const [filter, setFilter] = useState("All");
  const [priFilter, setPriFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editTodo, setEditTodo] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [ringing, setRinging] = useState([]);

  // Study tracker state
  const studyKey = currentUser ? `study-v1-${currentUser.id}` : "study-v1";
  const [subjects, setSubjects] = useState(() => {
    const key = currentUser ? `study-v1-${currentUser.id}` : "study-v1";
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  });
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [subjectTotal, setSubjectTotal] = useState("");

  // ★ NEW: Habit tracker state
  const habitKey = currentUser ? `habits-v1-${currentUser.id}` : "habits-v1";
  const [habits, setHabits] = useState(() => {
    const key = currentUser ? `habits-v1-${currentUser.id}` : "habits-v1";
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  });

  // Active tab — now includes 4 new tabs
  const [activeTab, setActiveTab] = useState("tasks");

  // Persist data
  useEffect(() => { localStorage.setItem(habitKey, JSON.stringify(habits)); }, [habits, habitKey]);
  useEffect(() => { localStorage.setItem(studyKey, JSON.stringify(subjects)); }, [subjects, studyKey]);
  useEffect(() => { localStorage.setItem(todosKey, JSON.stringify(todos)); }, [todos, todosKey]);
  useEffect(() => { localStorage.setItem("todo-dark", String(dark)); }, [dark]);

  // Reload on user change
  useEffect(() => {
    if (!currentUser) { setTodos(DEFAULTS); setSubjects([]); setHabits([]); return; }
    try { setTodos(JSON.parse(localStorage.getItem(`todo-v6-${currentUser.id}`)) || DEFAULTS); } catch { setTodos(DEFAULTS); }
    try { setSubjects(JSON.parse(localStorage.getItem(`study-v1-${currentUser.id}`)) || []); } catch { setSubjects([]); }
    try { setHabits(JSON.parse(localStorage.getItem(`habits-v1-${currentUser.id}`)) || []); } catch { setHabits([]); }
  }, [currentUser?.id]);

  // Auth handlers
  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => { clearSession(); setCurrentUser(null); setShowProfile(false); setRinging([]); window.speechSynthesis?.cancel(); };

  // Voice load
  useEffect(() => {
    if (window.speechSynthesis) {
      const load = () => { getBestVoice("male"); getBestVoice("female"); };
      window.speechSynthesis.getVoices().length ? load() : window.speechSynthesis.addEventListener("voiceschanged", load, { once: true });
    }
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
  }, []);

  // Alarm checker
  useEffect(() => {
    const check = () => {
      const now = nowTimeStr();
      setTodos((prev) => {
        let changed = false;
        const updated = prev.map((t) => {
          if (t.done || t.alarmFired || !t.alarm) return t;
          if (t.alarm === now) {
            changed = true;
            speakAlarm(t.text, t.voiceType || "male");
            setRinging((r) => [...r.filter((x) => x.id !== t.id), t]);
            if ("Notification" in window && Notification.permission === "granted") new Notification(`⏰ ${t.text}`, { body: t.text, icon: "/logo192.png" });
            return { ...t, alarmFired: true };
          }
          return t;
        });
        return changed ? updated : prev;
      });
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, []);

  const dismissAlarm = (id) => { window.speechSynthesis?.cancel(); setRinging((r) => r.filter((x) => x.id !== id)); };
  const snoozeAlarm = (id) => {
    window.speechSynthesis?.cancel();
    setRinging((r) => r.filter((x) => x.id !== id));
    const d = new Date(); d.setMinutes(d.getMinutes() + 5);
    const st = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
    setTodos((p) => p.map((t) => t.id === id ? { ...t, alarm: st, alarmFired: false } : t));
  };

  const addTodo = useCallback(() => {
    const t = input.trim(); if (!t) return;
    setTodos((p) => [{ id: uid(), text: t, category: cat, priority: pri, due, alarm, voiceType, alarmFired: false, done: false }, ...p]);
    setInput(""); setDue(""); setAlarm(""); setShowAdd(false);
  }, [input, cat, pri, due, alarm, voiceType]);

  const toggle = useCallback((id) => {
    let fired = false;
    setTodos((p) => p.map((t) => { if (t.id !== id) return t; if (!t.done) fired = true; return { ...t, done: !t.done }; }));
    if (fired) setConfetti(true);
  }, []);

  const remove = useCallback((id) => setTodos((p) => p.filter((t) => t.id !== id)), []);
  const saveEdit = (id, changes) => { setTodos((p) => p.map((t) => t.id === id ? { ...t, ...changes, alarmFired: false } : t)); setEditTodo(null); };

  const onDragStart = (id) => setDragId(id);
  const onDragOver = (e, id) => { e.preventDefault(); setDragOver(id); };
  const onDrop = (tid) => {
    if (!dragId || dragId === tid) { setDragId(null); setDragOver(null); return; }
    setTodos((p) => { const a = [...p], fi = a.findIndex((t) => t.id === dragId), ti = a.findIndex((t) => t.id === tid); const [item] = a.splice(fi, 1); a.splice(ti, 0, item); return a; });
    setDragId(null); setDragOver(null);
  };

  const visible = todos.filter((t) => {
    if (filter !== "All" && t.category !== filter) return false;
    if (priFilter !== "All" && t.priority !== priFilter) return false;
    if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const doneCnt = todos.filter((t) => t.done).length;
  const total = todos.length;
  const pct = total ? Math.round((doneCnt / total) * 100) : 0;
  const overdueCnt = todos.filter((t) => !t.done && t.due && t.due < todayStr()).length;
  const alarmCnt = todos.filter((t) => !t.done && t.alarm).length;

  const T = {
    bg: dark ? "#0b0b14" : "#f4f3ff",
    card: dark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.9)",
    glass: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)",
    text: dark ? "#ede9fe" : "#1e1b4b",
    sub: dark ? "#a78bfa" : "#7c3aed",
    muted: dark ? "#6b7280" : "#9ca3af",
    bord: dark ? "rgba(139,92,246,0.15)" : "rgba(99,102,241,0.15)",
    inp: dark ? "rgba(255,255,255,0.07)" : "#fff",
    shadow: dark ? "0 12px 40px rgba(0,0,0,0.5)" : "0 12px 40px rgba(99,102,241,0.12)",
  };

  if (!currentUser) return <AuthScreen onLogin={handleLogin} dark={dark} />;

  const initials = currentUser.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  // Tab config with new tabs
  const TABS = [
    { id: "tasks", label: "✅ Tasks" },
    { id: "ai", label: "🤖 AI Assistant" },
    { id: "pomodoro", label: "🍅 Pomodoro" },
    { id: "habits", label: "🔥 Habits" },
    { id: "analytics", label: "📊 Analytics" },
    { id: "weekly", label: "📋 Weekly" },
    { id: "study", label: "📚 Study" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI',system-ui,sans-serif", color: T.text, transition: "background 0.4s", position: "relative", overflowX: "hidden" }}>
      <Confetti active={confetti} onDone={() => setConfetti(false)} />
      <AlarmPopup alarms={ringing} onDismiss={dismissAlarm} onSnooze={snoozeAlarm} dark={dark} />
      {editTodo && <EditModal todo={editTodo} dark={dark} onSave={(changes) => saveEdit(editTodo.id, changes)} onClose={() => setEditTodo(null)} />}
      {showProfile && <ProfilePage user={currentUser} todos={todos} dark={dark} onLogout={handleLogout} onClose={() => setShowProfile(false)} />}

      {/* BG Orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {[{ top: "-15%", left: "-10%", s: 580, c: dark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.18)" }, { bottom: "-15%", right: "-10%", s: 500, c: dark ? "rgba(236,72,153,0.08)" : "rgba(236,72,153,0.12)" }, { top: "40%", right: "15%", s: 280, c: dark ? "rgba(56,189,248,0.07)" : "rgba(56,189,248,0.1)" }].map((o, i) => (
          <div key={i} style={{ position: "absolute", ...(o.top ? { top: o.top } : { bottom: o.bottom }), ...(o.left ? { left: o.left } : { right: o.right }), width: o.s, height: o.s, borderRadius: "50%", background: `radial-gradient(circle,${o.c},transparent 70%)` }} />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto", padding: "28px 16px 100px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", background: "linear-gradient(90deg,#6366f1,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>✦ TASK MANAGER ✦</div>
            <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0, letterSpacing: "-1.5px", lineHeight: 1, background: dark ? "linear-gradient(135deg,#c4b5fd,#f9a8d4)" : "linear-gradient(135deg,#4338ca,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {currentUser.name.split(" ")[0]}'s Workspace
            </h1>
            <p style={{ fontSize: 13, color: T.muted, margin: "6px 0 0", fontWeight: 500 }}>
              {doneCnt}/{total} done
              {overdueCnt > 0 && <span style={{ color: "#f43f5e", fontWeight: 700 }}> · {overdueCnt} overdue</span>}
              {alarmCnt > 0 && <span style={{ color: "#7c3aed", fontWeight: 700 }}> · {alarmCnt} 🔔</span>}
              {habits.filter((h) => h.completedDays.includes(todayStr())).length > 0 && <span style={{ color: "#f59e0b", fontWeight: 700 }}> · {habits.filter((h) => h.completedDays.includes(todayStr())).length} habits done 🔥</span>}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={() => setDark((d) => !d)} style={{ width: 46, height: 46, borderRadius: 15, border: `1px solid ${T.bord}`, background: T.glass, backdropFilter: "blur(12px)", cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: T.shadow }}>{dark ? "☀️" : "🌙"}</button>
            <button onClick={() => setShowProfile(true)} style={{ width: 46, height: 46, borderRadius: 15, border: "2px solid #7c3aed", background: "linear-gradient(135deg,#6366f1,#ec4899)", cursor: "pointer", fontSize: 14, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>{initials}</button>
          </div>
        </div>

        {/* PROGRESS */}
        <div style={{ background: T.card, backdropFilter: "blur(20px)", borderRadius: 28, border: `1px solid ${T.bord}`, padding: 22, marginBottom: 16, boxShadow: T.shadow }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Overall Progress</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#6366f1" }}>{pct}%</span>
          </div>
          <div style={{ height: 10, background: dark ? "rgba(255,255,255,0.08)" : "#ede9fe", borderRadius: 99, overflow: "hidden", marginBottom: 18 }}>
            <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: "linear-gradient(90deg,#6366f1,#a855f7,#ec4899,#f59e0b)", transition: "width 0.7s cubic-bezier(.4,0,.2,1)", boxShadow: "0 2px 8px rgba(99,102,241,0.4)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
            {[{ n: total, l: "Total", c: "#6366f1", bg: dark ? "rgba(99,102,241,0.2)" : "#eef2ff" }, { n: doneCnt, l: "Done", c: "#10b981", bg: dark ? "rgba(16,185,129,0.2)" : "#ecfdf5" }, { n: total - doneCnt, l: "Left", c: "#f59e0b", bg: dark ? "rgba(245,158,11,0.2)" : "#fefce8" }, { n: overdueCnt, l: "Overdue", c: "#f43f5e", bg: dark ? "rgba(244,63,94,0.2)" : "#fff1f2" }, { n: alarmCnt, l: "Alarms", c: "#a855f7", bg: dark ? "rgba(168,85,247,0.2)" : "#faf5ff" }].map(({ n, l, c, bg: sb }) => (
              <div key={l} style={{ background: sb, borderRadius: 16, padding: "12px 6px", textAlign: "center", border: `1px solid ${c}22` }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: c, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TAB SWITCHER — scrollable for 6 tabs */}
        <div style={{ overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
          <div style={{ display: "flex", gap: 6, background: dark ? "rgba(255,255,255,0.05)" : "#ede9fe", borderRadius: 16, padding: 4, minWidth: "max-content" }}>
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "10px 16px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.2s", whiteSpace: "nowrap", background: activeTab === tab.id ? "linear-gradient(135deg,#6366f1,#ec4899)" : "transparent", color: activeTab === tab.id ? "#fff" : T.muted, boxShadow: activeTab === tab.id ? "0 4px 14px rgba(99,102,241,0.35)" : "none" }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── TAB CONTENT ─── */}

        {/* POMODORO TAB */}
        {activeTab === "pomodoro" && <PomodoroTimer todos={todos} dark={dark} />}

        {/* AI ASSISTANT TAB */}
        {activeTab === "ai" && (
          <AIAssistant
            todos={todos}
            dark={dark}
            onAddTasks={(tasks) => {
              const uid2 = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
              const newTasks = tasks.map((t) => ({
                id: uid2(),
                text: t.text,
                category: t.category || "Personal",
                priority: t.priority || "Medium",
                due: "",
                alarm: "",
                voiceType: "male",
                alarmFired: false,
                done: false,
              }));
              setTodos((prev) => [...newTasks, ...prev]);
              setActiveTab("tasks");
            }}
          />
        )}

        {/* HABITS TAB */}
        {activeTab === "habits" && <HabitTracker habits={habits} setHabits={setHabits} dark={dark} />}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && <AnalyticsDashboard todos={todos} dark={dark} />}

        {/* WEEKLY REVIEW TAB */}
        {activeTab === "weekly" && <WeeklyReview todos={todos} dark={dark} />}

        {/* STUDY TAB */}
        {activeTab === "study" && (
          <StudyTracker subjects={subjects} setSubjects={setSubjects} dark={dark} showAddSubject={showAddSubject} setShowAddSubject={setShowAddSubject} subjectName={subjectName} setSubjectName={setSubjectName} subjectTotal={subjectTotal} setSubjectTotal={setSubjectTotal} />
        )}

        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <>
            {/* SEARCH */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.glass, backdropFilter: "blur(20px)", border: `1px solid ${T.bord}`, borderRadius: 18, padding: "11px 16px", marginBottom: 12, boxShadow: T.shadow }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔍</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: T.text, fontFamily: "inherit" }} />
              {search && <button onClick={() => setSearch("")} style={{ background: "transparent", border: "none", color: T.muted, cursor: "pointer", fontSize: 15, padding: 0 }}>✕</button>}
            </div>

            {/* FILTERS */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
              {CATEGORIES.map((c2) => {
                const a = filter === c2; const m = CAT_META[c2];
                return (
                  <button key={c2} onClick={() => setFilter(c2)} style={{ padding: "9px 18px", borderRadius: 14, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.2s", background: a ? m ? m.gradient : "linear-gradient(135deg,#6366f1,#818cf8)" : T.glass, color: a ? "#fff" : T.muted, backdropFilter: "blur(10px)", boxShadow: a ? `0 4px 16px ${m ? m.glow : "rgba(99,102,241,0.3)"}` : "none", transform: a ? "translateY(-2px)" : "none" }}>
                    {m ? `${m.icon} ${c2}` : `✨ ${c2}`}
                  </button>
                );
              })}
              <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                {PRIORITIES.map((p2) => {
                  const a = priFilter === p2; const m = PRI_META[p2];
                  return (
                    <button key={p2} onClick={() => setPriFilter(priFilter === p2 ? "All" : p2)} style={{ padding: "7px 12px", borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: 700, border: `1.5px solid ${a ? m.color : T.bord}`, background: a ? m.bg : T.glass, color: a ? m.color : T.muted, backdropFilter: "blur(10px)" }}>
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ADD TASK */}
            <div style={{ background: T.card, backdropFilter: "blur(20px)", marginBottom: 14, border: `1.5px solid ${showAdd ? "#7c3aed" : T.bord}`, borderRadius: 24, overflow: "hidden", boxShadow: showAdd ? "0 12px 40px rgba(124,58,237,0.2)" : T.shadow, transition: "all 0.3s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px" }}>
                <div onClick={() => setShowAdd((s) => !s)} style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, cursor: "pointer", background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 700, lineHeight: 1, boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>
                  {showAdd ? "−" : "+"}
                </div>
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTodo()} onFocus={() => setShowAdd(true)} placeholder="What do you need to do?" style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 16, color: T.text, fontFamily: "inherit", fontWeight: 500 }} />
                {input && <button onClick={addTodo} style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)", border: "none", borderRadius: 12, padding: "9px 18px", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>Add ↵</button>}
              </div>
              {showAdd && (
                <div style={{ padding: "4px 18px 18px", borderTop: `1px solid ${T.bord}` }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14, marginBottom: 14 }}>
                    {[{ label: "📁 Category", val: cat, set: setCat, opts: CATEGORIES.filter((x) => x !== "All") }, { label: "⚡ Priority", val: pri, set: setPri, opts: PRIORITIES }].map((s, i) => (
                      <div key={i} style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, letterSpacing: 0.5 }}>{s.label}</div>
                        <select value={s.val} onChange={(e) => s.set(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${T.bord}`, background: T.inp, color: T.text, fontSize: 13, fontWeight: 600, outline: "none", fontFamily: "inherit" }}>
                          {s.opts.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                    <div style={{ flex: 1, minWidth: 130 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, letterSpacing: 0.5 }}>📅 Due Date</div>
                      <input type="date" value={due} onChange={(e) => setDue(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${T.bord}`, background: T.inp, color: T.text, fontSize: 13, fontWeight: 600, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                    </div>
                  </div>
                  <div style={{ background: dark ? "rgba(124,58,237,0.1)" : "#faf5ff", border: `1.5px solid ${dark ? "rgba(124,58,237,0.25)" : "#ddd6fe"}`, borderRadius: 18, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}>🔔</div>
                      <div><div style={{ fontSize: 14, fontWeight: 800, color: "#7c3aed" }}>Voice Alarm</div><div style={{ fontSize: 11, color: T.muted }}>Speaks your task name at set time</div></div>
                    </div>
                    <input type="time" value={alarm} onChange={(e) => setAlarm(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 14, boxSizing: "border-box", marginBottom: 12, border: `2px solid ${alarm ? "#7c3aed" : T.bord}`, background: T.inp, color: T.text, fontSize: 18, fontWeight: 800, outline: "none", fontFamily: "inherit", letterSpacing: 2 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      {[{ val: "male", icon: "👨", label: "Male", color: "#3b82f6", bg: dark ? "rgba(59,130,246,0.15)" : "#eff6ff" }, { val: "female", icon: "👩", label: "Female", color: "#ec4899", bg: dark ? "rgba(236,72,153,0.15)" : "#fdf2f8" }].map((v) => (
                        <button key={v.val} onClick={() => setVoiceType(v.val)} style={{ flex: 1, padding: "10px 8px", borderRadius: 12, cursor: "pointer", border: `2px solid ${voiceType === v.val ? v.color : T.bord}`, background: voiceType === v.val ? v.bg : dark ? "transparent" : "#fafafa", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <span style={{ fontSize: 18 }}>{v.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: voiceType === v.val ? v.color : T.muted }}>{v.label}</span>
                        </button>
                      ))}
                    </div>
                    {alarm && <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: dark ? "rgba(124,58,237,0.12)" : "#ede9fe", fontSize: 13, color: "#7c3aed", fontWeight: 600 }}>🔊 At <strong>{alarm}</strong> — will speak: <em>"{input || "your task"}"</em></div>}
                    {input && <button onClick={() => speakAlarm(input, voiceType)} style={{ marginTop: 10, width: "100%", padding: "11px", borderRadius: 12, border: "2px solid #7c3aed", background: "transparent", color: "#7c3aed", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🔊 Test Voice Now</button>}
                  </div>
                </div>
              )}
            </div>

            {/* TASK LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {visible.length === 0 && (
                <div style={{ textAlign: "center", padding: "56px 24px", background: T.glass, backdropFilter: "blur(20px)", borderRadius: 24, border: `1px solid ${T.bord}` }}>
                  <div style={{ fontSize: 52, marginBottom: 14 }}>✨</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>{search ? `No tasks matching "${search}"` : "You're all caught up!"}</div>
                  <div style={{ fontSize: 13, color: T.muted }}>Add your first task above</div>
                </div>
              )}
              {visible.map((todo) => {
                const cm = CAT_META[todo.category]; const pm = PRI_META[todo.priority];
                const isOverdue = !todo.done && todo.due && todo.due < todayStr();
                const isDragTarget = dragOver === todo.id;
                const hasAlarm = !todo.done && todo.alarm;
                const isFemale = todo.voiceType === "female";
                return (
                  <div key={todo.id} draggable onDragStart={() => onDragStart(todo.id)} onDragOver={(e) => onDragOver(e, todo.id)} onDrop={() => onDrop(todo.id)} onDragEnd={() => { setDragId(null); setDragOver(null); }}
                    style={{ background: todo.done ? dark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)" : T.card, backdropFilter: "blur(20px)", borderRadius: 20, border: `1.5px solid ${isDragTarget ? "#6366f1" : hasAlarm ? "rgba(124,58,237,0.4)" : T.bord}`, padding: "15px 16px", display: "flex", alignItems: "flex-start", gap: 12, opacity: dragId === todo.id ? 0.3 : 1, transform: isDragTarget ? "scale(1.02)" : "scale(1)", transition: "all 0.2s ease", boxShadow: hasAlarm ? dark ? "0 6px 28px rgba(124,58,237,0.22)" : "0 6px 28px rgba(124,58,237,0.14)" : todo.done ? "none" : T.shadow, cursor: "grab", position: "relative", overflow: "hidden" }}>
                    {!todo.done && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: hasAlarm ? "linear-gradient(180deg,#7c3aed,#a855f7)" : cm ? cm.gradient : "linear-gradient(#6366f1,#ec4899)", borderRadius: "20px 0 0 20px" }} />}
                    <span style={{ color: T.muted, fontSize: 15, marginTop: 2, cursor: "grab", userSelect: "none", flexShrink: 0, paddingLeft: 6 }}>⠿</span>
                    <div onClick={() => toggle(todo.id)} style={{ width: 24, height: 24, borderRadius: 9, flexShrink: 0, border: todo.done ? "none" : `2px solid ${dark ? "rgba(255,255,255,0.2)" : "#c4b5fd"}`, background: todo.done ? "linear-gradient(135deg,#6366f1,#ec4899)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", boxShadow: todo.done ? "0 3px 10px rgba(99,102,241,0.45)" : "none", marginTop: 0 }}>
                      {todo.done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, wordBreak: "break-word", color: todo.done ? T.muted : T.text, textDecoration: todo.done ? "line-through" : "none", opacity: todo.done ? 0.6 : 1 }}>{todo.text}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, color: "#fff", background: cm ? cm.gradient : "linear-gradient(135deg,#6366f1,#818cf8)", boxShadow: cm ? `0 2px 8px ${cm.glow}` : "none" }}>{cm ? cm.icon : "✨"} {todo.category}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, color: pm.color, background: pm.bg, border: `1px solid ${pm.border}` }}>{pm.label}</span>
                        {todo.due && <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, fontWeight: 600, background: isOverdue ? "#fff1f2" : dark ? "rgba(255,255,255,0.07)" : "#f5f3ff", color: isOverdue ? "#f43f5e" : T.muted, border: `1px solid ${isOverdue ? "#fecdd3" : T.bord}` }}>📅 {todo.due}</span>}
                        {todo.alarm && !todo.done && (
                          <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, fontWeight: 700, background: dark ? "rgba(124,58,237,0.18)" : "#faf5ff", color: "#7c3aed", border: "1.5px solid #ddd6fe", display: "flex", alignItems: "center", gap: 5 }}>
                            {isFemale ? "👩" : "👨"} 🔔 {todo.alarm}
                            <span onClick={(e) => { e.stopPropagation(); speakAlarm(todo.text, todo.voiceType || "male"); }} style={{ background: "#7c3aed", color: "#fff", borderRadius: 6, padding: "1px 6px", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>🔊</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                      <button onClick={() => setEditTodo(todo)} style={{ width: 34, height: 34, borderRadius: 11, border: `1px solid ${T.bord}`, background: T.glass, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, backdropFilter: "blur(10px)" }}>✏️</button>
                      <button onClick={() => remove(todo.id)} style={{ width: 34, height: 34, borderRadius: 11, border: "1.5px solid #fecdd3", background: dark ? "rgba(244,63,94,0.1)" : "#fff1f2", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#f43f5e" }}>🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {todos.some((t) => t.done) && (
              <button onClick={() => setTodos((p) => p.filter((t) => !t.done))} style={{ width: "100%", marginTop: 14, padding: "13px", background: T.glass, backdropFilter: "blur(10px)", border: `1.5px dashed ${T.bord}`, borderRadius: 16, color: T.muted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                🗑️ Clear {todos.filter((t) => t.done).length} completed tasks
              </button>
            )}

            <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: T.muted, opacity: 0.5, lineHeight: 1.8 }}>
              ✏️ click edit to change anything · 🔔 voice alarm · ⠿ drag · ✓ for confetti 🎊
            </div>
          </>
        )}
      </div>
    </div>
  );
}