# Voyager One — Autonomous Financial Research Agent
> **Sectors Hackathon 2026** • Track: AI Agents & Assistants • Derived Intelligence Engine

Voyager One is an autonomous financial research agent and analytical workspace built for the Indonesian capital markets (IDX). It transforms high-level investment objectives into multi-stage execution DAGs, performs universe screening across 900+ listed equities, calculates proprietary 5-factor quality scores and 3-stage DuPont decompositions, and produces explainable institutional research dossiers.

---

## 🏛️ The 5 Core Pillars Architecture

1. **Pillar 1: Research Planner**: Translates user objectives into structured execution plans and tool orchestration.
2. **Pillar 2: Autonomous Screener**: Corong multi-tahap mempersempit semesta saham ($914 \rightarrow 284 \rightarrow 68 \rightarrow 18 \rightarrow 5$) secara terukur.
3. **Pillar 3: Deep Research Engine**: Dekonstruksi finansial mendalam (3-Stage DuPont ROE Decomposition, Solvency Stress Checks, FCF Yields).
4. **Pillar 4: Memory & State (Observability)**: Audit trail lengkap dari setiap invocation Sectors API dan monitoring kuota credits.
5. **Pillar 5: Final Research Report**: Sintesis bukti empiris, rasionalitas pemilihan saham, mitigasi risiko, serta batas ketidakpastian (*Limitations & Uncertainty*).

---

## 🎨 Design Philosophy & UI/UX Standards

* **Color Palette**: Pure White Base (`#FFFFFF`) with official **Pantone 660 C** (`#407EC9` / `#2F64A8`) primary brand accent.
* **Zero Emojis**: 100% Crisp SVG vector icons powered by `lucide-vue-next`.
* **Anti-AI-Slop**: Estetika presisi FinTech institusional tanpa gradien liar.
* **UI/UX Laws**: Penerapan Hick's Law, Fitts's Law, Miller's Law, dan Jakob's Law pada seluruh tampilan metrik finansial.

---

## 🛠️ Tech Stack

* **Framework**: Vue 3 (Composition API + `<script setup lang="ts">`)
* **Build Tool**: Vite 6
* **Language**: TypeScript (Strict mode)
* **Styling**: Tailwind CSS v4
* **State Management**: Pinia
* **Routing**: Vue Router 4
* **Icons**: Lucide Vue Next

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🌐 Deployment on Vercel

This frontend is configured for zero-config automatic deployment on [Vercel](https://vercel.com):
* **Framework Preset**: Vite
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Install Command**: `npm install`
