<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import type { ResearchSession } from '../types'
import { ArrowRight, Copy, FileText, Search, Trash2 } from '@lucide/vue'

const store = useResearchStore()
const router = useRouter()
const query = ref('')
const statusFilter = ref<'all' | 'completed' | 'active' | 'attention'>('all')
const pendingDeleteId = ref<string | null>(null)

const filteredSessions = computed(() => store.recentSessions.filter(session => {
  const matchesQuery = `${sessionTitle(session)} ${session.objective} ${session.id}`.toLowerCase().includes(query.value.trim().toLowerCase())
  const matchesStatus = statusFilter.value === 'all'
    || (statusFilter.value === 'completed' && session.status === 'COMPLETED')
    || (statusFilter.value === 'active' && !['COMPLETED', 'FAILED', 'PARTIAL'].includes(session.status))
    || (statusFilter.value === 'attention' && ['FAILED', 'PARTIAL'].includes(session.status))
  return matchesQuery && matchesStatus
}))

const sessionTitle = (session: ResearchSession) => store.presets.find(preset => preset.id === session.presetId)?.title || 'Riset khusus'
const statusLabel = (session: ResearchSession) => session.status === 'COMPLETED' ? 'Selesai' : session.status === 'FAILED' ? 'Gagal' : session.status === 'PARTIAL' ? 'Hasil parsial' : session.status === 'IDLE' ? 'Disiapkan' : 'Sedang berjalan'
const formatDate = (value: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const duplicateSession = async (session: ResearchSession) => {
  store.setObjective(session.objective, session.presetId)
  await router.push('/research/new')
}

const removeSession = (id: string) => {
  if (store.deleteSession(id)) store.notify('Sesi riset dihapus dari pustaka.', 'success')
  pendingDeleteId.value = null
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <header class="grid gap-6 rounded-3xl bg-[#102138] p-6 text-white shadow-xl sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
      <div class="max-w-3xl">
        <p class="text-xs font-bold uppercase tracking-wider text-blue-200">Pustaka riset</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Temukan dan lanjutkan riset Anda</h1>
        <p class="mt-3 text-sm leading-6 text-slate-300">Buka kembali hasil, tinjau laporan, atau gunakan riset lama sebagai titik awal. Semua sesi tersimpan pada browser ini.</p>
      </div>
      <router-link to="/research/new" class="button-primary bg-white text-[#1E4270] hover:bg-blue-50">Mulai riset baru <ArrowRight class="h-4 w-4" /></router-link>
    </header>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Cari dan filter riset">
      <div class="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <label class="text-xs font-bold text-slate-700">Cari riset
          <span class="relative mt-2 block"><Search class="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input v-model="query" data-testid="library-search" class="min-h-11 w-full rounded-xl border border-slate-300 pl-10 pr-4 text-sm outline-none focus:border-[#407EC9] focus:ring-4 focus:ring-[#407EC9]/10" placeholder="Cari berdasarkan tujuan atau ID sesi" /></span>
        </label>
        <div class="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1" aria-label="Filter status">
          <button v-for="option in [{ value: 'all', label: 'Semua' }, { value: 'completed', label: 'Selesai' }, { value: 'active', label: 'Berjalan' }, { value: 'attention', label: 'Perlu perhatian' }]" :key="option.value" type="button" :data-testid="`library-filter-${option.value}`" class="min-h-10 shrink-0 rounded-lg px-3 text-xs font-bold" :class="statusFilter === option.value ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'" @click="statusFilter = option.value as typeof statusFilter">{{ option.label }}</button>
        </div>
      </div>
    </section>

    <section aria-labelledby="library-results-title">
      <div class="mb-4 flex items-end justify-between gap-3"><div><p class="section-kicker">Tersimpan lokal</p><h2 id="library-results-title" class="mt-1 text-xl font-bold text-slate-950">{{ filteredSessions.length }} dari {{ store.recentSessions.length }} sesi</h2></div><p class="hidden text-xs text-slate-500 sm:block">Maksimal lima sesi pada mode demonstrasi</p></div>

      <div v-if="filteredSessions.length" class="grid gap-4 lg:grid-cols-2">
        <article v-for="session in filteredSessions" :key="session.id" :data-testid="`library-session-${session.id}`" class="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-start justify-between gap-3"><div class="min-w-0"><span class="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{{ statusLabel(session) }}</span><h3 class="mt-3 text-lg font-bold leading-6 text-slate-950">{{ sessionTitle(session) }}</h3><p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{{ session.objective }}</p></div><span class="shrink-0 font-mono text-xs font-bold text-[#2F64A8]">{{ session.candidates.length }} kandidat</span></div>
          <div class="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"><span class="font-semibold text-slate-800">Ringkasan hasil:</span> {{ session.candidates.length ? `Peringkat teratas sesi ${session.candidates[0].symbol}, skor kualitas ${session.candidates[0].qualityScore}/100 (${session.candidates[0].qualityScore >= 90 ? 'sangat kuat dalam model' : 'kuat dalam model'}).` : 'Belum ada kandidat akhir yang tersedia.' }}</div>
          <div class="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-4 text-[11px] text-slate-500"><span>Diperbarui {{ formatDate(session.updatedAt) }}</span><span class="font-mono">{{ session.id }}</span></div>
          <div class="mt-5 flex flex-wrap items-center gap-2">
            <router-link :to="`/research/${session.id}`" class="button-primary">Buka riset <ArrowRight class="h-4 w-4" /></router-link>
            <router-link v-if="session.status === 'COMPLETED'" :to="`/research/${session.id}/report`" class="button-secondary"><FileText class="h-4 w-4" /> Laporan</router-link>
            <button type="button" :data-testid="`library-duplicate-${session.id}`" class="button-secondary" @click="duplicateSession(session)"><Copy class="h-4 w-4" /> Gunakan sebagai template</button>
            <div v-if="pendingDeleteId === session.id" class="flex items-center gap-1"><button type="button" data-testid="library-confirm-delete" class="min-h-11 rounded-lg px-3 text-xs font-bold text-rose-700 hover:bg-rose-50" @click="removeSession(session.id)">Hapus</button><button type="button" class="min-h-11 rounded-lg px-3 text-xs font-bold text-slate-600" @click="pendingDeleteId = null">Batal</button></div>
            <button v-else type="button" class="icon-button ml-auto disabled:opacity-35" :disabled="store.recentSessions.length <= 1" :aria-label="`Hapus ${sessionTitle(session)}`" @click="pendingDeleteId = session.id"><Trash2 class="h-4 w-4" /></button>
          </div>
        </article>
      </div>

      <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h3 class="text-lg font-bold text-slate-950">{{ store.recentSessions.length ? 'Tidak ada riset yang cocok' : 'Belum ada riset tersimpan' }}</h3>
        <p class="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">{{ store.recentSessions.length ? 'Ubah kata pencarian atau filter status untuk melihat sesi lainnya.' : 'Mulai dari tujuan sederhana. Voyager One akan membantu memilih kandidat, membandingkan hasil, dan menyusun laporan.' }}</p>
        <button v-if="store.recentSessions.length" type="button" class="button-secondary mt-5" @click="query = ''; statusFilter = 'all'">Tampilkan semua</button>
        <router-link v-else to="/research/new" class="button-primary mt-5">Mulai riset pertama</router-link>
      </div>
    </section>
  </div>
</template>
