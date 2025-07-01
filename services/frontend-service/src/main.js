import './assets/main.css'
import 'vue-loading-overlay/dist/css/index.css';
import "vue-toastification/dist/index.css";

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import { LoadingPlugin } from 'vue-loading-overlay';
import Toast from "vue-toastification";

const app = createApp(App)

app.use(Toast, {
    pauseOnHover: false,
})
app.use(createPinia())
app.use(router)
app.use(LoadingPlugin);
app.use(VueApexCharts)

app.mount('#app')
