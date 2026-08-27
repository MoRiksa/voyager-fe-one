<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import CandidateCard from '../components/CandidateCard.vue'
import { ArrowRight, Clock3, FileText, Search, Sparkles, Activity, ChevronRight } from 'lucide-vue-next'

const store = useResearchStore()
const router = useRouter()
const draftObjective = ref('')

const currentPillar = computed(() => store.pillars.find(pillar => pillar.status === 'active'))
const completedSteps = computed(() => store.pillars.filter(pillar => pillar.status === 'completed').length)

const startDraft = () => {
  if (draftObjective.value.trim()) store.setObjective(draftObjective.value.trim())
  router.push('/research/new')
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-10 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <section class="overflow-hidden rounded-3xl border border-[#407EC9]/20 bg-[#102138] text-white shadow-[0_24px_70px_-35px_rgba(16,33,56,0.8)]">
      <div class="grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1.25fr_0.75fr] lg:px-12 lg:py-12">
        <div>
          <div class="mb-4 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/8 px-2.5 py-1 text-xs font-semibold text-blue-100">
            <Sparkles class="h-3.5 w-3.5" />
            Research workspace
          </div>
          <h1 class="max-w-3xl text-3xl font-bold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">
            Apa yang ingin Anda teliti hari ini?
          </h1>
          <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Jelaskan tujuan riset Anda. Voyager One akan menyusun ruang lingkup, menyeleksi kandidat, dan merangkum temuan beserta risiko yang perlu diperiksa.
          </p>

          <form class="mt-7 rounded-2xl border border-white/15 bg-white p-2 shadow-xl" @submit.prevent="startDraft">
            <label for="dashboard-objective" class="sr-only">Tujuan riset</label>
            <textarea
              id="dashboard-objective"
              v-model="draftObjective"
              rows="2"
              class="block w-full resize-none rounded-xl px-4 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#407EC9]"
              placeholder="Contoh: Temukan perusahaan consumer Indonesia dengan margin stabil dan valuasi yang wajar."
            ></textarea>
            <div class="flex flex-col gap-2 border-t border-slate-100 px-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <router-link to="/research/new" class="inline-flex min-h-11 items-center px-2 text-xs font-semibold text-slate-600 hover:text-slate-950">
                Gunakan template riset
              </router-link>
              <button type="submit" class="button-primary w-full sm:w-auto">
                Susun riset
                <ArrowRight class="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        <aside class="rounded-2xl border border-white/12 bg-white/7 p-5 backdrop-blur-sm" aria-label="Ringkasan sesi terakhir">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-semibold text-blue-200">Sesi terakhir</p>
              <h2 class="mt-1 font-mono text-sm font-bold">{{ store.report.sessionId }}</h2>
            </div>
            <span class="rounded-md bg-emerald-400/15 px-2 py-1 text-xs font-semibold text-emerald-200">Selesai</span>
          </div>
          <p class="mt-5 line-clamp-3 text-sm leading-6 text-slate-200">{{ store.report.objective }}</p>
          <div class="mt-6 grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-black/15 p-3">
              <span class="text-xs text-slate-400">Kandidat</span>
              <strong class="mt-1 block font-mono text-xl">{{ store.candidates.length }}</strong>
            </div>
            <div class="rounded-xl bg-black/15 p-3">
              <span class="text-xs text-slate-400">Skor tertinggi</span>
              <strong class="mt-1 block font-mono text-xl">{{ store.candidates[0]?.qualityScore }}/100</strong>
            </div>
          </div>
          <router-link :to="`/research/${store.report.sessionId}`" class="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white hover:text-blue-100">
            Buka sesi riset
            <ChevronRight class="h-4 w-4" />
          </router-link>
        </aside>
      </div>
    </section>

    <section aria-labelledby="active-research-title">
      <div class="mb-4 flex items-end justify-between gap-4">
        <div>
          <p class="section-kicker">Riset aktif</p>
          <h2 id="active-research-title" class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Lanjutkan dari konteks terakhir</h2>
        </div>
        <router-link :to="`/research/${store.report.sessionId}`" class="text-link hidden sm:inline-flex">Lihat sesi <ArrowRight class="h-4 w-4" /></router-link>
      </div>

      <div class="grid gap-4 lg:grid-cols-[1fr_0.38fr]">
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div class="max-w-3xl">
              <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Activity class="h-4 w-4 text-[#407EC9]" />
                {{ currentPillar ? currentPillar.name : 'Laporan siap ditinjau' }}
              </div>
              <h3 class="mt-2 text-lg font-bold text-slate-950">{{ store.report.objective }}</h3>
              <p class="mt-2 text-sm leading-6 text-slate-600">{{ currentPillar?.subtitle || 'Seluruh tahap selesai. Kandidat dan laporan dapat dibuka kembali kapan saja.' }}</p>
            </div>
            <span class="shrink-0 rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs font-bold text-slate-700">{{ completedSteps }}/5 tahap</span>
          </div>
          <div class="mt-6 h-2 overflow-hidden rounded-full bg-slate-100" aria-label="Progress riset" role="progressbar" :aria-valuenow="completedSteps" aria-valuemin="0" aria-valuemax="5">
            <div class="h-full rounded-full bg-[#407EC9]" :style="{ width: `${(completedSteps / 5) * 100}%` }"></div>
          </div>
          <div class="mt-5 flex flex-wrap items-center gap-4">
            <router-link :to="`/research/${store.report.sessionId}`" class="button-secondary">Buka riset</router-link>
            <span class="inline-flex items-center gap-1.5 text-xs text-slate-500"><Clock3 class="h-3.5 w-3.5" /> Diperbarui {{ store.report.timestamp }}</span>
          </div>
        </article>

        <article class="rounded-2xl bg-[#407EC9] p-6 text-white shadow-[0_18px_45px_-25px_rgba(64,126,201,0.9)]">
          <FileText class="h-5 w-5 text-blue-100" />
          <h3 class="mt-5 text-lg font-bold">Laporan tersedia</h3>
          <p class="mt-2 text-sm leading-6 text-blue-100">Tinjau ranking, analisis kandidat, risiko, dan keterbatasan riset.</p>
          <router-link to="/report" class="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-white">
            Buka laporan <ArrowRight class="h-4 w-4" />
          </router-link>
        </article>
      </div>
    </section>

    <section aria-labelledby="latest-findings-title">
      <div class="mb-4 flex items-end justify-between gap-4">
        <div>
          <p class="section-kicker">Temuan terbaru</p>
          <h2 id="latest-findings-title" class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Tiga kandidat teratas</h2>
        </div>
        <router-link to="/screener" class="text-link hidden sm:inline-flex">Lihat semua kandidat <ArrowRight class="h-4 w-4" /></router-link>
      </div>
      <div class="grid gap-4 lg:grid-cols-3">
        <CandidateCard v-for="candidate in store.candidates.slice(0, 3)" :key="candidate.symbol" :candidate="candidate" />
      </div>
    </section>

    <section v-if="store.recentSessions.length" aria-labelledby="recent-sessions-title">
      <div class="mb-4"><p class="section-kicker">Riwayat lokal</p><h2 id="recent-sessions-title" class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Riset terbaru</h2><p class="mt-1 text-xs text-slate-500">Tersimpan pada browser ini, maksimal lima sesi.</p></div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><router-link v-for="session in store.recentSessions" :key="session.id" :to="`/research/${session.id}`" class="flex min-h-20 items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-0 hover:bg-slate-50"><div class="min-w-0"><h3 class="truncate text-sm font-bold text-slate-900">{{ session.objective }}</h3><p class="mt-1 font-mono text-xs text-slate-500">{{ session.id }} · {{ session.candidates.length }} kandidat</p></div><span class="shrink-0 rounded-md px-2 py-1 text-xs font-bold" :class="session.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : session.status === 'PARTIAL' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'">{{ session.status === 'COMPLETED' ? 'Selesai' : session.status === 'PARTIAL' ? 'Parsial' : 'Berjalan' }}</span></router-link></div>
    </section>
  </div>
</template>
