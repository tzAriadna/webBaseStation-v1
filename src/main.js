import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import AuthorizationVue from './components/Authorization.vue'


createApp(App).use(router).mount('#app')
createApp(AuthorizationVue).mount('#authForm')
