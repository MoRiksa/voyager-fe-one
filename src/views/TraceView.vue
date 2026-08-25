<script setup lang="ts">
import { ref } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { 
  Terminal, 
  Coins, 
  CheckCircle2, 
  Clock, 
  HardDrive, 
  Database,
  Filter,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers
} from 'lucide-vue-next'

const store = useResearchStore()
const expandedLogId = ref<string | null>('tool-01')

const toggleExpand = (id: string) => {
  expandedLogId.value = expandedLogId.value === id ? null : id
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- View Header -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-xs font-bold uppercase tracking-wider text-[#407EC9] font-mono">Pillar 4: State & Observability</span>
        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
          Audit Trail
        </span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
        Agent Tool Trace & Observability
      </h1>
      <p class="text-sm text-slate-600 mt-1 max-w-3xl">
        Complete high-level execution trace and API audit log. Every query, derived intelligence score, and validation step is observable and reproducible without exposing private LLM chain-of-thought.
      </p>
    </div>

    <!-- Metrics Cards Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-xs text-slate-400 font-semibold uppercase">Total Tool Invocations</span>
        <div class="text-2xl font-mono font-bold text-slate-900 mt-1">{{ store.toolCalls.length }}</div>
        <span class="text-[11px] text-emerald-600 font-medium">100% Success Rate</span>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-xs text-slate-400 font-semibold uppercase">Total Credits Spent</span>
        <div class="text-2xl font-mono font-bold text-[#407EC9] mt-1">160</div>
        <span class="text-[11px] text-slate-500 font-mono">Sectors API Credits</span>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-xs text-slate-400 font-semibold uppercase">Avg Tool Latency</span>
        <div class="text-2xl font-mono font-bold text-slate-900 mt-1">285ms</div>
        <span class="text-[11px] text-slate-500 font-medium">Fast Execution</span>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-xs text-slate-400 font-semibold uppercase">Data Anomaly Flags</span>
        <div class="text-2xl font-mono font-bold text-emerald-600 mt-1">0</div>
        <span class="text-[11px] text-emerald-600 font-medium">Validated Clean</span>
      </div>
    </div>

    <!-- Trace Log Feed -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 class="text-lg font-bold text-slate-900">Execution Events & Tool Payload History</h3>
          <p class="text-xs text-slate-500 mt-0.5">Click any tool call to inspect raw JSON input and output summary</p>
        </div>
        <span class="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Live Session: {{ store.report.sessionId }}
        </span>
      </div>

      <div class="space-y-3">
        <div 
          v-for="call in store.toolCalls"
          :key="call.id"
          class="rounded-xl border border-slate-200 overflow-hidden transition-all"
          :class="expandedLogId === call.id ? 'bg-slate-50/70 ring-1 ring-[#407EC9]/30' : 'bg-white hover:bg-slate-50/40'"
        >
          <!-- Log Item Header -->
          <button
            @click="toggleExpand(call.id)"
            class="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left cursor-pointer"
          >
            <div class="flex items-start gap-3">
              <span class="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-xs text-slate-900">{{ call.toolName }}</span>
                  <span 
                    class="text-[10px] font-semibold px-2 py-0.5 rounded border"
                    :class="call.category === 'Sectors API' ? 'bg-[#407EC9]/10 text-[#407EC9] border-[#407EC9]/20' : 'bg-slate-100 text-slate-700 border-slate-200'"
                  >
                    {{ call.category }}
                  </span>
                  <span class="text-[11px] font-mono text-slate-400">{{ call.timestamp }}</span>
                </div>
                <p class="text-xs text-slate-600 mt-1">{{ call.outputSummary }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4 text-xs font-mono text-slate-500 self-end sm:self-center shrink-0">
              <span class="flex items-center gap-1">
                <Clock class="w-3.5 h-3.5 text-slate-400" />
                {{ call.durationMs }}ms
              </span>
              <span v-if="call.creditCost > 0" class="flex items-center gap-1 text-[#407EC9] font-bold">
                <Coins class="w-3.5 h-3.5" />
                -{{ call.creditCost }} credits
              </span>
              <component :is="expandedLogId === call.id ? ChevronUp : ChevronDown" class="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <!-- Expanded Payload Details -->
          <div 
            v-if="expandedLogId === call.id"
            class="p-4 bg-slate-900 text-slate-100 font-mono text-xs border-t border-slate-200/80 rounded-b-xl overflow-x-auto space-y-3"
          >
            <div>
              <div class="text-slate-400 text-[11px] mb-1 uppercase font-bold tracking-wider">// Tool Input Payload:</div>
              <pre class="text-[#9CC5EF] bg-slate-950 p-3 rounded-lg overflow-x-auto">{{ JSON.stringify(call.input, null, 2) }}</pre>
            </div>
            <div>
              <div class="text-slate-400 text-[11px] mb-1 uppercase font-bold tracking-wider">// Result Summary:</div>
              <div class="text-emerald-400 bg-slate-950 p-3 rounded-lg">{{ call.outputSummary }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
