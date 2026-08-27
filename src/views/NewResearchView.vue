<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import type { ResearchObjectivePreset } from '../types'
import { ArrowRight, Check, Search, SlidersHorizontal } from '@lucide/vue'

const store = useResearchStore()
const router = useRouter()
const objective = ref(store.currentObjective)
const selectedPreset = ref(store.activePresetId)
const error = ref('')

const selectedTemplate = computed(() => store.presets.find(preset => preset.id === selectedPreset.value))
const screeningPreview = computed(() => store.getScreeningPreview(selectedPreset.value))

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
            aria-describedby="objective-help objective-error"
            :aria-invalid="Boolean(error)"
            class="mt-4 w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#407EC9] focus:ring-4 focus:ring-[#407EC9]/10"
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
          <h2 class="text-lg font-bold text-slate-950">Mode demonstrasi</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">Semua riset memakai satu kedalaman analisis yang sama agar hasil dapat dibandingkan secara konsisten. Tidak ada kredit yang digunakan.</p>
        </section>
      </div>

      <aside class="h-fit rounded-2xl border border-slate-200 bg-[#102138] p-5 text-white shadow-xl lg:sticky lg:top-24">
        <SlidersHorizontal class="h-5 w-5 text-blue-200" />
        <h2 class="mt-4 text-lg font-bold">Ringkasan riset</h2>
        <dl class="mt-5 space-y-4 text-sm">
          <div>
            <dt class="text-xs text-slate-400">Dataset yang diperiksa</dt>
            <dd data-testid="actual-universe" class="mt-1 font-semibold">{{ screeningPreview.universe.count }} perusahaan contoh</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-400">Batas hasil</dt>
            <dd class="mt-1 font-semibold">Maksimal {{ screeningPreview.maximumCandidates }} kandidat</dd>
          </div>
        </dl>
        <button type="submit" :disabled="store.isExecuting" class="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#407EC9] px-5 text-sm font-bold text-white transition-[background-color,transform] hover:bg-[#2F64A8] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
          <Search class="h-4 w-4" />
          Mulai riset
          <ArrowRight class="h-4 w-4" />
        </button>
        <p class="mt-3 text-xs leading-5 text-slate-400">Anda dapat meninjau progress dan hasil sementara dari halaman sesi.</p>
      </aside>
    </form>
  </div>
</template>
