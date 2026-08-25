# Autonomous Research Agent — Sectors Hackathon 2026

## 1. Project Overview

Project ini adalah **Autonomous Financial Research Agent** untuk Sectors Hackathon 2026.

Tujuan utama:
- Membuat agent AI yang menerima **research objective**, bukan instruksi langkah-per-langkah.
- Agent menentukan sendiri strategi penelitian, data yang dibutuhkan, urutan tool call, screening, deep research, comparison, validation, dan final report.
- Sectors API/MCP harus menjadi **core data source** produk.
- Produk harus berfungsi sebagai **research/information tool**, bukan automated trading atau financial-advice execution system.

### Contoh objective

> Find 5 Indonesian companies worth researching further based on strong fundamentals, healthy financials, reasonable valuation, and consistent growth.

User tidak menentukan ticker atau langkah analisis. Agent harus menentukan proses risetnya sendiri.

---

# 2. Target Produk

Produk harus terasa seperti:

> "Berikan saya tujuan riset. Agent akan mencari tahu bagaimana cara menelitinya."

Bukan:

> "Pilih saham lalu chatbot menjelaskan saham tersebut."

Perbedaan ini sangat penting.

## Bukan target

- Chatbot saham biasa.
- Dashboard saham yang hanya menampilkan raw data.
- Single LLM prompt + Sectors MCP.
- Sistem yang hanya menganalisis satu ticker berdasarkan instruksi eksplisit.
- Automated trading/buy/sell execution.

## Target

- Autonomous planning.
- Dynamic tool selection.
- Multi-step research.
- Screening.
- Candidate ranking.
- Deep research.
- Peer comparison.
- Validation.
- Explainable research trail.
- Final research report.

---

# 3. Core User Flow

```text
User
  |
  | Research Objective
  v
Research Agent
  |
  v
Understand Objective
  |
  v
Create Research Plan
  |
  v
Select Data / Tools
  |
  v
Load Company Universe
  |
  v
Initial Screening
  |
  v
Candidate Ranking
  |
  v
Deep Research
  |
  v
Peer Comparison
  |
  v
Validation
  |
  v
Final Ranking
  |
  v
Research Report
```

---

# 4. Autonomous Behavior

# 4A. Core Capabilities — The 5 Pillars

The product is built around five core capabilities. These are the primary capabilities that define the Autonomous Research Agent.

## 1. Research Planner

**Purpose:** Transform a high-level user objective into a structured research strategy.

Input:
```text
High-level research objective
```

Output:
```text
Research plan
- research universe
- criteria
- required data
- research steps
- candidate-selection strategy
- validation strategy
```

Acceptance criteria:
- User does not need to specify individual research steps.
- Plan changes according to the objective.
- Planner does not invent unavailable data or tools.
- Plan is represented as structured data that the orchestrator can execute.

---

## 2. Autonomous Screener

**Purpose:** Discover and progressively narrow the relevant company universe without requiring the user to provide a ticker list.

Example:

```text
Indonesian listed companies
        ↓
Eligibility screening
        ↓
Financial screening
        ↓
Quality / valuation screening
        ↓
Candidate ranking
        ↓
Deep-research candidates
```

Acceptance criteria:
- Agent can start from a broad universe.
- Screening criteria can be derived from the research objective.
- Screening uses actual Sectors data where applicable.
- Screening results are reproducible and explainable.
- The system avoids expensive deep research on every company.

---

## 3. Research Engine / Deep Research

**Purpose:** Perform detailed research on shortlisted candidates.

The research engine can analyze, where data is available:

```text
Revenue
Earnings
Growth
Profitability
Margins
Balance Sheet
Valuation
Historical performance
Peer comparison
Data completeness
```

Acceptance criteria:
- Deep research is performed only after screening.
- Research uses actual retrieved data.
- Important conclusions can be traced to evidence.
- Missing data is explicitly reported.
- The engine never fabricates unavailable financial information.

---

## 4. Research Memory / State

**Purpose:** Maintain the state of the research process so the agent knows what has happened, what remains, and what evidence has already been collected.

Example:

```text
Research Session
├── Objective
├── Plan
├── Current Step
├── Completed Steps
├── Candidates
├── Tool Calls
├── Evidence
├── Errors
└── Final Report
```

Acceptance criteria:
- Research progress is persisted.
- A research session can be inspected or resumed where practical.
- Tool calls and high-level actions are observable.
- State prevents unnecessary duplicate work.
- The UI can show progress without exposing hidden model chain-of-thought.

---

## 5. Final Research Report

**Purpose:** Convert the complete research state into a clear, evidence-backed report.

Minimum output:

```text
Research Objective
Methodology
Research Universe
Screening Summary
Top Candidates

For each candidate:
- Score / ranking
- Why selected
- Key strengths
- Potential concerns
- Relevant metrics
- Peer comparison
- Evidence
- Confidence / uncertainty

Final Research Summary
Limitations
```

Acceptance criteria:
- Report explains why candidates were selected.
- Important claims are backed by retrieved data.
- Uncertainty and data limitations are visible.
- Report is understandable to a non-technical user.
- Report does not claim guaranteed returns or issue automated trade execution instructions.

---

## Relationship Between the 5 Pillars

The five capabilities form one autonomous research loop:

```text
                 USER OBJECTIVE
                       │
                       ▼
                1. RESEARCH PLANNER
                       │
                       ▼
                2. AUTONOMOUS SCREENER
                       │
                       ▼
              3. RESEARCH ENGINE
                       │
                       ▼
              4. RESEARCH STATE
                       │
                       ▼
               5. FINAL REPORT
                       │
                       ▼
                Research Result
```

The state layer surrounds the process rather than being only a final step:

```text
             ┌───────────────────────────┐
             │      RESEARCH STATE       │
             │                           │
             │ Objective                 │
             │ Plan                      │
             │ Progress                  │
             │ Tool Calls                │
             │ Candidates                │
             │ Evidence                  │
             │ Errors                    │
             └───────────────────────────┘
                 ↕      ↕       ↕
              Planner Screener Research
                         │
                         ▼
                       Report
```

These five pillars are **mandatory product capabilities for the MVP**. Other capabilities such as scoring, peer comparison, validation, Sectors integration, observability, and error handling support these pillars.


Agent harus memiliki state dan loop.

Contoh state:

```text
UNDERSTANDING
PLANNING
DISCOVERING
SCREENING
RANKING
RESEARCHING
COMPARING
VALIDATING
REPORTING
COMPLETED
FAILED
```

Agent tidak boleh hanya menjalankan hardcoded sequence untuk semua pertanyaan.

Contoh:

```text
Objective A:
Find undervalued profitable companies.

Objective B:
Find companies with consistent earnings growth.

Objective C:
Compare Indonesian banking companies.

```

Ketiga objective tersebut harus dapat menghasilkan research plan yang berbeda.

---

# 5. Research Planner

Planner menerima objective dan menghasilkan structured plan.

Contoh:

```json
{
  "objective": "Find Indonesian companies with strong fundamentals and reasonable valuation",
  "universe": "Indonesian listed companies",
  "criteria": [
    "strong profitability",
    "healthy balance sheet",
    "consistent growth",
    "reasonable valuation"
  ],
  "steps": [
    "load company universe",
    "retrieve financial metrics",
    "perform initial screening",
    "rank candidates",
    "perform deep research",
    "compare peers",
    "validate findings",
    "generate report"
  ]
}
```

Planner tidak boleh mengarang data. Planner hanya menentukan strategi.

---

# 6. Tool Layer

Agent harus memiliki abstraction layer untuk Sectors.

Contoh konseptual:

```text
tools/
├── sectors/
│   ├── company_search
│   ├── company_profile
│   ├── financial_metrics
│   ├── financial_statements
│   ├── valuation
│   ├── historical_data
│   └── peer_data
│
├── screening/
│   ├── filter_companies
│   ├── calculate_score
│   └── rank_candidates
│
└── research/
    ├── compare_companies
    ├── validate_result
    └── generate_evidence
```

Nama tool final harus mengikuti tool/API yang benar-benar tersedia dari Sectors. Jangan mengarang endpoint.

---

# 6A. Qualifying Test Compliance — Derived Intelligence

The project must not be a raw-data viewer. It must produce **derived insight** from Sectors data.

This is a mandatory product requirement.

## Core Derived-Insight Pipeline

```text
Sectors Raw Data
       |
       v
Custom Application Logic
       |
       +--> Screening
       +--> Scoring
       +--> Ranking
       +--> Comparative Analysis
       +--> Validation
       |
       v
Synthesized Research Insight
```

The Autonomous Research Agent is the product's primary interface and orchestration layer. The Intelligence Engine transforms Sectors data into derived insights.

## Qualifying Outputs

The MVP should produce these derived outputs where supported by available Sectors data:

- Custom company screening
- Custom financial scores
- Candidate rankings
- Comparative analysis
- Synthesized research outputs
- Anomaly/outlier detection where useful for a research objective

Preferred combination:

```text
Custom Screener + Custom Score + Ranking
        + Comparative Analysis + Synthesized Research
```

These outputs must be generated from actual Sectors data using project-specific logic.

## What Does Not Qualify

The project must not rely on:

```text
Sectors Raw Data
      |
      v
Beautiful Dashboard
      |
      v
Same Data
```

Changing the visualization, table, chart, or UI of raw Sectors data is not sufficient. An LLM response that merely paraphrases Sectors data without meaningful custom analysis is also insufficient.

## Evidence of Derived Insight

For important candidates/results, the application should show:

1. Input data/metrics used.
2. Custom logic or criteria applied.
3. Derived score/ranking/result.
4. Comparative context where applicable.
5. Explanation of why the result was selected.
6. Data limitations or uncertainty.

Example:

```text
BBCA
  ↓
Sectors data
  ↓
Custom financial criteria
  ↓
Quality Score: 91/100
  ↓
Rank: #1
  ↓
Peer comparison
  ↓
Research conclusion
```

The score and ranking are project-generated derived insights, not Sectors-provided raw values.

## Track Positioning

Primary product identity:

**Autonomous Research Agent**

Primary intended track:

**AI Agents & Assistants**

The project contains a substantial Market Intelligence layer because it produces derived scores, rankings, screeners, comparative analysis, and synthesized research. The Intelligence Engine is a core subsystem that enables the agent to produce meaningful derived insight.

The final track selection must follow the latest official hackathon rules.

## Boundary Rules

The project's track should be determined by what the product fundamentally does, not by its UI.

```text
AI Agents & Assistants
= Autonomous agent is the product's primary behavior.

Market Intelligence
= Derived intelligence itself is the primary product behavior.

This project:
Autonomous Research Agent
        +
Derived Intelligence Engine
```

The project must use **Sectors MCP or Sectors REST API as a core data source**.

Automated trade execution is prohibited.

# 7. Sectors API / MCP

Sectors harus menjadi bagian inti dari application flow.

Prinsip:

```text
Our Agent
    |
    v
Our Tool Orchestrator
    |
    v
Sectors API / MCP
    |
    v
Indonesian Financial Data
```

Jangan membuat sistem seperti:

```text
LLM
 |
 +-- Sectors call sekali
 |
 +-- Generic answer
```

Sectors harus digunakan secara substantif untuk:
- company discovery
- financial data
- screening
- comparison
- research
- evidence

Tool dan endpoint aktual wajib diverifikasi dari dokumentasi Sectors sebelum implementasi.

---

# 8. Autonomous Screening

Agent harus mampu mempersempit universe secara bertahap.

Contoh:

```text
Indonesian listed companies
        |
        v
      1000+
        |
        v
Basic eligibility
        |
        v
       300
        |
        v
Financial screening
        |
        v
        80
        |
        v
Quality / valuation screening
        |
        v
        25
        |
        v
Deep research
        |
        v
        10
        |
        v
Final candidates
        |
        v
         5
```

Angka di atas hanya ilustrasi. Jangan hardcode angka tersebut sebagai fakta.

---

# 9. Intelligence / Scoring

Untuk meningkatkan kualitas research, agent dapat menggunakan custom scoring layer.

Contoh:

```text
Quality Score
├── Revenue Growth       20%
├── Earnings Growth      20%
├── Profitability        20%
├── Balance Sheet        15%
├── Valuation            15%
└── Consistency          10%
```

Formula final harus ditentukan setelah memahami data Sectors yang tersedia.

Penting:
- Jangan membuat formula yang menggunakan metric yang tidak tersedia.
- Jangan memberikan kesan bahwa score adalah official Sectors score.
- Score adalah proprietary/custom analysis dari project.

---

# 10. Deep Research

Setelah screening, agent melakukan research lebih dalam pada kandidat.

Contoh:

```text
Company
├── Revenue trend
├── Earnings trend
├── Profitability
├── Growth
├── Balance sheet
├── Valuation
├── Historical performance
├── Peer comparison
└── Data quality / completeness
```

Agent harus menyimpan evidence/data yang digunakan untuk menghasilkan kesimpulan.

---

# 11. Peer Comparison

Agent dapat membuat peer group secara dinamis.

Contoh:

```text
Candidate: BBCA

Potential peers:
- BMRI
- BBRI
- BBNI
```

Peer selection harus berdasarkan data/category yang tersedia, bukan random.

Agent kemudian membandingkan:

```text
Growth
Profitability
Valuation
Balance Sheet
Consistency
```

---

# 12. Validation

Agent tidak boleh langsung percaya hasil screening pertama.

Contoh:

```text
Screening Result
       |
       v
Candidate
       |
       v
Deep Research
       |
       v
Peer Comparison
       |
       v
Validation
       |
       +---- Result consistent -> keep
       |
       +---- Result inconsistent -> investigate again
```

Jika data tidak lengkap atau hasil bertentangan, agent harus:
- mencari data tambahan jika tersedia,
- menandai uncertainty,
- atau menurunkan confidence.

Agent tidak boleh mengarang data yang tidak tersedia.

---

# 13. Agent State

Research session harus memiliki persistent state.

Contoh:

```json
{
  "session_id": "research_001",
  "objective": "...",
  "status": "RESEARCHING",
  "plan": {},
  "steps_completed": [],
  "current_step": {},
  "candidates": [],
  "tool_calls": [],
  "evidence": [],
  "errors": [],
  "final_report": null
}
```

State memungkinkan:
- resume research
- progress display
- debugging
- audit trail
- explainability

---

# 14. Research Trace

UI harus dapat menunjukkan apa yang sedang dilakukan agent.

Contoh:

```text
AUTONOMOUS RESEARCH

✓ Understanding objective
✓ Creating research strategy
✓ Loading company universe
✓ Screening candidates
✓ Ranking candidates
⟳ Deep researching candidate #1
○ Peer comparison
○ Validation
○ Generating report
```

Jangan expose hidden chain-of-thought model.

Yang ditampilkan adalah **high-level action/tool trace**, bukan private reasoning.

---

# 15. Final Report

Final report minimal memiliki:

```text
Research Objective

Methodology

Research Universe

Screening Summary

Top Candidates

For Each Candidate:
- Research score
- Key strengths
- Potential concerns
- Relevant metrics
- Peer comparison
- Evidence
- Confidence

Final Research Summary

Limitations
```

Bahasa harus bersifat research/information.

Hindari:

```text
BUY NOW
SELL NOW
GUARANTEED PROFIT
```

Gunakan:

```text
Worth further research
Strong research profile
Potential concern
Requires additional investigation
```

---

# 16. Explainability

Setiap kandidat harus dapat menjawab:

> Why did the agent select this company?

Contoh:

```text
WHY THIS COMPANY?

1. Passed initial financial screening.
2. Ranked highly on profitability.
3. Demonstrated consistent earnings.
4. Passed balance-sheet criteria.
5. Remained competitive after peer comparison.
6. Valuation did not eliminate the candidate.
```

Semua alasan harus berasal dari actual computation/data.

---

# 17. Error Handling

Agent harus menangani:

- API timeout
- rate limit
- missing data
- invalid ticker
- incomplete financial metrics
- tool failure
- model failure
- malformed tool response
- insufficient candidates

Contoh:

```text
If Sectors API fails:
    retry according to policy
    if still fails:
        mark step as failed
        explain limitation
        do not fabricate data
```

---

# 18. Cost / API Efficiency

Sectors credits harus digunakan efisien.

Jangan melakukan deep research terhadap seluruh universe.

Gunakan funnel:

```text
Cheap / broad queries
        ↓
Screening
        ↓
Small candidate set
        ↓
Expensive / detailed queries
```

Tujuannya:
- mengurangi API calls
- mengurangi latency
- menghemat credits
- membuat architecture lebih scalable

Exact credit cost wajib diverifikasi dari Sectors documentation.

---

# 18A. System Fundamentals — Core Architecture

The project is not only a frontend, backend, and database application. The core product requires an autonomous agent layer and a derived-intelligence layer.

## Core Components

```text
                         ┌─────────────────────┐
                         │      FRONTEND       │
                         │      Next.js        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       BACKEND       │
                         │      FastAPI        │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    ▼               ▼                ▼
             ┌───────────┐  ┌──────────────┐  ┌──────────────┐
             │   AGENT   │  │ INTELLIGENCE │  │   RESEARCH   │
             │ ORCHESTR. │  │    ENGINE    │  │    ENGINE    │
             └─────┬─────┘  └──────┬───────┘  └──────┬───────┘
                   │               │                 │
                   └───────────────┼─────────────────┘
                                   ▼
                         ┌──────────────────┐
                         │  SECTORS MCP/API │
                         └────────┬─────────┘
                                  │
                                  ▼
                         Financial Market Data

                         ┌──────────────────┐
                         │    PostgreSQL    │
                         │ State + Results  │
                         └──────────────────┘
```

## Required Core Components

### 1. Frontend

Recommended stack: Next.js.

Minimum UI:
- Research objective input
- Research session page
- Agent activity/progress
- Candidate ranking
- Comparative analysis
- Final research report

### 2. Backend

Recommended stack: FastAPI.

Responsibilities:
- Research session API
- Agent execution
- Sectors integration
- Intelligence Engine
- Research Engine
- Persistence
- Progress/events

The backend should not become a monolithic file. Agent, tools, intelligence, research, and persistence should remain separate modules.

### 3. Agent Orchestrator

This is the autonomous behavior layer.

```text
Objective
   ↓
Planner
   ↓
Action
   ↓
Tool Call
   ↓
Observe Result
   ↓
Evaluate
   ↓
Next Action?
   ├── YES → Tool Call
   └── NO  → Report
```

The agent must be able to adapt its next action based on retrieved data rather than always executing one fixed sequence.

### 4. Intelligence Engine

This is mandatory for the qualifying test.

Responsibilities:
- normalization
- screening
- scoring
- ranking
- comparison
- deterministic calculations
- validation

The Intelligence Engine must transform Sectors data into project-generated derived insight.

### 5. Sectors Adapter / Tool Layer

Use an abstraction between the agent and Sectors:

```text
Agent
  ↓
Tool Interface
  ↓
Sectors Adapter
  ↓
Sectors MCP / REST API
```

Actual Sectors tool names and endpoints must be verified from the current official documentation. Never invent them.

### 6. Research Engine

The Research Engine performs deeper analysis after initial screening.

It can include:
- financial analysis
- historical analysis
- peer comparison
- strengths/concerns
- data completeness
- research synthesis

### 7. PostgreSQL

PostgreSQL stores application state and derived research results.

Suggested entities:
- research_sessions
- research_plans
- research_steps
- tool_calls
- screening_results
- candidate_scores
- research_evidence
- peer_comparisons
- research_reports

Sectors remains the core source for market/financial data; PostgreSQL is not intended to replace Sectors as the primary source.

### 8. Agent State / Memory

Research state should track:

```json
{
  "status": "RESEARCHING",
  "current_step": "deep_research",
  "companies_screened": 1245,
  "candidates": 20,
  "researched": 8,
  "remaining": 12
}
```

State should support progress display, observability, avoiding duplicate work, and resuming research where practical.

### 9. LLM Layer

Use the LLM primarily for:
- objective interpretation
- planning
- tool selection
- data interpretation
- research synthesis
- final report generation

Use deterministic application code for:
- filtering
- scoring
- ranking
- calculations
- validation
- state management

Do not make the LLM the sole source of financial scoring logic.

### 10. Streaming / Progress Events

For the hackathon demo, live progress is strongly recommended.

Example events:

```text
PLAN_CREATED
UNIVERSE_DISCOVERED
SCREENING_STARTED
SCREENING_COMPLETED
SCORING_COMPLETED
RANKING_COMPLETED
DEEP_RESEARCH_STARTED
COMPARISON_COMPLETED
REPORT_GENERATED
```

The UI should display high-level actions only. Never expose hidden model chain-of-thought.

### 11. Observability

Record high-level research activity such as:
- research_id
- tool_name
- timestamp
- duration
- status
- input/output summaries
- error

This is for debugging and auditability, not for exposing private model reasoning.

### 12. Cache

Caching is recommended to reduce:
- Sectors API calls
- latency
- credit consumption

Do not add a complex caching system before the core flow works.

### 13. Background Worker / Queue

Not mandatory for the first MVP.

If research becomes long-running, move execution to a background worker:

```text
POST /research
      ↓
Create session
      ↓
Background Agent
      ↓
Progress events
      ↓
Frontend
```

### 14. Authentication

Authentication is low priority for the hackathon MVP unless required by the final product.

Do not spend early development time on a complex auth system.

### 15. Security

Secrets must remain server-side.

Example:

```text
SECTORS_API_KEY=...
LLM_API_KEY=...
DATABASE_URL=...
```

Never expose Sectors or LLM secrets through public frontend environment variables.

## MVP Architecture Priority

The first MVP should focus on these seven components:

```text
1. Next.js Frontend
2. FastAPI Backend
3. Agent Orchestrator
4. Intelligence Engine
5. Research Engine
6. Sectors MCP / REST API
7. PostgreSQL
```

Then add:

```text
SSE / streaming
Cache
Background worker
Authentication
```

only when the core research loop is stable.

## Recommended Implementation Order

```text
1. Verify Sectors MCP/API
        ↓
2. Test retrieving real Sectors data
        ↓
3. Build Intelligence Engine
        ↓
4. Build Research Planner
        ↓
5. Build Agent Orchestrator
        ↓
6. Build Research State
        ↓
7. Build Final Report
        ↓
8. Expose backend API
        ↓
9. Build Next.js UI
        ↓
10. Add live agent trace
```

The priority is to prove the core loop first:

```text
Sectors
  ↓
Derived Intelligence
  ↓
Autonomous Agent
  ↓
Research
  ↓
Report
```

Do not start by building a large dashboard or complex infrastructure.

# 19. Recommended Architecture

Initial architecture:

```text
frontend/
├── app/
│   ├── page
│   ├── research/
│   ├── research/[id]/
│   └── company/[symbol]/
│
├── components/
│   ├── ResearchInput
│   ├── AgentProgress
│   ├── ResearchPlan
│   ├── CandidateTable
│   ├── CandidateCard
│   ├── Comparison
│   └── ResearchReport
│
└── lib/

backend/
├── agent/
│   ├── planner
│   ├── orchestrator
│   ├── state
│   ├── policies
│   └── evaluator
│
├── tools/
│   ├── sectors
│   ├── screening
│   ├── ranking
│   └── research
│
├── intelligence/
│   ├── scoring
│   ├── screening
│   └── ranking
│
├── research/
│   ├── discovery
│   ├── deep_research
│   ├── comparison
│   └── validation
│
└── persistence/
    ├── models
    └── repositories
```

Exact framework/language can be selected after checking the existing project and Codex environment.

---

# 20. Database Concept

Suggested entities:

```text
research_sessions
research_plans
research_steps
tool_calls
companies
screening_results
candidate_scores
research_evidence
peer_comparisons
research_reports
```

Do not create unnecessary tables until the actual data flow is confirmed.

---

# 21. MVP

The first working version must implement the five core pillars:

```text
1. Research Planner
2. Autonomous Screener
3. Research Engine / Deep Research
4. Research Memory / State
5. Final Research Report
```

Concrete MVP flow:

```text
1. User enters research objective
2. Planner creates a structured plan
3. Agent discovers companies/data
4. Screener narrows the universe
5. Agent selects candidates
6. Research Engine performs deep research
7. Agent compares candidates where appropriate
8. Agent validates important findings
9. Research State records progress/evidence
10. Agent generates the final report
11. UI shows high-level research trace
```

All five pillars must work together in one end-to-end research session.

Do NOT start with:
- authentication
- complex admin panel
- mobile app
- multi-tenant SaaS
- unnecessary microservices
- Kubernetes
- complex vector database
- fine-tuning

First prove the autonomous research loop.

---

# 22. Demo Scenario

Recommended hackathon demo:

```text
Objective:

"Find 5 Indonesian listed companies worth
researching further based on strong fundamentals,
healthy financials, consistent growth, and
reasonable valuation."
```

Expected visible flow:

```text
Understanding objective
        ↓
Creating strategy
        ↓
Loading company universe
        ↓
Screening
        ↓
Candidate ranking
        ↓
Deep research
        ↓
Peer comparison
        ↓
Validation
        ↓
Final report
```

The demo should show that the user did NOT specify:
- ticker list
- exact metrics
- exact screening sequence
- exact peer group
- exact research steps

The agent determines these from the objective and available tools.

---

# 23. Hackathon Positioning

Primary track:

**AI Agents & Assistants**

Primary product:

**Autonomous Financial Research Agent**

Supporting core subsystem:

**Custom Financial Intelligence Engine**

The strongest differentiator should be:

> A purpose-built autonomous financial research agent that transforms a high-level research objective into a multi-step, derived-insight-driven research process using Sectors as the core Indonesian financial data layer.

The derived-intelligence layer is **mandatory**, not optional.

It should produce:

- custom screening
- custom scoring
- candidate rankings
- comparative analysis
- synthesized research
- validation based on derived results

The agent then uses these outputs to decide which candidates deserve deeper research.

```text
Sectors Data
    ↓
Custom Intelligence Engine
    ↓
Derived Insights
    ↓
Autonomous Research Agent
    ↓
Deep Research
    ↓
Synthesized Report
```

The project should be presented as an autonomous research product, not as a generic dashboard or raw-data visualization product.

Secondary capabilities:
- peer comparison
- research trace
- confidence/uncertainty
- evidence-backed reporting
- efficient API usage

# 24. Important Constraints

Before implementation, verify the latest official Sectors Hackathon rules and documentation.

Must verify:
- exact Sectors API capabilities
- exact MCP tools
- authentication
- credit allocation
- rate limits
- allowed data usage
- submission requirements
- AI model restrictions, if any
- prohibited financial activities
- deadline
- judging criteria

Never invent Sectors endpoints, tool names, limits, or pricing.

---

# 24A. Architecture Readiness Checklist

Before considering the MVP architecture complete:

- [ ] Frontend can create/view a research session.
- [ ] Backend exposes the research workflow.
- [ ] Agent Planner can create a structured plan.
- [ ] Agent Orchestrator can execute multiple steps.
- [ ] Sectors MCP/API is connected through an adapter/tool layer.
- [ ] Intelligence Engine produces at least one custom derived score/ranking.
- [ ] Autonomous Screener produces a candidate set.
- [ ] Research Engine performs deeper analysis on selected candidates.
- [ ] Research State persists progress and results.
- [ ] Final report is generated from collected evidence.
- [ ] High-level progress events can be displayed.
- [ ] Secrets remain server-side.
- [ ] Raw Sectors data is not presented as the project's only value.
- [ ] No automated trade execution exists.

# 25. Definition of Done

The project is not considered MVP-complete until:

- [ ] User can submit a high-level research objective.
- [ ] Agent generates a structured research plan.
- [ ] Agent executes multiple research steps.
- [ ] Agent uses Sectors API/MCP as a core data source.
- [ ] Agent performs autonomous screening.
- [ ] Agent selects candidates without requiring a user-provided ticker list.
- [ ] Agent performs deeper research on selected candidates.
- [ ] Agent performs peer comparison where appropriate.
- [ ] Agent validates important findings.
- [ ] Agent records research state.
- [ ] UI displays high-level agent activity.
- [ ] Final report contains evidence/data used.
- [ ] Missing data is explicitly handled.
- [ ] Agent never fabricates unavailable data.
- [ ] No automated trading/buy/sell execution exists.
- [ ] Product is positioned as research/information support.
- [ ] Sectors API/MCP integration is demonstrably core to the product.
- [ ] The product produces derived insight rather than only displaying raw Sectors data.
- [ ] At least one custom screener is implemented.
- [ ] At least one project-generated score or ranking is implemented.
- [ ] At least one comparative or synthesized research output is implemented.
- [ ] Derived results can be traced to the underlying data and project logic.
- [ ] Demo can be completed reliably from a fresh research objective.

---

# 26. Development Strategy

Build in this order:

```text
PHASE 0
Research Sectors documentation
        ↓
PHASE 1
Verify API/MCP + available tools
        ↓
PHASE 2
Minimal Sectors integration
        ↓
PHASE 3
Agent planner
        ↓
PHASE 4
Agent orchestration/state machine
        ↓
PHASE 5
Screening engine
        ↓
PHASE 6
Deep research
        ↓
PHASE 7
Comparison + validation
        ↓
PHASE 8
Final report
        ↓
PHASE 9
Polished UI + live trace
        ↓
PHASE 10
Demo optimization + submission
```

---

# 27. Instructions for Codex

You are helping implement an **Autonomous Financial Research Agent** for Sectors Hackathon 2026.

Before writing substantial code:

1. Inspect the existing repository.
2. Identify current framework, runtime, package manager, environment variables, and architecture.
3. Do not replace the existing stack without a clear reason.
4. Read the latest official Sectors documentation available to the project.
5. Verify actual API/MCP tools before implementing integrations.
6. Never invent API endpoints or tool names.
7. Keep Sectors integration isolated behind a tool/service abstraction.
8. Build the autonomous research loop incrementally.
9. Prefer deterministic application logic for screening/scoring where appropriate.
10. Use the LLM for planning, tool selection, interpretation, and synthesis.
11. Do not expose model chain-of-thought.
12. Store high-level agent actions and tool results for observability.
13. Never fabricate financial data.
14. Handle missing/failed data explicitly.
15. Avoid automated trading or transaction execution.
16. Keep the MVP focused.
17. Do not add unnecessary dependencies.
18. Write maintainable, typed, testable code.
19. Add tests for critical agent/tool orchestration.
20. Before major architectural changes, explain the tradeoff and inspect existing code first.

---

# 28. Product Principle

The central product principle is:

> **The user provides the goal. The agent figures out the research process.**

If the user has to manually specify every research step, the system is no longer meaningfully autonomous.

The final product should demonstrate:

```text
High-level Goal
      ↓
Autonomous Planning
      ↓
Tool Selection
      ↓
Data Discovery
      ↓
Screening
      ↓
Research
      ↓
Comparison
      ↓
Validation
      ↓
Evidence-backed Report
```

This is the core identity of the project.
