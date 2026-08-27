<script setup lang="ts">
import { computed } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { ArrowRight, CheckCircle2, Clock3, FileText, Filter, Search } from 'lucide-vue-next'

const store = useResearchStore()
const totalDuration = computed(() => store.toolCalls.reduce((sum, call) => sum + call.durationMs, 0))
const iconFor = (category: string) => category === 'Sectors API' ? Search : category === 'Derived Intelligence' ? Filter : FileText
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-7 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <header class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p class="section-kicker">Aktivitas sesi</p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">Langkah yang telah dijalankan</h1>
      <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Ikuti proses riset dalam bahasa ringkas. Detail input dan payload tersedia terpisah pada audit teknis.</p>
      <div class="mt-6 flex flex-wrap gap-3 text-xs"><span class="rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700">{{ store.toolCalls.length }} aktivitas</span><span class="rounded-lg bg-slate-100 px-3 py-2 font-mono text-slate-700">{{ totalDuration.toLocaleString() }} ms total</span><span class="rounded-lg bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">Sesi {{ store.report.sessionId }}</span></div>
    </header>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-label="Timeline aktivitas">
      <ol class="space-y-1">
        <li v-for="(call, index) in store.toolCalls" :key="call.id" class="relative grid grid-cols-[2.75rem_1fr] gap-3 pb-7 last:pb-0">
          <div class="relative flex justify-center"><span v-if="index < store.toolCalls.length - 1" class="absolute top-10 bottom-0 w-px bg-slate-200"></span><span class="z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-[#407EC9]/10 text-[#2F64A8]"><component :is="iconFor(call.category)" class="h-4 w-4" /></span></div>
          <article class="rounded-xl border border-slate-200 p-4"><div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><div class="flex items-center gap-2"><CheckCircle2 class="h-4 w-4 text-emerald-600" /><h2 class="text-sm font-bold text-slate-950">{{ call.outputSummary }}</h2></div><p class="mt-2 text-xs text-slate-500">{{ call.category }} · langkah {{ index + 1 }}</p></div><span class="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-slate-500"><Clock3 class="h-3.5 w-3.5" />{{ call.durationMs }} ms</span></div></article>
        </li>
      </ol>
      <router-link to="/trace" class="button-secondary mt-7">Buka audit teknis <ArrowRight class="h-4 w-4" /></router-link>
    </section>
  </div>
</template>
