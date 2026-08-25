<script setup lang="ts">
import { ref, computed } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import ResearchInputConsole from '../components/ResearchInputConsole.vue'
import PillarsWorkflowDAG from '../components/PillarsWorkflowDAG.vue'
import ScreeningFunnelCard from '../components/ScreeningFunnelCard.vue'
import CandidateCard from '../components/CandidateCard.vue'
import CandidateDetailModal from '../components/CandidateDetailModal.vue'
import MethodologyModal from '../components/MethodologyModal.vue'
import { 
  Award, 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  Download, 
  FileText, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Terminal,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-vue-next'

const store = useResearchStore()
const activeTab = ref<'all' | 'financials' | 'consumer' | 'industrials'>('all')

const filteredCandidates = computed(() => {
  if (activeTab.value === 'all') return store.candidates
  if (activeTab.value === 'financials') return store.candidates.filter(c => c.sector === 'Financials')
  if (activeTab.value === 'consumer') return store.candidates.filter(c => c.sector.includes('Consumer'))
  if (activeTab.value === 'industrials') return store.candidates.filter(c => c.sector === 'Industrials')
  return store.candidates
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- 1. Executive Objective Console -->
    <ResearchInputConsole />

    <!-- 2. 5-Pillars Workflow Visualizer -->
    <PillarsWorkflowDAG />

    <!-- 3. Main Analytical Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Top Candidates Shortlist (7 cols on large screens) -->
      <div class="lg:col-span-8 space-y-6">
        <!-- Section Header with Filter Tabs -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-[#407EC9] font-mono">
                Pillar 5: Derived Output
              </span>
              <span class="px-2 py-0.5 text-[10px] font-bold bg-[#407EC9]/10 text-[#407EC9] rounded">
                {{ filteredCandidates.length }} Ranked Targets
              </span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 mt-0.5">Top Validated Research Candidates</h2>
          </div>

          <!-- Sector Filter Tabs -->
          <div class="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-medium self-start sm:self-auto">
            <button
              @click="activeTab = 'all'"
              class="px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              :class="activeTab === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            >
              All Sectors
            </button>
            <button
              @click="activeTab = 'financials'"
              class="px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              :class="activeTab === 'financials' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            >
              Banking
            </button>
            <button
              @click="activeTab = 'consumer'"
              class="px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              :class="activeTab === 'consumer' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            >
              Consumer
            </button>
            <button
              @click="activeTab = 'industrials'"
              class="px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              :class="activeTab === 'industrials' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            >
              Industrials
            </button>
          </div>
        </div>

        <!-- Candidate Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CandidateCard
            v-for="candidate in filteredCandidates"
            :key="candidate.symbol"
            :candidate="candidate"
          />
        </div>
      </div>

      <!-- Right Column: Screener Funnel & Live Tool Activity Stream (4 cols) -->
      <div class="lg:col-span-4 space-y-6">
        <!-- Funnel Card -->
        <ScreeningFunnelCard />

        <!-- Executive Summary Snapshot -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Research Synthesis Memo
            </h3>
            <span class="text-[10px] font-mono text-slate-400">Pillar 5 Output</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            {{ store.report.peerComparisonNotes }}
          </p>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <router-link
              to="/report"
              class="text-xs font-bold text-[#407EC9] hover:underline flex items-center gap-1.5"
            >
              <FileText class="w-3.5 h-3.5" />
              <span>Open Executive Report</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </router-link>

            <span class="text-[10px] text-slate-400 font-mono">
              Session: {{ store.report.sessionId }}
            </span>
          </div>
        </div>

        <!-- Recent Sectors Tool Trace Widget -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <Terminal class="w-4 h-4 text-[#407EC9]" />
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Recent Sectors Tool Calls
              </h3>
            </div>
            <router-link 
              to="/trace" 
              class="text-xs text-[#407EC9] hover:underline font-semibold"
            >
              Full Trace
            </router-link>
          </div>

          <div class="space-y-2 font-mono text-[11px]">
            <div 
              v-for="call in store.toolCalls.slice(-4)" 
              :key="call.id"
              class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-2"
            >
              <div>
                <div class="font-bold text-slate-800 text-[11px]">{{ call.toolName }}</div>
                <div class="text-[10px] text-slate-500 line-clamp-1 font-sans mt-0.5">{{ call.outputSummary }}</div>
              </div>
              <span class="text-[10px] text-slate-400 shrink-0">{{ call.durationMs }}ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CandidateDetailModal />
    <MethodologyModal />
  </div>
</template>
