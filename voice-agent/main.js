import { Conversation } from "@elevenlabs/client";

const statusEl = document.getElementById("status");
const toggle = document.getElementById("toggle");
const log = document.getElementById("log");
let conversation = null;
let lastAgentLine = null;

function setStatus(text, cls = "") {
  statusEl.textContent = text;
  statusEl.className = cls;
}

function addLine(cls, html) {
  const p = document.createElement("p");
  p.className = cls;
  p.innerHTML = html;
  log.append(p);
  p.scrollIntoView({ block: "end" });
  return p;
}

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

async function start() {
  toggle.hidden = true;
  setStatus("Conectando…");
  try {
    const res = await fetch("/api/session");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    conversation = await Conversation.startSession({
      conversationToken: data.token,
      connectionType: "webrtc",
      onConnect: () => setStatus(`Conectado · ${data.model}`),
      onModeChange: ({ mode }) =>
        setStatus(mode === "speaking" ? "IA falando… (fale pra interromper)" : "Ouvindo…", mode),
      onMessage: ({ role, source, message }) => {
        const isUser = (role ?? source) === "user";
        const p = addLine(isUser ? "user" : "agent", `<b>${isUser ? "Você" : "IA"}:</b> ${esc(message)}`);
        if (!isUser) lastAgentLine = p;
      },
      // Interrupção: mostra o que ela chegou a falar e risca o resto.
      onAgentResponseCorrection: ({ original_agent_response: full, corrected_agent_response: said }) => {
        if (!lastAgentLine) return;
        const rest = full.startsWith(said) ? full.slice(said.length) : "";
        lastAgentLine.innerHTML = `<b>IA:</b> ${esc(said)}<s>${esc(rest)}</s> <i>(interrompida)</i>`;
      },
      onError: (message) => addLine("error", esc(String(message))),
      onDisconnect: (details) => {
        conversation = null;
        setStatus(`Desconectado${details?.message ? ": " + details.message : ""}`);
        toggle.textContent = "Iniciar";
        toggle.hidden = false;
      },
    });
    toggle.textContent = "Encerrar";
    toggle.hidden = false;
  } catch (err) {
    setStatus("Não deu pra iniciar");
    addLine("error", esc(err.message));
    toggle.textContent = "Tentar de novo";
    toggle.hidden = false;
  }
}

toggle.onclick = () => (conversation ? conversation.endSession() : start());
start();
