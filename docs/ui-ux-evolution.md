# Voyager One UI/UX Evolution

## 1. Document Status

| Field | Value |
| --- | --- |
| Document type | Product UX direction and implementation specification |
| Status | Proposed evolution |
| Scope | UI/UX, mobile readiness, accessibility, page functionality, and copywriting |
| Product | Voyager One |
| Last updated | 2026-08-27 |

This document defines the next evolution of Voyager One from a polished dashboard prototype into a professional, accessible, and mobile-ready financial research workspace.

The current prototype now persists the actual symbol membership of every screening stage. Counts, retained companies, excluded companies, final candidates, peer comparison, and report output share that session-scoped result. Local filtering evaluates only fields present in the eight-company fixture dataset; production-scale coverage and unsupported metrics remain explicit limitations until the backend screening API supplies them.

Session activity and technical trace use the same result provenance. Prototype runs emit neutral fixture audit events with stage inputs, criteria, and retained symbols; they do not claim API requests, measured latency, or credit usage. JSON exports include the report, funnel membership, audit events, and dataset identity as one reviewable package.

Peer Comparison consumes the complete final candidate list from the active screening session. It does not maintain a second stock filter or default to a fixed subset; the only page-level control changes the metric columns. Mobile narrows the presentation to two distinct candidates at a time without changing the underlying result set.

Navigation treats the active research session as the parent workspace. Global actions, session results, and supporting information occupy separate groups; desktop and mobile both provide a direct route back to the session summary. User-facing labels prioritize tasks such as choosing and comparing candidates, while technical trace remains available as secondary detail.

The Research Library at `/research` is the canonical destination for saved sessions. It supports search by title, objective, or session ID; status filtering; result summaries; direct access to sessions and reports; duplication into an editable new-research draft; and confirmed deletion. The dashboard only previews recent work and links to the library.

Completed research follows an explicit in-page journey: session summary to candidate-selection rationale, then complete candidate comparison, then the final report. Each page provides one primary next action plus a secondary escape route. The report closes the loop by returning to the Research Library or creating an editable draft from the same objective without modifying the saved result.

New sessions begin without final screening stages, candidates, audit results, or report recommendations. While status is not `COMPLETED`, result routes show a progress gate and return users to the session summary. Final artifacts become visible atomically at completion; this visibility rule is part of the backend handoff contract, not presentation-only behavior.

Before a run starts, the UI exposes the exact deterministic screening rules and actual fixture universe from the same evaluator used by execution. Editing objective prose detaches the selected preset and activates the documented general rule set; selecting a rule card restores its exact objective and criteria. Financial metrics are paired with plain-language meaning, score thresholds, sector-comparison cautions, and model limitations across candidate cards, comparison, company analysis, methodology, and reports.

This is an evolution, not a visual reset. The existing institutional visual identity, blue and slate palette, financial typography, data-dense presentation, and explainability focus remain valuable. The work should improve product structure, interaction clarity, accessibility, and language without replacing the established character of the interface.

---

## 2. Evolution Statement

### Current experience

Voyager One currently presents most capabilities inside one dashboard:

```text
Research objective
Execution pipeline
Candidate ranking
Screening funnel
Research memo
Tool activity
```

This demonstrates the product breadth, but it also makes the dashboard responsible for starting research, monitoring execution, reviewing results, explaining methodology, and exposing audit details at the same time.

### Evolved experience

Voyager One should become a task-oriented research workspace:

```text
Dashboard
  Overview, active work, recent results, and next actions

New Research
  Structured research brief and objective clarification

Research Session
  Plan, progress, findings, follow-up questions, and session activity

Results
  Screener, candidate ranking, peer comparison, and report

Audit and Trust
  Methodology, evidence, limitations, and technical trace
```

### Product principle

> The user states what they want to investigate. Voyager One structures the research, keeps the user informed, and presents the result with evidence and limitations.

The interface should reveal complexity progressively. The first view should help users decide what to do. Detailed formulas, raw payloads, and execution metadata should remain available without competing with primary research tasks.

---

## 3. Evolution Goals

### Primary goals

1. Make the primary user journey obvious from the first screen.
2. Separate research creation, execution, results, and audit into clear contexts.
3. Make every core workflow usable on mobile without relying on desktop tables.
4. Meet baseline keyboard, screen-reader, contrast, and motion accessibility requirements.
5. Replace architecture-oriented language with concise, user-oriented financial research language.
6. Preserve the existing institutional design character.

### Non-goals

- Replacing Vue, Pinia, Vue Router, Vite, or Tailwind.
- Rebuilding the visual identity from scratch.
- Turning the product into a generic floating chatbot.
- Hiding methodology or technical audit information.
- Reducing all financial content to simplified cards.
- Adding decorative animation that does not improve comprehension.

---

## 4. Experience Principles

### 4.1 Task first, architecture second

Users should first see what they can do and what happened. Internal concepts such as pillars, engines, orchestration, and tool payloads belong in supporting views.

### 4.2 One primary action per context

| Context | Primary action |
| --- | --- |
| Dashboard | Start new research |
| New Research | Start research |
| Active Session | Review current progress |
| Completed Session | Open results |
| Screener | Inspect a screening stage |
| Peer Comparison | Compare selected candidates |
| Report | Download or share report |
| Methodology | Understand how a score was produced |
| Trace | Inspect a research event |

### 4.3 Progressive disclosure

Present information in this order:

```text
Conclusion
Reason
Supporting metrics
Evidence
Methodology
Raw technical details
```

### 4.4 Structured agent interaction

Voyager One should not imitate a general-purpose chat application. Agent interaction should use structured research objects:

- Research brief.
- Clarification question.
- Generated plan.
- Progress event.
- Candidate shortlist.
- Comparison result.
- Evidence citation.
- Risk or limitation.
- Final report section.

Conversational follow-up remains useful, but only within an existing research session where the objective, candidates, and evidence already provide context.

### 4.5 Consistency over novelty

The same concept must use the same name, status color, format, and interaction throughout the product. A candidate selected from the dashboard, screener, peer comparison, or report should lead to the same detail experience.

### 4.6 Accessible by default

Accessibility is part of component correctness. Navigation, dialogs, tabs, tables, status changes, and form controls are incomplete until they work with keyboard and assistive technology.

---

## 5. Target Information Architecture

### Primary navigation

```text
Home
Research
Results
Reports
```

### Secondary navigation

```text
Screener
Peer Comparison
Methodology
Activity and Audit
Settings or system information, when needed
```

### Proposed routes

| Route | Purpose |
| --- | --- |
| `/` | Dashboard overview |
| `/research/new` | Create a research brief |
| `/research/:id` | Monitor and interact with one research session |
| `/research/:id/screener` | Inspect screening stages and outcomes |
| `/research/:id/peers` | Compare candidates and peer benchmarks |
| `/research/:id/report` | Read and export the final report |
| `/research/:id/activity` | Review high-level session activity |
| `/research/:id/trace` | Inspect technical tool details |
| `/methodology` | Understand scoring and research methodology |
| `/company/:symbol` | Read the complete company dossier |

The current routes may remain during incremental implementation. The end state should make session context explicit rather than presenting all pages as global, unrelated dashboards.

---

## 6. Core Journey

### 6.1 Start research

```text
Dashboard
  -> Start new research
  -> Complete research brief
  -> Resolve optional clarification
  -> Confirm scope and estimated run
  -> Start research
```

### 6.2 Monitor research

```text
Research Session
  -> Review generated plan
  -> Follow current progress
  -> Inspect high-level activity
  -> Review partial findings when available
  -> Receive completion state
```

### 6.3 Explore results

```text
Completed Session
  -> Read executive summary
  -> Inspect screening funnel
  -> Compare candidates
  -> Open a company dossier
  -> Review evidence and limitations
  -> Export the report
```

### 6.4 Ask a follow-up

Follow-up interaction belongs inside the research session:

```text
Ask a follow-up or refine this research...
```

Examples:

- Compare the top three candidates by downside risk.
- Explain why UNTR ranked below ICBP.
- Exclude companies with commodity exposure.
- Show evidence from the latest reporting period only.

The answer should render as structured content rather than a long unformatted chat message.

---

## 7. Dashboard Evolution

### Current role

The dashboard currently combines objective input, architecture pipeline, candidates, funnel, synthesis, and tool calls.

### Target role

The dashboard becomes an overview and launch point. It should answer:

1. What research is currently active?
2. What should the user do next?
3. What were the latest important findings?
4. Which previous reports can be reopened?

### Target content order

```text
Page greeting and context
Compact research composer
Active research session
Latest findings
Recent research sessions
Secondary links to methodology and audit
```

### Compact research composer

```text
What would you like to research?

[ Describe your objective...                              ]

[Use a template]                              [Start research]
```

The compact composer starts the journey but does not contain all advanced controls. Selecting it can navigate to `/research/new` with the initial objective prefilled.

### Active session card

Minimum information:

- Objective summary.
- Current stage.
- Progress description.
- Time or step estimate when available.
- Most recent meaningful event.
- `Open research` action.

### Latest findings

Show no more than three candidates on the dashboard. Provide one concise reason and one risk per candidate. Detailed metrics belong in results and company pages.

### Remove or demote

- Full five-pillar architecture grid.
- Full screening funnel.
- Raw or recent tool call list.
- Long research synthesis memo.
- Permanent global run action detached from the active objective.

These remain accessible through the relevant session pages.

---

## 8. New Research Evolution

### Purpose

Create a clear, structured research brief before execution.

### Recommended structure

```text
New research

Research objective
[ Find Indonesian consumer companies with durable margins... ]

Scope
[Indonesia] [All sectors] [Top 5 candidates]

Suggested criteria
[Profitability] [Growth] [Balance sheet] [Valuation]

Research depth
( ) Quick screen
(*) Standard research
( ) Deep comparison

Estimated run
Approximately 5 minutes and 120 credits

[Start research]
```

### Presets

Presets should be called templates. Each template must explain the expected outcome, not only its strategy name.

Example:

```text
Profitable companies at reasonable valuations
Find five companies with durable earnings, healthy balance sheets,
and valuation multiples below their sector benchmarks.
```

### Clarification

The system may ask one or more concise clarification questions before starting when the objective is ambiguous.

```text
Should financial institutions use bank-specific metrics?

[Use sector-specific metrics] [Use one model for all sectors]
```

Clarification must never resemble hidden reasoning. It should ask only for a user decision needed to define the research scope.

### Form behavior

- The objective has a visible, programmatically associated label.
- Empty objectives cannot be submitted.
- Validation appears next to the relevant field.
- Keyboard users can complete and submit the form.
- Submission states clearly distinguish idle, validating, starting, and failed.
- The user sees what will happen before credits or execution begin.

---

## 9. Research Session Evolution

### Purpose

Provide one place to understand the objective, plan, progress, findings, and follow-up actions for a single session.

### Desktop layout

```text
+--------------------------------------+-------------------------+
| Objective and generated plan         | Session activity        |
| Current findings                     | Current stage           |
| Candidate shortlist                  | Recent events           |
|                                      | Warnings or blockers    |
+--------------------------------------+-------------------------+
| Ask a follow-up or refine this research...                  |
+----------------------------------------------------------------+
```

### Mobile layout

```text
Research title
Status and progress

[Overview] [Activity] [Results]

Selected panel content

[Ask a follow-up...]
```

### Progress language

Progress should describe user-relevant work:

```text
Plan created
914 companies reviewed
68 companies passed the financial screen
18 candidates scored
5 candidates selected for deeper analysis
Report ready
```

Avoid making internal architecture the dominant content:

```text
Pillar 2 active
Derived engine executing
Orchestrator loop running
```

### Session states

| State | User-facing behavior |
| --- | --- |
| Draft | Objective can still be edited |
| Starting | Brief is being validated and session created |
| Running | Progress and activity update in place |
| Needs input | Clarification or decision is required |
| Completed | Results and report are available |
| Partial | Some results are available with visible limitations |
| Failed | Cause, retained progress, and recovery action are shown |
| Cancelled | Completed work remains inspectable |

---

## 10. Screener Evolution

### User questions to answer

- How did the universe narrow?
- Which criteria were applied at each stage?
- Which companies passed or failed?
- Why did a specific company get excluded?
- Which criterion had the largest effect?

### Target structure

```text
Screening stages
[914 Universe] [284 Eligible] [68 Financial] [18 Quality] [5 Final]

Selected stage: Financial screening
68 companies retained, 216 excluded

Applied criteria
ROE >= 12%
Debt/Equity <= 1.5x
Three years of complete financial history

[Retained companies] [Excluded companies]

Company | Status | Key reason | Score
```

### Desktop behavior

- The stage selector remains visible while reviewing the table.
- The first company column is sticky.
- Columns can be sorted where sorting is meaningful.
- Criteria have plain-language explanations.
- Selecting a company opens a consistent quick view or company page.

### Mobile behavior

- Replace the five-card row with a horizontal stepper or stage select.
- Default to a concise company list.
- Expand one company to view additional metrics and exclusion reasons.
- Do not require horizontal scrolling to understand pass/fail status.

### Empty and edge states

- No companies passed this stage.
- A criterion could not be applied due to missing data.
- Results are partial.
- The stage is still processing.

---

## 11. Peer Comparison Evolution

### Purpose

Help users understand tradeoffs between selected candidates, not merely display many metrics.

### Target controls

- Select two to five candidates.
- Select metric group.
- Sort by a selected metric.
- Toggle absolute values and sector-relative values when available.
- Open metric definitions.

### Metric groups

```text
Quality
Profitability
Growth
Balance sheet
Valuation
Cash generation
```

### Desktop behavior

- Sticky company column.
- Visual indicators for strongest, weakest, and unavailable values.
- Sector benchmark row when comparison is valid.
- A concise synthesis above or beside the table.

### Mobile behavior

Default to two-company comparison:

```text
Compare
[BBCA] versus [BMRI]

Quality score        94       91
ROE                  21.8%    19.6%
P/E                  23.4x    11.8x
Revenue CAGR         12.7%    14.9%

BBCA leads on quality.
BMRI trades at a lower valuation.
```

Users may switch to additional candidates, but the mobile default should never be a ten-column table.

---

## 12. Candidate Detail Evolution

### Current pattern

Candidate details are presented in a large modal containing score decomposition, DuPont analysis, strengths, concerns, and evidence.

### Target pattern

Use two levels of detail:

#### Quick view

A right-side drawer on desktop and a full-screen sheet on mobile containing:

- Company identity.
- Rank and score.
- Four key metrics.
- Selection rationale.
- Primary strengths and risk.
- `Open full analysis` action.

#### Full company page

Route: `/company/:symbol`

Content:

- Research thesis.
- Key metrics and reporting period.
- Score decomposition.
- Financial analysis.
- Peer comparison.
- Strengths and concerns.
- Evidence and limitations.
- Related research sessions.

### Interaction consistency

Selecting a company from the dashboard, screener, peer comparison, or report must lead to the same quick view and full analysis behavior.

---

## 13. Activity and Trace Evolution

### Two information levels

#### Activity

For research users:

```text
Financial screening completed
68 of 284 eligible companies passed the selected criteria.
Completed in 520 ms

[View technical details]
```

#### Technical trace

For audit and debugging:

- Tool or operation name.
- Timestamp.
- Duration.
- Status.
- Credit cost.
- Input summary.
- Output summary.
- Expandable raw payload where appropriate.

### Default behavior

- Show activity first.
- Keep raw JSON collapsed.
- Clearly identify warnings, retries, partial results, and failures.
- Use `aria-expanded` and `aria-controls` for expandable events.
- Preserve chronological and status filtering.

---

## 14. Methodology Evolution

### Purpose

Build trust by explaining how results should be interpreted and where the method is limited.

### Target content order

```text
How scoring works
How to interpret a score
Five scoring dimensions
Worked company example
Sector-specific adjustments
Missing-data treatment
Limitations
Technical definitions
```

### Progressive disclosure

The first screen should explain the method in plain language. Formula details and metric definitions can use expandable sections.

### Example score interpretation

| Score | Interpretation |
| --- | --- |
| 90-100 | Exceptional profile within the evaluated universe |
| 80-89 | Strong profile with identifiable tradeoffs |
| 70-79 | Mixed profile requiring deeper review |
| Below 70 | Not selected by the current criteria |

Score interpretation must state that a high score is a research prioritization signal, not a prediction of future return.

### Remove from primary copy

- `Qualifying Test Compliance`.
- Repeated hackathon framing.
- Internal architecture terminology not needed to understand the result.

These can remain in submission documentation rather than the product interface.

---

## 15. Report Evolution

### Target structure

```text
Executive summary
Research objective and scope
Key findings
Final ranking
Candidate analysis
Peer comparison
Risks and uncertainty
Evidence and methodology
Regulatory notice
```

### Desktop navigation

Use sticky section navigation:

```text
Summary
Ranking
Candidates
Risks
Evidence
Methodology
```

### Mobile navigation

Use a compact section selector:

```text
Jump to: [Executive summary v]
```

### Export hierarchy

Primary action:

```text
Download report
```

Secondary menu:

```text
Print or save as PDF
Download Markdown
Download JSON
Copy summary
```

### Report writing pattern

Each major finding should use:

```text
Conclusion
Why it matters
Supporting data
Tradeoff or risk
Evidence
```

---

## 16. Responsive Navigation

### Desktop

- Persistent sidebar is acceptable.
- Current route remains visually clear.
- Session context may appear below the primary navigation.
- Global navigation should not contain a context-specific run action.

### Mobile

Recommended bottom navigation:

```text
Home
Research
Results
More
```

`More` contains:

```text
Screener
Peer comparison
Methodology
Activity and audit
Reports
```

Alternative: a top app bar with an accessible drawer. The final choice must provide equivalent access to all routes and preserve a visible current location.

### Mobile top bar

```text
[Menu or logo]  Research Workspace  [Session status]
```

Do not place a long breadcrumb, status pill, and full run button in one mobile row.

---

## 17. Responsive Content Rules

| Desktop pattern | Mobile evolution |
| --- | --- |
| Persistent sidebar | Bottom navigation or drawer |
| Multi-column dashboard | Single-column priority feed |
| Five-column pipeline | Horizontal stepper or selected-stage view |
| Wide financial table | Comparison cards or compact rows |
| Centered large modal | Full-screen sheet or dedicated page |
| Hover detail | Tap detail with visible affordance |
| Multiple inline actions | Primary action plus overflow menu |
| Small metadata labels | Minimum readable supporting text |
| Sticky side activity panel | Tabbed activity panel |

### Breakpoint behavior

Responsive design must change information presentation, not only stack desktop cards vertically.

### Touch targets

- Target minimum: 44 by 44 CSS pixels for primary touch controls.
- Closely grouped icon actions require adequate separation.
- Rows that appear clickable must expose a visible button or link.

### Tables

Horizontal scrolling may remain available for expert use, but it cannot be the only way to understand core results on mobile.

---

## 18. Accessibility Standard

The target is WCAG 2.2 AA for core workflows.

### 18.1 Document and navigation

- Provide a `Skip to main content` link.
- Use one primary `<main>` landmark.
- Give navigation regions accessible names where multiple navs exist.
- Mark the current route with `aria-current="page"`.
- Maintain logical heading order.
- Provide a useful not-found page with a route back to the dashboard.

### 18.2 Keyboard

- Every action is reachable using Tab and Shift+Tab.
- Focus order matches visual order.
- Enter and Space activate buttons where expected.
- Escape closes dialogs and dismissible sheets.
- No clickable table rows without an equivalent keyboard control.
- Focus remains visible at all times.

### 18.3 Dialogs and drawers

- Prefer native `<dialog>` where it fits the required behavior.
- Otherwise implement `role="dialog"` and `aria-modal="true"`.
- Associate the dialog with its title.
- Move focus into the dialog when opened.
- Trap focus while open.
- Return focus to the triggering control when closed.
- Lock background scroll.
- Give icon-only close buttons an accessible name.

### 18.4 Forms

- Associate labels and fields using `for` and `id`.
- Provide instructions before input when needed.
- Connect validation messages with `aria-describedby`.
- Do not communicate errors through color alone.
- Preserve entered values after recoverable errors.

### 18.5 Status and progress

- Use `role="status"` or `aria-live="polite"` for meaningful progress updates.
- Do not announce every animation frame or rapidly changing number.
- Provide text status in addition to color and icons.
- A failed status must not use the same green indicator as ready or completed.

### 18.6 Tables

- Add a descriptive `<caption>`.
- Use `scope="col"` for column headers.
- Use `scope="row"` for company identifiers where appropriate.
- Keep header labels understandable without surrounding visual context.
- Explain abbreviations such as ROE, P/E, and CAGR through accessible descriptions or nearby definitions.

### 18.7 Tabs, filters, and accordions

- Use `aria-pressed` for independent toggle filters.
- Use the ARIA tabs pattern only for true tabbed interfaces.
- Expandable trace entries expose `aria-expanded` and `aria-controls`.
- Selected states cannot depend only on background color.

### 18.8 Contrast and type

- Normal text meets at least 4.5:1 contrast.
- Large text meets at least 3:1 contrast.
- Avoid using `text-slate-400` for essential 10px or 11px content on white.
- Important supporting text should generally be at least 12px.
- Financial values must remain legible at 200% browser zoom.

### 18.9 Motion

- Respect `prefers-reduced-motion`.
- Remove continuous ping, pulse, and movement when reduced motion is enabled.
- Preserve useful opacity and color feedback.
- Avoid motion that blocks interaction.

### 18.10 Accessibility acceptance flow

The following must be completable using keyboard only:

```text
Open mobile or desktop navigation
Start new research
Complete the research brief
Submit the objective
Review session progress
Open a candidate
Switch report sections
Export the report
Close all dialogs and return to the previous control
```

---

## 19. Motion and Interaction Evolution

Voyager One should feel calm, precise, and responsive.

### Timing guidance

| Interaction | Target duration |
| --- | --- |
| Button press | 100-160 ms |
| Hover or color feedback | 120-180 ms |
| Tooltip or small popover | 125-200 ms |
| Drawer | 200-280 ms |
| Modal | 180-240 ms |
| Route-level content | Minimal or none |

### Rules

- Animate only when motion explains state, location, or feedback.
- Prefer `transform` and `opacity`.
- Replace broad `transition-all` usage with explicit properties.
- Add subtle press feedback such as `scale(0.97)` to pressable controls.
- Use strong ease-out curves for entering UI.
- Avoid continuous status animation after the user already understands the state.
- Do not add animation to frequent keyboard interactions.

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

The final implementation may use more targeted rules, but all continuous and spatial motion must have a reduced-motion behavior.

---

## 20. Copywriting Evolution

### 20.1 Voice

Voyager One should sound:

- Clear.
- Analytical.
- Calm.
- Evidence-aware.
- Honest about uncertainty.
- Professional without sounding academic or promotional.

Voyager One should not sound:

- Overconfident.
- Filled with internal architecture jargon.
- Like a generic AI assistant.
- Like a hackathon submission inside the product UI.
- Like an investment recommendation.

### 20.2 Language policy

Choose one primary interface language for a release.

For an Indonesian audience:

- Primary interface copy uses Bahasa Indonesia.
- Standard financial abbreviations such as ROE, P/E, CAGR, and FCF may remain.
- Technical API names and raw payload fields remain unchanged where necessary.
- Avoid switching language within one sentence unless it improves comprehension.

### 20.3 Writing structure

Use conclusion-first writing:

```text
Conclusion
Supporting reason
Relevant evidence
Risk or limitation
Suggested next action
```

### 20.4 Headings

- Explain the user's task or result.
- Prefer sentence case.
- Keep headings short.
- Avoid repeating `Autonomous`, `Derived Intelligence`, `Engine`, and `Pillar` in primary headings.

### 20.5 Labels and buttons

- Use verbs for actions.
- Describe the immediate result of the action.
- Avoid internal process names.
- Do not use different labels for the same action across pages.

### 20.6 Status writing

Good status copy explains what is happening:

```text
Preparing the research plan
Reviewing 914 listed companies
Scoring 68 eligible companies
Comparing the five finalists
Report ready
```

Avoid:

```text
Running loop
Executing engine
Pillar active
Processing autonomous DAG
```

### 20.7 Error writing

Use this pattern:

```text
What failed
What was preserved
What the user can do next
```

Example:

```text
Peer comparison could not be completed.
Your screening results and candidate scores are still available.
Try the comparison again or continue to the report with partial results.
```

### 20.8 Confidence and uncertainty

- Do not use precise confidence percentages unless the calculation is defined and explainable.
- Prefer levels such as `High`, `Moderate`, and `Low` with supporting reasons.
- State missing data and reporting periods near affected conclusions.

---

## 21. Copy Transformation Reference

| Current copy | Evolved copy | Reason |
| --- | --- | --- |
| `Define Research Objective` | `Apa yang ingin Anda teliti?` | Directly asks for the user's intent |
| `State your high-level research goal.` | `Jelaskan perusahaan atau karakteristik yang ingin Anda temukan.` | Clarifies the expected input |
| `Autonomous Objective Input` | `Riset baru` | Removes internal terminology |
| `Launch Autonomous Research` | `Mulai riset` | Short and action-oriented |
| `Deterministic Intelligence` | `Metodologi terukur` | Easier to understand |
| `Zero Hallucinations - Traceable Logic` | `Setiap kesimpulan disertai data pendukung` | Expresses a user benefit without an absolute claim |
| `Autonomous Execution Pipeline` | `Progress riset` | Describes what the user needs |
| `Research Planner` | `Menyusun rencana` | Uses a clear action |
| `Autonomous Screener` | `Menyaring perusahaan` | Makes the task concrete |
| `Deep Research Engine` | `Menganalisis kandidat` | Removes unnecessary engine language |
| `State & Observability` | `Mencatat aktivitas riset` | Explains the visible function |
| `Synthesis & Final Report` | `Menyusun laporan` | Concise and familiar |
| `Top Validated Research Candidates` | `Kandidat teratas` | Removes redundant assurance language |
| `Why Selected by Agent` | `Mengapa perusahaan ini dipilih` | Natural and specific |
| `View Full Dossier` | `Lihat analisis lengkap` | Familiar product language |
| `Inspect Funnel` | `Lihat proses penyaringan` | Replaces jargon |
| `Multi-Stage Universe Narrowing` | `Dari 914 perusahaan menjadi 5 kandidat` | Communicates a concrete outcome |
| `Validated Screening Shortlist` | `Perusahaan yang lolos penyaringan` | Explains the list plainly |
| `Peer Group Comparison Matrix` | `Bandingkan kandidat` | Action-oriented |
| `Cross-Sectional Benchmark` | `Perbandingan dengan perusahaan sejenis` | Explains the concept |
| `Agent Tool Trace & Observability` | `Riwayat aktivitas riset` | Suitable for non-technical users |
| `Execution Events & Tool Payload History` | `Langkah yang telah dijalankan` | Keeps payloads secondary |
| `Methodology & Financial Scoring Logic` | `Cara skor dihitung` | Short and clear |
| `Proprietary 5-Factor Quality Scoring Model` | `Lima faktor penilaian` | Removes marketing language |
| `Executive Research Dossier` | `Laporan riset` | Familiar terminology |
| `Cross-Sectional Candidate Matrix` | `Perbandingan kandidat` | Easier to scan |
| `Re-Run Cycle` | `Jalankan kembali` | Describes the action |
| `Agent Ready` | `Siap memulai riset` | Adds useful context |
| `Running Loop...` | `Riset sedang berjalan...` | Avoids exposing implementation concepts |
| `Gateway Online` | `Layanan tersedia` | User-oriented system language |
| `94.2% Confidence` | `Tingkat keyakinan: tinggi` | Avoids unexplained precision |

---

## 22. Example Candidate Copy

### Avoid

```text
BBCA commands the highest quality score driven by pristine asset quality
and superior CASA, sustaining capital efficiency across the observed period.
```

### Prefer

```text
BBCA menempati peringkat pertama. Profitabilitasnya tinggi dan basis dana
murahnya lebih kuat dibanding bank pembanding. Namun, valuasinya juga paling
mahal sehingga potensi pertumbuhannya perlu diuji lebih lanjut.
```

The evolved version:

- Starts with the conclusion.
- Explains the comparative reason.
- Includes a meaningful tradeoff.
- Avoids promotional language.
- Supports the next research decision.

---

## 23. Component Evolution Map

| Current component | Evolved responsibility |
| --- | --- |
| `AppSidebar.vue` | Desktop primary navigation with session context |
| `AppNavbar.vue` | Compact page context and status; no detached global run action |
| `ResearchInputConsole.vue` | Split into compact dashboard composer and full research brief |
| `PillarsWorkflowDAG.vue` | Session progress timeline; architecture explanation moves to methodology |
| `ScreeningFunnelCard.vue` | Dashboard summary with link to full stage explorer |
| `CandidateCard.vue` | Concise candidate summary with one reason, one risk, and clear detail action |
| `CandidateDetailModal.vue` | Quick-view drawer plus dedicated company page |
| `ScreenerView.vue` | Interactive stage explorer with retained and excluded companies |
| `PeersView.vue` | Selectable, grouped, responsive candidate comparison |
| `TraceView.vue` | High-level activity by default, raw technical trace on demand |
| `MethodologyView.vue` | Plain-language methodology with worked examples and limitations |
| `ReportView.vue` | Sectioned report with focused export hierarchy and responsive navigation |

---

## 24. Functional States Required Per Page

Every data-driven page should define these states where applicable:

| State | Expected presentation |
| --- | --- |
| Initial | Clear purpose and primary action |
| Loading | Layout-matched skeleton or meaningful progress |
| Populated | Main content and actions |
| Empty | Explanation and next action |
| Partial | Available content plus visible limitations |
| Error | Cause, preserved state, and recovery action |
| Offline or unavailable | What remains accessible and when to retry |

### Page-specific examples

#### Dashboard

- No previous research.
- Active research.
- Completed recent research.
- Failed recent research.

#### Screener

- Stage processing.
- No companies retained.
- Missing data prevented evaluation.
- Results available.

#### Peer Comparison

- Fewer than two candidates selected.
- Metric unavailable for one candidate.
- Invalid cross-sector comparison.
- Comparison ready.

#### Report

- Report is being generated.
- Partial report available.
- Export succeeded.
- Export failed.

---

## 25. Implementation Phases

### Phase 1: Navigation and accessibility foundation

- Add mobile navigation.
- Simplify the mobile top bar.
- Add skip link and main landmark target.
- Establish focus-visible styles.
- Add reduced-motion behavior.
- Correct dialog semantics and keyboard behavior.
- Correct tabs, filters, accordion, and table semantics.
- Increase essential microcopy size and contrast.

### Phase 2: Dashboard and research entry

- Convert the dashboard into an overview.
- Create `/research/new`.
- Split compact composer from full research brief.
- Move the run action into the relevant context.
- Add form validation and submission states.

### Phase 3: Session workspace

- Create `/research/:id`.
- Replace architecture cards with a progress timeline.
- Add overview, activity, and results panels.
- Add structured follow-up interaction.
- Define running, partial, failed, completed, and cancelled states.

### Phase 4: Results exploration

- Evolve the screener into a stage explorer.
- Evolve peer comparison for candidate selection and mobile use.
- Introduce quick-view drawer and `/company/:symbol`.
- Make candidate detail behavior consistent across pages.

### Phase 5: Report, methodology, and audit

- Add report section navigation.
- Simplify export hierarchy.
- Separate activity from technical trace.
- Rewrite methodology using progressive disclosure.
- Apply the evolved copy system throughout the product.

### Phase 6: Quality verification

- Test keyboard-only workflows.
- Test screen-reader landmarks and status announcements.
- Test 320px, 375px, 768px, 1024px, and wide desktop layouts.
- Test browser zoom at 200%.
- Test reduced motion.
- Test empty, partial, loading, and error states.
- Test direct navigation and refresh for every route.

---

## 26. Acceptance Criteria

### Navigation and structure

- [ ] All primary pages are reachable on desktop and mobile.
- [ ] Current location is visible and programmatically identified.
- [ ] Dashboard, research creation, session monitoring, results, and audit have distinct responsibilities.
- [ ] A user can start a new research session without understanding internal architecture terms.
- [ ] Context-specific actions appear in the relevant page rather than a global toolbar.

### Dashboard

- [ ] The primary action is clear within the first viewport.
- [ ] Active research and recent results are distinguishable.
- [ ] No more than three candidate summaries dominate the overview.
- [ ] Detailed funnel and trace information is linked rather than fully duplicated.

### Research interaction

- [ ] The research brief clearly communicates objective, scope, criteria, depth, and expected run.
- [ ] Ambiguous objectives can trigger concise clarification.
- [ ] Progress language describes meaningful research work.
- [ ] Follow-up interaction is available within session context.
- [ ] Agent output is rendered as structured research content.

### Mobile

- [ ] Navigation remains complete below the `md` breakpoint.
- [ ] No primary header content overlaps or clips at 320px width.
- [ ] Core results do not require a ten-column horizontal table.
- [ ] Candidate details work as a full-screen sheet or page.
- [ ] Primary touch targets are approximately 44 by 44 CSS pixels.
- [ ] Important text remains readable without zooming.

### Accessibility

- [ ] Core workflow is operable using keyboard only.
- [ ] Dialogs manage focus, Escape, naming, and focus return.
- [ ] Forms have associated labels and accessible errors.
- [ ] Status changes are announced appropriately.
- [ ] Tables have captions and header scope.
- [ ] Tabs, filters, and accordions expose selected or expanded state.
- [ ] Essential text meets WCAG AA contrast.
- [ ] Reduced-motion preference is respected.
- [ ] Browser zoom at 200% does not hide content or actions.

### Page functionality

- [ ] Candidate detail opens consistently from dashboard, screener, peers, and report.
- [ ] Screener stages explain retained and excluded results.
- [ ] Peer comparison supports an understandable two-company mobile view.
- [ ] Activity presents plain-language events before technical payloads.
- [ ] Methodology explains interpretation, calculation, adjustments, and limitations.
- [ ] Report sections are navigable and exports have success and error feedback.

### Copywriting

- [ ] One primary interface language is used consistently.
- [ ] Primary headings describe user tasks or results.
- [ ] Internal architecture terms are removed from primary user flows.
- [ ] Findings use conclusion, reason, evidence, and risk structure.
- [ ] Status and errors explain what happened and what the user can do next.
- [ ] Confidence language does not imply unexplained precision.
- [ ] Financial content remains informational and avoids recommendation language.

---

## 27. Definition of Done

The UI/UX evolution is complete when a first-time user can perform this flow on both desktop and mobile without guidance:

```text
Open Voyager One
Understand what the product can do
Start a new research objective
Review and confirm the research brief
Follow progress in a dedicated session
Understand the resulting shortlist
Compare at least two candidates
Open a complete company analysis
Review evidence and limitations
Read and export the report
Return to the dashboard and reopen the session
```

The same flow must be keyboard-operable, understandable at 200% zoom, usable with reduced motion enabled, and free from inaccessible modal or table interactions.

The final experience should feel like a focused financial research product, not a collection of technical dashboard demonstrations.

---

## 28. Scoring System Limitations (Pre-API Integration)

### Current State

The scoring system uses a 5-factor formula with static fixture data:

```
Quality Score = (0.25 × Profitability) + (0.25 × Growth) + (0.20 × Solvency) 
              + (0.20 × Valuation) + (0.10 × Consistency)
```

**Current Accuracy Assessment: 7/10**

### Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **No sector normalization** | Bank ROE 20% vs Retail ROE 20% treated equally | Scores should be peer-relative |
| **No price momentum** | Purely fundamental, timing ignored | Add momentum factor from price performance |
| **No forward-looking metrics** | Only historical data | Include analyst estimates |
| **Consistency unvalidated** | Score 80-99 without historical proof | Validate from quarterly time series |
| **No liquidity filter** | May recommend illiquid stocks | Filter by index membership or volume |
| **Absolute valuation** | P/E compared to fixed threshold | Should compare to sector median |

### User-Facing Disclaimers Required

These disclaimers should appear in the UI:

**Methodology Modal:**
> Skor kualitas adalah demonstrasi metodologi menggunakan data prototype. Benchmark seharusnya dibandingkan dengan median sektor, bukan nilai absolut.

**Score Tooltip:**
> Momentum dan timing belum diperhitungkan dalam skor ini. Skor tinggi menunjukkan prioritas riset, bukan prediksi return.

**Report Footer:**
> Data menggunakan fixture demonstrasi untuk delapan perusahaan. Implementasi produksi akan menggunakan data real-time dari seluruh perusahaan tercatat.

### Recommended Enhanced Scoring (Post-API Integration)

With Sectors API integration, the scoring can be enhanced to:

```typescript
// Enhanced 8-factor formula (target accuracy: 9/10)
const enhancedScore = 
  (0.20 * profitability) +    // ROE, ROA vs sector median
  (0.20 * growth) +           // Validated CAGR from quarterly data
  (0.10 * solvency) +         // D/E, current ratio, interest coverage
  (0.10 * valuation) +        // PE, PBV relative to sector median
  (0.15 * momentum) +         // 30d, 90d, 365d price performance
  (0.10 * liquidity) +        // Index membership, avg volume
  (0.10 * consistency) +      // Earnings variance from historical data
  (0.05 * forward)            // Forward PE, analyst growth estimates
```

### API Endpoints Required for Enhancement

| Factor | Sectors API Endpoint |
|--------|---------------------|
| Peer comparison | `GET /company/report/{ticker}/?sections=peers` |
| Price momentum | `GET /listing-performance/{ticker}/` |
| Historical financials | `GET /financials/quarterly/{ticker}/` |
| Index membership | `GET /index/{index}/` |
| Forward estimates | `GET /company/report/{ticker}/?sections=future` |

For detailed integration recommendations, see `docs/sectors-api-integration-recommendations.md`.

---

## 29. Data Source Transparency

### Current Data Contract

| Aspect | Current State | Production Target |
|--------|---------------|-------------------|
| **Universe** | 8 companies (fixture) | 900+ IDX companies |
| **Data freshness** | Static | Daily/quarterly updates |
| **Source** | `sectorsUniverse.ts` | Sectors API v1 |
| **Validation** | Manual | API-verified |

### Required UI Indicators

1. **Data source badge** on every data-dependent page
2. **Last updated timestamp** for time-sensitive metrics
3. **"Demo data" indicator** while using fixtures
4. **Sector coverage disclosure** in methodology

### Evidence Citation Format

Current format in fixtures:
```
source: 'Prototype fixture: /companies/BBCA/financials'
```

Production format should be:
```
source: 'Sectors API: /company/report/BBCA/?sections=financials'
asOf: '2026-08-27'
```

This ensures auditability and user trust in the presented data.
