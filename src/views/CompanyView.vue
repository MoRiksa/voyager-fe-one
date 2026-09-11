<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { getCompany } from '../services/researchApi'
import ReportCandidateAnalysis from '../components/ReportCandidateAnalysis.vue'
import CompanySupplementalAnalysis from '../components/CompanySupplementalAnalysis.vue'
const route = useRoute()
const store = useResearchStore()
const symbol = computed(() => String(route.params.symbol).toUpperCase())
const company = computed(() => route.params.id ? store.candidates.find(c => c.symbol === symbol.value) : undefined)
const profile = ref<any>(null)
const error = ref('')
const loading = ref(false)
let token = 0
const load = async () => {
  const current = ++token
  profile.value = null; error.value = ''; loading.value = false
  if (route.params.id) return
  loading.value = true
  try { const result = await getCompany(symbol.value); if (current === token) profile.value = result }
  catch (e) { if (current === token) error.value = e instanceof Error ? e.message : 'Profil tidak tersedia.' }
  finally { if (current === token) loading.value = false }
}
watch(() => route.fullPath, load, { immediate: true })
</script>
<template>
  <div class="page-shell space-y-6">
    <router-link :to="route.params.id ? `/research/${route.params.id}/report` : '/research'" class="button-secondary">Kembali ke {{ route.params.id ? 'laporan' : 'pustaka' }}</router-link>
    <template v-if="company"><h1 class="text-3xl font-bold">{{ company.symbol }} — {{ company.name }}</h1><ReportCandidateAnalysis :candidates="[company]" :selected-ticker="company.symbol" :session-id="store.report.sessionId" /><section class="rounded-2xl border border-slate-200 bg-white p-6"><h2 class="text-lg font-bold">Sumber dan data pendukung</h2><p class="mt-3 break-words text-xs leading-6">{{ company.providerSource?.sourceRef || 'Sumber tidak tersedia' }}</p><ul class="mt-4 space-y-4 text-sm leading-6"><li v-for="citation in company.evidenceCitations" :key="`${citation.source}-${citation.metric}`"><strong>{{ citation.metric }}: {{ citation.value }}</strong><p>{{ citation.context }}</p><p class="break-words text-xs text-slate-600">{{ citation.source }} · {{ citation.period || 'Periode tidak tersedia' }} · {{ citation.asOf || 'Tanggal tidak tersedia' }}</p></li></ul></section><details class="rounded-2xl border border-slate-200 bg-white p-6"><summary class="min-h-11 cursor-pointer font-bold">Ketersediaan data tambahan</summary><CompanySupplementalAnalysis :company="company" /></details></template>
    <section v-else-if="route.params.id" class="rounded-2xl border border-slate-200 bg-white p-6"><h1 class="text-2xl font-bold">Kandidat tidak tersedia dalam sesi ini</h1><p class="mt-3 text-sm">Ticker {{ symbol }} bukan kandidat pada snapshot sesi ini. Ini bukan pernyataan bahwa perusahaan tidak ada.</p></section>
    <p v-else-if="loading" role="status">Memuat profil perusahaan…</p>
    <section v-else-if="error" class="rounded-2xl border border-slate-200 bg-white p-6"><h1 class="text-2xl font-bold">Profil belum dapat dimuat</h1><p role="alert" class="mt-3 text-sm text-rose-700">{{ error }}</p><button type="button" class="button-secondary mt-4" @click="load">Coba lagi</button></section>
    <section v-else class="rounded-2xl border border-slate-200 bg-white p-6"><h1 class="text-2xl font-bold">{{ symbol }} — {{ profile?.companyName || profile?.name || 'Nama tidak tersedia' }}</h1><p class="mt-3 text-sm">Sektor: {{ profile?.sector || 'Tidak tersedia' }}</p><p class="mt-3 text-sm leading-6 text-slate-600">Profil global bukan hasil screening. Skor, ranking, dan alasan pemilihan hanya tersedia dalam konteks laporan sesi. Riset mendalam perusahaan belum didukung.</p><router-link to="/research/new" class="button-primary mt-5">Pilih screening yang didukung</router-link></section>
  </div>
</template>
