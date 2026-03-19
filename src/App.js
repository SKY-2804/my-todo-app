import { useState, useEffect, useRef, useCallback } from "react";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const todayStr = () => new Date().toISOString().split("T")[0];
const nowTimeStr = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};

const CATEGORIES = ["All", "Personal", "Study", "Work"];
const PRIORITIES  = ["High", "Medium", "Low"];

const CAT_META = {
  Personal: { icon:"🌸", gradient:"linear-gradient(135deg,#f472b6,#ec4899)", light:"#fdf2f8", text:"#9d174d" },
  Study:    { icon:"📚", gradient:"linear-gradient(135deg,#818cf8,#6366f1)", light:"#eef2ff", text:"#3730a3" },
  Work:     { icon:"💼", gradient:"linear-gradient(135deg,#38bdf8,#0ea5e9)", light:"#f0f9ff", text:"#0c4a6e" },
};
const PRI_META = {
  High:   { color:"#ef4444", bg:"#fef2f2", label:"🔴 High" },
  Medium: { color:"#f59e0b", bg:"#fffbeb", label:"🟡 Medium" },
  Low:    { color:"#22c55e", bg:"#f0fdf4", label:"🟢 Low" },
};

const DEFAULTS = [
  { id:"d1", text:"Complete DSA assignment", category:"Study",    priority:"High",   due:todayStr(), alarm:"09:00", alarmFired:false, done:false },
  { id:"d2", text:"Team standup meeting",    category:"Work",     priority:"Medium", due:"",         alarm:"10:30", alarmFired:false, done:false },
  { id:"d3", text:"Call mom",                category:"Personal", priority:"Low",    due:"",         alarm:"18:00", alarmFired:false, done:false },
];

// ── Confetti ──────────────────────────────────────────────────────────────────
function Confetti({ active, onDone }) {
  const ref = useRef(null);
  const cb  = useRef(onDone);
  cb.current = onDone;
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const cols = ["#6366f1","#ec4899","#f59e0b","#22c55e","#38bdf8","#a855f7","#f43f5e"];
    const pieces = Array.from({length:150},()=>({
      x:Math.random()*canvas.width, y:-20,
      w:6+Math.random()*10, h:3+Math.random()*7,
      color:cols[Math.floor(Math.random()*cols.length)],
      vx:(Math.random()-.5)*5, vy:2+Math.random()*6,
      angle:Math.random()*360, va:(Math.random()-.5)*10,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      let done = true;
      pieces.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.angle+=p.va;
        if(p.y<canvas.height+20) done=false;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.angle*Math.PI/180);
        ctx.fillStyle=p.color; ctx.globalAlpha=Math.max(0,1-p.y/canvas.height);
        ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
      });
      if(done){cb.current();return;} raf=requestAnimationFrame(draw);
    };
    draw();
    const t=setTimeout(()=>cb.current(),4000);
    return()=>{cancelAnimationFrame(raf);clearTimeout(t);};
  },[active]);
  if(!active) return null;
  return <canvas ref={ref} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999}}/>;
}

// ── Alarm Bell Sound (Web Audio API) ─────────────────────────────────────────
function playAlarmSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const ring = (freq, start, dur) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    // Ring ring ring pattern
    ring(880, 0.0,  0.2);
    ring(880, 0.25, 0.2);
    ring(880, 0.5,  0.2);
    ring(1100,0.8,  0.3);
    ring(880, 1.2,  0.2);
    ring(880, 1.45, 0.2);
    ring(1100,1.7,  0.4);
  } catch(e) { console.log("Audio not supported"); }
}

// ── Alarm Notification Popup ──────────────────────────────────────────────────
function AlarmPopup({ alarms, onDismiss, onSnooze, dark }) {
  if (!alarms.length) return null;
  const todo = alarms[0];
  const cm   = CAT_META[todo.category];
  return (
    <div style={{
      position:"fixed", top:24, left:"50%", transform:"translateX(-50%)",
      zIndex:10000, width:"min(420px, calc(100vw - 32px))",
    }}>
      <div style={{
        background: dark ? "rgba(15,15,25,0.98)" : "#fff",
        border:`2px solid #6366f1`,
        borderRadius:24, padding:24,
        boxShadow:"0 20px 60px rgba(99,102,241,0.4), 0 0 0 4px rgba(99,102,241,0.1)",
        animation:"alarmPop 0.4s cubic-bezier(.34,1.56,.64,1)",
      }}>
        {/* Pulsing bell */}
        <div style={{textAlign:"center", marginBottom:16}}>
          <div style={{
            width:64, height:64, borderRadius:"50%", margin:"0 auto 12px",
            background:"linear-gradient(135deg,#6366f1,#ec4899)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:28, animation:"alarmBell 0.5s ease-in-out infinite alternate",
            boxShadow:"0 8px 24px rgba(99,102,241,0.5)",
          }}>🔔</div>
          <div style={{
            fontSize:12, fontWeight:700, letterSpacing:3, textTransform:"uppercase",
            background:"linear-gradient(135deg,#6366f1,#ec4899)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            marginBottom:6,
          }}>⏰ TIME REMINDER</div>
          <div style={{
            fontSize:20, fontWeight:800,
            color: dark ? "#f1f0fb" : "#1e1b4b",
            lineHeight:1.3, marginBottom:8,
          }}>
            {todo.text}
          </div>
          <span style={{
            fontSize:12, fontWeight:700, padding:"4px 12px",
            borderRadius:99, color:"#fff",
            background: cm ? cm.gradient : "linear-gradient(135deg,#6366f1,#818cf8)",
          }}>
            {cm ? cm.icon : "✨"} {todo.category}
          </span>
          {todo.alarm && (
            <div style={{marginTop:10, fontSize:14, color: dark?"#9ca3af":"#6b7280", fontWeight:600}}>
              Scheduled for {todo.alarm}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{display:"flex", gap:10, marginTop:4}}>
          <button onClick={() => onSnooze(todo.id)} style={{
            flex:1, padding:"11px", borderRadius:12,
            border:`1px solid ${dark?"rgba(255,255,255,0.1)":"#e0e7ff"}`,
            background: dark?"rgba(255,255,255,0.05)":"#f8faff",
            color: dark?"#a5b4fc":"#6366f1",
            fontSize:13, fontWeight:700, cursor:"pointer",
          }}>
            😴 Snooze 5 min
          </button>
          <button onClick={() => onDismiss(todo.id)} style={{
            flex:1, padding:"11px", borderRadius:12, border:"none",
            background:"linear-gradient(135deg,#6366f1,#ec4899)",
            color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer",
            boxShadow:"0 4px 15px rgba(99,102,241,0.4)",
          }}>
            ✅ Got it!
          </button>
        </div>
      </div>
      <style>{`
        @keyframes alarmPop { from{opacity:0;transform:translateY(-20px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes alarmBell { from{transform:rotate(-15deg)} to{transform:rotate(15deg)} }
      `}</style>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function TodoApp() {
  const [dark,      setDark]      = useState(()=>localStorage.getItem("todo-dark")==="true");
  const [todos,     setTodos]     = useState(()=>{
    try{ return JSON.parse(localStorage.getItem("todo-v3"))||DEFAULTS; }catch{return DEFAULTS;}
  });
  const [input,     setInput]     = useState("");
  const [cat,       setCat]       = useState("Study");
  const [pri,       setPri]       = useState("Medium");
  const [due,       setDue]       = useState("");
  const [alarm,     setAlarm]     = useState("");
  const [filter,    setFilter]    = useState("All");
  const [priFilter, setPriFilter] = useState("All");
  const [search,    setSearch]    = useState("");
  const [editId,    setEditId]    = useState(null);
  const [editText,  setEditText]  = useState("");
  const [confetti,  setConfetti]  = useState(false);
  const [dragId,    setDragId]    = useState(null);
  const [dragOver,  setDragOver]  = useState(null);
  const [showAdd,   setShowAdd]   = useState(false);
  const [ringing,   setRinging]   = useState([]);

  // persist
  useEffect(()=>{ localStorage.setItem("todo-v3",JSON.stringify(todos)); },[todos]);
  useEffect(()=>{ localStorage.setItem("todo-dark",String(dark)); },[dark]);

  // ── Alarm checker — runs every 30 seconds ──────────────────────────────────
  useEffect(()=>{
    const check = () => {
      const now = nowTimeStr();
      setTodos(prev => {
        let changed = false;
        const updated = prev.map(t => {
          if (t.done || t.alarmFired || !t.alarm) return t;
          if (t.alarm === now) {
            changed = true;
            setRinging(r => [...r.filter(x=>x.id!==t.id), t]);
            playAlarmSound();
            // Request browser notification permission + show notification
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`⏰ Reminder: ${t.text}`, {
                body: `Time for your ${t.category} task!`,
                icon: "/logo192.png",
              });
            }
            return { ...t, alarmFired: true };
          }
          return t;
        });
        return changed ? updated : prev;
      });
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  },[]);

  // Request notification permission on mount
  useEffect(()=>{
    if("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  },[]);

  const dismissAlarm = (id) => setRinging(r => r.filter(x => x.id !== id));
  const snoozeAlarm  = (id) => {
    setRinging(r => r.filter(x => x.id !== id));
    // Snooze = reset alarm 5 minutes from now
    const d = new Date(); d.setMinutes(d.getMinutes() + 5);
    const snoozeTime = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
    setTodos(prev => prev.map(t => t.id === id
      ? { ...t, alarm: snoozeTime, alarmFired: false }
      : t
    ));
  };

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const addTodo = useCallback(()=>{
    const t = input.trim();
    if(!t) return;
    setTodos(p=>[{id:uid(),text:t,category:cat,priority:pri,due,alarm,alarmFired:false,done:false},...p]);
    setInput(""); setDue(""); setAlarm(""); setShowAdd(false);
  },[input,cat,pri,due,alarm]);

  const toggle = useCallback((id)=>{
    let fired=false;
    setTodos(p=>p.map(t=>{if(t.id!==id)return t;if(!t.done)fired=true;return{...t,done:!t.done};}));
    if(fired) setConfetti(true);
  },[]);

  const remove    = useCallback((id)=>setTodos(p=>p.filter(t=>t.id!==id)),[]);
  const startEdit = useCallback((t)=>{setEditId(t.id);setEditText(t.text);},[]);
  const saveEdit  = useCallback((id)=>{
    const v=editText.trim();
    if(v) setTodos(p=>p.map(t=>t.id===id?{...t,text:v}:t));
    setEditId(null);
  },[editText]);

  const onDragStart = (id)=>setDragId(id);
  const onDragOver  = (e,id)=>{ e.preventDefault(); setDragOver(id); };
  const onDrop      = (targetId)=>{
    if(!dragId||dragId===targetId){setDragId(null);setDragOver(null);return;}
    setTodos(p=>{
      const a=[...p],fi=a.findIndex(t=>t.id===dragId),ti=a.findIndex(t=>t.id===targetId);
      const[item]=a.splice(fi,1);a.splice(ti,0,item);return a;
    });
    setDragId(null);setDragOver(null);
  };

  const visible = todos.filter(t=>{
    if(filter!=="All"&&t.category!==filter) return false;
    if(priFilter!=="All"&&t.priority!==priFilter) return false;
    if(search&&!t.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const doneCnt    = todos.filter(t=>t.done).length;
  const total      = todos.length;
  const pct        = total ? Math.round((doneCnt/total)*100) : 0;
  const overdueCnt = todos.filter(t=>!t.done&&t.due&&t.due<todayStr()).length;
  const alarmCnt   = todos.filter(t=>!t.done&&t.alarm).length;

  // theme
  const bg      = dark?"#0d0d14":"#f5f3ff";
  const card    = dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.85)";
  const glass   = dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.7)";
  const text    = dark?"#f1f0fb":"#1e1b4b";
  const muted   = dark?"#6b7280":"#9ca3af";
  const bord    = dark?"rgba(255,255,255,0.08)":"rgba(99,102,241,0.12)";
  const inputBg = dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.9)";

  return (
    <div style={{minHeight:"100vh",background:bg,fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",
      color:text,transition:"all 0.4s ease",position:"relative",overflowX:"hidden"}}>

      <Confetti active={confetti} onDone={()=>setConfetti(false)}/>
      <AlarmPopup alarms={ringing} onDismiss={dismissAlarm} onSnooze={snoozeAlarm} dark={dark}/>

      {/* BG Orbs */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-20%",left:"-10%",width:600,height:600,borderRadius:"50%",
          background:dark?"radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%)":"radial-gradient(circle,rgba(99,102,241,0.2),transparent 70%)"}}/>
        <div style={{position:"absolute",bottom:"-20%",right:"-10%",width:500,height:500,borderRadius:"50%",
          background:dark?"radial-gradient(circle,rgba(236,72,153,0.1),transparent 70%)":"radial-gradient(circle,rgba(236,72,153,0.15),transparent 70%)"}}/>
        <div style={{position:"absolute",top:"40%",right:"20%",width:300,height:300,borderRadius:"50%",
          background:dark?"radial-gradient(circle,rgba(56,189,248,0.08),transparent 70%)":"radial-gradient(circle,rgba(56,189,248,0.12),transparent 70%)"}}/>
      </div>

      <div style={{position:"relative",zIndex:1,maxWidth:620,margin:"0 auto",padding:"32px 16px 80px"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,letterSpacing:3,textTransform:"uppercase",
              background:"linear-gradient(135deg,#6366f1,#ec4899)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:6}}>
              TASK MANAGER
            </div>
            <h1 style={{fontSize:32,fontWeight:800,margin:0,letterSpacing:"-1px",
              background:dark?"linear-gradient(135deg,#e0e7ff,#f5d0fe)":"linear-gradient(135deg,#4338ca,#7c3aed)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              My Workspace
            </h1>
            <div style={{fontSize:13,color:muted,marginTop:4}}>
              {doneCnt}/{total} complete
              {overdueCnt>0 && <span style={{color:"#f43f5e",fontWeight:600}}> · {overdueCnt} overdue</span>}
              {alarmCnt>0  && <span style={{color:"#6366f1",fontWeight:600}}> · {alarmCnt} 🔔</span>}
            </div>
          </div>
          <button onClick={()=>setDark(d=>!d)} style={{
            width:44,height:44,borderRadius:14,border:`1px solid ${bord}`,
            background:glass,backdropFilter:"blur(10px)",cursor:"pointer",fontSize:20,
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:dark?"0 4px 20px rgba(0,0,0,0.3)":"0 4px 20px rgba(99,102,241,0.15)",
          }}>{dark?"☀️":"🌙"}</button>
        </div>

        {/* Stats */}
        <div style={{background:card,backdropFilter:"blur(20px)",borderRadius:24,border:`1px solid ${bord}`,
          padding:20,marginBottom:20,boxShadow:dark?"0 8px 32px rgba(0,0,0,0.4)":"0 8px 32px rgba(99,102,241,0.1)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:600,color:text}}>Overall Progress</span>
                <span style={{fontSize:13,fontWeight:700,color:"#6366f1"}}>{pct}%</span>
              </div>
              <div style={{height:8,background:dark?"rgba(255,255,255,0.08)":"#e0e7ff",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:99,width:`${pct}%`,
                  background:"linear-gradient(90deg,#6366f1,#ec4899,#f59e0b)",
                  transition:"width 0.6s cubic-bezier(.4,0,.2,1)"}}/>
              </div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:8}}>
            {[
              {n:total,       l:"Total",   c:"#6366f1", bg:dark?"rgba(99,102,241,0.15)":"#eef2ff"},
              {n:doneCnt,     l:"Done",    c:"#22c55e", bg:dark?"rgba(34,197,94,0.15)":"#f0fdf4"},
              {n:total-doneCnt,l:"Left",  c:"#f59e0b", bg:dark?"rgba(245,158,11,0.15)":"#fffbeb"},
              {n:overdueCnt,  l:"Overdue", c:"#f43f5e", bg:dark?"rgba(244,63,94,0.15)":"#fff1f2"},
              {n:alarmCnt,    l:"Alarms",  c:"#a855f7", bg:dark?"rgba(168,85,247,0.15)":"#faf5ff"},
            ].map(({n,l,c,bg:sb})=>(
              <div key={l} style={{background:sb,borderRadius:14,padding:"10px 6px",textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:800,color:c,lineHeight:1}}>{n}</div>
                <div style={{fontSize:10,color:muted,marginTop:4,fontWeight:500}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{display:"flex",alignItems:"center",gap:10,background:glass,backdropFilter:"blur(20px)",
          border:`1px solid ${bord}`,borderRadius:16,padding:"10px 16px",marginBottom:14,
          boxShadow:dark?"0 4px 20px rgba(0,0,0,0.2)":"0 4px 20px rgba(99,102,241,0.08)"}}>
          <span style={{fontSize:16}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your tasks..."
            style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:14,color:text,fontFamily:"inherit"}}/>
          {search && <button onClick={()=>setSearch("")} style={{background:"transparent",border:"none",color:muted,cursor:"pointer",fontSize:14,padding:0}}>✕</button>}
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
          {CATEGORIES.map(c2=>{
            const active=filter===c2; const meta=CAT_META[c2];
            return(
              <button key={c2} onClick={()=>setFilter(c2)} style={{
                padding:"8px 16px",borderRadius:12,border:"none",cursor:"pointer",
                fontSize:13,fontWeight:600,transition:"all 0.2s",
                background:active?(meta?meta.gradient:"linear-gradient(135deg,#6366f1,#818cf8)"):glass,
                color:active?"#fff":muted,backdropFilter:"blur(10px)",
                boxShadow:active?"0 4px 15px rgba(99,102,241,0.35)":"none",
                transform:active?"translateY(-1px)":"none",
              }}>{meta?`${meta.icon} ${c2}`:`✨ ${c2}`}</button>
            );
          })}
          <div style={{marginLeft:"auto",display:"flex",gap:6}}>
            {PRIORITIES.map(p2=>{
              const active=priFilter===p2; const m=PRI_META[p2];
              return(
                <button key={p2} onClick={()=>setPriFilter(priFilter===p2?"All":p2)} style={{
                  padding:"8px 12px",borderRadius:12,border:`1px solid ${active?m.color:bord}`,
                  cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.2s",
                  background:active?m.bg:glass,color:active?m.color:muted,backdropFilter:"blur(10px)",
                }}>{m.label}</button>
              );
            })}
          </div>
        </div>

        {/* Add task */}
        <div style={{background:card,backdropFilter:"blur(20px)",border:`1px solid ${showAdd?"#6366f1":bord}`,
          borderRadius:20,marginBottom:16,overflow:"hidden",transition:"all 0.3s ease",
          boxShadow:showAdd?"0 8px 32px rgba(99,102,241,0.2)":dark?"0 4px 20px rgba(0,0,0,0.3)":"0 4px 20px rgba(99,102,241,0.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px"}}>
            <div onClick={()=>setShowAdd(s=>!s)} style={{
              width:32,height:32,borderRadius:10,
              background:"linear-gradient(135deg,#6366f1,#ec4899)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:20,cursor:"pointer",flexShrink:0,color:"#fff",lineHeight:1,
            }}>{showAdd?"−":"+"}</div>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addTodo()}
              onFocus={()=>setShowAdd(true)}
              placeholder="Add a new task... press Enter to save"
              style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:15,color:text,fontFamily:"inherit"}}/>
            {input&&(
              <button onClick={addTodo} style={{
                background:"linear-gradient(135deg,#6366f1,#818cf8)",border:"none",
                borderRadius:10,padding:"8px 16px",color:"#fff",fontSize:13,fontWeight:700,
                cursor:"pointer",boxShadow:"0 4px 12px rgba(99,102,241,0.4)",whiteSpace:"nowrap",
              }}>Add ↵</button>
            )}
          </div>
          {showAdd&&(
            <div style={{padding:"0 16px 16px",borderTop:`1px solid ${bord}`,paddingTop:14}}>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
                {[
                  {label:"Category",val:cat,set:setCat,opts:CATEGORIES.filter(x=>x!=="All")},
                  {label:"Priority", val:pri,set:setPri,opts:PRIORITIES},
                ].map((s,i)=>(
                  <div key={i} style={{flex:1,minWidth:120}}>
                    <div style={{fontSize:11,fontWeight:600,color:muted,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>{s.label}</div>
                    <select value={s.val} onChange={e=>s.set(e.target.value)} style={{
                      width:"100%",padding:"8px 12px",borderRadius:10,border:`1px solid ${bord}`,
                      background:inputBg,color:text,fontSize:13,outline:"none",fontFamily:"inherit",
                    }}>
                      {s.opts.map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{flex:1,minWidth:130}}>
                  <div style={{fontSize:11,fontWeight:600,color:muted,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>Due Date</div>
                  <input type="date" value={due} onChange={e=>setDue(e.target.value)} style={{
                    width:"100%",padding:"8px 12px",borderRadius:10,border:`1px solid ${bord}`,
                    background:inputBg,color:text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box",
                  }}/>
                </div>
              </div>
              {/* ALARM row */}
              <div style={{
                background: dark?"rgba(168,85,247,0.1)":"#faf5ff",
                border:`1px solid ${dark?"rgba(168,85,247,0.3)":"#e9d5ff"}`,
                borderRadius:14, padding:14,
              }}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{fontSize:18}}>🔔</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#7c3aed"}}>Set Alarm / Reminder</span>
                  <span style={{fontSize:11,color:muted,marginLeft:"auto"}}>It will ring at this time!</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <input type="time" value={alarm} onChange={e=>setAlarm(e.target.value)} style={{
                    flex:1,padding:"10px 14px",borderRadius:10,
                    border:`2px solid ${alarm?"#7c3aed":bord}`,
                    background:inputBg,color:text,fontSize:15,fontWeight:600,
                    outline:"none",fontFamily:"inherit",
                  }}/>
                  {alarm&&(
                    <button onClick={()=>setAlarm("")} style={{
                      padding:"10px 14px",borderRadius:10,border:`1px solid ${bord}`,
                      background:glass,color:muted,fontSize:13,cursor:"pointer",
                    }}>Clear</button>
                  )}
                </div>
                {alarm&&(
                  <div style={{marginTop:8,fontSize:12,color:"#7c3aed",fontWeight:600}}>
                    ✅ Alarm set for {alarm} — your app will ring at this time!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Task list */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {visible.length===0&&(
            <div style={{textAlign:"center",padding:"48px 24px",background:glass,backdropFilter:"blur(20px)",borderRadius:20,border:`1px solid ${bord}`}}>
              <div style={{fontSize:48,marginBottom:12}}>✨</div>
              <div style={{fontSize:16,fontWeight:600,color:text,marginBottom:6}}>
                {search?`No tasks matching "${search}"`:"All clear!"}
              </div>
              <div style={{fontSize:13,color:muted}}>
                {search?"Try a different search term":"Add a task above to get started"}
              </div>
            </div>
          )}

          {visible.map(todo=>{
            const cm=CAT_META[todo.category];
            const pm=PRI_META[todo.priority];
            const isOverdue=!todo.done&&todo.due&&todo.due<todayStr();
            const isDragTarget=dragOver===todo.id;
            const hasAlarm=!todo.done&&todo.alarm;

            return(
              <div key={todo.id}
                draggable
                onDragStart={()=>onDragStart(todo.id)}
                onDragOver={e=>onDragOver(e,todo.id)}
                onDrop={()=>onDrop(todo.id)}
                onDragEnd={()=>{setDragId(null);setDragOver(null);}}
                style={{
                  background:todo.done?(dark?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.5)"):card,
                  backdropFilter:"blur(20px)",borderRadius:18,
                  border:`1px solid ${isDragTarget?"#6366f1":hasAlarm?"rgba(168,85,247,0.3)":bord}`,
                  padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:12,
                  opacity:dragId===todo.id?0.3:1,
                  transform:isDragTarget?"scale(1.01)":"scale(1)",
                  transition:"all 0.2s ease",
                  boxShadow:todo.done?"none":hasAlarm
                    ?(dark?"0 4px 24px rgba(168,85,247,0.2)":"0 4px 24px rgba(168,85,247,0.12)")
                    :(dark?"0 4px 24px rgba(0,0,0,0.3)":"0 4px 24px rgba(99,102,241,0.08)"),
                  cursor:"grab",position:"relative",overflow:"hidden",
                }}
              >
                {/* Left accent */}
                {!todo.done&&(
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,
                    background:hasAlarm?"linear-gradient(180deg,#a855f7,#7c3aed)":(cm?cm.gradient:"linear-gradient(180deg,#6366f1,#ec4899)"),
                    borderRadius:"18px 0 0 18px"}}/>
                )}

                <span style={{color:muted,fontSize:16,marginTop:1,cursor:"grab",userSelect:"none",flexShrink:0,paddingLeft:4}}>⠿</span>

                {/* Checkbox */}
                <div onClick={()=>toggle(todo.id)} style={{
                  width:22,height:22,borderRadius:8,flexShrink:0,marginTop:1,
                  border:todo.done?"none":`2px solid ${dark?"rgba(255,255,255,0.2)":"#c7d2fe"}`,
                  background:todo.done?"linear-gradient(135deg,#6366f1,#ec4899)":"transparent",
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                  transition:"all 0.2s",boxShadow:todo.done?"0 2px 8px rgba(99,102,241,0.4)":"none",
                }}>
                  {todo.done&&<span style={{color:"#fff",fontSize:12}}>✓</span>}
                </div>

                {/* Content */}
                <div style={{flex:1,minWidth:0}}>
                  {editId===todo.id?(
                    <input autoFocus value={editText} onChange={e=>setEditText(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter")saveEdit(todo.id);if(e.key==="Escape")setEditId(null);}}
                      onBlur={()=>saveEdit(todo.id)}
                      style={{width:"100%",background:inputBg,border:"2px solid #6366f1",
                        borderRadius:8,padding:"4px 10px",fontSize:14,color:text,
                        outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                  ):(
                    <div onDoubleClick={()=>startEdit(todo)} style={{
                      fontSize:15,fontWeight:500,lineHeight:1.4,wordBreak:"break-word",
                      color:todo.done?muted:text,
                      textDecoration:todo.done?"line-through":"none",
                    }}>{todo.text}</div>
                  )}

                  <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,color:"#fff",
                      background:cm?cm.gradient:"linear-gradient(135deg,#6366f1,#818cf8)"}}>
                      {cm?cm.icon:"✨"} {todo.category}
                    </span>
                    <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,
                      color:pm.color,background:pm.bg,border:`1px solid ${pm.color}33`}}>
                      {pm.label}
                    </span>
                    {todo.due&&(
                      <span style={{fontSize:11,padding:"3px 10px",borderRadius:99,fontWeight:600,
                        background:isOverdue?"#fef2f2":(dark?"rgba(255,255,255,0.08)":"#f8fafc"),
                        color:isOverdue?"#f43f5e":muted,
                        border:`1px solid ${isOverdue?"#fecaca":bord}`}}>
                        📅 {todo.due}
                      </span>
                    )}
                    {/* Alarm badge */}
                    {todo.alarm&&!todo.done&&(
                      <span style={{fontSize:11,padding:"3px 10px",borderRadius:99,fontWeight:700,
                        background:dark?"rgba(168,85,247,0.15)":"#faf5ff",
                        color:"#7c3aed",border:"1px solid #e9d5ff"}}>
                        🔔 {todo.alarm}
                      </span>
                    )}
                    {todo.alarm&&todo.done&&(
                      <span style={{fontSize:11,padding:"3px 10px",borderRadius:99,fontWeight:600,
                        color:muted,background:dark?"rgba(255,255,255,0.05)":"#f1f5f9"}}>
                        🔕 alarm done
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{display:"flex",gap:4,flexShrink:0}}>
                  <button onClick={()=>startEdit(todo)} style={{
                    width:32,height:32,borderRadius:10,border:`1px solid ${bord}`,
                    background:glass,cursor:"pointer",fontSize:13,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    backdropFilter:"blur(10px)",color:muted,
                  }}>✏️</button>
                  <button onClick={()=>remove(todo.id)} style={{
                    width:32,height:32,borderRadius:10,border:"1px solid #fecaca",
                    background:dark?"rgba(244,63,94,0.1)":"#fff1f2",
                    cursor:"pointer",fontSize:13,
                    display:"flex",alignItems:"center",justifyContent:"center",color:"#f43f5e",
                  }}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {todos.some(t=>t.done)&&(
          <button onClick={()=>setTodos(p=>p.filter(t=>!t.done))} style={{
            width:"100%",marginTop:16,padding:"12px",background:glass,backdropFilter:"blur(10px)",
            border:`1px dashed ${bord}`,borderRadius:14,color:muted,fontSize:13,fontWeight:600,cursor:"pointer",
          }}>
            🗑️ Clear {todos.filter(t=>t.done).length} completed tasks
          </button>
        )}
        <div style={{textAlign:"center",marginTop:20,fontSize:12,color:muted,opacity:0.6}}>
          ⠿ drag to reorder · double-click to edit · 🔔 set alarms · click ✓ for confetti 🎊
        </div>
      </div>
    </div>
  );
}
