<script setup lang="ts">
import { Compass, ArrowLeft } from '@lucide/vue'
</script>

<template>
  <div class="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-center justify-center px-6 text-center">
    <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#407EC9] text-white">
      <Compass class="h-7 w-7" />
    </div>
    <p class="font-mono text-xs font-bold uppercase tracking-wider text-[#2F64A8]">404</p>
    <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">Halaman tidak ditemukan</h1>
    <p class="mt-3 text-sm leading-6 text-slate-600">Alamat ini tidak tersedia. Kembali ke beranda untuk memulai atau membuka riset yang tersedia.</p>
    <router-link to="/" class="button-primary mt-6">
      <ArrowLeft class="h-4 w-4" />
      Kembali ke beranda
    </router-link>
  </div>
</template>
