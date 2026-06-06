import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./App.css";

const EXAMPLES = [
  "What are the latest breakthroughs in nuclear fusion and where do experts disagree?",
  "What are the pros and cons of universal basic income?",
  "How does climate change affect global food security and what do scientists disagree on?",
];

const STEPS = [
  "🔍 Breaking into sub-queries",
  "📡 Searching knowledge sources",
  "🧩 Detecting source conflicts",
  "✍️ Synthesizing with citations",
];

function extractConfidence(text) {
  const patterns = [
    /overall confidence[^:\n]*[:]\s*\*{0,2}(high|medium-high|medium|low)\*{0,2}/i,
    /confidence rating[^:\n]*[:]\s*\*{0,2}(high|medium-high|medium|low)\*{0,2}/i,
    /confidence[^:\n]*[:]\s*\*{0,2}(high|medium-high|medium|low)\*{0,2}/i,
    /\*{0,2}(high|medium-high|medium|low)\*{0,2}\s*confidence/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const word = match[1].toLowerCase();
      return word.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("-");
    }
  }
  return null;
}

function countSources(text) {
  const matches = text.match(/\[([^\]]+)\]\(https?:\/\/[^\)]+\)/g);
  return matches ? new Set(matches).size : 0;
}

function downloadMarkdown(text, question) {
  const blob = new Blob([`# Research Report\n\n**Question:** ${question}\n\n---\n\n${text}`], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "research-report.md";
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [history, setHistory] = useState([]);
  const [researchTime, setResearchTime] = useState(null);
  const responseRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!loading) return;
    setActiveStep(0);
    const interval = setInterval(() => {
      setActiveStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [response]);

  const ask = async (q) => {
    const query = q || question;
    if (!query.trim()) return;
    if (q) setQuestion(q);
    setLoading(true);
    setError(null);
    setResponse(null);
    setResearchTime(null);
    startTimeRef.current = Date.now();

    try {
      const res = await axios.post("http://localhost:3001/api/research", { question: query });
      const elapsed = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
      setResearchTime(elapsed);
      setResponse(res.data);
      setHistory((prev) => {
        const next = [{ question: query, time: elapsed }, ...prev.filter(h => h.question !== query)];
        return next.slice(0, 5);
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const copyReport = () => {
    if (!response?.text) return;
    navigator.clipboard.writeText(response.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confidence = response?.text ? extractConfidence(response.text) : null;
  const sourceCount = response?.text ? countSources(response.text) : 0;

  const confidenceColor = {
    "High": "#22c55e",
    "Medium-High": "#84cc16",
    "Medium": "#f59e0b",
    "Low": "#ef4444",
  };

  const confidenceWidth = {
    "High": "100%",
    "Medium-High": "75%",
    "Medium": "50%",
    "Low": "25%",
  };

  return (
    <div className="app">
      {showHow && (
        <div className="modal-overlay" onClick={() => setShowHow(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>How ResearchMind Works</span>
              <button className="modal-close" onClick={() => setShowHow(false)}>✕</button>
            </div>
            <div className="modal-body">
              {[
                { title: "Question Decomposition", desc: "Your question is broken into 3–4 focused sub-questions by the reasoning agent." },
                { title: "Foundry IQ Retrieval", desc: "Microsoft Foundry IQ searches the live web and private knowledge sources simultaneously, returning cited, grounded results." },
                { title: "Source Conflict Detection", desc: "The agent compares findings across sources, identifying where they agree, disagree, or leave gaps." },
                { title: "Cited Synthesis", desc: "A final answer is synthesized with every claim traced back to its source and a confidence rating applied." },
              ].map((s, i) => (
                <div key={i} className="how-step">
                  <div className="how-num">{i + 1}</div>
                  <div>
                    <strong>{s.title}</strong>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
              <div className="how-footer">Built on Microsoft Azure AI Foundry • Agents League Hackathon 2026</div>
            </div>
          </div>
        </div>
      )}

      <button className="help-btn" onClick={() => setShowHow(true)}>?</button>

      <header>
        <div className="logo">
          <div className="logo-icon">🧠</div>
          <h1>ResearchMind</h1>
        </div>
        <p>AI-powered reasoning agent • Grounded by Microsoft Foundry IQ</p>
        <div className="badge-row">
          <div className="badge"><span>⚡</span>Foundry IQ</div>
          <div className="badge"><span>🌐</span>Web Grounded</div>
          <div className="badge"><span>🔍</span>Multi-step Reasoning</div>
        </div>
      </header>

      {history.length > 0 && (
        <div className="history-bar">
          <span className="history-label">Recent:</span>
          {history.map((h, i) => (
            <button key={i} className="history-chip" onClick={() => ask(h.question)}>
              {h.question.length > 40 ? h.question.slice(0, 40) + "..." : h.question}
              <span className="history-chip-time">{h.time}s</span>
            </button>
          ))}
        </div>
      )}

      <div className="input-card">
        <div className="input-label">
          Research Question
          <span className="char-count">{question.length} chars</span>
        </div>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything complex..."
          rows={4}
          onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) ask(); }}
        />
        <div className="examples">
          {EXAMPLES.map((ex, i) => (
            <button key={i} className="example-btn" onClick={() => setQuestion(ex)}>
              <span className="example-arrow">→</span> {ex}
            </button>
          ))}
        </div>
        <div className="input-footer">
          <span className="hint">Ctrl + Enter to submit</span>
          <button className="research-btn" onClick={() => ask()} disabled={loading}>
            {loading ? "Researching..." : "Research →"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="loading-header">
            <div className="spinner" />
            <div className="loading-title">Agent is reasoning across sources...</div>
          </div>
          <div className="steps">
            {STEPS.map((step, i) => (
              <div key={i} className={`step ${i <= activeStep ? "step-active" : ""}`}>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error">⚠️ {String(error)}</div>}

      {response && response.text && (
        <div className="response" ref={responseRef}>
          <div className="response-header">
            <div className="response-title">
              <div className="response-dot" />
              Research Report
            </div>
            <div className="response-actions">
              {researchTime && <div className="time-badge">⏱ {researchTime}s</div>}
              {sourceCount > 0 && <div className="source-badge">📎 {sourceCount} sources</div>}
              <button className="copy-btn" onClick={copyReport}>{copied ? "✓ Copied" : "Copy"}</button>
              <button className="copy-btn" onClick={() => downloadMarkdown(response.text, question)}>↓ Export</button>
              <button className="clear" onClick={() => { setResponse(null); setQuestion(""); }}>New Question</button>
            </div>
          </div>

          {confidence && (
            <div className="confidence-bar-wrap">
              <div className="confidence-label">
                <span>Confidence</span>
                <span style={{ color: confidenceColor[confidence] || "#a78bfa" }}>{confidence}</span>
              </div>
              <div className="confidence-track">
                <div className="confidence-fill" style={{
                  width: confidenceWidth[confidence] || "50%",
                  background: confidenceColor[confidence] || "#a78bfa",
                }} />
              </div>
            </div>
          )}

          <div className="response-body markdown">
            <ReactMarkdown>{response.text}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}