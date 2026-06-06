# 🧠 ResearchMind

> AI-powered reasoning agent that answers complex questions by searching, analyzing, and synthesizing information from multiple sources — grounded by Microsoft Foundry IQ.

Built for the **Agents League Hackathon 2026** hosted by Microsoft.

---

## 🎯 What It Does

ResearchMind takes any complex question and:

1. **Decomposes** it into 3–4 focused sub-questions
2. **Searches** the live web via Microsoft Foundry IQ grounding
3. **Detects conflicts** — identifies where sources agree or disagree
4. **Synthesizes** a final cited answer with a confidence rating

---

## 🏗️ Architecture

```
User Question
      ↓
React Frontend (localhost:5173)
      ↓
Express Backend (localhost:3001)
      ↓
Microsoft Azure AI Foundry (Responses API)
      ↓
Foundry IQ — Web Search Grounding (Bing)
      ↓
Cited, structured research report
```

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **AI Agent:** Microsoft Azure AI Foundry
- **Knowledge Grounding:** Microsoft Foundry IQ (Web Search)
- **Model:** GPT-4o via Azure AI Foundry

---

## ✨ Features

- 🔍 Multi-step reasoning across live web sources
- 📎 Automatic source citation and counting
- ⚖️ Source conflict detection
- 📊 Confidence rating (High / Medium-High / Medium / Low)
- ⏱️ Research time tracking
- 📋 Copy & export report as Markdown
- 🕐 Recent question history
- ❓ How it works modal

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- Azure AI Foundry project with Foundry IQ configured
- Azure CLI installed and logged in (`az login`)

### Setup

```bash
# Clone the repo
git clone https://github.com/durtymurty/research-mind.git
cd research-mind

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root:

```
VITE_AZURE_ENDPOINT=https://your-resource.services.ai.azure.com
VITE_AZURE_PROJECT=your-project-name
VITE_AZURE_API_KEY=your-api-key
VITE_AGENT_NAME=research-mind
```

### Run

```bash
# Terminal 1 — Frontend
npm run dev

# Terminal 2 — Backend
node server.js
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🏆 Hackathon Track

- **Track:** Reasoning Agents (Microsoft Foundry)
- **IQ Layer:** Foundry IQ — Web Search Grounding
- **Event:** Agents League @ AISF 2026

---

## 👤 Author

**Murtaza Bootwala**
- GitHub: [@durtymurty](https://github.com/durtymurty)
- Cal Poly SLO — Computer Engineering