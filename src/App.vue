<script setup lang="ts">
import AppSidebar from './components/AppSidebar.vue'
import AppNavbar from './components/AppNavbar.vue'
import MobileNav from './components/MobileNav.vue'
import CandidateDetailModal from './components/CandidateDetailModal.vue'
import MethodologyModal from './components/MethodologyModal.vue'
</script>

<template>
  <div class="min-h-dvh bg-[#F8FAFC] flex text-slate-900 selection:bg-[#407EC9]/20 selection:text-[#1E4270]">
    <a href="#main-content" class="skip-link">Lewati ke konten utama</a>
    <!-- Persistent Left Sidebar Navigation -->
    <AppSidebar class="hidden md:flex" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <AppNavbar />

      <main id="main-content" tabindex="-1" class="flex-1 pb-24 md:pb-12">
        <router-view />
      </main>

      <!-- Institutional Footer -->
      <footer class="border-t border-slate-200 bg-white py-6 px-6 lg:px-8 print:hidden mb-16 md:mb-0">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-800 font-mono">VOYAGER.ONE</span>
            <span class="text-slate-300">•</span>
            <span>Autonomous Financial Research Agent</span>
          </div>

          <div class="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-slate-500 text-xs">
            <span>Sectors Hackathon 2026</span>
            <span>•</span>
            <span>Deterministic Derived Intelligence</span>
          </div>
        </div>
      </footer>
    </div>

    <MobileNav />
    <CandidateDetailModal />
    <MethodologyModal />
  </div>
</template>
