import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// 引入Element Plus样式
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

// 引入全局样式
import './styles/index.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')