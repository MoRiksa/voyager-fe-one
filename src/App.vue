<script setup lang="ts">
import AppSidebar from './components/AppSidebar.vue'
import AppNavbar from './components/AppNavbar.vue'
import { Compass } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] flex text-slate-900 selection:bg-[#407EC9]/20 selection:text-[#1E4270]">
    <!-- Persistent Left Sidebar Navigation -->
    <AppSidebar class="hidden md:flex" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <AppNavbar />

      <main class="flex-1 pb-12">
        <router-view />
      </main>

      <!-- Institutional Footer -->
      <footer class="border-t border-slate-200 bg-white py-6 px-6 lg:px-8 print:hidden">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-800 font-mono">VOYAGER.ONE</span>
            <span class="text-slate-300">•</span>
            <span>Autonomous Financial Research Agent</span>
          </div>

          <div class="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Sectors Hackathon 2026</span>
            <span>•</span>
            <span>Deterministic Derived Intelligence</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>
