<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Compass, ShieldCheck, ArrowUpRight } from '@lucide/vue'

const route = useRoute()
const isLandingPage = computed(() => route.name === 'landing-page')
const currentYear = new Date().getFullYear()

const productLinks = [
  { label: 'Kalender Ekonomi', to: '/economic-calendar' },
  { label: 'Pustaka Riset', to: '/research' },
  { label: 'Workspace Baru', to: '/workspace' }
]

const docLinks = [
  { label: 'Cara Kerja Metodologi', to: '/methodology' },
  { label: 'Kamus Istilah Finansial', to: '/glossary' },
  { label: 'Pusat Bantuan', to: '/help' },
  { label: 'Status Aksesibilitas', to: '/accessibility' }
]
</script>

<template>
  <footer class="border-t border-slate-200/80 bg-white/95 text-slate-600 print:hidden backdrop-blur-md">
    <!-- =======================================================================
         LANDING PAGE FOOTER: Full-depth architectural layout with brand bento & columns
         ======================================================================= -->
    <div v-if="isLandingPage" class="mx-auto w-full max-w-[84rem] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      
      <!-- Upper Section: Bento Grid Brand Info + Nav Columns -->
      <div class="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-12">
        
        <!-- Left: Brand Info & Mission Statement -->
        <div class="md:col-span-5 lg:col-span-6 space-y-4">
          <router-link to="/landing-page" class="group inline-flex items-center gap-3 transition-transform hover:scale-[1.01]">
            <div class="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E4270] to-[#244F87] text-white shadow-sm ring-1 ring-slate-900/10">
              <Compass class="size-5 stroke-[2.2]" />
            </div>
            <div class="leading-tight">
              <span class="block font-mono text-sm font-extrabold tracking-tight text-[#102138]">
                VOYAGER<span class="text-[#407EC9]">.ONE</span>
              </span>
              <span class="block text-[11px] font-medium text-slate-500">
                Workspace Riset Saham & Pasar Modal
              </span>
            </div>
          </router-link>

          <p class="max-w-md text-xs leading-relaxed text-slate-500">
            Bandingkan metrik fundamental dan laporan keuangan emiten saham lintas sektor. Dilengkapi sumber data resmi dan formula terbuka.
          </p>

          <div class="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-600">
            <ShieldCheck class="size-4 text-emerald-600 shrink-0" />
            <span>Audit data laporan keuangan resmi & rujukan terbuka</span>
          </div>
        </div>

        <!-- Center: Nav Column 1 (Produk & Navigasi) -->
        <div class="md:col-span-3 lg:col-span-3 space-y-3">
          <p class="font-mono text-xs font-bold uppercase tracking-wider text-[#102138]">
            Eksplorasi
          </p>
          <ul class="space-y-2.5 text-xs">
            <li v-for="item in productLinks" :key="item.to">
              <router-link
                :to="item.to"
                class="transition-colors hover:text-[#1E4270] hover:underline underline-offset-4"
              >
                {{ item.label }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Right: Nav Column 2 (Dokumentasi & Panduan) -->
        <div class="md:col-span-4 lg:col-span-3 space-y-3">
          <p class="font-mono text-xs font-bold uppercase tracking-wider text-[#102138]">
            Panduan & Metodologi
          </p>
          <ul class="space-y-2.5 text-xs">
            <li v-for="item in docLinks" :key="item.to">
              <router-link
                :to="item.to"
                class="transition-colors hover:text-[#1E4270] hover:underline underline-offset-4"
              >
                {{ item.label }}
              </router-link>
            </li>
          </ul>
        </div>

      </div>

      <!-- Lower Section: Disclaimer & Copyright Bar -->
      <div class="mt-12 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
        <p>
          &copy; {{ currentYear }} VOYAGER.ONE. Seluruh hak cipta dilindungi. Data disajikan untuk riset, bukan rekomendasi jual-beli efek.
        </p>

        <div class="flex items-center gap-4">
          <router-link to="/workspace" class="inline-flex items-center gap-1 font-semibold text-[#1E4270] hover:underline">
            <span>Buka Workspace</span>
            <ArrowUpRight class="size-3" />
          </router-link>
        </div>
      </div>

    </div>

    <!-- =======================================================================
         APP WORKSPACE COMPACT 1-BAR FOOTER: Single-line utility bar flush-aligned
         ======================================================================= -->
    <div v-else class="w-full max-w-[96rem] mx-auto px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-slate-500">
        <!-- Left: Brand mark + Copyright & Disclaimer in 1 line -->
        <div class="flex flex-wrap items-center gap-2 text-center sm:text-left">
          <span class="font-mono font-bold tracking-tight text-[#102138]">
            VOYAGER<span class="text-[#407EC9]">.ONE</span>
          </span>
          <span class="text-slate-300" aria-hidden="true">•</span>
          <span>&copy; {{ currentYear }}</span>
          <span class="hidden md:inline text-slate-300" aria-hidden="true">•</span>
          <span class="hidden md:inline text-slate-400">Data untuk riset, bukan rekomendasi jual-beli efek.</span>
        </div>

        <!-- Right: Essential inline links in 1 bar -->
        <nav class="flex flex-wrap items-center gap-3.5 text-xs font-medium" aria-label="Tautan navigasi footer ringkas">
          <router-link to="/methodology" class="transition-colors hover:text-[#1E4270] hover:underline underline-offset-2">
            Metodologi
          </router-link>
          <span class="text-slate-300" aria-hidden="true">•</span>
          <router-link to="/glossary" class="transition-colors hover:text-[#1E4270] hover:underline underline-offset-2">
            Kamus
          </router-link>
          <span class="text-slate-300" aria-hidden="true">•</span>
          <router-link to="/help" class="transition-colors hover:text-[#1E4270] hover:underline underline-offset-2">
            Bantuan
          </router-link>
          <span class="text-slate-300" aria-hidden="true">•</span>
          <router-link to="/accessibility" class="transition-colors hover:text-[#1E4270] hover:underline underline-offset-2">
            Aksesibilitas
          </router-link>
        </nav>
      </div>
    </div>
  </footer>
</template>
