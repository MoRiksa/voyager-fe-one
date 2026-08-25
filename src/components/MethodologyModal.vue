<script setup lang="ts">
import { useResearchStore } from '../stores/researchStore'
import { 
  X, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  Cpu, 
  Calculator, 
  Layers,
  Award,
  AlertCircle
} from 'lucide-vue-next'

const store = useResearchStore()
</script>

<template>
  <div 
    v-if="store.isMethodologyModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-900/60 backdrop-blur-xs transition-opacity"
    @click.self="store.closeMethodology"
  >
    <div class="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <!-- Modal Header -->
      <div class="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#407EC9] text-white flex items-center justify-center shadow-xs">
            <Calculator class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-900">Derived Intelligence Methodology</h2>
            <p class="text-xs text-slate-500">Sectors Hackathon 2026 Qualifying Test Compliance</p>
          </div>
        </div>

        <button
          @click="store.closeMethodology"
          class="p-2 rounded-xl hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-slate-600">
        <!-- 1. Qualifying Test Mandate -->
        <div class="p-4 rounded-xl bg-[#407EC9]/5 border border-[#407EC9]/20">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[#407EC9] mb-1 flex items-center gap-1.5">
            <ShieldCheck class="w-4 h-4" />
            Hackathon Mandatory Requirement: Derived Intelligence
          </h4>
          <p class="text-xs text-slate-700 leading-relaxed">
            The project does not merely re-render raw Sectors API data on a dashboard. It executes a proprietary 5-factor scoring model, 3-stage DuPont decomposition, and multi-tier universe screening directly on retrieved market metrics.
          </p>
        </div>

        <!-- 2. The 5-Factor Scoring Formula -->
        <div>
          <h3 class="text-base font-bold text-slate-900 mb-2">1. Derived Quality Score Formula</h3>
          <p class="text-xs leading-relaxed mb-3">
            Every candidate is evaluated on a scale of 0 to 100 based on weighted fundamental dimensions:
          </p>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
            <div class="font-bold text-[#407EC9]">
              Quality Score = (0.25 × Profitability) + (0.25 × Growth) + (0.20 × Solvency) + (0.20 × Valuation) + (0.10 × Consistency)
            </div>
            <div class="text-[11px] text-slate-500 pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div>• <strong>Profitability (25%)</strong>: ROE, ROA, Gross Margin</div>
              <div>• <strong>Growth (25%)</strong>: 3Y Revenue & Net Income CAGR</div>
              <div>• <strong>Solvency (20%)</strong>: Debt/Equity, Current Ratio, Cash Buffer</div>
              <div>• <strong>Valuation (20%)</strong>: P/E, P/BV vs Historical Sector Medians</div>
              <div>• <strong>Consistency (10%)</strong>: Multi-year dividend & earnings stability</div>
            </div>
          </div>
        </div>

        <!-- 3. De-coupled AI Orchestrator vs Deterministic Engine -->
        <div>
          <h3 class="text-base font-bold text-slate-900 mb-2">2. Architecture Boundary & Explainability</h3>
          <p class="text-xs leading-relaxed mb-3">
            To ensure zero hallucinations, calculations are performed deterministically in the custom Intelligence Engine, while the Autonomous Agent handles strategy synthesis and evidence validation.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3.5 rounded-xl border border-slate-200 bg-white">
              <h5 class="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Cpu class="w-3.5 h-3.5 text-[#407EC9]" />
                Intelligence Engine (Deterministic)
              </h5>
              <ul class="text-[11px] text-slate-600 space-y-1">
                <li>• Multi-stage universe screening</li>
                <li>• Exact DuPont mathematical models</li>
                <li>• Relative valuation multiple normalization</li>
                <li>• Anomaly & missing data detection</li>
              </ul>
            </div>

            <div class="p-3.5 rounded-xl border border-slate-200 bg-white">
              <h5 class="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Layers class="w-3.5 h-3.5 text-emerald-600" />
                Autonomous Agent (Synthesis)
              </h5>
              <ul class="text-[11px] text-slate-600 space-y-1">
                <li>• Translates objective into research plan</li>
                <li>• Dynamic Sectors MCP tool selection</li>
                <li>• Formulates explainable thesis ("Why Selected")</li>
                <li>• Flags uncertainties & limitations</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 4. Research Safety & Disclaimers -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div class="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
            <AlertCircle class="w-4 h-4 text-slate-500" />
            Compliance Notice
          </div>
          <p class="text-[11px] text-slate-500 leading-relaxed">
            Voyager One operates strictly as a financial research tool. It does not perform automated trade execution, buy/sell recommendations, or guaranteed return claims.
          </p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
        <button
          @click="store.closeMethodology"
          class="px-5 py-2 text-xs font-bold text-white bg-[#407EC9] hover:bg-[#2F64A8] rounded-xl transition-colors cursor-pointer"
        >
          Understood
        </button>
      </div>
    </div>
  </div>
</template>
