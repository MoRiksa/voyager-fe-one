import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useResearchStore } from './stores/researchStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
const researchStore = useResearchStore(pinia)
void researchStore.refreshSessions()
app.use(router)
app.mount('#app')
