<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import {
  Clock,
  Calendar,
  Play,
  Plus,
  Check,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X
} from '@lucide/vue'

const store = useResearchStore()
const router = useRouter()

const isCreateModalOpen = ref(false)
const newName = ref('')
const newObjective = ref('')
const newFrequency = ref<'daily' | 'weekdays' | 'weekly' | 'monthly'>('weekdays')
const newTime = ref('08:00')
const newTimezone = ref('Asia/Jakarta')
const newMarket = ref<'IDX' | 'SGX'>('IDX')
const newCandidates = ref(5)
const isSubmitting = ref(false)
const selectedPresetId = ref<string>('obj-banking-moat')

onMounted(() => {
  void store.fetchSchedules()
})

const activeTaskCount = computed(() => store.schedules.filter(t => t.enabled).length)
const frequencyLabels = { daily: 'Setiap hari', weekdays: 'Hari kerja', weekly: 'Setiap Senin', monthly: 'Tanggal 1 setiap bulan' }
const cronFromSchedule = computed(() => {
  const [hour, minute] = newTime.value.split(':')
  const suffix = newFrequency.value === 'daily' ? '* * *' : newFrequency.value === 'weekdays' ? '* * 1-5' : newFrequency.value === 'weekly' ? '* * 1' : '1 * *'
  return `${Number(minute)} ${Number(hour)} ${suffix}`
})
const scheduleLabel = (task: typeof store.schedules[number]) => task.frequency && task.scheduleTime
  ? `${frequencyLabels[task.frequency]}, ${task.scheduleTime} ${task.timezone === 'Asia/Jakarta' ? 'WIB' : task.timezone === 'Asia/Makassar' ? 'WITA' : task.timezone === 'Asia/Jayapura' ? 'WIT' : task.timezone || ''}`
  : `Jadwal tersimpan: ${task.cronExpression}`

const choosePresetForSchedule = (preset: any) => {
  selectedPresetId.value = preset.id
  newName.value = preset.title
  newObjective.value = preset.objective
  newCandidates.value = preset.expectedCandidates || 5
}

const handleToggle = async (id: string, currentEnabled: boolean) => {
  await store.toggleSchedule(id, !currentEnabled)
}

const handleRunNow = async (id: string) => {
  const result = await store.runScheduleNow(id)
  if (result?.session?.id) {
    router.push(`/research/${result.session.id}`)
  }
}

const handleCreateSubmit = async () => {
  if (!newName.value.trim() || !newObjective.value.trim()) return
  isSubmitting.value = true
  try {
    await store.createSchedule({
      name: newName.value.trim(),
      objective: newObjective.value.trim(),
      cronExpression: cronFromSchedule.value,
      frequency: newFrequency.value,
      scheduleTime: newTime.value,
      timezone: newTimezone.value,
      market: newMarket.value,
      requestedCandidates: newCandidates.value,
      enabled: true
    })
    isCreateModalOpen.value = false
    newName.value = ''
    newObjective.value = ''
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <!-- Header matching NewResearchView.vue -->
    <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="max-w-3xl">
        <p class="section-kicker">Riset berkala</p>
        <h1 class="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl flex items-center gap-3">
          <span>Riset terjadwal</span>
        </h1>
        <p class="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          Simpan jadwal riset agar tujuan yang sama mudah dijalankan kembali. Untuk saat ini, gunakan tombol “Jalankan sekarang” saat Anda siap.
        </p>
      </div>

      <button
        @click="isCreateModalOpen = true"
        type="button"
        class="button-primary min-h-11 shrink-0 px-5 text-sm font-semibold shadow-sm"
      >
        <Plus class="h-4 w-4" />
        <span>Tambah Jadwal Riset</span>
      </button>
    </header>

    <!-- Main Grid: Task List & Sticky Summary Sidebar -->
    <div class="mt-8 grid gap-6 lg:grid-cols-[1fr_19rem]">
      <!-- Left Column: Task Cards -->
      <div class="space-y-6">
        <!-- Section: Active Tasks -->
        <section>
          <div class="mb-3 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-950">Jadwal tersimpan</h2>
              <p class="mt-0.5 text-xs text-slate-500">Aktifkan jadwal yang ingin Anda pertahankan, lalu jalankan saat diperlukan.</p>
            </div>
            <span class="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#2F64A8]">
                {{ activeTaskCount }} dari {{ store.schedules.length }} jadwal disimpan
            </span>
          </div>

          <div v-if="store.schedules.length === 0" class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <Clock class="mx-auto h-8 w-8 text-slate-400" />
            <p class="mt-2 text-sm font-semibold text-slate-700">Belum Ada Riset Terjadwal</p>
            <p class="mt-1 text-xs text-slate-500">Klik tombol "Tambah Jadwal Riset" untuk membuat otomatisasi baru.</p>
          </div>

          <div class="space-y-4">
            <div
              v-for="task in store.schedules"
              :key="task.id"
              class="rounded-2xl border bg-white p-5 shadow-sm sm:p-6 transition-all duration-150"
              :class="task.enabled ? 'border-slate-200 hover:border-[#407EC9]/50' : 'border-slate-200 opacity-75 bg-slate-50/50'"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="space-y-1.5">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs font-bold uppercase tracking-wider text-[#2F64A8] font-mono">{{ task.market }}</span>
                    <h3 class="text-base font-bold text-slate-950">{{ task.name }}</h3>
                    <span
                      class="rounded px-2 py-0.5 text-[10px] font-bold uppercase font-mono"
                      :class="task.enabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'"
                    >
                      {{ task.enabled ? 'Tersimpan' : 'Dinonaktifkan' }}
                    </span>
                  </div>
                  <p class="text-xs leading-5 text-slate-600">{{ task.objective }}</p>
                </div>

                <!-- Control Buttons -->
                <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    @click="handleToggle(task.id, task.enabled)"
                    type="button"
                    class="rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-150"
                    :class="task.enabled ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100' : 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'"
                  >
                    {{ task.enabled ? 'Non-aktifkan' : 'Aktifkan' }}
                  </button>

                  <button
                    @click="handleRunNow(task.id)"
                    type="button"
                    class="button-primary min-h-9 px-3.5 text-xs font-semibold shadow-sm"
                  >
                    <Play class="h-3.5 w-3.5 fill-current" />
                    <span>Jalankan sekarang</span>
                  </button>
                </div>
              </div>

              <!-- Task Metadata Bar -->
              <div class="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3.5 text-xs sm:grid-cols-4 font-mono">
                <div>
                   <span class="text-[10px] font-bold text-slate-400 block uppercase">Waktu pilihan</span>
                  <span class="font-bold text-slate-800 flex items-center gap-1">
                    <Clock class="h-3 w-3 text-[#2F64A8]" />
                    {{ scheduleLabel(task) }}
                  </span>
                </div>
                <div>
                  <span class="text-[10px] font-bold text-slate-400 block uppercase">Total Eksekusi</span>
                  <span class="font-semibold text-slate-800">{{ task.runCount }}x selesai</span>
                </div>
                <div>
                  <span class="text-[10px] font-bold text-slate-400 block uppercase">Eksekusi Terakhir</span>
                  <span class="text-slate-700">{{ task.lastRunAt ? new Date(task.lastRunAt).toLocaleDateString('id-ID') : 'Belum pernah' }}</span>
                </div>
                <div>
                  <span class="text-[10px] font-bold text-slate-400 block uppercase">Jadwal Berikutnya</span>
                  <span class="text-slate-700">{{ task.nextRunAt ? new Date(task.nextRunAt).toLocaleDateString('id-ID') : '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Honest execution note -->
        <section class="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <ShieldCheck class="h-5 w-5 text-[#2F64A8] shrink-0 mt-0.5" />
            <div class="space-y-1 text-xs leading-5 text-slate-700">
              <h4 class="font-bold text-slate-950 text-sm">Cara kerja saat ini</h4>
              <p>Jadwal dan tujuan riset disimpan. Eksekusi otomatis belum aktif; tombol <strong>Jalankan sekarang</strong> membuat sesi riset baru saat Anda memilihnya.</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Right Column: Sticky Summary Sidebar matching NewResearchView.vue -->
      <aside class="h-fit rounded-2xl border border-slate-200 bg-[#102138] p-5 text-white shadow-xl lg:sticky lg:top-24 space-y-4">
        <div class="flex items-center gap-2">
          <SlidersHorizontal class="h-5 w-5 text-blue-200" />
          <h2 class="text-lg font-bold">Ringkasan jadwal</h2>
        </div>

        <dl class="space-y-4 text-xs">
          <div>
            <dt class="text-slate-400">Total Tugas Terdaftar</dt>
            <dd class="mt-1 font-semibold text-base text-white">{{ store.schedules.length }} Tugas</dd>
          </div>
          <div>
            <dt class="text-slate-400">Cara menjalankan</dt>
            <dd class="mt-1 font-semibold text-emerald-300 flex items-center gap-1.5">
              <Sparkles class="h-3.5 w-3.5" />
              Jalankan sekarang
            </dd>
          </div>
        </dl>

        <div class="border-t border-slate-700 pt-4">
          <button
            @click="isCreateModalOpen = true"
            type="button"
            class="button-primary min-h-11 w-full text-xs font-bold shadow-md"
          >
            <Plus class="h-4 w-4" />
            <span>Buat Jadwal Riset Baru</span>
          </button>
        </div>
      </aside>
    </div>

    <!-- Create Schedule Modal Styled like NewResearchView Cards -->
    <div v-if="isCreateModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="schedule-dialog-title" class="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <p class="section-kicker">Jadwal baru</p>
            <h2 id="schedule-dialog-title" class="text-xl font-bold text-slate-950 mt-0.5">Simpan jadwal riset</h2>
          </div>
          <button @click="isCreateModalOpen = false" type="button" aria-label="Tutup dialog" class="icon-button text-slate-500">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div>
          <p class="mb-2 text-xs font-bold text-slate-900">Pilih contoh aturan</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="preset in store.presets"
              :key="preset.id"
              type="button"
              class="rounded-xl border p-3 text-left transition-all duration-150 text-xs"
              :class="selectedPresetId === preset.id ? 'border-[#407EC9] bg-blue-50/60 ring-2 ring-[#407EC9]/15 font-bold text-slate-950' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'"
              @click="choosePresetForSchedule(preset)"
            >
              <div class="flex items-center justify-between">
                <span class="font-semibold text-[#2F64A8] text-[11px]">{{ preset.category }}</span>
                <CheckCircle2 v-if="selectedPresetId === preset.id" class="h-3.5 w-3.5 text-[#407EC9]" />
              </div>
              <p class="mt-1 font-bold text-slate-900 truncate">{{ preset.title }}</p>
            </button>
          </div>
        </div>

        <form @submit.prevent="handleCreateSubmit" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-900 mb-1">Nama riset</label>
            <input
              v-model="newName"
              type="text"
              required
              placeholder="Contoh: Tinjauan data bank bulanan"
              class="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-900 focus:border-[#2F64A8] focus:outline-none"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-900 mb-1">Tujuan riset</label>
            <textarea
              v-model="newObjective"
              rows="3"
              required
              placeholder="Jelaskan kriteria fundamental..."
              class="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 focus:border-[#2F64A8] focus:outline-none"
            ></textarea>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="block font-bold text-slate-900 mb-1">Pasar</label>
              <select v-model="newMarket" class="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-900 font-semibold">
                <option value="IDX">IDX (Indonesia)</option>
                <option value="SGX">SGX (Singapore)</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-900 mb-1">Frekuensi</label>
              <select v-model="newFrequency" class="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-900"><option value="daily">Setiap hari</option><option value="weekdays">Hari kerja</option><option value="weekly">Setiap Senin</option><option value="monthly">Tanggal 1 setiap bulan</option></select>
            </div>
            <div><label class="block font-bold text-slate-900 mb-1">Waktu</label><input v-model="newTime" type="time" required class="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-900" /></div>
            <div><label class="block font-bold text-slate-900 mb-1">Zona waktu</label><select v-model="newTimezone" class="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-900"><option value="Asia/Jakarta">WIB</option><option value="Asia/Makassar">WITA</option><option value="Asia/Jayapura">WIT</option></select></div>
            <div>
              <label class="block font-bold text-slate-900 mb-1">Jumlah kandidat</label>
              <select v-model.number="newCandidates" class="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-900">
                <option :value="3">3 kandidat</option>
                <option :value="5">5 kandidat</option>
                <option :value="10">10 kandidat</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              @click="isCreateModalOpen = false"
              type="button"
              class="rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="button-primary min-h-10 px-5 font-bold disabled:opacity-50"
            >
              <Plus class="h-4 w-4" />
              <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan jadwal' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
