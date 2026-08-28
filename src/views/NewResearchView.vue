<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import type { ResearchBrief, ResearchObjectivePreset } from '../types'
import { ArrowRight, Check, Search, SlidersHorizontal } from '@lucide/vue'

const store = useResearchStore()
const router = useRouter()
const objective = ref(store.currentObjective)
const selectedPreset = ref(store.activePresetId)
const error = ref('')
const market = ref<ResearchBrief['market']>(store.activeBrief.market)
const sectorScope = ref(store.activeBrief.sectorScope)
const indexScope = ref(store.activeBrief.indexScope)
const candidateCount = ref(store.activeBrief.candidateCount)
const researchDepth = ref<ResearchBrief['researchDepth']>(store.activeBrief.researchDepth)
const useSectorMetrics = ref(store.activeBrief.useSectorMetrics)
const optionalDimensions = ref<string[]>([...store.activeBrief.optionalDimensions])

const selectedTemplate = computed(() => store.presets.find(preset => preset.id === selectedPreset.value))
const screeningPreview = computed(() => store.getScreeningPreview(selectedPreset.value))
const sectorOptions = computed(() => ['Semua sektor fixture', ...new Set([
  ...store.candidates.map(candidate => candidate.sector),
  'Financials',
  'Consumer Non-Cyclicals',
  'Consumer Discretionary',
  'Industrials',
  'Telecommunications'
])])
const dimensions = [
  { id: 'momentum', label: 'Momentum harga', availability: 'akan digunakan bila tersedia' },
  { id: 'dividend', label: 'Dividen', availability: 'tersedia pada fixture' },
  { id: 'esg', label: 'ESG', availability: 'akan digunakan bila tersedia' },
  { id: 'ownership', label: 'Kepemilikan', availability: 'akan digunakan bila tersedia' },
  { id: 'segments', label: 'Segmen usaha', availability: 'akan digunakan bila tersedia' },
  { id: 'forward', label: 'Estimasi forward', availability: 'akan digunakan bila tersedia' }
]
const estimatedDuration = computed(() => ({ Ringkas: '4-7 menit', Standar: '8-12 menit', Mendalam: '15-25 menit' }[researchDepth.value] || '8-12 menit'))
const selectedDimensionLabels = computed(() => dimensions.filter(item => optionalDimensions.value.includes(item.id)).map(item => item.label))

watch(objective, value => {
  if (selectedTemplate.value && value.trim() !== selectedTemplate.value.objective) selectedPreset.value = 'custom'
})

const chooseTemplate = (preset: ResearchObjectivePreset) => {
  selectedPreset.value = preset.id
  objective.value = preset.objective
  store.selectPreset(preset)
  error.value = ''
}

const submit = async () => {
  if (store.isExecuting) {
    error.value = 'Tunggu riset yang sedang berjalan selesai sebelum membuat sesi baru.'
    return
  }
  if (objective.value.trim().length < 20) {
    error.value = 'Jelaskan tujuan riset dengan sedikitnya 20 karakter agar ruang lingkupnya dapat disusun.'
    return
  }
  error.value = ''
  store.setObjective(objective.value.trim(), selectedPreset.value)
  store.setResearchBrief({
    market: market.value,
    sectorScope: sectorScope.value,
    indexScope: indexScope.value,
    candidateCount: candidateCount.value,
    researchDepth: researchDepth.value,
    useSectorMetrics: useSectorMetrics.value,
    optionalDimensions: [...optionalDimensions.value]
  })
  store.activePlan.objective = objective.value.trim()
  const sessionId = store.createSession()
  void store.runAutonomousResearch(sessionId)
  await router.push(`/research/${sessionId}`)
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <header class="max-w-3xl">
      <p class="section-kicker">Riset baru</p>
      <h1 class="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">Susun tujuan sebelum riset dimulai</h1>
      <p class="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Berikan konteks yang cukup agar ruang lingkup, kriteria, dan kedalaman riset sesuai dengan pertanyaan Anda.</p>
    </header>

    <form data-testid="research-form" class="mt-8 grid gap-6 lg:grid-cols-[1fr_19rem]" @submit.prevent="submit">
      <div class="space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <label for="research-objective" class="text-sm font-bold text-slate-900">Apa yang ingin Anda teliti?</label>
          <p id="objective-help" class="mt-1 text-xs leading-5 text-slate-500">Jelaskan konteks keputusan Anda. Aturan angka yang memengaruhi hasil ditampilkan secara terpisah agar dapat diperiksa sebelum riset dimulai.</p>
          <textarea
            id="research-objective"
            data-testid="research-objective"
            v-model="objective"
            rows="5"
            :aria-describedby="error ? 'objective-help objective-error' : 'objective-help'"
            :aria-invalid="Boolean(error)"
            class="mt-4 w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-900 focus:border-[#2F64A8]"
            placeholder="Contoh: Temukan lima perusahaan consumer Indonesia dengan pertumbuhan laba konsisten, neraca sehat, dan valuasi di bawah median sektornya."
          ></textarea>
          <p v-if="error" id="objective-error" data-testid="objective-error" role="alert" class="mt-2 text-sm font-medium text-rose-700">{{ error }}</p>
          <div data-testid="screening-rule-contract" class="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h2 class="text-sm font-bold text-slate-950">Aturan yang benar-benar diterapkan</h2>
            <p class="mt-1 text-xs leading-5 text-slate-600">Hanya aturan berikut yang mengubah hasil pada mode demonstrasi. Teks tujuan memberi konteks, tetapi tidak otomatis menjadi filter angka baru.</p>
            <p v-if="selectedPreset === 'custom'" data-testid="custom-rule-notice" class="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-950">Tujuan sudah Anda sesuaikan. Sistem menggunakan aturan fundamental umum sampai Anda memilih kembali salah satu template aturan.</p>
            <ul class="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-700"><li v-for="criterion in screeningPreview.criteria" :key="criterion">{{ criterion }}</li></ul>
          </div>
        </section>

        <section aria-labelledby="template-title">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <h2 id="template-title" class="text-lg font-bold text-slate-950">Aturan seleksi</h2>
              <p class="mt-1 text-xs text-slate-500">Pilihan ini menentukan ruang lingkup dan filter angka. Anda tetap dapat menyesuaikan kalimat tujuan di atas.</p>
            </div>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <button
              v-for="preset in store.presets"
              :key="preset.id"
              :data-testid="`preset-${preset.id}`"
              type="button"
              :aria-pressed="selectedPreset === preset.id"
              class="min-h-32 rounded-2xl border p-5 text-left transition-[border-color,background-color,transform] duration-150 active:scale-[0.98]"
              :class="selectedPreset === preset.id ? 'border-[#407EC9] bg-[#407EC9]/5 ring-2 ring-[#407EC9]/15' : 'border-slate-200 bg-white hover:border-slate-300'"
              @click="chooseTemplate(preset)"
            >
              <div class="flex items-start justify-between gap-3">
                <span class="text-xs font-semibold text-[#2F64A8]">{{ preset.category }}</span>
                <Check v-if="selectedPreset === preset.id" class="h-4 w-4 text-[#407EC9]" />
              </div>
              <h3 class="mt-2 text-sm font-bold leading-5 text-slate-950">{{ preset.title }}</h3>
              <p class="mt-2 text-xs leading-5 text-slate-500">{{ preset.universe }}</p>
            </button>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="section-kicker">Preferensi perencanaan</p>
              <h2 class="mt-1 text-lg font-bold text-slate-950">Lengkapi brief riset</h2>
            </div>
            <span class="w-fit rounded-md bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-900">Belum diterapkan sebagai filter</span>
          </div>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Kontrol berikut menyusun brief frontend saja. Pada mode demonstrasi, hasil tetap ditentukan oleh template dan aturan pada panel “Aturan yang benar-benar diterapkan”.</p>

          <div class="mt-6 grid gap-5 sm:grid-cols-2">
            <fieldset>
              <legend class="text-sm font-bold text-slate-900">Pasar</legend>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <label class="flex min-h-11 items-center gap-2 rounded-xl border border-[#407EC9] bg-blue-50 px-3 text-sm font-semibold text-slate-900"><input v-model="market" type="radio" value="IDX" class="accent-[#407EC9]" /> IDX</label>
                <label class="flex min-h-11 cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400"><input type="radio" value="SGX" disabled /> SGX <span class="text-[10px]">Belum tersedia</span></label>
              </div>
            </fieldset>
            <label class="block text-sm font-bold text-slate-900">Cakupan sektor
               <select v-model="sectorScope" data-testid="brief-sector" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-800 focus:border-[#2F64A8]">
                <option v-for="sector in sectorOptions" :key="sector">{{ sector }}</option>
              </select>
            </label>
            <label class="block text-sm font-bold text-slate-900">Indeks / likuiditas
               <select v-model="indexScope" data-testid="brief-index" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-800 focus:border-[#2F64A8]">
                <option>Seluruh fixture IDX</option><option>IDX30</option><option>LQ45</option><option>Kompas100</option><option>Saham likuid non-indeks</option>
              </select>
            </label>
            <label class="block text-sm font-bold text-slate-900">Jumlah kandidat yang diinginkan
               <select v-model.number="candidateCount" data-testid="brief-candidate-count" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-800 focus:border-[#2F64A8]">
                <option :value="3">3 kandidat</option><option :value="5">5 kandidat</option><option :value="10">10 kandidat</option>
              </select>
            </label>
            <label class="block text-sm font-bold text-slate-900">Kedalaman riset
               <select v-model="researchDepth" data-testid="brief-depth" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-800 focus:border-[#2F64A8]">
                <option>Ringkas</option><option>Standar</option><option>Mendalam</option>
              </select>
            </label>
            <label class="flex min-h-16 items-start gap-3 rounded-xl bg-slate-50 p-4 sm:mt-6">
              <input v-model="useSectorMetrics" type="checkbox" class="mt-0.5 accent-[#407EC9]" />
              <span><span class="block text-sm font-bold text-slate-900">Gunakan metrik spesifik sektor</span><span class="mt-1 block text-xs leading-5 text-slate-500">Preferensi untuk metrik seperti NIM/NPL perbankan atau ARPU telekomunikasi bila datanya tersedia.</span></span>
            </label>
          </div>

          <fieldset class="mt-6 border-t border-slate-200 pt-5">
            <legend class="text-sm font-bold text-slate-900">Dimensi opsional</legend>
            <p class="mt-1 text-xs leading-5 text-slate-500">Dimensi terpilih menjadi catatan brief. Ketersediaan data ditandai per pilihan.</p>
            <div class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <label v-for="dimension in dimensions" :key="dimension.id" class="flex items-start gap-2 rounded-xl border border-slate-200 p-3">
                <input v-model="optionalDimensions" type="checkbox" :value="dimension.id" :data-testid="`brief-dimension-${dimension.id}`" class="mt-0.5 accent-[#407EC9]" />
                <span><span class="block text-xs font-bold text-slate-900">{{ dimension.label }}</span><span class="mt-0.5 block text-[11px] leading-4" :class="dimension.availability.startsWith('tersedia') ? 'text-emerald-700' : 'text-slate-500'">{{ dimension.availability }}</span></span>
              </label>
            </div>
          </fieldset>
        </section>
      </div>

      <aside class="h-fit rounded-2xl border border-slate-200 bg-[#102138] p-5 text-white shadow-xl lg:sticky lg:top-24">
        <SlidersHorizontal class="h-5 w-5 text-blue-200" />
        <h2 class="mt-4 text-lg font-bold">Ringkasan riset</h2>
        <dl class="mt-5 space-y-4 text-sm">
          <div>
            <dt class="text-xs text-slate-400">Klarifikasi brief</dt>
             <dd data-testid="brief-summary" class="mt-1 text-xs font-semibold leading-5 text-white">{{ market }} · {{ sectorScope }} · {{ indexScope }} · target {{ candidateCount }} kandidat · {{ researchDepth.toLowerCase() }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-400">Analisis tambahan</dt>
            <dd class="mt-1 text-xs font-semibold leading-5 text-white">{{ useSectorMetrics ? 'Metrik sektor bila tersedia' : 'Metrik umum' }}<template v-if="selectedDimensionLabels.length"> · {{ selectedDimensionLabels.join(', ') }}</template><template v-else> · tanpa dimensi opsional</template></dd>
          </div>
          <div>
            <dt class="text-xs text-slate-400">Estimasi preferensi</dt>
            <dd class="mt-1 font-semibold">{{ estimatedDuration }}</dd>
            <p class="mt-1 text-[11px] leading-4 text-slate-400">Estimasi target untuk integrasi data mendatang. Demo fixture saat ini berjalan sekitar {{ store.activePlan.estimatedDurationSeconds }} detik.</p>
          </div>
          <div class="border-t border-slate-700 pt-4">
            <dt class="text-xs text-blue-200">Aturan demo yang diterapkan</dt>
          </div>
          <div>
            <dt class="text-xs text-slate-400">Dataset yang diperiksa</dt>
            <dd data-testid="actual-universe" class="mt-1 font-semibold">{{ screeningPreview.universe.count }} perusahaan contoh</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-400">Batas hasil</dt>
            <dd class="mt-1 font-semibold">Maksimal {{ screeningPreview.maximumCandidates }} kandidat</dd>
          </div>
        </dl>
        <button type="submit" :disabled="store.isExecuting" class="button-primary mt-6 min-h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-50">
          <Search class="h-4 w-4" />
          Mulai riset
          <ArrowRight class="h-4 w-4" />
        </button>
        <p class="mt-3 text-xs leading-5 text-slate-400">Preferensi brief disimpan bersama sesi, tetapi belum mengubah aturan fixture. Anda dapat meninjau brief dan aturan aktif dari halaman sesi.</p>
      </aside>
    </form>
  </div>
</template>
