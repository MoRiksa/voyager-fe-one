<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import { Compass, ShieldCheck } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-900 selection:bg-[#407EC9]/20 selection:text-[#1E4270]">
    <div>
      <AppHeader />
      <main>
        <router-view />
      </main>
    </div>

    <!-- Institutional Footer -->
    <footer class="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8 mt-12 print:hidden">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded bg-[#407EC9] text-white flex items-center justify-center font-bold">
            <Compass class="w-3.5 h-3.5" />
          </div>
          <div>
            <span class="font-bold text-slate-800 font-mono">VOYAGER.ONE</span> — Autonomous Financial Research Agent
          </div>
        </div>

        <div class="flex items-center gap-6 text-slate-400">
          <span>Sectors Hackathon 2026</span>
          <span>•</span>
          <span>Core Data: Sectors MCP & REST API</span>
          <span>•</span>
          <span>Tone: White & Pantone 660 C</span>
        </div>
      </div>
    </footer>
  </div>
</template>
