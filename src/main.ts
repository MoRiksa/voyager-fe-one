import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useResearchStore } from './stores/researchStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
useResearchStore(pinia).hydrateSessions()
app.use(router)
app.mount('#app')
