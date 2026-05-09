import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = "https://ai-demand-orchestrator.onrender.com/api/demand";

// ── Fonts & Styles ─────────────────────────────────────────────────────────
const FONT_LINK = document.createElement("link");
FONT_LINK.rel = "stylesheet";
FONT_LINK.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap";
document.head.appendChild(FONT_LINK);

const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f; --surface: #111118; --surface2: #18181f;
    --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
    --accent: #6c63ff; --accent2: #a78bfa;
    --green: #10b981; --amber: #f59e0b; --red: #ef4444;
    --text: #f0f0f5; --muted: #6b6b80; --muted2: #9090a8;
    --font-display: 'Syne', sans-serif; --font-body: 'DM Sans', sans-serif; --font-mono: 'DM Mono', monospace;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }
  ::selection { background: rgba(108,99,255,0.3); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes msgIn { from{opacity:0;transform:translateY(8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(108,99,255,0.4)} 70%{box-shadow:0 0 0 8px rgba(108,99,255,0)} 100%{box-shadow:0 0 0 0 rgba(108,99,255,0)} }
  @keyframes typing { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
  @keyframes slideIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }

  .fade-up { animation: fadeUp 0.35s ease both; }
  .fade-up-1 { animation: fadeUp 0.35s 0.05s ease both; }
  .fade-up-2 { animation: fadeUp 0.35s 0.10s ease both; }
  .fade-up-3 { animation: fadeUp 0.35s 0.15s ease both; }
  .fade-up-4 { animation: fadeUp 0.35s 0.20s ease both; }
  .fade-up-5 { animation: fadeUp 0.35s 0.25s ease both; }

  .glow-btn {
    position:relative; overflow:hidden; background:var(--accent); color:#fff;
    border:none; cursor:pointer; font-family:var(--font-display); font-weight:700; font-size:14px;
    padding:12px 28px; border-radius:8px; transition:transform 0.15s, box-shadow 0.15s; letter-spacing:0.04em;
  }
  .glow-btn:hover { transform:translateY(-1px); box-shadow:0 8px 32px rgba(108,99,255,0.45); }
  .glow-btn:active { transform:translateY(0); }
  .glow-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; box-shadow:none; }
  .glow-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 50%,transparent 60%); background-size:200% 100%; animation:shimmer 2s infinite; }

  /* ── NEW: danger + secondary buttons ── */
  .danger-btn {
    background:rgba(239,68,68,0.12); color:#f87171;
    border:1px solid rgba(239,68,68,0.25); cursor:pointer;
    font-family:var(--font-body); font-size:13px; padding:9px 18px;
    border-radius:7px; font-weight:500; transition:background 0.15s, box-shadow 0.15s;
  }
  .danger-btn:hover { background:rgba(239,68,68,0.22); box-shadow:0 4px 16px rgba(239,68,68,0.2); }

  .ghost-btn {
    background:transparent; color:var(--muted2); border:1px solid var(--border2); cursor:pointer;
    font-family:var(--font-body); font-size:13px; padding:8px 16px; border-radius:6px;
    transition:color 0.15s, border-color 0.15s, background 0.15s;
  }
  .ghost-btn:hover { color:var(--text); background:var(--surface2); }

  .card { background:var(--surface); border:1px solid var(--border); border-radius:12px; transition:border-color 0.2s; }
  .card:hover { border-color:var(--border2); }

  .tag { display:inline-flex; align-items:center; gap:4px; font-family:var(--font-mono); font-size:10px; font-weight:500; padding:3px 8px; border-radius:4px; letter-spacing:0.06em; text-transform:uppercase; }
  .tag-purple { background:rgba(108,99,255,0.15); color:var(--accent2); border:1px solid rgba(108,99,255,0.25); }
  .tag-green  { background:rgba(16,185,129,0.12); color:#34d399; border:1px solid rgba(16,185,129,0.25); }
  .tag-amber  { background:rgba(245,158,11,0.12); color:#fbbf24; border:1px solid rgba(245,158,11,0.25); }
  .tag-red    { background:rgba(239,68,68,0.12); color:#f87171; border:1px solid rgba(239,68,68,0.25); }
  .tag-gray   { background:rgba(255,255,255,0.05); color:var(--muted2); border:1px solid var(--border); }

  .input-field {
    width:100%; background:var(--surface2); border:1px solid var(--border); border-radius:8px;
    color:var(--text); font-family:var(--font-body); font-size:14px; padding:11px 14px; outline:none;
    transition:border-color 0.2s, box-shadow 0.2s;
  }
  .input-field:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(108,99,255,0.15); }
  .input-field::placeholder { color:var(--muted); }
  .field-filled { border-color: rgba(16,185,129,0.4) !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.08) !important; }

  .spinner { width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,0.2); border-top-color:#fff; animation:spin 0.7s linear infinite; display:inline-block; }

  .risk-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }
  .risk-GREEN { background:var(--green); box-shadow:0 0 6px var(--green); }
  .risk-AMBER { background:var(--amber); box-shadow:0 0 6px var(--amber); }
  .risk-RED   { background:var(--red); box-shadow:0 0 6px var(--red); animation:pulse-ring 1.5s infinite; }

  .stage-bar { display:flex; overflow:hidden; border-radius:6px; border:1px solid var(--border); }
  .stage-seg { flex:1; padding:6px 4px; text-align:center; font-family:var(--font-mono); font-size:9px; font-weight:500; letter-spacing:0.05em; color:var(--muted); background:var(--surface2); border-right:1px solid var(--border); transition:background 0.2s, color 0.2s; }
  .stage-seg:last-child { border-right:none; }
  .stage-seg.active { background:rgba(108,99,255,0.2); color:var(--accent2); }
  .stage-seg.done   { background:rgba(16,185,129,0.1); color:#34d399; }

  .demand-card { cursor:pointer; padding:16px; transition:transform 0.15s, border-color 0.15s, box-shadow 0.15s; }
  .demand-card:hover { transform:translateY(-2px); border-color:rgba(108,99,255,0.4); box-shadow:0 8px 24px rgba(0,0,0,0.3); }
  .kanban-col { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; min-height:200px; }
  .kanban-col-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid var(--border); }

  .nav-link { font-family:var(--font-display); font-size:13px; font-weight:600; color:var(--muted2); cursor:pointer; padding:6px 14px; border-radius:6px; letter-spacing:0.04em; transition:color 0.15s, background 0.15s; background:transparent; border:none; }
  .nav-link:hover { color:var(--text); background:var(--surface2); }
  .nav-link.active { color:var(--text); background:var(--surface2); }

  .explainer-box { background:linear-gradient(135deg,rgba(108,99,255,0.08),rgba(167,139,250,0.05)); border:1px solid rgba(108,99,255,0.2); border-radius:10px; padding:16px; font-size:13px; color:var(--muted2); line-height:1.7; font-style:italic; }
  .stat-card { background:var(--surface2); border:1px solid var(--border); border-radius:10px; padding:20px; text-align:center; }
  .stat-num { font-family:var(--font-display); font-size:32px; font-weight:800; color:var(--text); line-height:1; }
  .stat-label { font-size:11px; color:var(--muted); margin-top:6px; text-transform:uppercase; letter-spacing:0.07em; font-family:var(--font-mono); }

  .processing-overlay { position:fixed; inset:0; background:rgba(10,10,15,0.85); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:999; flex-direction:column; gap:20px; }
  .orbit { width:60px; height:60px; border-radius:50%; border:2px solid var(--border); border-top:2px solid var(--accent); animation:spin 1s linear infinite; }

  /* ── NEW: info boxes ── */
  .asset-box { background:linear-gradient(135deg,rgba(16,185,129,0.08),rgba(52,211,153,0.04)); border:1px solid rgba(16,185,129,0.2); border-radius:10px; padding:16px; }
  .rebalance-box { background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(251,191,36,0.04)); border:1px solid rgba(245,158,11,0.25); border-radius:10px; padding:16px; }
  .email-box { background:linear-gradient(135deg,rgba(108,99,255,0.06),rgba(167,139,250,0.03)); border:1px solid rgba(108,99,255,0.15); border-radius:10px; padding:14px; }

  /* ── NEW: delete button on kanban card ── */
  .card-wrap { position:relative; margin-bottom:8px; }
  .card-delete-btn {
    position:absolute; top:8px; right:8px; z-index:10;
    background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15);
    border-radius:5px; width:24px; height:24px;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; opacity:0; transition:opacity 0.15s, background 0.15s;
  }
  .card-wrap:hover .card-delete-btn { opacity:1; }
  .card-delete-btn:hover { background:rgba(239,68,68,0.22); }

  /* ── NEW: delete confirm modal ── */
  .modal-overlay { position:fixed; inset:0; background:rgba(10,10,15,0.8); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:500; }
  .modal { background:var(--surface); border:1px solid var(--border2); border-radius:14px; padding:28px; max-width:400px; width:90%; animation:slideIn 0.2s ease; }

  .chat-bubble { animation: msgIn 0.3s ease both; max-width: 80%; }
  .bot-bubble { background:var(--surface2); border:1px solid var(--border2); border-radius:16px 16px 16px 4px; padding:12px 16px; font-size:14px; line-height:1.65; color:var(--text); }
  .user-bubble { background:var(--accent); border-radius:16px 16px 4px 16px; padding:12px 16px; font-size:14px; line-height:1.65; color:#fff; margin-left:auto; }
  .typing-dot { width:6px; height:6px; border-radius:50%; background:var(--muted2); display:inline-block; margin:0 2px; }
  .typing-dot:nth-child(1){animation:typing 1s 0.0s infinite}
  .typing-dot:nth-child(2){animation:typing 1s 0.15s infinite}
  .typing-dot:nth-child(3){animation:typing 1s 0.3s infinite}

  .chat-input-row { display:flex; gap:8px; padding:12px 16px; border-top:1px solid var(--border); background:var(--surface); border-radius:0 0 14px 14px; }
  .chat-input { flex:1; background:var(--surface2); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:var(--font-body); font-size:14px; padding:10px 14px; outline:none; transition:border-color 0.2s, box-shadow 0.2s; resize:none; }
  .chat-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(108,99,255,0.15); }
  .chat-input::placeholder { color:var(--muted); }
  .send-btn { background:var(--accent); border:none; cursor:pointer; border-radius:8px; width:40px; height:40px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:transform 0.15s, box-shadow 0.15s; }
  .send-btn:hover { transform:scale(1.05); box-shadow:0 4px 16px rgba(108,99,255,0.4); }
  .send-btn:disabled { opacity:0.4; cursor:not-allowed; transform:none; }
  .quick-reply { display:inline-block; cursor:pointer; background:var(--surface2); border:1px solid var(--border2); border-radius:20px; padding:6px 14px; font-size:12px; color:var(--accent2); font-family:var(--font-mono); margin:4px 4px 0 0; transition:background 0.15s, border-color 0.15s; }
  .quick-reply:hover { background:rgba(108,99,255,0.15); border-color:rgba(108,99,255,0.4); }
`;
document.head.appendChild(style);

// ── Helpers ────────────────────────────────────────────────────────────────
const STAGES = ["INTAKE","CLASSIFIED","ASSIGNED","IN_PROGRESS","DONE"];
const ROUTE_COLORS = { POC:"tag-purple", MVP:"tag-green", PROJECT:"tag-amber", HACKATHON:"tag-green", PARTNER:"tag-red" };
const RISK_LABEL   = { GREEN:"tag-green", AMBER:"tag-amber", RED:"tag-red" };
const PRIORITY_COLOR = { HIGH:"tag-red", MEDIUM:"tag-amber", LOW:"tag-green" };
function safeParse(v) { if(!v) return []; if(Array.isArray(v)) return v; try{return JSON.parse(v);}catch{return [];} }
function stageIndex(s) { return STAGES.indexOf(s); }

// ── Conversation steps (your original working CONV) ────────────────────────
const CONV = [
  {
    bot: "👋 Hi! I'm your AI Demand Assistant.\n\nI'll help you fill the form through a quick conversation. Let's go!\n\n**What's the title of your demand?**\ne.g. *AI contract risk detector for BFSI*",
    field: "title",
    validate: v => v.length > 3 ? null : "Please give a more descriptive title.",
  },
  {
    bot: (v) => `Got it — **"${v}"** 👍\n\n**What's your name?**`,
    field: "submitter",
    validate: v => v.length > 1 ? null : "Please enter your name.",
  },
  {
    bot: (v) => `Nice to meet you, **${v}**! 🙌\n\n**Which Business Unit is this for?**`,
    field: "bu",
    validate: v => v.length > 0 ? null : "Please enter a BU.",
    quickReplies: ["BFSI","HR","Retail","Healthcare","Manufacturing","Other"],
  },
  {
    bot: () => `Perfect. Now let me understand the demand.\n\n🔍 **What problem are you trying to solve?**\nDescribe the current pain point.`,
    store: "problem",
    validate: v => v.length > 8 ? null : "Please describe the problem in more detail.",
  },
  {
    bot: () => `Got it! 💡\n\n🎯 **What is the expected outcome?**\nWhat does success look like?`,
    store: "outcome",
    validate: v => v.length > 8 ? null : "Please describe the expected outcome.",
  },
  {
    bot: () => `Almost done! 🚀\n\n⚠️ **Any constraints or requirements?**\ne.g. compliance, tech stack, timeline\n*(type **none** if there are none)*`,
    store: "constraints",
    validate: () => null,
  },
  {
    bot: () => `Last one! 🎯\n\n💥 **What is the business impact?**\ne.g. *Reduces downtime, lowers maintenance costs, and improves operational efficiency.*`,
    store: "impact",
    validate: v => v.length > 8 ? null : "Please describe the expected business impact.",
    done: true,
  },
];

// ── NEW: Delete Confirm Modal ───────────────────────────────────────────────
function DeleteModal({ title, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom:16 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </div>
          <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:18, marginBottom:8 }}>Delete Demand?</div>
          <div style={{ color:"var(--muted2)", fontSize:14, lineHeight:1.5 }}>
            <strong style={{ color:"var(--text)" }}>"{title}"</strong> will be permanently removed from the pipeline. This cannot be undone.
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="ghost-btn" onClick={onCancel} style={{ flex:1 }}>Cancel</button>
          <button className="danger-btn" onClick={onConfirm} style={{ flex:1, textAlign:"center" }}>Delete Demand</button>
        </div>
      </div>
    </div>
  );
}

// ── ChatBot Component (your original working version) ─────────────────────
function ChatBot({ form, setForm }) {
  const [msgs, setMsgs]       = useState([]);
  const [input, setInput]     = useState("");
  const [convIdx, setConvIdx] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [isDone, setIsDone]   = useState(false);
  const [descParts, setDescParts] = useState({ problem:"", outcome:"", constraints:"", impact:"" });
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const initializedRef = useRef(false);

  const addMsg = (role, text, quickReplies) =>
    setMsgs(prev => [...prev, { role, text, quickReplies, id: Date.now() + Math.random() }]);

  const buildDesc = (parts) => {
    let d = "";
    if (parts.problem)   d += `Problem:\n${parts.problem}\n\n`;
    if (parts.outcome)   d += `Expected Outcome:\n${parts.outcome}\n\n`;
    if (parts.constraints && parts.constraints.toLowerCase() !== "none")
                         d += `Constraints:\n${parts.constraints}\n\n`;
    if (parts.impact)    d += `Impact:\n${parts.impact}`;
    return d.trim();
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    setTimeout(() => {
      const first = CONV[0];
      const botText = typeof first.bot === "function" ? first.bot("") : first.bot;
      addMsg("bot", botText, first.quickReplies);
      setConvIdx(0);
    }, 400);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, waiting]);

  const handleSend = async (override) => {
    const text = (override || input).trim();
    if (!text || waiting || isDone) return;
    setInput("");
    addMsg("user", text);
    setWaiting(true);
    await new Promise(r => setTimeout(r, 400));
    setWaiting(false);

    const step = CONV[convIdx];
    if (!step) return;

    if (step.validate) {
      const err = step.validate(text);
      if (err) { addMsg("bot", `⚠️ ${err}`); return; }
    }

    let newDescParts = { ...descParts };
    if (step.field) setForm(f => ({ ...f, [step.field]: text }));
    if (step.store) {
      newDescParts[step.store] = text;
      setDescParts(newDescParts);
      setForm(f => ({ ...f, description: buildDesc(newDescParts) }));
    }

    if (step.done) {
      setIsDone(true);
      addMsg("bot", "✅ **All done!** I've filled the form for you.\n\nReview the details on the right and hit **Submit Demand** when ready!");
      return;
    }

    const nextIdx = convIdx + 1;
    setConvIdx(nextIdx);
    const nextStep = CONV[nextIdx];
    if (nextStep?.bot) {
      const botText = typeof nextStep.bot === "function" ? nextStep.bot(text) : nextStep.bot;
      addMsg("bot", botText, nextStep.quickReplies);
    }
    inputRef.current?.focus();
  };

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
      <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10, background:"var(--surface2)" }}>
        <div style={{ position:"relative" }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,var(--accent),#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>
          <div style={{ position:"absolute", bottom:1, right:1, width:9, height:9, borderRadius:"50%", background:"var(--green)", border:"2px solid var(--surface2)" }}/>
        </div>
        <div>
          <div style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:14 }}>Demand Assistant</div>
          <div style={{ fontSize:11, color:"var(--green)", fontFamily:"var(--font-mono)" }}>● online</div>
        </div>
        {isDone && <div style={{ marginLeft:"auto" }}><span className="tag tag-green">Form Ready ✓</span></div>}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:12 }}>
        {msgs.map(msg => (
          <div key={msg.id} className="chat-bubble" style={{ alignSelf: msg.role==="user"?"flex-end":"flex-start", display:"flex", flexDirection:"column", gap:6 }}>
            <div className={msg.role==="bot" ? "bot-bubble" : "user-bubble"}>
              {msg.text.split('\n').map((line, i, arr) => {
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return <span key={i}>{parts.map((p,j) => j%2===1 ? <strong key={j}>{p}</strong> : p)}{i<arr.length-1&&<br/>}</span>;
              })}
            </div>
            {msg.quickReplies && (
              <div style={{ display:"flex", flexWrap:"wrap" }}>
                {msg.quickReplies.map(qr => <span key={qr} className="quick-reply" onClick={()=>handleSend(qr)}>{qr}</span>)}
              </div>
            )}
          </div>
        ))}
        {waiting && (
          <div className="chat-bubble" style={{ alignSelf:"flex-start" }}>
            <div className="bot-bubble" style={{ display:"flex", gap:4, alignItems:"center" }}>
              <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div className="chat-input-row">
        <input
          ref={inputRef}
          className="chat-input"
          placeholder={isDone ? "Form filled — submit it! 🚀" : "Type your answer and press Enter…"}
          value={input}
          disabled={isDone}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={handleKey}
          style={{ height:40 }}
        />
        <button className="send-btn" onClick={()=>handleSend()} disabled={!input.trim()||isDone||waiting}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}

// ── Submit Page (your original) ────────────────────────────────────────────
function SubmitPage({ onDone }) {
  const [form, setForm]       = useState({ title:"", description:"", submitter:"", bu:"" });
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);

  const loadSteps = ["Running Intake Agent…","Classifying domain & priority…","Routing demand…","Composing team…","Finalising tracking…"];

  const submit = async () => {
    if (!form.title||!form.description||!form.submitter||!form.bu) {
      setError("Please complete the conversation to fill all fields."); return;
    }
    setError(null); setLoading(true);
    const iv = setInterval(()=>setLoadStep(s=>Math.min(s+1,loadSteps.length-1)), 1800);
    try {
      const { data } = await axios.post(`${API}/submit`, form);
      clearInterval(iv); setResult(data); setLoading(false);
    } catch(e) {
      clearInterval(iv);
      setError(e?.response?.data?.error || e.message || "Server error — is the backend running?");
      setLoading(false); setLoadStep(0);
    }
  };

  if (loading) return (
    <div className="processing-overlay">
      <div className="orbit"/>
      <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:18 }}>Processing your demand</div>
      <div style={{ fontFamily:"var(--font-mono)", fontSize:12, color:"var(--muted2)", animation:"blink 1s infinite" }}>{loadSteps[loadStep]}</div>
    </div>
  );

  if (result) return <ResultView result={result} onDone={onDone}/>;

  const filled = [form.title,form.submitter,form.bu,form.description].filter(Boolean).length;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, maxWidth:1100, margin:"36px auto", padding:"0 24px", height:"calc(100vh - 120px)" }}>
      <div className="fade-up" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
        <div style={{ marginBottom:14 }}>
          <h2 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:20, marginBottom:4 }}>AI Demand Assistant</h2>
          <p style={{ color:"var(--muted2)", fontSize:13 }}>Chat with the bot — it fills the form automatically.</p>
        </div>
        <div style={{ flex:1, minHeight:0 }}>
          <ChatBot form={form} setForm={setForm}/>
        </div>
      </div>

      <div className="fade-up-1" style={{ display:"flex", flexDirection:"column" }}>
        <div style={{ marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h2 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:20, marginBottom:4 }}>Form Preview</h2>
            <p style={{ color:"var(--muted2)", fontSize:13 }}>Auto-filled as you chat · {filled}/4 fields complete</p>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {["title","submitter","bu","description"].map(f=>(
              <div key={f} style={{ width:8, height:8, borderRadius:"50%", background:form[f]?"var(--green)":"var(--border2)", transition:"background 0.3s", boxShadow:form[f]?"0 0 6px var(--green)":"none" }}/>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14, flex:1 }}>
          {[
            { key:"title",     label:"Demand Title",   placeholder:"Waiting for your answer…" },
            { key:"submitter", label:"Your Name",      placeholder:"Waiting for your answer…" },
            { key:"bu",        label:"Business Unit",  placeholder:"Waiting for your answer…" },
          ].map(({ key, label, placeholder })=>(
            <div key={key}>
              <label style={{ display:"block", fontSize:11, fontFamily:"var(--font-mono)", color:"var(--muted2)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>{label}</label>
              <input className={`input-field${form[key]?" field-filled":""}`} placeholder={placeholder} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>
            </div>
          ))}

          <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
            <label style={{ display:"block", fontSize:11, fontFamily:"var(--font-mono)", color:"var(--muted2)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Description</label>
            <textarea className={`input-field${form.description?" field-filled":""}`} style={{ flex:1, minHeight:120, resize:"vertical" }} placeholder="Auto-filled from your chat answers…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          </div>

          {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:13, fontFamily:"var(--font-mono)" }}>{error}</div>}
          <button className="glow-btn" onClick={submit} style={{ width:"100%" }}>Submit Demand →</button>
        </div>
      </div>
    </div>
  );
}

// ── Result View — NEW: added asset-first + rebalance boxes ─────────────────
function ResultView({ result, onDone }) {
  const { classification:c, decision:d, resource:r, tracking:t } = result;
  const team   = Array.isArray(r?.team) ? r.team : safeParse(r?.team);
  const skills = Array.isArray(c?.required_skills) ? c.required_skills : safeParse(c?.required_skills);
  return (
    <div style={{ maxWidth:640, margin:"40px auto", padding:"0 24px" }}>
      <div className="fade-up" style={{ marginBottom:24, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <h2 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:20 }}>Demand Processed</h2>
          <p style={{ color:"var(--muted2)", fontSize:13 }}>All 4 agents completed successfully</p>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        {[
          {label:"Route",val:d?.route,tag:ROUTE_COLORS[d?.route]||"tag-gray"},
          {label:"Domain",val:c?.domain,tag:"tag-purple"},
          {label:"Priority",val:c?.priority,tag:PRIORITY_COLOR[c?.priority]||"tag-gray"},
          {label:"Risk",val:t?.risk_flag,tag:RISK_LABEL[t?.risk_flag]||"tag-green"},
        ].map(({label,val,tag},i)=>(
          <div key={label} className={`card fade-up-${i+1}`} style={{ padding:"14px 16px" }}>
            <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>{label}</div>
            <span className={`tag ${tag}`}>{val||"—"}</span>
          </div>
        ))}
      </div>

      {/* NEW: Asset-first recommendation */}
      {c?.reuse_recommendation && c.reuse_recommendation !== "None identified" && (
        <div className="asset-box fade-up-2" style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"#34d399", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>♻ Asset-First Recommendation</div>
          <div style={{ fontSize:13, color:"var(--muted2)", lineHeight:1.6 }}>{c.reuse_recommendation}</div>
        </div>
      )}

      {d?.reason && (
        <div className="explainer-box fade-up-3" style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"var(--accent2)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8, fontStyle:"normal" }}>Why this route?</div>
          {d.reason}
        </div>
      )}

      {/* NEW: Rebalance alert */}
      {r?.rebalance_needed && (
        <div className="rebalance-box fade-up-3" style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"#fbbf24", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>⚠ Rebalance Required</div>
          <div style={{ fontSize:13, color:"var(--muted2)", lineHeight:1.6 }}>{r.rebalance_suggestion || "Agent detected team gaps — manual rebalancing may be needed."}</div>
        </div>
      )}

      {skills.length>0 && (
        <div className="card fade-up-4" style={{ padding:"14px 16px", marginBottom:14 }}>
          <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Required Skills</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{skills.map(s=><span key={s} className="tag tag-gray">{s}</span>)}</div>
        </div>
      )}

      {team.length>0 && (
        <div className="card fade-up-5" style={{ padding:"14px 16px", marginBottom:20 }}>
          <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Team Composed</div>
          {team.map((m,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:i<team.length-1?"1px solid var(--border)":"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:"rgba(108,99,255,0.15)", border:"1px solid rgba(108,99,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"var(--accent2)", fontFamily:"var(--font-display)" }}>{(m.name||"?")[0]}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{m.name}</div>
                  <div style={{ fontSize:11, color:"var(--muted2)" }}>{m.role}</div>
                </div>
              </div>
              <div style={{ fontSize:12, fontFamily:"var(--font-mono)", color:"var(--green)" }}>{m.fit_score}% fit</div>
            </div>
          ))}
        </div>
      )}

      <button className="glow-btn" onClick={onDone} style={{ width:"100%" }}>View Pipeline Dashboard →</button>
    </div>
  );
}

// ── Dashboard — NEW: delete button on CLASSIFIED cards ─────────────────────
function Dashboard({ onSelect }) {
  const [demands, setDemands]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }

  const load = () => { axios.get(API).then(r=>{setDemands(r.data);setLoading(false);}).catch(()=>setLoading(false)); };
  useEffect(()=>{ load(); const iv=setInterval(load,10000); return()=>clearInterval(iv); },[]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API}/${deleteTarget.id}`);
      setDemands(prev => prev.filter(d => d.id !== deleteTarget.id));
    } catch(e) { console.error(e); }
    setDeleteTarget(null);
  };

  const total=demands.length, highRisk=demands.filter(d=>d.risk_flag==="RED").length,
        done=demands.filter(d=>d.stage==="DONE").length, inFlight=demands.filter(d=>d.stage==="IN_PROGRESS").length;

  return (
    <div style={{ padding:"32px", maxWidth:1400, margin:"0 auto" }}>
      {deleteTarget && <DeleteModal title={deleteTarget.title} onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)}/>}

      <div className="fade-up" style={{ marginBottom:28, display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:26, marginBottom:4 }}>Demand Pipeline</h1>
          <p style={{ color:"var(--muted2)", fontSize:13 }}>Live orchestration dashboard — auto-refreshes every 10s</p>
        </div>
        <button className="ghost-btn" onClick={load}>↻ Refresh</button>
      </div>

      <div className="fade-up-1" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:28 }}>
        {[{num:total,label:"Total Demands"},{num:inFlight,label:"In Progress"},{num:done,label:"Completed"},{num:highRisk,label:"High Risk",color:highRisk>0?"var(--red)":undefined}].map(({num,label,color})=>(
          <div key={label} className="stat-card">
            <div className="stat-num" style={color?{color}:{}}>{num}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:60, color:"var(--muted2)", fontFamily:"var(--font-mono)", fontSize:13 }}>
          <div className="spinner" style={{ margin:"0 auto 12px" }}/>Loading demands…
        </div>
      ) : demands.length===0 ? (
        <div style={{ textAlign:"center", padding:80, color:"var(--muted2)" }}>
          <div style={{ fontSize:40, marginBottom:12, opacity:0.3 }}>⬡</div>
          <div style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:16, marginBottom:6 }}>No demands yet</div>
          <div style={{ fontSize:13 }}>Submit your first demand to see the pipeline</div>
        </div>
      ) : (
        <div className="fade-up-2" style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
          {STAGES.map(stage=>{
            const sd=demands.filter(d=>d.stage===stage);
            return (
              <div key={stage} className="kanban-col">
                <div className="kanban-col-header">
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:10, fontWeight:500, color:"var(--muted2)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{stage}</span>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--muted)", background:"var(--surface2)", borderRadius:4, padding:"2px 7px", border:"1px solid var(--border)" }}>{sd.length}</span>
                </div>
                {sd.map(d=>(
                  <div key={d.id} className="card-wrap">
                    <div className="card demand-card" onClick={()=>onSelect(d.id)}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                        <span className={`risk-dot risk-${d.risk_flag||"GREEN"}`}/>
                        {d.route&&<span className={`tag ${ROUTE_COLORS[d.route]||"tag-gray"}`}>{d.route}</span>}
                      </div>
                      <div style={{ fontWeight:500, fontSize:13, marginBottom:4, lineHeight:1.4 }}>{d.title}</div>
                      <div style={{ fontSize:11, color:"var(--muted2)", marginBottom:8 }}>{d.bu} · {d.submitter}</div>
                      {d.domain&&<span className="tag tag-purple" style={{ marginRight:4 }}>{d.domain}</span>}
                      {d.priority&&<span className={`tag ${PRIORITY_COLOR[d.priority]||"tag-gray"}`}>{d.priority}</span>}
                    </div>
                    {/* Delete button — only on CLASSIFIED cards, visible on hover */}
                    {stage === "CLASSIFIED" && (
                      <div
                        className="card-delete-btn"
                        title="Delete demand"
                        onClick={e=>{ e.stopPropagation(); setDeleteTarget({id:d.id,title:d.title}); }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Detail Page — NEW: delete button, email banner, asset-first, rebalance ─
function DetailPage({ id, onBack, onDelete }) {
  const [d, setD]             = useState(null);
  const [advancing, setAdvancing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(()=>{ axios.get(`${API}/${id}`).then(r=>setD(r.data)); },[id]);

  const advance = async () => {
    const idx=stageIndex(d.stage);
    if(idx>=STAGES.length-1) return;
    const next = STAGES[idx+1];
    setAdvancing(true);
    try {
      await axios.patch(`${API}/${d.id}/stage`,{stage:next});
      setD({...d,stage:next});
      if (next === "ASSIGNED") setEmailSent(true); // show email banner
    } catch(e){ console.error(e); }
    setAdvancing(false);
  };

  const handleDelete = async () => {
    try { await axios.delete(`${API}/${d.id}`); onDelete(); }
    catch(e){ console.error(e); }
  };

  if(!d) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:400, color:"var(--muted2)", fontFamily:"var(--font-mono)", fontSize:13 }}><div className="spinner" style={{ marginRight:10 }}/> Loading…</div>;

  const team=safeParse(d.team), skills=safeParse(d.required_skills), stageIdx=stageIndex(d.stage);

  return (
    <div style={{ maxWidth:720, margin:"40px auto", padding:"0 24px" }}>
      {/* Header row: back button + delete button */}
      <div className="fade-up" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <button className="ghost-btn" onClick={onBack}>← Back to Pipeline</button>
        {d.stage === "CLASSIFIED" && (
          <button className="danger-btn" onClick={handleDelete}>🗑 Delete Demand</button>
        )}
      </div>

      <div className="fade-up-1" style={{ marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:8 }}>
          <h1 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:22, lineHeight:1.3 }}>{d.title}</h1>
          <span className={`tag ${ROUTE_COLORS[d.route]||"tag-gray"}`} style={{ flexShrink:0, fontSize:11 }}>{d.route}</span>
        </div>
        <p style={{ color:"var(--muted2)", fontSize:13, lineHeight:1.6 }}>{d.description}</p>
      </div>

      <div className="fade-up-2" style={{ marginBottom:20 }}>
        <div className="stage-bar">{STAGES.map((s,i)=><div key={s} className={`stage-seg${i<stageIdx?" done":i===stageIdx?" active":""}`}>{s.replace("_"," ")}</div>)}</div>
      </div>

      {/* NEW: Email sent banner — appears after advancing to ASSIGNED */}
      {emailSent && (
        <div className="email-box fade-up-2" style={{ marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <div style={{ fontSize:13, color:"var(--muted2)" }}>
            <span style={{ color:"var(--accent2)", fontWeight:500 }}>Assignment email triggered</span> — team members notified automatically
          </div>
        </div>
      )}

      <div className="fade-up-3" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        {[["Domain",d.domain,"tag-purple"],["Priority",d.priority,PRIORITY_COLOR[d.priority]||"tag-gray"],["Complexity",d.complexity,"tag-gray"],["Risk",d.risk_flag,RISK_LABEL[d.risk_flag]||"tag-green"],["SLA",d.sla_days?`${d.sla_days} days`:"—","tag-gray"],["Predicted End",d.predicted_end||"—","tag-gray"]].map(([label,val,tag])=>(
          <div key={label} className="card" style={{ padding:"12px 14px" }}>
            <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>{label}</div>
            <span className={`tag ${tag}`}>{val||"—"}</span>
          </div>
        ))}
      </div>

      {/* NEW: Asset-first recommendation */}
      {d.reuse_recommendation && d.reuse_recommendation !== "None identified" && (
        <div className="asset-box fade-up-3" style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"#34d399", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>♻ Asset-First Recommendation</div>
          <div style={{ fontSize:13, color:"var(--muted2)", lineHeight:1.6 }}>{d.reuse_recommendation}</div>
        </div>
      )}

      {d.route_reason && (
        <div className="explainer-box fade-up-4" style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"var(--accent2)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8, fontStyle:"normal" }}>◈ Why this routing decision?</div>
          {d.route_reason}
        </div>
      )}

      {/* NEW: Rebalance alert */}
      {d.rebalance_needed === 1 && (
        <div className="rebalance-box fade-up-4" style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"#fbbf24", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>⚠ Continuous Rebalancing Alert</div>
          <div style={{ fontSize:13, color:"var(--muted2)", lineHeight:1.6 }}>{d.rebalance_suggestion || "Agent detected fulfilment gaps — team composition may need adjustment."}</div>
        </div>
      )}

      {skills.length>0 && (
        <div className="card fade-up-4" style={{ padding:"14px 16px", marginBottom:14 }}>
          <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Required Skills</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{skills.map(s=><span key={s} className="tag tag-gray">{s}</span>)}</div>
        </div>
      )}

      {team.length>0 && (
        <div className="card fade-up-5" style={{ padding:"14px 16px", marginBottom:20 }}>
          <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Assigned Team</div>
          {team.map((m,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:i<team.length-1?"1px solid var(--border)":"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(108,99,255,0.15)", border:"1px solid rgba(108,99,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"var(--accent2)", fontFamily:"var(--font-display)" }}>{(m.name||"?")[0]}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{m.name}</div>
                  <div style={{ fontSize:11, color:"var(--muted2)" }}>{m.role}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize:12, fontFamily:"var(--font-mono)", color:"var(--green)", textAlign:"right" }}>{m.fit_score}%</div>
                <div style={{ fontSize:10, color:"var(--muted)", textAlign:"right" }}>fit score</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {stageIdx<STAGES.length-1 ? (
        <button className="glow-btn" onClick={advance} disabled={advancing} style={{ width:"100%" }}>
          {advancing?<><span className="spinner"/> Processing…</>:`Advance to ${STAGES[stageIdx+1]} →`}
        </button>
      ) : (
        <div style={{ textAlign:"center", padding:16, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:8, color:"#34d399", fontFamily:"var(--font-mono)", fontSize:13 }}>✓ Demand completed</div>
      )}
    </div>
  );
}

// ── Nav (your original) ────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  return (
    <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(10,10,15,0.85)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--border)", padding:"0 32px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:28, height:28, borderRadius:7, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="4" cy="4" r="2.5" fill="white"/>
            <circle cx="12" cy="4" r="2.5" fill="rgba(255,255,255,0.5)"/>
            <circle cx="4" cy="12" r="2.5" fill="rgba(255,255,255,0.5)"/>
            <circle cx="12" cy="12" r="2.5" fill="white"/>
            <line x1="4" y1="4" x2="12" y2="4" stroke="white" strokeWidth="1"/>
            <line x1="4" y1="4" x2="4" y2="12" stroke="white" strokeWidth="1"/>
            <line x1="12" y1="4" x2="12" y2="12" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
        <span style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:15 }}>AI-Orchestrator</span>
      </div>
      <div style={{ display:"flex", gap:4 }}>
        <button className={`nav-link${page==="dashboard"?" active":""}`} onClick={()=>setPage("dashboard")}>Dashboard</button>
        <button className={`nav-link${page==="submit"?" active":""}`} onClick={()=>setPage("submit")}>+ Submit Demand</button>
      </div>
    </nav>
  );
}

// ── Root — NEW: pass onDelete to DetailPage ────────────────────────────────
export default function App() {
  const [page, setPage]             = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  return (
    <div style={{ minHeight:"100vh" }}>
      <Nav page={page} setPage={setPage}/>
      {page==="dashboard" && <Dashboard onSelect={id=>{setSelectedId(id);setPage("detail");}}/>}
      {page==="submit"    && <SubmitPage onDone={()=>setPage("dashboard")}/>}
      {page==="detail"    && (
        <DetailPage
          id={selectedId}
          onBack={()=>setPage("dashboard")}
          onDelete={()=>setPage("dashboard")}
        />
      )}
    </div>
  );
}