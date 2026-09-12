<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { isRestrictedSession, useResearchStore } from '../stores/researchStore'
import { sessionStatusMeta } from '../utils/status'
import { formatDateTime } from '../utils/presentation'
const store = useResearchStore()
const loading = ref(true)
const error = ref(false)
const load = async () => { loading.value = true; error.value = !await store.refreshSessions(); loading.value = false }
onMounted(load)
</script>
<template>
  <div class="page-shell space-y-8">
    <header class="rounded-3xl bg-[#102138] p-7 text-white sm:p-10"><p class="text-xs font-semibold text-blue-200">Workspace riset finansial</p><h1 class="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Tinjau data bank berkapitalisasi pasar terbesar</h1><p class="mt-5 max-w-2xl text-sm leading-7 text-slate-300">Lihat data ROE dan P/BV hingga delapan bank besar. Urutan mengikuti kapitalisasi pasar dari penyedia data, bukan urutan saham terbaik.</p><router-link to="/research/new" class="button-primary mt-6">Susun riset</router-link><p class="mt-4 max-w-2xl text-xs leading-6 text-slate-300">Angka belum dicocokkan sepenuhnya dengan laporan resmi dan tidak menunjukkan saham yang sebaiknya dibeli.</p></header>
    <section aria-labelledby="recent-title"><div class="flex flex-wrap items-center justify-between gap-3"><h2 id="recent-title" class="text-xl font-bold">Riset terbaru</h2><router-link to="/research" class="text-link">Buka pustaka</router-link></div><p v-if="loading" role="status" class="mt-4">Memuat sesi…</p><p v-else-if="error" role="alert" class="mt-4 text-sm text-rose-700">Daftar riset belum dapat dimuat. <button type="button" class="underline" @click="load">Coba lagi</button></p><p v-else-if="!store.recentSessions.length" class="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">Belum ada riset tersimpan. Pilih tujuan pemeriksaan untuk memulai.</p><div v-else class="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white"><router-link v-for="session in store.recentSessions.slice(0, 5)" :key="session.id" :to="`/research/${session.id}`" class="block p-5 hover:bg-slate-50"><p v-if="isRestrictedSession(session)" class="mb-2 text-xs font-bold text-rose-700">Arsip terbatas · jangan gunakan untuk keputusan investasi</p><h3 class="text-sm font-bold leading-6">{{ session.objective }}</h3><p class="mt-2 text-xs text-slate-500">{{ sessionStatusMeta(session.status).label }} · <time :datetime="session.updatedAt">{{ formatDateTime(session.updatedAt) }}</time></p></router-link></div></section>
    <section class="max-w-3xl"><h2 class="text-lg font-bold">Baca alasan, risiko, periode, dan basis data</h2><p class="mt-3 text-sm leading-7 text-slate-600">Hasil menampilkan alasan seleksi, data yang belum lengkap, serta sumber dan waktu snapshot. Verifikasi laporan sumber secara independen sebelum menggunakan shortlist.</p><router-link to="/methodology" class="text-link mt-3 inline-block">Pelajari cara penilaian</router-link></section>
  </div>
</template>
