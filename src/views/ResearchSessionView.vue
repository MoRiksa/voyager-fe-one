<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import CandidateCard from '../components/CandidateCard.vue'
import { Activity, ArrowRight, CheckCircle2, Clock3, FileText, MessageSquare, Send, Terminal } from '@lucide/vue'

const store = useResearchStore()
const route = useRoute()
const activePanel = ref<'overview' | 'activity' | 'results'>('overview')
const followUp = ref('')
const followUpResponse = ref('')
const sessionFound = ref(true)

watch(() => String(route.params.id), id => {
  sessionFound.value = store.loadSession(id) || id === store.report.sessionId
}, { immediate: true })

const activePillar = computed(() => store.pillars.find(pillar => pillar.status === 'active'))
const completedCount = computed(() => store.pillars.filter(pillar => pillar.status === 'completed').length)
const progress = computed(() => Math.round((completedCount.value / store.pillars.length) * 100))

const askFollowUp = () => {
  if (!followUp.value.trim()) return
  store.addFollowUp(followUp.value.trim())
  followUpResponse.value = 'Pertanyaan lanjutan telah dicatat pada sesi ini. Dataset prototype tidak dihitung ulang oleh pertanyaan lanjutan.'
  followUp.value = ''
}
</script>

<template>
  <div v-if="!sessionFound" class="mx-auto flex min-h-[65dvh] max-w-xl flex-col items-center justify-center px-6 text-center">
    <h1 class="text-2xl font-bold text-slate-950">Sesi riset tidak ditemukan</h1>
    <p class="mt-3 text-sm leading-6 text-slate-600">Sesi ini tidak tersedia di perangkat ini atau telah melewati batas riwayat lokal.</p>
    <router-link to="/" class="button-primary mt-6">Kembali ke beranda</router-link>
  </div>
  <div v-else class="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <header class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div class="max-w-4xl">
          <div class="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span class="text-[#2F64A8]">Sesi {{ store.report.sessionId }}</span>
             <span class="rounded-md px-2 py-1" :class="store.isExecuting ? 'bg-blue-50 text-blue-700' : store.status === 'FAILED' ? 'bg-amber-50 text-amber-700' : store.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'">{{ store.isExecuting ? 'Sedang berjalan' : store.status === 'FAILED' ? 'Hasil parsial' : store.status === 'COMPLETED' ? 'Selesai' : 'Disiapkan' }}</span>
          </div>
          <h1 class="mt-3 text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">{{ store.presets.find(preset => preset.id === store.activePresetId)?.title || 'Riset khusus Anda' }}</h1>
          <div class="mt-4 max-w-4xl rounded-xl bg-slate-50 p-4"><span class="text-xs font-bold text-slate-500">Tujuan riset</span><p class="mt-1 text-sm leading-6 text-slate-700">{{ store.currentObjective }}</p></div>
          <p class="mt-3 text-sm leading-6 text-slate-600">{{ activePillar?.subtitle || (store.status === 'FAILED' ? 'Proses sebelumnya terputus. Hasil yang telah tersimpan tetap dapat ditinjau.' : 'Hasil riset, kandidat, dan laporan telah tersedia untuk ditinjau.') }}</p>
        </div>
        <div v-if="store.status === 'COMPLETED'" class="flex shrink-0 flex-wrap gap-2">
          <router-link v-if="store.candidates.length >= 2" data-testid="session-next" :to="`/research/${store.report.sessionId}/screener`" class="button-primary">Lihat cara kandidat dipilih <ArrowRight class="h-4 w-4" /></router-link>
          <router-link v-else-if="store.candidates.length === 1" data-testid="session-next" :to="`/research/${store.report.sessionId}/company/${store.candidates[0].symbol}`" class="button-primary">Buka analisis kandidat <ArrowRight class="h-4 w-4" /></router-link>
          <router-link v-else data-testid="session-next" to="/research/new" class="button-primary">Ubah kriteria riset <ArrowRight class="h-4 w-4" /></router-link>
          <router-link :to="`/research/${store.report.sessionId}/report`" class="button-secondary">Buka laporan</router-link>
        </div>
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
          <div class="flex items-center justify-between gap-3"><div><p class="section-kicker">Rencana riset</p><h2 class="mt-1 text-xl font-bold text-slate-950">Langkah yang dijalankan</h2></div><span class="font-mono text-xs text-slate-500">{{ completedCount }}/{{ store.pillars.length }} selesai</span></div>
          <ol class="mt-5 grid gap-3 sm:grid-cols-2">
            <li v-for="pillar in store.pillars" :key="pillar.id" class="flex gap-3 rounded-xl border border-slate-200 p-4" :class="pillar.status === 'active' ? 'border-[#407EC9] bg-[#407EC9]/5' : ''">
              <CheckCircle2 v-if="pillar.status === 'completed'" class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <Clock3 v-else class="mt-0.5 h-4 w-4 shrink-0 text-[#407EC9]" />
              <div><h3 class="text-sm font-bold text-slate-900">{{ pillar.name }}</h3><p class="mt-1 text-xs leading-5 text-slate-500">{{ pillar.subtitle }}</p></div>
            </li>
          </ol>
        </section>

        <section v-show="activePanel === 'overview' || activePanel === 'results'" aria-labelledby="session-results-title">
          <div class="mb-4 flex items-end justify-between"><div><p class="section-kicker">Hasil sementara</p><h2 id="session-results-title" class="mt-1 text-xl font-bold text-slate-950">Kandidat teratas</h2></div><router-link :to="`/research/${store.report.sessionId}/peers`" class="text-link hidden sm:inline-flex">Bandingkan kandidat <ArrowRight class="h-4 w-4" /></router-link></div>
          <div v-if="store.candidates.length" class="grid gap-4 xl:grid-cols-2"><CandidateCard v-for="candidate in store.candidates.slice(0, 4)" :key="candidate.symbol" :candidate="candidate" /></div>
          <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><h3 class="font-bold text-slate-900">Tidak ada kandidat yang lolos</h3><p class="mt-2 text-sm text-slate-600">Tinjau tahap penyaringan untuk melihat perusahaan yang gugur, lalu gunakan riset ini sebagai template untuk menyesuaikan kriteria.</p><div class="mt-5 flex flex-wrap justify-center gap-2"><router-link :to="`/research/${store.report.sessionId}/screener`" class="button-secondary">Tinjau tahap seleksi</router-link><router-link to="/research/new" class="button-primary">Ubah kriteria</router-link></div></div>
        </section>

        <section v-show="activePanel === 'activity'" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:hidden">
          <h2 class="text-lg font-bold text-slate-950">Aktivitas terbaru</h2>
          <div class="mt-4 space-y-4"><div v-for="call in store.toolCalls.slice(-6).reverse()" :key="call.id" class="border-l-2 border-slate-200 pl-4"><p class="text-sm font-bold text-slate-900">{{ call.outputSummary }}</p><p class="mt-1 font-mono text-xs text-slate-500">{{ call.timestamp }} · {{ call.sourceKind === 'prototype-fixture' ? 'fixture v1' : 'input pengguna' }}</p></div></div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div class="flex items-center gap-2"><MessageSquare class="h-4 w-4 text-[#407EC9]" /><h2 class="text-lg font-bold text-slate-950">Catatan lanjutan</h2></div>
          <p class="mt-1 text-xs leading-5 text-slate-500">Simpan pertanyaan atau ide untuk riset berikutnya. Catatan tidak menghitung ulang hasil sesi ini.</p>
          <form class="mt-4 flex flex-col gap-2 sm:flex-row" @submit.prevent="askFollowUp"><label for="follow-up" class="sr-only">Pertanyaan lanjutan</label><input id="follow-up" v-model="followUp" class="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#407EC9] focus:ring-4 focus:ring-[#407EC9]/10" placeholder="Contoh: Bandingkan tiga kandidat teratas dari sisi risiko." /><button type="submit" class="button-primary"><Send class="h-4 w-4" /> Kirim</button></form>
          <p v-if="followUpResponse" role="status" class="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">{{ followUpResponse }}</p>
        </section>
      </main>

      <aside class="hidden space-y-4 lg:block">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div class="flex items-center gap-2"><Activity class="h-4 w-4 text-[#407EC9]" /><h2 class="text-sm font-bold text-slate-950">Aktivitas sesi</h2></div><div class="mt-5 space-y-5"><div v-for="call in store.toolCalls.slice(-5).reverse()" :key="call.id" class="relative border-l-2 border-slate-200 pl-4"><span class="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-[#407EC9]"></span><p class="text-xs font-semibold leading-5 text-slate-800">{{ call.outputSummary }}</p><p class="mt-1 font-mono text-[11px] text-slate-500">{{ call.timestamp }} · {{ call.sourceKind === 'prototype-fixture' ? 'fixture v1' : 'input pengguna' }}</p></div></div><router-link :to="`/research/${store.report.sessionId}/activity`" class="text-link mt-5">Lihat seluruh aktivitas <ArrowRight class="h-4 w-4" /></router-link></section>
        <section class="rounded-2xl bg-slate-900 p-5 text-white"><Terminal class="h-4 w-4 text-blue-200" /><h2 class="mt-4 text-sm font-bold">Perlu detail teknis?</h2><p class="mt-2 text-xs leading-5 text-slate-300">Payload dan metadata tersedia tanpa memenuhi ruang kerja utama.</p><router-link :to="`/research/${store.report.sessionId}/trace`" class="mt-4 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-white">Buka audit teknis <ArrowRight class="h-4 w-4" /></router-link></section>
      </aside>
    </div>
  </div>
</template>
