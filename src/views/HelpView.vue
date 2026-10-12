<script setup lang="ts">
import {
  HelpCircle,
  AlertTriangle,
  FileCheck,
  BookOpen,
  Library,
  ShieldCheck,
  ArrowRight,
  Info,
  Clock,
  Sparkles
} from '@lucide/vue'
</script>

<template>
  <div class="page-shell space-y-8">
    <!-- Editorial Hero Header -->
    <header class="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/70 to-blue-50/30 p-6 sm:p-8 md:p-10 shadow-xs">
      <div class="relative z-10 max-w-3xl space-y-3">
        <div class="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/70 px-3 py-1 font-mono text-xs font-bold text-[#1E4270]">
          <HelpCircle class="size-3.5" />
          <span>Panduan Pengguna & Verifikasi</span>
        </div>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Cara Membaca & Memverifikasi Voyager One
        </h1>
        <p class="text-sm sm:text-base leading-relaxed text-slate-600 max-w-2xl">
          Voyager One dirancang sebagai workspace analitis berbasis data terbuka untuk membantu penelaahan emiten, bukan mesin pemberi rekomendasi atau sinyal beli-jual otomatis.
        </p>
      </div>

      <!-- Subtle geometric watermark background decor -->
      <div class="pointer-events-none absolute -right-12 -top-12 size-72 rounded-full bg-blue-100/30 blur-3xl" aria-hidden="true"></div>
      <div class="pointer-events-none absolute -right-6 -bottom-6 size-48 rounded-full bg-indigo-100/20 blur-2xl" aria-hidden="true"></div>
    </header>

    <!-- 2-Column Responsive Bento Grid: Checklists & Status Guide -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <!-- Section 1: Pre-requisites Checklist -->
      <section class="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div>
          <div class="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div class="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-200/70">
              <AlertTriangle class="size-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900">Sebelum Memakai Hasil</h2>
              <p class="text-xs text-slate-500">Langkah penting sebelum mengambil kesimpulan riset</p>
            </div>
          </div>

          <ol class="mt-5 space-y-4 text-sm leading-relaxed text-slate-700">
            <li class="flex items-start gap-3">
              <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-xs font-bold text-slate-700">1</span>
              <div>
                Pastikan laporan tidak berlabel <strong>Arsip terbatas</strong>.
                <p class="text-xs text-slate-500 mt-0.5">Laporan berstatus arsip terbatas tidak mencerminkan metode mutakhir dan tidak dapat direproduksi.</p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-xs font-bold text-slate-700">2</span>
              <div>
                Bandingkan periode keuangan dengan tanggal harga dan waktu laporan dibuat.
                <p class="text-xs text-slate-500 mt-0.5">Hindari mencampuradukkan rasio tahun fiskal lalu dengan harga pasar saat ini tanpa sinkronisasi.</p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-xs font-bold text-slate-700">3</span>
              <div>
                Buka referensi penyedia data dan cocokkan angka dengan laporan resmi perusahaan.
                <p class="text-xs text-slate-500 mt-0.5">Lakukan verifikasi silang pada keterbukaan informasi IDX atau prospektus audit.</p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-xs font-bold text-slate-700">4</span>
              <div>
                Anggap ROE dan P/BV sebagai data belum terverifikasi, bukan penilaian kualitas.
                <p class="text-xs text-slate-500 mt-0.5">Angka historis memerlukan penelusuran lebih lanjut terkait pos keuntungan luar biasa atau beban satu kali.</p>
              </div>
            </li>
          </ol>
        </div>

        <div class="mt-6 rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 text-xs leading-relaxed text-amber-900 flex items-start gap-2.5">
          <Info class="size-4 shrink-0 text-amber-700 mt-0.5" />
          <span>Selalu utamakan penilaian independen dan konfirmasi dokumen primer sebelum mengeksekusi keputusan investasi perbankan.</span>
        </div>
      </section>

      <!-- Section 2: Status Definitions -->
      <section class="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div>
          <div class="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div class="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-[#1E4270] ring-1 ring-blue-200/70">
              <FileCheck class="size-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900">Apa Arti Status?</h2>
              <p class="text-xs text-slate-500">Definisi kondisi sistem terhadap ketersediaan data</p>
            </div>
          </div>

          <dl class="mt-5 space-y-4 text-sm leading-relaxed text-slate-700">
            <div class="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <dt class="font-bold text-slate-900 flex items-center gap-2">
                <span class="size-2 rounded-full bg-emerald-500"></span>
                Terjawab pada cakupan yang tersedia
              </dt>
              <dd class="mt-1 text-xs text-slate-600 leading-normal">
                Data bank yang dibutuhkan tersedia. Ini bukan rekomendasi membeli.
              </dd>
            </div>

            <div class="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <dt class="font-bold text-slate-900 flex items-center gap-2">
                <span class="size-2 rounded-full bg-amber-500"></span>
                Belum dapat dinilai
              </dt>
              <dd class="mt-1 text-xs text-slate-600 leading-normal">
                Satu atau lebih data wajib tidak tersedia. Jangan menarik kesimpulan dari daftar yang tersisa.
              </dd>
            </div>

            <div class="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <dt class="font-bold text-slate-900 flex items-center gap-2">
                <span class="size-2 rounded-full bg-rose-500"></span>
                Arsip terbatas
              </dt>
              <dd class="mt-1 text-xs text-slate-600 leading-normal">
                Metode lama atau hasil tidak lengkap. Arsip hanya dapat dibaca dan tidak dapat disalin, diekspor, atau digunakan ulang.
              </dd>
            </div>
          </dl>
        </div>

        <div class="mt-6 rounded-2xl bg-slate-100/70 border border-slate-200 p-4 text-xs text-slate-600 flex items-center gap-2">
          <Clock class="size-4 shrink-0 text-slate-500" />
          <span>Status diperbarui secara real-time berdasarkan kontrak integritas API.</span>
        </div>
      </section>
    </div>

    <!-- Section 3: Navigation & Operational Notice Card -->
    <section class="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-xs space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 class="text-xl font-bold text-slate-900">Pelajari Istilah & Cara Kerja</h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Jelajahi panduan dokumentasi terinci untuk pemahaman komprehensif</p>
        </div>

        <div class="flex flex-wrap gap-2.5">
          <router-link
            to="/glossary"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white hover:border-[#1E4270] hover:text-[#1E4270] hover:shadow-2xs transition-all"
          >
            <BookOpen class="size-3.5 text-slate-500" />
            <span>Buka Kamus Istilah</span>
          </router-link>

          <router-link
            to="/methodology"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white hover:border-[#1E4270] hover:text-[#1E4270] hover:shadow-2xs transition-all"
          >
            <Library class="size-3.5 text-slate-500" />
            <span>Baca Cara Kerja</span>
          </router-link>

          <router-link
            to="/accessibility"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white hover:border-[#1E4270] hover:text-[#1E4270] hover:shadow-2xs transition-all"
          >
            <ShieldCheck class="size-3.5 text-slate-500" />
            <span>Status Aksesibilitas</span>
          </router-link>
        </div>
      </div>

      <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 sm:p-5 text-xs leading-relaxed text-slate-600">
        <p>
          Kontak bantuan khusus belum tersedia. Jika layanan gagal, jangan mengulang transaksi atau membagikan hasil sampai status sesi dapat dibaca kembali.
        </p>
      </div>
    </section>
  </div>
</template>
