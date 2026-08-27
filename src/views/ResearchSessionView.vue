<script setup lang="ts">
import { computed, ref } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import CandidateCard from '../components/CandidateCard.vue'
import { Activity, ArrowRight, CheckCircle2, Clock3, FileText, MessageSquare, Send, Terminal } from 'lucide-vue-next'

const store = useResearchStore()
const activePanel = ref<'overview' | 'activity' | 'results'>('overview')
const followUp = ref('')
const followUpResponse = ref('')

const activePillar = computed(() => store.pillars.find(pillar => pillar.status === 'active'))
const completedCount = computed(() => store.pillars.filter(pillar => pillar.status === 'completed').length)
const progress = computed(() => Math.round((completedCount.value / store.pillars.length) * 100))

const askFollowUp = () => {
  if (!followUp.value.trim()) return
  followUpResponse.value = 'Pertanyaan lanjutan telah dicatat pada sesi ini. Dalam prototype ini, hasil tetap menggunakan kandidat yang tersedia.'
  followUp.value = ''
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <header class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div class="max-w-4xl">
          <div class="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span class="text-[#2F64A8]">Sesi {{ store.report.sessionId }}</span>
            <span class="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">{{ store.isExecuting ? 'Sedang berjalan' : 'Selesai' }}</span>
          </div>
          <h1 class="mt-3 text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">{{ store.currentObjective }}</h1>
          <p class="mt-3 text-sm leading-6 text-slate-600">{{ activePillar?.subtitle || 'Hasil riset, kandidat, dan laporan telah tersedia untuk ditinjau.' }}</p>
        </div>
        <router-link v-if="!store.isExecuting" to="/report" class="button-primary shrink-0">Buka laporan <ArrowRight class="h-4 w-4" /></router-link>
      </div>
      <div class="mt-7">
        <div class="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600"><span>{{ activePillar?.name || 'Riset selesai' }}</span><span class="font-mono">{{ progress }}%</span></div>
        <div class="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100"><div class="h-full rounded-full bg-[#407EC9] transition-[width] duration-300" :style="{ width: `${progress}%` }"></div></div>
      </div>
    </header>

    <div class="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 lg:hidden" aria-label="Panel sesi">
      <button v-for="panel in [{ id: 'overview', label: 'Ringkasan' }, { id: 'activity', label: 'Aktivitas' }, { id: 'results', label: 'Hasil' }]" :key="panel.id" type="button" class="min-h-11 flex-1 rounded-lg px-4 text-xs font-bold" :class="activePanel === panel.id ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'" :aria-pressed="activePanel === panel.id" @click="activePanel = panel.id as typeof activePanel">{{ panel.label }}</button>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_21rem]">
      <main class="space-y-6">
        <section v-show="activePanel === 'overview' || activePanel === 'results'" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div class="flex items-center justify-between gap-3"><div><p class="section-kicker">Rencana riset</p><h2 class="mt-1 text-xl font-bold text-slate-950">Langkah yang dijalankan</h2></div><span class="font-mono text-xs text-slate-500">{{ completedCount }}/5 selesai</span></div>
          <ol class="mt-5 grid gap-3 sm:grid-cols-2">
            <li v-for="pillar in store.pillars" :key="pillar.id" class="flex gap-3 rounded-xl border border-slate-200 p-4" :class="pillar.status === 'active' ? 'border-[#407EC9] bg-[#407EC9]/5' : ''">
              <CheckCircle2 v-if="pillar.status === 'completed'" class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <Clock3 v-else class="mt-0.5 h-4 w-4 shrink-0 text-[#407EC9]" />
              <div><h3 class="text-sm font-bold text-slate-900">{{ pillar.name }}</h3><p class="mt-1 text-xs leading-5 text-slate-500">{{ pillar.subtitle }}</p></div>
            </li>
          </ol>
        </section>

        <section v-show="activePanel === 'overview' || activePanel === 'results'" aria-labelledby="session-results-title">
          <div class="mb-4 flex items-end justify-between"><div><p class="section-kicker">Hasil sementara</p><h2 id="session-results-title" class="mt-1 text-xl font-bold text-slate-950">Kandidat teratas</h2></div><router-link to="/peers" class="text-link hidden sm:inline-flex">Bandingkan kandidat <ArrowRight class="h-4 w-4" /></router-link></div>
          <div class="grid gap-4 xl:grid-cols-2"><CandidateCard v-for="candidate in store.candidates.slice(0, 4)" :key="candidate.symbol" :candidate="candidate" /></div>
        </section>

        <section v-show="activePanel === 'activity'" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:hidden">
          <h2 class="text-lg font-bold text-slate-950">Aktivitas terbaru</h2>
          <div class="mt-4 space-y-4"><div v-for="call in store.toolCalls.slice(-6).reverse()" :key="call.id" class="border-l-2 border-slate-200 pl-4"><p class="text-sm font-bold text-slate-900">{{ call.outputSummary }}</p><p class="mt-1 font-mono text-xs text-slate-500">{{ call.timestamp }} · {{ call.durationMs }} ms</p></div></div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div class="flex items-center gap-2"><MessageSquare class="h-4 w-4 text-[#407EC9]" /><h2 class="text-lg font-bold text-slate-950">Tanyakan hal lanjutan</h2></div>
          <p class="mt-1 text-xs leading-5 text-slate-500">Gunakan konteks sesi ini untuk mempersempit hasil atau meminta perbandingan tambahan.</p>
          <form class="mt-4 flex flex-col gap-2 sm:flex-row" @submit.prevent="askFollowUp"><label for="follow-up" class="sr-only">Pertanyaan lanjutan</label><input id="follow-up" v-model="followUp" class="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#407EC9] focus:ring-4 focus:ring-[#407EC9]/10" placeholder="Contoh: Bandingkan tiga kandidat teratas dari sisi risiko." /><button type="submit" class="button-primary"><Send class="h-4 w-4" /> Kirim</button></form>
          <p v-if="followUpResponse" role="status" class="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">{{ followUpResponse }}</p>
        </section>
      </main>

      <aside class="hidden space-y-4 lg:block">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div class="flex items-center gap-2"><Activity class="h-4 w-4 text-[#407EC9]" /><h2 class="text-sm font-bold text-slate-950">Aktivitas sesi</h2></div><div class="mt-5 space-y-5"><div v-for="call in store.toolCalls.slice(-5).reverse()" :key="call.id" class="relative border-l-2 border-slate-200 pl-4"><span class="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-[#407EC9]"></span><p class="text-xs font-semibold leading-5 text-slate-800">{{ call.outputSummary }}</p><p class="mt-1 font-mono text-[11px] text-slate-500">{{ call.timestamp }} · {{ call.durationMs }} ms</p></div></div><router-link to="/trace" class="text-link mt-5">Lihat seluruh aktivitas <ArrowRight class="h-4 w-4" /></router-link></section>
        <section class="rounded-2xl bg-slate-900 p-5 text-white"><Terminal class="h-4 w-4 text-blue-200" /><h2 class="mt-4 text-sm font-bold">Perlu detail teknis?</h2><p class="mt-2 text-xs leading-5 text-slate-300">Payload dan metadata tersedia tanpa memenuhi ruang kerja utama.</p><router-link to="/trace" class="mt-4 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-white">Buka audit trail <ArrowRight class="h-4 w-4" /></router-link></section>
      </aside>
    </div>
  </div>
</template>
