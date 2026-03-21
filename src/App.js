import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem("todo-users") || "[]");
  } catch {
    return [];
  }
};
const saveUsers = (u) => localStorage.setItem("todo-users", JSON.stringify(u));
const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem("todo-session") || "null");
  } catch {
    return null;
  }
};
const saveSession = (u) =>
  localStorage.setItem("todo-session", JSON.stringify(u));
const clearSession = () => localStorage.removeItem("todo-session");

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function AuthScreen({ onLogin, dark }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
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
    if (!emailTrim) {
      setError("Email is required.");
      return;
    }

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Name is required.");
        return;
      }
      const users = getUsers();
      if (users.find((u) => u.email === emailTrim)) {
        setError("Email already registered. Please log in.");
        return;
      }
      const newUser = {
        id: Date.now().toString(36),
        name: name.trim(),
        email: emailTrim,
      };
      saveUsers([...users, newUser]);
      saveSession(newUser);
      onLogin(newUser);
    } else {
      const users = getUsers();
      const found = users.find((u) => u.email === emailTrim);
      if (!found) {
        setError("Email not found. Please sign up first.");
        return;
      }
      saveSession(found);
      onLogin(found);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'Segoe UI',system-ui,sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* BG orbs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {[
          {
            top: "-20%",
            left: "-10%",
            s: 600,
            c: dark ? "rgba(99,102,241,0.14)" : "rgba(99,102,241,0.18)",
          },
          {
            bottom: "-15%",
            right: "-10%",
            s: 500,
            c: dark ? "rgba(236,72,153,0.09)" : "rgba(236,72,153,0.13)",
          },
        ].map((o, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...(o.top ? { top: o.top } : { bottom: o.bottom }),
              ...(o.left ? { left: o.left } : { right: o.right }),
              width: o.s,
              height: o.s,
              borderRadius: "50%",
              background: `radial-gradient(circle,${o.c},transparent 70%)`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 420,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              background: "linear-gradient(90deg,#6366f1,#ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 8,
            }}
          >
            ✦ TASK MANAGER ✦
          </div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 900,
              margin: 0,
              letterSpacing: "-1.5px",
              background: dark
                ? "linear-gradient(135deg,#c4b5fd,#f9a8d4)"
                : "linear-gradient(135deg,#4338ca,#7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            My Workspace
          </h1>
          <p
            style={{
              fontSize: 13,
              color: T.muted,
              margin: "8px 0 0",
              fontWeight: 500,
            }}
          >
            Your tasks, your world 🌙
          </p>
        </div>

        <div
          style={{
            background: T.card,
            backdropFilter: "blur(20px)",
            borderRadius: 28,
            border: `1.5px solid ${T.bord}`,
            padding: "32px 28px",
            boxShadow: dark
              ? "0 24px 80px rgba(0,0,0,0.5)"
              : "0 24px 80px rgba(99,102,241,0.13)",
          }}
        >
          {/* Tab switcher */}
          <div
            style={{
              display: "flex",
              gap: 4,
              background: dark ? "rgba(255,255,255,0.05)" : "#f0eeff",
              borderRadius: 14,
              padding: 4,
              marginBottom: 24,
            }}
          >
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  transition: "all 0.2s",
                  background:
                    mode === m
                      ? "linear-gradient(135deg,#6366f1,#ec4899)"
                      : "transparent",
                  color: mode === m ? "#fff" : T.muted,
                  boxShadow:
                    mode === m ? "0 4px 14px rgba(99,102,241,0.35)" : "none",
                }}
              >
                {m === "login" ? "🔑 Log In" : "✨ Sign Up"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.sub,
                    marginBottom: 6,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Your Name
                </div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Name"
                  onKeyDown={(e) => e.key === "Enter" && handle()}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1.5px solid ${T.bord}`,
                    background: T.inp,
                    color: T.text,
                    fontSize: 15,
                    fontWeight: 500,
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.sub,
                  marginBottom: 6,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Email Address
              </div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                onKeyDown={(e) => e.key === "Enter" && handle()}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${T.bord}`,
                  background: T.inp,
                  color: T.text,
                  fontSize: 15,
                  fontWeight: 500,
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  background: dark ? "rgba(244,63,94,0.15)" : "#fff1f2",
                  border: "1px solid #fecdd3",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#f43f5e",
                  fontWeight: 600,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handle}
              style={{
                marginTop: 4,
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg,#6366f1,#ec4899)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(99,102,241,0.4)",
                letterSpacing: 0.3,
              }}
            >
              {mode === "login" ? "Log In →" : "Create Account →"}
            </button>
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: T.muted,
              marginTop: 20,
              lineHeight: 1.8,
            }}
          >
            {mode === "login" ? "No account? " : "Already have one? "}
            <span
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              style={{ color: T.sub, fontWeight: 700, cursor: "pointer" }}
            >
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
  const T = {
    bg: dark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.9)",
    text: dark ? "#ede9fe" : "#1e1b4b",
    muted: dark ? "#9ca3af" : "#6b7280",
    bord: dark ? "rgba(139,92,246,0.15)" : "rgba(99,102,241,0.15)",
    inp: dark ? "rgba(255,255,255,0.07)" : "#fff",
  };

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10002,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: dark ? "#13131f" : "#fff",
          borderRadius: 28,
          padding: 28,
          maxWidth: 380,
          width: "100%",
          border: `1.5px solid ${T.bord}`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          animation: "popIn 0.35s cubic-bezier(.34,1.56,.64,1)",
          fontFamily: "'Segoe UI',system-ui,sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Avatar */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#6366f1,#ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 900,
              color: "#fff",
              margin: "0 auto 14px",
              boxShadow: "0 8px 28px rgba(99,102,241,0.4)",
            }}
          >
            {initials}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: T.text,
              letterSpacing: "-0.5px",
            }}
          >
            {user.name}
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
            {user.email}
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {[
            {
              n: total,
              l: "Total",
              c: "#6366f1",
              bg: dark ? "rgba(99,102,241,0.18)" : "#eef2ff",
            },
            {
              n: done,
              l: "Done",
              c: "#10b981",
              bg: dark ? "rgba(16,185,129,0.18)" : "#ecfdf5",
            },
            {
              n: total - done,
              l: "Left",
              c: "#f59e0b",
              bg: dark ? "rgba(245,158,11,0.18)" : "#fefce8",
            },
          ].map(({ n, l, c, bg }) => (
            <div
              key={l}
              style={{
                background: bg,
                borderRadius: 16,
                padding: "14px 8px",
                textAlign: "center",
                border: `1px solid ${c}22`,
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: c,
                  lineHeight: 1,
                }}
              >
                {n}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: T.muted,
                  marginTop: 5,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "13px",
              borderRadius: 14,
              border: `1px solid ${T.bord}`,
              background: "transparent",
              color: T.muted,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Close
          </button>
          <button
            onClick={onLogout}
            style={{
              flex: 1,
              padding: "13px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg,#f43f5e,#ec4899)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(244,63,94,0.35)",
            }}
          >
            🚪 Log Out
          </button>
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.75) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING HELPERS (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const todayStr = () => new Date().toISOString().split("T")[0];
const nowTimeStr = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const CATEGORIES = ["All", "Personal", "Study", "Work"];
const PRIORITIES = ["High", "Medium", "Low"];

const CAT_META = {
  Personal: {
    icon: "🌸",
    gradient: "linear-gradient(135deg,#f472b6,#ec4899)",
    glow: "rgba(244,114,182,0.3)",
  },
  Study: {
    icon: "📚",
    gradient: "linear-gradient(135deg,#818cf8,#6366f1)",
    glow: "rgba(129,140,248,0.3)",
  },
  Work: {
    icon: "💼",
    gradient: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
    glow: "rgba(56,189,248,0.3)",
  },
};
const PRI_META = {
  High: {
    color: "#f43f5e",
    bg: "#fff1f2",
    border: "#fecdd3",
    label: "🔴 High",
  },
  Medium: {
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    label: "🟡 Medium",
  },
  Low: { color: "#10b981", bg: "#f0fdf4", border: "#a7f3d0", label: "🟢 Low" },
};

const DEFAULTS = [
  {
    id: "d1",
    text: "Study DSA chapter 3",
    category: "Study",
    priority: "High",
    due: todayStr(),
    alarm: "",
    voiceType: "male",
    alarmFired: false,
    done: false,
  },
  {
    id: "d2",
    text: "Team standup meeting",
    category: "Work",
    priority: "Medium",
    due: "",
    alarm: "",
    voiceType: "male",
    alarmFired: false,
    done: false,
  },
  {
    id: "d3",
    text: "Call mom",
    category: "Personal",
    priority: "Low",
    due: "",
    alarm: "",
    voiceType: "female",
    alarmFired: false,
    done: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// VOICE ENGINE (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const MALE_VOICES = [
  "Google UK English Male",
  "Microsoft David Desktop - English (United States)",
  "Microsoft David",
  "Daniel",
  "Alex",
  "Fred",
  "Microsoft George - English (United Kingdom)",
  "Rishi",
  "Google US English",
];
const FEMALE_VOICES = [
  "Google UK English Female",
  "Samantha",
  "Karen",
  "Moira",
  "Tessa",
  "Microsoft Zira Desktop - English (United States)",
  "Microsoft Zira",
  "Victoria",
  "Google US English",
];

function getBestVoice(type = "male") {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const list = type === "female" ? FEMALE_VOICES : MALE_VOICES;
  for (const name of list) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }
  if (type === "female") {
    return (
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.toLowerCase().includes("female") ||
            v.name.includes("Zira") ||
            v.name.includes("Samantha") ||
            v.name.includes("Karen")),
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0]
    );
  }
  return (
    voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.toLowerCase().includes("male") ||
          v.name.includes("David") ||
          v.name.includes("Daniel") ||
          v.name.includes("Alex")),
    ) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    voices[0]
  );
}

function playBeep() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    [
      [660, 0.0, 0.18],
      [660, 0.25, 0.18],
      [880, 0.5, 0.3],
    ].forEach(([f, t, d]) => {
      const o = ac.createOscillator(),
        g = ac.createGain();
      o.connect(g);
      g.connect(ac.destination);
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.7, ac.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + d);
      o.start(ac.currentTime + t);
      o.stop(ac.currentTime + t + d + 0.05);
    });
  } catch (e) {}
}

function speakAlarm(taskText, voiceType = "male") {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  playBeep();
  setTimeout(() => {
    const voice = getBestVoice(voiceType);
    const say = () => {
      const utt = new SpeechSynthesisUtterance(taskText);
      utt.voice = getBestVoice(voiceType);
      utt.rate = voiceType === "female" ? 0.85 : 0.8;
      utt.pitch = voiceType === "female" ? 1.1 : 0.7;
      utt.volume = 1.0;
      utt.onend = () => {
        setTimeout(() => {
          const u2 = new SpeechSynthesisUtterance(taskText);
          u2.voice = getBestVoice(voiceType);
          u2.rate = voiceType === "female" ? 0.85 : 0.8;
          u2.pitch = voiceType === "female" ? 1.1 : 0.7;
          u2.volume = 1.0;
          window.speechSynthesis.speak(u2);
        }, 900);
      };
      window.speechSynthesis.speak(utt);
    };
    voice ? say() : setTimeout(say, 500);
  }, 900);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFETTI (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function Confetti({ active, onDone }) {
  const ref = useRef(null);
  const cb = useRef(onDone);
  cb.current = onDone;
  useEffect(() => {
    if (!active) return;
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    const cols = [
      "#6366f1",
      "#ec4899",
      "#f59e0b",
      "#10b981",
      "#38bdf8",
      "#a855f7",
      "#f43f5e",
    ];
    const pp = Array.from({ length: 160 }, () => ({
      x: Math.random() * cv.width,
      y: -20,
      w: 5 + Math.random() * 10,
      h: 3 + Math.random() * 7,
      color: cols[Math.floor(Math.random() * cols.length)],
      vx: (Math.random() - 0.5) * 5,
      vy: 2 + Math.random() * 6,
      angle: Math.random() * 360,
      va: (Math.random() - 0.5) * 10,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      let done = true;
      pp.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.va;
        if (p.y < cv.height + 20) done = false;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.y / cv.height);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (done) {
        cb.current();
        return;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const t = setTimeout(() => cb.current(), 4500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [active]);
  if (!active) return null;
  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ALARM POPUP (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function AlarmPopup({ alarms, onDismiss, onSnooze, dark }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!alarms.length) return;
    const t = setInterval(() => setTick((n) => n + 1), 500);
    return () => clearInterval(t);
  }, [alarms.length]);
  if (!alarms.length) return null;
  const todo = alarms[0];
  const cm = CAT_META[todo.category];
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: dark ? "#13131f" : "#fff",
          borderRadius: 32,
          padding: "36px 28px",
          maxWidth: 400,
          width: "100%",
          border: "2px solid #7c3aed",
          boxShadow:
            "0 0 0 8px rgba(124,58,237,0.12),0 32px 80px rgba(0,0,0,0.6)",
          textAlign: "center",
          animation: "popIn 0.45s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            margin: "0 auto 20px",
            background: "linear-gradient(135deg,#7c3aed,#ec4899)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 42,
            boxShadow: `0 0 0 ${tick % 2 === 0 ? 16 : 8}px rgba(124,58,237,${tick % 2 === 0 ? 0.2 : 0.08})`,
            transition: "box-shadow 0.5s ease",
            transform: `rotate(${tick % 2 === 0 ? -14 : 14}deg)`,
          }}
        >
          🔔
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#7c3aed",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          ⏰ ALARM RINGING
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: dark ? "#f1f0fb" : "#1e1b4b",
            lineHeight: 1.25,
            marginBottom: 14,
            letterSpacing: "-0.5px",
          }}
        >
          {todo.text}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              padding: "5px 14px",
              borderRadius: 99,
              color: "#fff",
              background: cm
                ? cm.gradient
                : "linear-gradient(135deg,#6366f1,#818cf8)",
            }}
          >
            {cm ? cm.icon : "✨"} {todo.category}
          </span>
          {todo.alarm && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: "5px 14px",
                borderRadius: 99,
                color: "#7c3aed",
                background: dark ? "rgba(124,58,237,0.15)" : "#ede9fe",
                border: "1px solid #ddd6fe",
              }}
            >
              🕐 {todo.alarm}
            </span>
          )}
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              padding: "5px 14px",
              borderRadius: 99,
              color: todo.voiceType === "female" ? "#ec4899" : "#3b82f6",
              background:
                todo.voiceType === "female"
                  ? dark
                    ? "rgba(236,72,153,0.15)"
                    : "#fdf2f8"
                  : dark
                    ? "rgba(59,130,246,0.15)"
                    : "#eff6ff",
              border: `1px solid ${todo.voiceType === "female" ? "#fbcfe8" : "#bfdbfe"}`,
            }}
          >
            {todo.voiceType === "female" ? "👩 Female" : "👨 Male"}
          </span>
        </div>
        <button
          onClick={() => speakAlarm(todo.text, todo.voiceType || "male")}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 14,
            marginBottom: 10,
            border: "2px solid #7c3aed",
            background: dark ? "rgba(124,58,237,0.15)" : "#faf5ff",
            color: "#7c3aed",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🔊 Speak Again
        </button>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onSnooze(todo.id)}
            style={{
              flex: 1,
              padding: "13px",
              borderRadius: 14,
              border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#e0e7ff"}`,
              background: dark ? "rgba(255,255,255,0.05)" : "#f0f4ff",
              color: dark ? "#a5b4fc" : "#6366f1",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            😴 Snooze 5 min
          </button>
          <button
            onClick={() => onDismiss(todo.id)}
            style={{
              flex: 1,
              padding: "13px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg,#6366f1,#ec4899)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(99,102,241,0.45)",
            }}
          >
            ✅ Got it!
          </button>
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.75) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT MODAL (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function EditModal({ todo, onSave, onClose, dark }) {
  const [text, setText] = useState(todo.text);
  const [category, setCategory] = useState(todo.category);
  const [priority, setPriority] = useState(todo.priority);
  const [due, setDue] = useState(todo.due || "");
  const [alarm, setAlarm] = useState(todo.alarm || "");
  const [voiceType, setVoiceType] = useState(todo.voiceType || "male");

  const T = {
    bg: dark ? "#13131f" : "#fff",
    text: dark ? "#f1f0fb" : "#1e1b4b",
    muted: dark ? "#9ca3af" : "#6b7280",
    bord: dark ? "rgba(139,92,246,0.2)" : "rgba(99,102,241,0.2)",
    inp: dark ? "rgba(255,255,255,0.07)" : "#f9f8ff",
    sub: "#7c3aed",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.bg,
          borderRadius: 28,
          padding: 28,
          maxWidth: 460,
          width: "100%",
          border: `1.5px solid ${T.bord}`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          animation: "popIn 0.35s cubic-bezier(.34,1.56,.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>
            ✏️ Edit Task
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: T.muted,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: T.sub,
              marginBottom: 6,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Task Name
          </div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 12,
              border: `1.5px solid ${T.bord}`,
              background: T.inp,
              color: T.text,
              fontSize: 15,
              fontWeight: 600,
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.sub,
                marginBottom: 6,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              📁 Category
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: `1.5px solid ${T.bord}`,
                background: T.inp,
                color: T.text,
                fontSize: 13,
                fontWeight: 600,
                outline: "none",
                fontFamily: "inherit",
              }}
            >
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.sub,
                marginBottom: 6,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              ⚡ Priority
            </div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: `1.5px solid ${T.bord}`,
                background: T.inp,
                color: T.text,
                fontSize: 13,
                fontWeight: 600,
                outline: "none",
                fontFamily: "inherit",
              }}
            >
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.sub,
                marginBottom: 6,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              📅 Due Date
            </div>
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: `1.5px solid ${T.bord}`,
                background: T.inp,
                color: T.text,
                fontSize: 13,
                fontWeight: 600,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.sub,
                marginBottom: 6,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              ⏰ Alarm Time
            </div>
            <input
              type="time"
              value={alarm}
              onChange={(e) => setAlarm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: `2px solid ${alarm ? "#7c3aed" : T.bord}`,
                background: T.inp,
                color: T.text,
                fontSize: 14,
                fontWeight: 700,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                letterSpacing: 1,
              }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: T.sub,
              marginBottom: 8,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            🔊 Alarm Voice
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              {
                val: "male",
                icon: "👨",
                label: "Male Voice",
                color: "#3b82f6",
                bg: dark ? "rgba(59,130,246,0.15)" : "#eff6ff",
                bord: "#bfdbfe",
              },
              {
                val: "female",
                icon: "👩",
                label: "Female Voice",
                color: "#ec4899",
                bg: dark ? "rgba(236,72,153,0.15)" : "#fdf2f8",
                bord: "#fbcfe8",
              },
            ].map((v) => (
              <button
                key={v.val}
                onClick={() => setVoiceType(v.val)}
                style={{
                  flex: 1,
                  padding: "12px 8px",
                  borderRadius: 14,
                  cursor: "pointer",
                  border: `2px solid ${voiceType === v.val ? v.color : T.bord}`,
                  background:
                    voiceType === v.val
                      ? v.bg
                      : dark
                        ? "transparent"
                        : "#fafafa",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{v.icon}</div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: voiceType === v.val ? v.color : T.muted,
                  }}
                >
                  {v.label}
                </div>
                {voiceType === v.val && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakAlarm(text || "Test", v.val);
                    }}
                    style={{
                      marginTop: 6,
                      padding: "4px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: v.color,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🔊 Test
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "13px",
              borderRadius: 14,
              border: `1px solid ${T.bord}`,
              background: "transparent",
              color: T.muted,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                text: text.trim() || todo.text,
                category,
                priority,
                due,
                alarm,
                voiceType,
              })
            }
            style={{
              flex: 2,
              padding: "13px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg,#6366f1,#ec4899)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(99,102,241,0.4)",
            }}
          >
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDY TRACKER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function StudyTracker({
  subjects,
  setSubjects,
  dark,
  showAddSubject,
  setShowAddSubject,
  subjectName,
  setSubjectName,
  subjectTotal,
  setSubjectTotal,
}) {
  const T = {
    card: dark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.9)",
    glass: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)",
    text: dark ? "#ede9fe" : "#1e1b4b",
    muted: dark ? "#6b7280" : "#9ca3af",
    bord: dark ? "rgba(139,92,246,0.15)" : "rgba(99,102,241,0.15)",
    inp: dark ? "rgba(255,255,255,0.07)" : "#fff",
    sub: "#7c3aed",
    shadow: dark
      ? "0 12px 40px rgba(0,0,0,0.5)"
      : "0 12px 40px rgba(99,102,241,0.12)",
  };

  const uid2 = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2);

  const addSubject = () => {
    const n = subjectName.trim();
    const t = parseInt(subjectTotal);
    if (!n || !t || t < 1) return;
    setSubjects((p) => [...p, { id: uid2(), name: n, total: t, completed: 0 }]);
    setSubjectName("");
    setSubjectTotal("");
    setShowAddSubject(false);
  };

  const markTopic = (id, delta) => {
    setSubjects((p) =>
      p.map((s) => {
        if (s.id !== id) return s;
        const newVal = Math.min(s.total, Math.max(0, s.completed + delta));
        return { ...s, completed: newVal };
      }),
    );
  };

  const deleteSubject = (id) =>
    setSubjects((p) => p.filter((s) => s.id !== id));

  const totalTopics = subjects.reduce((a, s) => a + s.total, 0);
  const doneTopics = subjects.reduce((a, s) => a + s.completed, 0);
  const overallPct = totalTopics
    ? Math.round((doneTopics / totalTopics) * 100)
    : 0;

  return (
    <div>
      {/* Overall summary */}
      {subjects.length > 0 && (
        <div
          style={{
            background: T.card,
            backdropFilter: "blur(20px)",
            borderRadius: 28,
            border: `1px solid ${T.bord}`,
            padding: 22,
            marginBottom: 16,
            boxShadow: T.shadow,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
              📚 Overall Study Progress
            </span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#6366f1" }}>
              {overallPct}%
            </span>
          </div>
          <div
            style={{
              height: 10,
              background: dark ? "rgba(255,255,255,0.08)" : "#ede9fe",
              borderRadius: 99,
              overflow: "hidden",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 99,
                width: `${overallPct}%`,
                background: "linear-gradient(90deg,#6366f1,#a855f7,#10b981)",
                transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
                boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#10b981",
                background: dark ? "rgba(16,185,129,0.15)" : "#ecfdf5",
                padding: "5px 14px",
                borderRadius: 99,
                border: "1px solid #a7f3d0",
              }}
            >
              {doneTopics} done
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#6366f1",
                background: dark ? "rgba(99,102,241,0.15)" : "#eef2ff",
                padding: "5px 14px",
                borderRadius: 99,
                border: "1px solid #c7d2fe",
              }}
            >
              {totalTopics} total
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#f59e0b",
                background: dark ? "rgba(245,158,11,0.15)" : "#fefce8",
                padding: "5px 14px",
                borderRadius: 99,
                border: "1px solid #fde68a",
              }}
            >
              {totalTopics - doneTopics} left
            </span>
          </div>
        </div>
      )}

      {/* Add subject button/form */}
      <div
        style={{
          background: T.card,
          backdropFilter: "blur(20px)",
          marginBottom: 14,
          border: `1.5px solid ${showAddSubject ? "#7c3aed" : T.bord}`,
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: showAddSubject
            ? "0 12px 40px rgba(124,58,237,0.2)"
            : T.shadow,
          transition: "all 0.3s",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            cursor: "pointer",
          }}
          onClick={() => setShowAddSubject((s) => !s)}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              flexShrink: 0,
              background: "linear-gradient(135deg,#6366f1,#10b981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              color: "#fff",
              fontWeight: 700,
              boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
            }}
          >
            {showAddSubject ? "−" : "+"}
          </div>
          <span style={{ fontSize: 16, color: T.text, fontWeight: 500 }}>
            Add a new subject
          </span>
        </div>
        {showAddSubject && (
          <div
            style={{
              padding: "4px 18px 18px",
              borderTop: `1px solid ${T.bord}`,
            }}
          >
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <div style={{ flex: 2 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.sub,
                    marginBottom: 6,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Subject Name
                </div>
                <input
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubject()}
                  placeholder="e.g. Mathematics"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: `1.5px solid ${T.bord}`,
                    background: T.inp,
                    color: T.text,
                    fontSize: 14,
                    fontWeight: 600,
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.sub,
                    marginBottom: 6,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Total Topics
                </div>
                <input
                  value={subjectTotal}
                  onChange={(e) => setSubjectTotal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubject()}
                  placeholder="10"
                  type="number"
                  min="1"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: `1.5px solid ${T.bord}`,
                    background: T.inp,
                    color: T.text,
                    fontSize: 14,
                    fontWeight: 600,
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
            <button
              onClick={addSubject}
              style={{
                marginTop: 12,
                width: "100%",
                padding: "13px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg,#6366f1,#10b981)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
              }}
            >
              📚 Add Subject
            </button>
          </div>
        )}
      </div>

      {/* Subject list */}
      {subjects.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "56px 24px",
            background: T.glass,
            backdropFilter: "blur(20px)",
            borderRadius: 24,
            border: `1px solid ${T.bord}`,
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 14 }}>📚</div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: T.text,
              marginBottom: 8,
            }}
          >
            No subjects yet!
          </div>
          <div style={{ fontSize: 13, color: T.muted }}>
            Add your first subject above to start tracking
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {subjects.map((s) => {
          const pct = s.total ? Math.round((s.completed / s.total) * 100) : 0;
          const isDone = s.completed === s.total;
          return (
            <div
              key={s.id}
              style={{
                background: isDone
                  ? dark
                    ? "rgba(16,185,129,0.1)"
                    : "rgba(16,185,129,0.06)"
                  : T.card,
                backdropFilter: "blur(20px)",
                borderRadius: 20,
                border: `1.5px solid ${isDone ? "#10b981" : T.bord}`,
                padding: "18px 18px",
                boxShadow: T.shadow,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* left accent */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: isDone
                    ? "linear-gradient(180deg,#10b981,#6366f1)"
                    : "linear-gradient(180deg,#6366f1,#a855f7)",
                  borderRadius: "20px 0 0 20px",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  paddingLeft: 8,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{ fontSize: 16, fontWeight: 800, color: T.text }}
                    >
                      {isDone ? "✅" : "📖"} {s.name}
                    </span>
                    {isDone && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#10b981",
                          background: dark ? "rgba(16,185,129,0.2)" : "#ecfdf5",
                          padding: "2px 8px",
                          borderRadius: 99,
                          border: "1px solid #a7f3d0",
                        }}
                      >
                        COMPLETED!
                      </span>
                    )}
                  </div>
                  <div
                    style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}
                  >
                    {s.completed}/{s.total} topics · {pct}%
                  </div>
                </div>
                <button
                  onClick={() => deleteSubject(s.id)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    border: "1.5px solid #fecdd3",
                    background: dark ? "rgba(244,63,94,0.1)" : "#fff1f2",
                    cursor: "pointer",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f43f5e",
                    flexShrink: 0,
                  }}
                >
                  🗑️
                </button>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: 8,
                  background: dark ? "rgba(255,255,255,0.08)" : "#ede9fe",
                  borderRadius: 99,
                  overflow: "hidden",
                  marginBottom: 14,
                  marginLeft: 8,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 99,
                    width: `${pct}%`,
                    background: isDone
                      ? "linear-gradient(90deg,#10b981,#6366f1)"
                      : "linear-gradient(90deg,#6366f1,#a855f7)",
                    transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
                    boxShadow: "0 2px 6px rgba(99,102,241,0.35)",
                  }}
                />
              </div>

              {/* Controls */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  paddingLeft: 8,
                }}
              >
                <button
                  onClick={() => markTopic(s.id, -1)}
                  disabled={s.completed === 0}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: `1.5px solid ${T.bord}`,
                    background: T.glass,
                    cursor: s.completed === 0 ? "not-allowed" : "pointer",
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: s.completed === 0 ? T.muted : "#f43f5e",
                    opacity: s.completed === 0 ? 0.4 : 1,
                  }}
                >
                  −
                </button>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      color: isDone ? "#10b981" : "#6366f1",
                      lineHeight: 1,
                    }}
                  >
                    {s.completed}
                    <span
                      style={{ fontSize: 14, color: T.muted, fontWeight: 600 }}
                    >
                      /{s.total}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: T.muted,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginTop: 2,
                    }}
                  >
                    topics done
                  </div>
                </div>
                <button
                  onClick={() => markTopic(s.id, 1)}
                  disabled={s.completed === s.total}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: `1.5px solid ${T.bord}`,
                    background:
                      s.completed === s.total
                        ? T.glass
                        : "linear-gradient(135deg,#6366f1,#10b981)",
                    cursor: s.completed === s.total ? "not-allowed" : "pointer",
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: s.completed === s.total ? T.muted : "#fff",
                    opacity: s.completed === s.total ? 0.4 : 1,
                    boxShadow:
                      s.completed === s.total
                        ? "none"
                        : "0 4px 12px rgba(99,102,241,0.35)",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP — now auth-aware
// ─────────────────────────────────────────────────────────────────────────────
export default function TodoApp() {
  // ── AUTH STATE ──
  const [currentUser, setCurrentUser] = useState(() => getSession());
  const [showProfile, setShowProfile] = useState(false);
  const [dark, setDark] = useState(
    () => localStorage.getItem("todo-dark") === "true",
  );

  // Per-user localStorage key for todos
  const todosKey = currentUser ? `todo-v6-${currentUser.id}` : "todo-v6";

  // ── TODO STATE ──
  const [todos, setTodos] = useState(() => {
    if (!currentUser) return DEFAULTS;
    try {
      return (
        JSON.parse(localStorage.getItem(`todo-v6-${currentUser.id}`)) ||
        DEFAULTS
      );
    } catch {
      return DEFAULTS;
    }
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

  // ── STUDY TRACKER STATE ──
  const studyKey = currentUser ? `study-v1-${currentUser.id}` : "study-v1";
  const [subjects, setSubjects] = useState(() => {
    const key = currentUser ? `study-v1-${currentUser.id}` : "study-v1";
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState("tasks"); // "tasks" | "study"
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [subjectTotal, setSubjectTotal] = useState("");

  // Reload subjects when user changes
  useEffect(() => {
    if (!currentUser) {
      setSubjects([]);
      return;
    }
    try {
      const saved = JSON.parse(
        localStorage.getItem(`study-v1-${currentUser.id}`),
      );
      setSubjects(saved || []);
    } catch {
      setSubjects([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    localStorage.setItem(studyKey, JSON.stringify(subjects));
  }, [subjects, studyKey]);

  // Reload todos when user changes
  useEffect(() => {
    if (!currentUser) {
      setTodos(DEFAULTS);
      return;
    }
    try {
      const saved = JSON.parse(
        localStorage.getItem(`todo-v6-${currentUser.id}`),
      );
      setTodos(saved || DEFAULTS);
    } catch {
      setTodos(DEFAULTS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    localStorage.setItem(todosKey, JSON.stringify(todos));
  }, [todos, todosKey]);
  useEffect(() => {
    localStorage.setItem("todo-dark", String(dark));
  }, [dark]);

  // ── AUTH HANDLERS ──
  const handleLogin = (user) => {
    setCurrentUser(user);
  };
  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setShowProfile(false);
    setRinging([]);
    window.speechSynthesis?.cancel();
  };

  // ── VOICE LOAD ──
  useEffect(() => {
    if (window.speechSynthesis) {
      const load = () => {
        getBestVoice("male");
        getBestVoice("female");
      };
      window.speechSynthesis.getVoices().length
        ? load()
        : window.speechSynthesis.addEventListener("voiceschanged", load, {
            once: true,
          });
    }
    if ("Notification" in window && Notification.permission === "default")
      Notification.requestPermission();
  }, []);

  // ── ALARM CHECKER ──
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
            if (
              "Notification" in window &&
              Notification.permission === "granted"
            )
              new Notification(`⏰ ${t.text}`, {
                body: t.text,
                icon: "/logo192.png",
              });
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

  const dismissAlarm = (id) => {
    window.speechSynthesis?.cancel();
    setRinging((r) => r.filter((x) => x.id !== id));
  };
  const snoozeAlarm = (id) => {
    window.speechSynthesis?.cancel();
    setRinging((r) => r.filter((x) => x.id !== id));
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    const st = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    setTodos((p) =>
      p.map((t) => (t.id === id ? { ...t, alarm: st, alarmFired: false } : t)),
    );
  };

  const addTodo = useCallback(() => {
    const t = input.trim();
    if (!t) return;
    setTodos((p) => [
      {
        id: uid(),
        text: t,
        category: cat,
        priority: pri,
        due,
        alarm,
        voiceType,
        alarmFired: false,
        done: false,
      },
      ...p,
    ]);
    setInput("");
    setDue("");
    setAlarm("");
    setShowAdd(false);
  }, [input, cat, pri, due, alarm, voiceType]);

  const toggle = useCallback((id) => {
    let fired = false;
    setTodos((p) =>
      p.map((t) => {
        if (t.id !== id) return t;
        if (!t.done) fired = true;
        return { ...t, done: !t.done };
      }),
    );
    if (fired) setConfetti(true);
  }, []);

  const remove = useCallback(
    (id) => setTodos((p) => p.filter((t) => t.id !== id)),
    [],
  );

  const saveEdit = (id, changes) => {
    setTodos((p) =>
      p.map((t) => (t.id === id ? { ...t, ...changes, alarmFired: false } : t)),
    );
    setEditTodo(null);
  };

  const onDragStart = (id) => setDragId(id);
  const onDragOver = (e, id) => {
    e.preventDefault();
    setDragOver(id);
  };
  const onDrop = (tid) => {
    if (!dragId || dragId === tid) {
      setDragId(null);
      setDragOver(null);
      return;
    }
    setTodos((p) => {
      const a = [...p],
        fi = a.findIndex((t) => t.id === dragId),
        ti = a.findIndex((t) => t.id === tid);
      const [item] = a.splice(fi, 1);
      a.splice(ti, 0, item);
      return a;
    });
    setDragId(null);
    setDragOver(null);
  };

  const visible = todos.filter((t) => {
    if (filter !== "All" && t.category !== filter) return false;
    if (priFilter !== "All" && t.priority !== priFilter) return false;
    if (search && !t.text.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const doneCnt = todos.filter((t) => t.done).length;
  const total = todos.length;
  const pct = total ? Math.round((doneCnt / total) * 100) : 0;
  const overdueCnt = todos.filter(
    (t) => !t.done && t.due && t.due < todayStr(),
  ).length;
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
    shadow: dark
      ? "0 12px 40px rgba(0,0,0,0.5)"
      : "0 12px 40px rgba(99,102,241,0.12)",
  };

  // ── SHOW AUTH IF NOT LOGGED IN ──
  if (!currentUser) return <AuthScreen onLogin={handleLogin} dark={dark} />;

  // User initials for avatar button
  const initials = currentUser.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        fontFamily: "'Segoe UI',system-ui,sans-serif",
        color: T.text,
        transition: "background 0.4s",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <Confetti active={confetti} onDone={() => setConfetti(false)} />
      <AlarmPopup
        alarms={ringing}
        onDismiss={dismissAlarm}
        onSnooze={snoozeAlarm}
        dark={dark}
      />
      {editTodo && (
        <EditModal
          todo={editTodo}
          dark={dark}
          onSave={(changes) => saveEdit(editTodo.id, changes)}
          onClose={() => setEditTodo(null)}
        />
      )}
      {showProfile && (
        <ProfilePage
          user={currentUser}
          todos={todos}
          dark={dark}
          onLogout={handleLogout}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* BG Orbs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {[
          {
            top: "-15%",
            left: "-10%",
            s: 580,
            c: dark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.18)",
          },
          {
            bottom: "-15%",
            right: "-10%",
            s: 500,
            c: dark ? "rgba(236,72,153,0.08)" : "rgba(236,72,153,0.12)",
          },
          {
            top: "40%",
            right: "15%",
            s: 280,
            c: dark ? "rgba(56,189,248,0.07)" : "rgba(56,189,248,0.1)",
          },
        ].map((o, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...(o.top ? { top: o.top } : { bottom: o.bottom }),
              ...(o.left ? { left: o.left } : { right: o.right }),
              width: o.s,
              height: o.s,
              borderRadius: "50%",
              background: `radial-gradient(circle,${o.c},transparent 70%)`,
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 640,
          margin: "0 auto",
          padding: "28px 16px 100px",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: "uppercase",
                background: "linear-gradient(90deg,#6366f1,#ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: 8,
              }}
            >
              ✦ TASK MANAGER ✦
            </div>
            <h1
              style={{
                fontSize: 34,
                fontWeight: 900,
                margin: 0,
                letterSpacing: "-1.5px",
                lineHeight: 1,
                background: dark
                  ? "linear-gradient(135deg,#c4b5fd,#f9a8d4)"
                  : "linear-gradient(135deg,#4338ca,#7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {currentUser.name.split(" ")[0]}'s Workspace
            </h1>
            <p
              style={{
                fontSize: 13,
                color: T.muted,
                margin: "6px 0 0",
                fontWeight: 500,
              }}
            >
              {doneCnt}/{total} done
              {overdueCnt > 0 && (
                <span style={{ color: "#f43f5e", fontWeight: 700 }}>
                  {" "}
                  · {overdueCnt} overdue
                </span>
              )}
              {alarmCnt > 0 && (
                <span style={{ color: "#7c3aed", fontWeight: 700 }}>
                  {" "}
                  · {alarmCnt} 🔔
                </span>
              )}
            </p>
          </div>
          {/* Right buttons: dark toggle + avatar */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => setDark((d) => !d)}
              style={{
                width: 46,
                height: 46,
                borderRadius: 15,
                border: `1px solid ${T.bord}`,
                background: T.glass,
                backdropFilter: "blur(12px)",
                cursor: "pointer",
                fontSize: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: T.shadow,
              }}
            >
              {dark ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => setShowProfile(true)}
              title={currentUser.name}
              style={{
                width: 46,
                height: 46,
                borderRadius: 15,
                border: "2px solid #7c3aed",
                background: "linear-gradient(135deg,#6366f1,#ec4899)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 900,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
              }}
            >
              {initials}
            </button>
          </div>
        </div>

        {/* PROGRESS */}
        <div
          style={{
            background: T.card,
            backdropFilter: "blur(20px)",
            borderRadius: 28,
            border: `1px solid ${T.bord}`,
            padding: 22,
            marginBottom: 16,
            boxShadow: T.shadow,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
              Overall Progress
            </span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#6366f1" }}>
              {pct}%
            </span>
          </div>
          <div
            style={{
              height: 10,
              background: dark ? "rgba(255,255,255,0.08)" : "#ede9fe",
              borderRadius: 99,
              overflow: "hidden",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 99,
                width: `${pct}%`,
                background:
                  "linear-gradient(90deg,#6366f1,#a855f7,#ec4899,#f59e0b)",
                transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
                boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
              }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: 8,
            }}
          >
            {[
              {
                n: total,
                l: "Total",
                c: "#6366f1",
                bg: dark ? "rgba(99,102,241,0.2)" : "#eef2ff",
              },
              {
                n: doneCnt,
                l: "Done",
                c: "#10b981",
                bg: dark ? "rgba(16,185,129,0.2)" : "#ecfdf5",
              },
              {
                n: total - doneCnt,
                l: "Left",
                c: "#f59e0b",
                bg: dark ? "rgba(245,158,11,0.2)" : "#fefce8",
              },
              {
                n: overdueCnt,
                l: "Overdue",
                c: "#f43f5e",
                bg: dark ? "rgba(244,63,94,0.2)" : "#fff1f2",
              },
              {
                n: alarmCnt,
                l: "Alarms",
                c: "#a855f7",
                bg: dark ? "rgba(168,85,247,0.2)" : "#faf5ff",
              },
            ].map(({ n, l, c, bg: sb }) => (
              <div
                key={l}
                style={{
                  background: sb,
                  borderRadius: 16,
                  padding: "12px 6px",
                  textAlign: "center",
                  border: `1px solid ${c}22`,
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: c,
                    lineHeight: 1,
                  }}
                >
                  {n}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: T.muted,
                    marginTop: 5,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: dark ? "rgba(255,255,255,0.05)" : "#ede9fe",
            borderRadius: 16,
            padding: 4,
            marginBottom: 16,
          }}
        >
          {[
            { id: "tasks", label: "✅ Tasks" },
            { id: "study", label: "📚 Study Tracker" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "11px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                transition: "all 0.2s",
                background:
                  activeTab === tab.id
                    ? "linear-gradient(135deg,#6366f1,#ec4899)"
                    : "transparent",
                color: activeTab === tab.id ? "#fff" : T.muted,
                boxShadow:
                  activeTab === tab.id
                    ? "0 4px 14px rgba(99,102,241,0.35)"
                    : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* STUDY TRACKER TAB */}
        {activeTab === "study" && (
          <StudyTracker
            subjects={subjects}
            setSubjects={setSubjects}
            dark={dark}
            showAddSubject={showAddSubject}
            setShowAddSubject={setShowAddSubject}
            subjectName={subjectName}
            setSubjectName={setSubjectName}
            subjectTotal={subjectTotal}
            setSubjectTotal={setSubjectTotal}
          />
        )}

        {activeTab === "tasks" && (
          <>
            {/* SEARCH */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: T.glass,
                backdropFilter: "blur(20px)",
                border: `1px solid ${T.bord}`,
                borderRadius: 18,
                padding: "11px 16px",
                marginBottom: 12,
                boxShadow: T.shadow,
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  color: T.text,
                  fontFamily: "inherit",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: T.muted,
                    cursor: "pointer",
                    fontSize: 15,
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* FILTERS */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {CATEGORIES.map((c2) => {
                const a = filter === c2;
                const m = CAT_META[c2];
                return (
                  <button
                    key={c2}
                    onClick={() => setFilter(c2)}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 14,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 700,
                      transition: "all 0.2s",
                      background: a
                        ? m
                          ? m.gradient
                          : "linear-gradient(135deg,#6366f1,#818cf8)"
                        : T.glass,
                      color: a ? "#fff" : T.muted,
                      backdropFilter: "blur(10px)",
                      boxShadow: a
                        ? `0 4px 16px ${m ? m.glow : "rgba(99,102,241,0.3)"}`
                        : "none",
                      transform: a ? "translateY(-2px)" : "none",
                    }}
                  >
                    {m ? `${m.icon} ${c2}` : `✨ ${c2}`}
                  </button>
                );
              })}
              <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                {PRIORITIES.map((p2) => {
                  const a = priFilter === p2;
                  const m = PRI_META[p2];
                  return (
                    <button
                      key={p2}
                      onClick={() =>
                        setPriFilter(priFilter === p2 ? "All" : p2)
                      }
                      style={{
                        padding: "7px 12px",
                        borderRadius: 12,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        border: `1.5px solid ${a ? m.color : T.bord}`,
                        background: a ? m.bg : T.glass,
                        color: a ? m.color : T.muted,
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ADD TASK */}
            <div
              style={{
                background: T.card,
                backdropFilter: "blur(20px)",
                marginBottom: 14,
                border: `1.5px solid ${showAdd ? "#7c3aed" : T.bord}`,
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: showAdd
                  ? "0 12px 40px rgba(124,58,237,0.2)"
                  : T.shadow,
                transition: "all 0.3s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 18px",
                }}
              >
                <div
                  onClick={() => setShowAdd((s) => !s)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    flexShrink: 0,
                    cursor: "pointer",
                    background: "linear-gradient(135deg,#6366f1,#ec4899)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    color: "#fff",
                    fontWeight: 700,
                    lineHeight: 1,
                    boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                  }}
                >
                  {showAdd ? "−" : "+"}
                </div>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  onFocus={() => setShowAdd(true)}
                  placeholder="What do you need to do?"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: 16,
                    color: T.text,
                    fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                />
                {input && (
                  <button
                    onClick={addTodo}
                    style={{
                      background: "linear-gradient(135deg,#6366f1,#818cf8)",
                      border: "none",
                      borderRadius: 12,
                      padding: "9px 18px",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                    }}
                  >
                    Add ↵
                  </button>
                )}
              </div>
              {showAdd && (
                <div
                  style={{
                    padding: "4px 18px 18px",
                    borderTop: `1px solid ${T.bord}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      marginTop: 14,
                      marginBottom: 14,
                    }}
                  >
                    {[
                      {
                        label: "📁 Category",
                        val: cat,
                        set: setCat,
                        opts: CATEGORIES.filter((x) => x !== "All"),
                      },
                      {
                        label: "⚡ Priority",
                        val: pri,
                        set: setPri,
                        opts: PRIORITIES,
                      },
                    ].map((s, i) => (
                      <div key={i} style={{ flex: 1, minWidth: 120 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: T.sub,
                            marginBottom: 6,
                            letterSpacing: 0.5,
                          }}
                        >
                          {s.label}
                        </div>
                        <select
                          value={s.val}
                          onChange={(e) => s.set(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "9px 12px",
                            borderRadius: 12,
                            border: `1.5px solid ${T.bord}`,
                            background: T.inp,
                            color: T.text,
                            fontSize: 13,
                            fontWeight: 600,
                            outline: "none",
                            fontFamily: "inherit",
                          }}
                        >
                          {s.opts.map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    <div style={{ flex: 1, minWidth: 130 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: T.sub,
                          marginBottom: 6,
                          letterSpacing: 0.5,
                        }}
                      >
                        📅 Due Date
                      </div>
                      <input
                        type="date"
                        value={due}
                        onChange={(e) => setDue(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: 12,
                          border: `1.5px solid ${T.bord}`,
                          background: T.inp,
                          color: T.text,
                          fontSize: 13,
                          fontWeight: 600,
                          outline: "none",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      background: dark ? "rgba(124,58,237,0.1)" : "#faf5ff",
                      border: `1.5px solid ${dark ? "rgba(124,58,237,0.25)" : "#ddd6fe"}`,
                      borderRadius: 18,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 12,
                          flexShrink: 0,
                          background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
                        }}
                      >
                        🔔
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "#7c3aed",
                          }}
                        >
                          Voice Alarm
                        </div>
                        <div style={{ fontSize: 11, color: T.muted }}>
                          Speaks your task name at set time
                        </div>
                      </div>
                    </div>
                    <input
                      type="time"
                      value={alarm}
                      onChange={(e) => setAlarm(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 14,
                        boxSizing: "border-box",
                        marginBottom: 12,
                        border: `2px solid ${alarm ? "#7c3aed" : T.bord}`,
                        background: T.inp,
                        color: T.text,
                        fontSize: 18,
                        fontWeight: 800,
                        outline: "none",
                        fontFamily: "inherit",
                        letterSpacing: 2,
                      }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      {[
                        {
                          val: "male",
                          icon: "👨",
                          label: "Male",
                          color: "#3b82f6",
                          bg: dark ? "rgba(59,130,246,0.15)" : "#eff6ff",
                          bord: "#bfdbfe",
                        },
                        {
                          val: "female",
                          icon: "👩",
                          label: "Female",
                          color: "#ec4899",
                          bg: dark ? "rgba(236,72,153,0.15)" : "#fdf2f8",
                          bord: "#fbcfe8",
                        },
                      ].map((v) => (
                        <button
                          key={v.val}
                          onClick={() => setVoiceType(v.val)}
                          style={{
                            flex: 1,
                            padding: "10px 8px",
                            borderRadius: 12,
                            cursor: "pointer",
                            border: `2px solid ${voiceType === v.val ? v.color : T.bord}`,
                            background:
                              voiceType === v.val
                                ? v.bg
                                : dark
                                  ? "transparent"
                                  : "#fafafa",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <span style={{ fontSize: 18 }}>{v.icon}</span>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: voiceType === v.val ? v.color : T.muted,
                            }}
                          >
                            {v.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    {alarm && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: "10px 14px",
                          borderRadius: 12,
                          background: dark
                            ? "rgba(124,58,237,0.12)"
                            : "#ede9fe",
                          fontSize: 13,
                          color: "#7c3aed",
                          fontWeight: 600,
                        }}
                      >
                        🔊 At <strong>{alarm}</strong> — will speak:{" "}
                        <em>"{input || "your task"}"</em>
                      </div>
                    )}
                    {input && (
                      <button
                        onClick={() => speakAlarm(input, voiceType)}
                        style={{
                          marginTop: 10,
                          width: "100%",
                          padding: "11px",
                          borderRadius: 12,
                          border: "2px solid #7c3aed",
                          background: "transparent",
                          color: "#7c3aed",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        🔊 Test Voice Now
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* TASK LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {visible.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "56px 24px",
                    background: T.glass,
                    backdropFilter: "blur(20px)",
                    borderRadius: 24,
                    border: `1px solid ${T.bord}`,
                  }}
                >
                  <div style={{ fontSize: 52, marginBottom: 14 }}>✨</div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: T.text,
                      marginBottom: 8,
                    }}
                  >
                    {search
                      ? `No tasks matching "${search}"`
                      : "You're all caught up!"}
                  </div>
                  <div style={{ fontSize: 13, color: T.muted }}>
                    Add your first task above
                  </div>
                </div>
              )}
              {visible.map((todo) => {
                const cm = CAT_META[todo.category];
                const pm = PRI_META[todo.priority];
                const isOverdue =
                  !todo.done && todo.due && todo.due < todayStr();
                const isDragTarget = dragOver === todo.id;
                const hasAlarm = !todo.done && todo.alarm;
                const isFemale = todo.voiceType === "female";
                return (
                  <div
                    key={todo.id}
                    draggable
                    onDragStart={() => onDragStart(todo.id)}
                    onDragOver={(e) => onDragOver(e, todo.id)}
                    onDrop={() => onDrop(todo.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setDragOver(null);
                    }}
                    style={{
                      background: todo.done
                        ? dark
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(255,255,255,0.6)"
                        : T.card,
                      backdropFilter: "blur(20px)",
                      borderRadius: 20,
                      border: `1.5px solid ${isDragTarget ? "#6366f1" : hasAlarm ? "rgba(124,58,237,0.4)" : T.bord}`,
                      padding: "15px 16px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      opacity: dragId === todo.id ? 0.3 : 1,
                      transform: isDragTarget ? "scale(1.02)" : "scale(1)",
                      transition: "all 0.2s ease",
                      boxShadow: hasAlarm
                        ? dark
                          ? "0 6px 28px rgba(124,58,237,0.22)"
                          : "0 6px 28px rgba(124,58,237,0.14)"
                        : todo.done
                          ? "none"
                          : T.shadow,
                      cursor: "grab",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {!todo.done && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          background: hasAlarm
                            ? "linear-gradient(180deg,#7c3aed,#a855f7)"
                            : cm
                              ? cm.gradient
                              : "linear-gradient(#6366f1,#ec4899)",
                          borderRadius: "20px 0 0 20px",
                        }}
                      />
                    )}
                    <span
                      style={{
                        color: T.muted,
                        fontSize: 15,
                        marginTop: 2,
                        cursor: "grab",
                        userSelect: "none",
                        flexShrink: 0,
                        paddingLeft: 6,
                      }}
                    >
                      ⠿
                    </span>
                    <div
                      onClick={() => toggle(todo.id)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 9,
                        flexShrink: 0,
                        border: todo.done
                          ? "none"
                          : `2px solid ${dark ? "rgba(255,255,255,0.2)" : "#c4b5fd"}`,
                        background: todo.done
                          ? "linear-gradient(135deg,#6366f1,#ec4899)"
                          : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        boxShadow: todo.done
                          ? "0 3px 10px rgba(99,102,241,0.45)"
                          : "none",
                        marginTop: 0,
                      }}
                    >
                      {todo.done && (
                        <span
                          style={{
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          lineHeight: 1.4,
                          wordBreak: "break-word",
                          color: todo.done ? T.muted : T.text,
                          textDecoration: todo.done ? "line-through" : "none",
                          opacity: todo.done ? 0.6 : 1,
                        }}
                      >
                        {todo.text}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          marginTop: 9,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 10px",
                            borderRadius: 99,
                            color: "#fff",
                            background: cm
                              ? cm.gradient
                              : "linear-gradient(135deg,#6366f1,#818cf8)",
                            boxShadow: cm ? `0 2px 8px ${cm.glow}` : "none",
                          }}
                        >
                          {cm ? cm.icon : "✨"} {todo.category}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 10px",
                            borderRadius: 99,
                            color: pm.color,
                            background: pm.bg,
                            border: `1px solid ${pm.border}`,
                          }}
                        >
                          {pm.label}
                        </span>
                        {todo.due && (
                          <span
                            style={{
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 99,
                              fontWeight: 600,
                              background: isOverdue
                                ? "#fff1f2"
                                : dark
                                  ? "rgba(255,255,255,0.07)"
                                  : "#f5f3ff",
                              color: isOverdue ? "#f43f5e" : T.muted,
                              border: `1px solid ${isOverdue ? "#fecdd3" : T.bord}`,
                            }}
                          >
                            📅 {todo.due}
                          </span>
                        )}
                        {todo.alarm && !todo.done && (
                          <span
                            style={{
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 99,
                              fontWeight: 700,
                              background: dark
                                ? "rgba(124,58,237,0.18)"
                                : "#faf5ff",
                              color: "#7c3aed",
                              border: "1.5px solid #ddd6fe",
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            {isFemale ? "👩" : "👨"} 🔔 {todo.alarm}
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                speakAlarm(todo.text, todo.voiceType || "male");
                              }}
                              style={{
                                background: "#7c3aed",
                                color: "#fff",
                                borderRadius: 6,
                                padding: "1px 6px",
                                fontSize: 10,
                                cursor: "pointer",
                                fontWeight: 700,
                              }}
                            >
                              🔊
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                      <button
                        onClick={() => setEditTodo(todo)}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 11,
                          border: `1px solid ${T.bord}`,
                          background: T.glass,
                          cursor: "pointer",
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: T.muted,
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => remove(todo.id)}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 11,
                          border: "1.5px solid #fecdd3",
                          background: dark ? "rgba(244,63,94,0.1)" : "#fff1f2",
                          cursor: "pointer",
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#f43f5e",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {todos.some((t) => t.done) && (
              <button
                onClick={() => setTodos((p) => p.filter((t) => !t.done))}
                style={{
                  width: "100%",
                  marginTop: 14,
                  padding: "13px",
                  background: T.glass,
                  backdropFilter: "blur(10px)",
                  border: `1.5px dashed ${T.bord}`,
                  borderRadius: 16,
                  color: T.muted,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🗑️ Clear {todos.filter((t) => t.done).length} completed tasks
              </button>
            )}

            <div
              style={{
                textAlign: "center",
                marginTop: 20,
                fontSize: 12,
                color: T.muted,
                opacity: 0.5,
                lineHeight: 1.8,
              }}
            >
              ✏️ click edit to change anything · 🔔 voice alarm · ⠿ drag · ✓ for
              confetti 🎊
            </div>
          </>
        )}
      </div>
    </div>
  );
}
