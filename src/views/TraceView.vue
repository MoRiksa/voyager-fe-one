<script setup lang="ts">
import { computed, ref } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { 
  ChevronDown,
  ChevronUp
} from '@lucide/vue'

const store = useResearchStore()
const expandedLogId = ref<string | null>(store.toolCalls[0]?.id || null)
const successRate = computed(() => Math.round((store.toolCalls.filter(call => call.status !== 'ERROR').length / Math.max(store.toolCalls.length, 1)) * 100))
const errorCount = computed(() => store.toolCalls.filter(call => call.status === 'ERROR').length)
const inputCount = computed(() => store.screeningFunnel[0]?.count || 0)

const toggleExpand = (id: string) => {
  expandedLogId.value = expandedLogId.value === id ? null : id
}
</script>

<template>
  <div class="page-shell space-y-7">
    <!-- View Header -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
         <span class="section-kicker">Audit teknis</span>
        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
           Detail teknis tersedia
        </span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
         Keputusan dan provenance penyaringan
      </h1>
      <p class="text-sm text-slate-600 mt-1 max-w-3xl">
         Periksa sumber dataset, simbol input, kriteria, dan hasil setiap tahap untuk kebutuhan audit atau debugging.
      </p>
    </div>

    <!-- Metrics Cards Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-xs text-slate-500 font-semibold uppercase">Total event</span>
        <div class="text-2xl font-mono font-bold text-slate-900 mt-1">{{ store.toolCalls.length }}</div>
        <span class="text-xs text-emerald-600 font-medium">{{ successRate }}% tercatat</span>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-xs text-slate-500 font-semibold uppercase">Sumber data</span>
        <div class="text-lg font-mono font-bold text-[#2F64A8] mt-2">Fixture v1</div>
        <span class="text-xs text-slate-500 font-mono">Prototype lokal</span>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-xs text-slate-500 font-semibold uppercase">Input awal</span>
        <div class="text-2xl font-mono font-bold text-slate-900 mt-1">{{ inputCount }}</div>
        <span class="text-xs text-slate-500 font-medium">Perusahaan fixture</span>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-xs text-slate-500 font-semibold uppercase">Operasi gagal</span>
        <div class="mt-1 font-mono text-2xl font-bold" :class="errorCount ? 'text-rose-700' : 'text-slate-900'">{{ errorCount }}</div>
        <span class="text-xs font-medium" :class="errorCount ? 'text-rose-700' : 'text-slate-500'">{{ errorCount ? 'Perlu diperiksa' : 'Tidak ada kegagalan' }}</span>
      </div>
    </div>

    <!-- Trace Log Feed -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
           <h3 class="text-lg font-bold text-slate-900">Langkah yang telah dijalankan</h3>
           <p class="text-xs text-slate-500 mt-0.5">Pilih aktivitas untuk membuka detail teknis</p>
        </div>
        <span class="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
           Sesi {{ store.report.sessionId }}
        </span>
      </div>

      <div v-if="!store.toolCalls.length" class="flex flex-col items-center justify-center py-12 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <ChevronDown class="h-6 w-6" />
        </div>
        <h2 class="mt-4 text-lg font-bold text-slate-900">Belum ada trace</h2>
        <p class="mt-2 max-w-sm text-sm text-slate-500">Detail teknis akan muncul di sini setelah proses riset dimulai. Kembali ke sesi untuk memulai atau melanjutkan riset.</p>
        <router-link :to="`/research/${store.report.sessionId}`" class="button-primary mt-6">Kembali ke sesi</router-link>
      </div>

      <div v-else class="space-y-3">
        <div 
          v-for="call in store.toolCalls"
          :key="call.id"
          class="rounded-xl border border-slate-200 overflow-hidden transition-all"
          :class="expandedLogId === call.id ? 'bg-slate-50/70 ring-1 ring-[#407EC9]/30' : 'bg-white hover:bg-slate-50/40'"
        >
          <!-- Log Item Header -->
           <button
             @click="toggleExpand(call.id)"
             :aria-expanded="expandedLogId === call.id"
             :aria-controls="`trace-${call.id}`"
            class="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left cursor-pointer"
          >
            <div class="flex items-start gap-3">
               <span class="w-2 h-2 rounded-full mt-2 shrink-0" :class="call.status === 'ERROR' ? 'bg-rose-500' : 'bg-emerald-500'"></span>
              <div>
                 <div class="flex flex-wrap items-center gap-2">
                   <span class="text-sm font-bold text-slate-900">{{ call.outputSummary }}</span>
                  <span class="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    {{ call.category }}
                  </span>
                  <span class="text-[11px] font-mono text-slate-500">{{ call.timestamp }}</span>
                </div>
                 <p class="text-xs text-slate-500 mt-1 font-mono">{{ call.toolName }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4 text-xs font-mono text-slate-500 self-end sm:self-center shrink-0">
              <span>{{ call.sourceKind === 'prototype-fixture' ? 'prototype-fixture-v1' : 'user-input' }}</span>
              <component :is="expandedLogId === call.id ? ChevronUp : ChevronDown" class="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <!-- Expanded Payload Details -->
           <div
             v-if="expandedLogId === call.id"
             :id="`trace-${call.id}`"
            class="p-4 bg-slate-900 text-slate-100 font-mono text-xs border-t border-slate-200/80 rounded-b-xl overflow-x-auto space-y-3"
          >
            <div>
               <div class="text-slate-400 text-[11px] mb-1 uppercase font-bold tracking-wider">// Input dan provenance:</div>
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
