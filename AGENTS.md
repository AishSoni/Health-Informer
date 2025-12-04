# AGENTS.md – Health Informer (with core backend from Narada AI)

## 1️⃣ Project Name

**Health Informer**
*A dedicated Health News Curator product built on Narada AI’s robust AI orchestration layer.*

---

## 2️⃣ Problem Statement (Verbatim from assignment)

> **Problem Statement 1: AI-Based Health News Curator**
> Task: Summarize and simplify health news articles into a daily feed.
> Expected Flow:
> ● Screen 1: Load mock news articles or RSS dump.
> ● Screen 2: AI summarizes each into 2-line TL;DR + 3 key takeaways.
> ● Screen 3: Display feed with pagination and pull-to-refresh.
> ● Screen 4: Expand article →AI rewrites in simpler, friendly tone.
> AI Usage Guidance:
> Focus on clean, consistent summary formatting. Handle regenerate and refresh states gracefully. 

---

## 3️⃣ Context: Starting Point → Narada AI

This project extends **Narada AI – Deep Research Agent**, which currently includes (among other things):

* Advanced AI orchestration for search + summarization
* Next.js 15 + React + Tailwind UI foundations
* Non-required tech: Qdrant VectorDB + Ollama embeddings + RAG stack (buggy & irrelevant to PS1) 

🛑 **These knowledge base & embeddings features MUST be removed/disabled** for Health Informer:

| Feature                                     | Location                                | Action Required                     |
| ------------------------------------------- | --------------------------------------- | ----------------------------------- |
| Qdrant integration                          | Docker setup + `lib/*` calls + env vars | REMOVE                              |
| Embedding models (Ollama/OpenAI embeddings) | `.env.local`, code paths                | REMOVE                              |
| Knowledge base UI pages & upload option     | Any `Knowledge Base` screens            | REMOVE links + code                 |
| MCP server integration (if KB related)      | Remove any dependency                   | REMOVE or mark optional in main app |

We should **not** expose non-functional or confusing unused features in the assignment build.

---

## 4️⃣ Final Product: Health Informer

A **clean consumer experience layer** on top of Narada’s AI prompting engine:

| Layer         | Tech & Responsibility                   |
| ------------- | --------------------------------------- |
| 🎨 UI         | 4 screens + polished feed experience    |
| 🧠 AI layer   | Summaries + simplified article rewrites |
| 📦 Data layer | Local JSON of mock health news articles |
| 🚫 Removed    | Qdrant, embeddings, knowledge base CRUD |

Focus = **UI + UX + prompt engineering** → exactly what assignment evaluates. 

---

## 5️⃣ Action Plan for Coding Agent

### ✔ Phase 1 — Remove / Disable Unneeded Systems

**Remove entirely:**

* Qdrant Docker config & setup
* Qdrant client imports & calls in `lib/`
* Embedding model configuration
* Knowledge base UI & routes
* Upload/scrape routines designed for KB ingestion
* Any environment variables related to embeddings / KB

**Outcomes:**

* Codebase slimmer
* Deployability improves
* No broken UX visible

---

### ✔ Phase 2 — Create the Health Informer Flow

Add new routes:

```
app/health-news/                # Feature root
  ├─ page.tsx                  # Screen 1 - Load articles / welcome
  ├─ summarize/page.tsx        # Screen 2
  ├─ feed/page.tsx             # Screen 3
  └─ article/[id]/page.tsx     # Screen 4 - Detail + rewrite
```

Add supporting structures:

```
app/api/health-news/
  ├─ articles/route.ts         # GET list from JSON
  ├─ articles/[id]/route.ts    # GET one article
  ├─ summarize/route.ts        # POST summarization
  └─ rewrite/route.ts          # POST simplified rewrite
data/health-news.json          # Mock articles
lib/health-news/               # Shared types + AI helpers
context/HealthNewsContext.tsx  # State
```

---

### ✔ Phase 3 — Implement Required Screens

*(Matching PS1 exactly)*

| Screen               | Route                       | Key Features                 |
| -------------------- | --------------------------- | ---------------------------- |
| 1. Article ingestion | `/health-news`              | Load JSON, skeleton UI       |
| 2. Summarizer flow   | `/health-news/summarize`    | Progress indicator, retries  |
| 3. Feed UI           | `/health-news/feed`         | Pagination + pull-to-refresh |
| 4. Detail + rewrite  | `/health-news/article/[id]` | Regenerate action            |

Animations + UI polish required.

---

## 6️⃣ AI Prompt Definitions

### Summary Prompt

**Output must be strict JSON**

```
{
  "tldr": "<max 2 sentences>",
  "keyTakeaways": [
    "<short bullet>",
    "<short bullet>",
    "<short bullet>"
  ]
}
```

* Designed for non-experts
* Friendly
* Zero hallucination

### Rewrite Prompt

**One paragraph or short sections**, conversational tone
No new medical advice beyond article content.

Retries if malformed output → required.

---

## 7️⃣ UI / UX Success Metrics

* Animated transitions (Framer Motion optional)
* Shimmer loaders
* Sticky header + refresh
* Tap card → detail modal/route
* Responsive (desktop + mobile)
* Smooth navigation (Next.js App Router)

This project must **feel like a polished health product**, not a dev tool.

---

## 8️⃣ Deployment Requirements

* Must run with:

  ```
  npm install && npm run dev
  ```
* Hosted optional but recommended (Vercel ideal)
* KB + embeddings removed ensures:

✔ Faster build
✔ No Docker dependency
✔ Production validation much easier

---

## 9️⃣ README Changes

Create **ASSIGNMENT-PS1.md** with:

* Screenshots of each screen
* Prompts used & iterations
* Architecture diagram: HEALTH INFORMER only
* Known issues + improvements
* Link to original Narada project for context

---

## 10️⃣ Final Priorities Checklist

| Priority | Task                                 | Status |
| -------- | ------------------------------------ | ------ |
| P0       | Remove VectorDB + embeddings + KB UI | ⬜      |
| P1       | Create mock article dataset          | ⬜      |
| P1       | Build 4-screen flow                  | ⬜      |
| P1       | Summarization + rewrite APIs         | ⬜      |
| P2       | Pagination + pull-to-refresh         | ⬜      |
| P2       | UI polish + animations               | ⬜      |
| P3       | Deployment (Vercel)                  | ⬜      |
| P3       | Documentation polish                 | ⬜      |

---

## Summary for your Coding Agent

> **Extend Narada into a new vertical called “Health Informer” — a polished Health News Curator that removes all research-agent database features and focuses entirely on a delightful News → Summarization → Feed → Detail flow.
> Deliver an assignment-ready, visually polished product.**

---