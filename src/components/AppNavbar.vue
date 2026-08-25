<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { 
  Play, 
  RotateCcw, 
  Loader2, 
  ChevronRight, 
  Building2, 
  ShieldCheck,
  CheckCircle2,
  Activity
} from 'lucide-vue-next'

const route = useRoute()
const store = useResearchStore()

const pageTitle = computed(() => {
  switch (route.name) {
    case 'screener': return 'Screener Funnel'
    case 'peers': return 'Peer Comparison Matrix'
    case 'trace': return 'Tool Trace & Observability'
    case 'methodology': return 'Scoring Methodology'
    case 'report': return 'Executive Research Report'
    default: return 'Research Workspace'
  }
})

const statusBadge = computed(() => {
  switch (store.status) {
    case 'UNDERSTANDING': return { text: 'Analyzing Objective', active: true }
    case 'PLANNING': return { text: 'Formulating DAG', active: true }
    case 'DISCOVERING': return { text: 'Fetching Universe', active: true }
    case 'SCREENING': return { text: 'Filtering Candidates', active: true }
    case 'RANKING': return { text: 'Computing Scores', active: true }
    case 'RESEARCHING': return { text: 'DuPont Decomposition', active: true }
    case 'COMPARING': return { text: 'Benchmarking Peers', active: true }
    case 'VALIDATING': return { text: 'Validating Checks', active: true }
    case 'REPORTING': return { text: 'Synthesizing Report', active: true }
    case 'COMPLETED': return { text: 'Agent Ready', active: false }
    case 'FAILED': return { text: 'Error', active: false }
    default: return { text: 'Agent Idle', active: false }
  }
})
</script>

<template>
  <header class="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
    <!-- Left: Context & Breadcrumb -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span class="text-slate-400">Voyager One</span>
        <ChevronRight class="w-3.5 h-3.5 text-slate-300" />
        <span class="text-slate-900 font-bold text-sm">{{ pageTitle }}</span>
      </div>

      <span class="hidden sm:inline text-slate-200">|</span>

      <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200/60">
        <Building2 class="w-3.5 h-3.5 text-slate-400" />
        <span>IDX Universe: <strong class="text-slate-800 font-mono">914 Companies</strong></span>
      </div>
    </div>

    <!-- Right: Subtle Status & Clean Action Button -->
    <div class="flex items-center gap-4">
      <!-- Subtle Minimal Status Pill -->
      <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs">
        <span 
          class="w-2 h-2 rounded-full"
          :class="statusBadge.active ? 'bg-[#407EC9] animate-ping' : 'bg-emerald-500'"
        ></span>
        <span class="text-slate-700 font-medium text-xs">{{ statusBadge.text }}</span>
      </div>

      <!-- Minimal, Non-Overpowering Run Button -->
      <button
        @click="store.runAutonomousResearch"
        :disabled="store.isExecuting"
        class="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[#407EC9]/30 bg-[#407EC9]/5 hover:bg-[#407EC9] hover:text-white text-[#407EC9] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
        title="Run autonomous research cycle"
      >
        <Loader2 v-if="store.isExecuting" class="w-3.5 h-3.5 animate-spin" />
        <RotateCcw v-else class="w-3.5 h-3.5" />
        <span>{{ store.isExecuting ? 'Running Loop...' : 'Re-Run Cycle' }}</span>
      </button>
    </div>
  </header>
</template>
