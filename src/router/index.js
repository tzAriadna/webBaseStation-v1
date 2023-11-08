import { createRouter, createWebHashHistory } from 'vue-router'


const routes = [
  {
    path: '/',
    name: 'Monitoring',
    component: () => import('../views/Monitoring.vue')
  },
  {
    path: '/auth',
    name: 'Authorization',
    component: () => import('../components/Authorization.vue')
  },
  {
    path: '/additional_information',
    name: 'AdditionalInformation',
    component: () => import('../views/AdditionalInformation.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingWidget.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../views/notFound.vue')
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

/** Вызов глобальных beforeResolve хуков, с помощью которого отображается анимация загрузки*/
router.beforeResolve((to, from, next) => {
  if (to.path) {
    console.log('Загрузка');
    const preloader = document.getElementById('preloader');
    let loader = document.getElementById('loader');
    preloader.style.display = 'block'; 
    loader.style.display = 'block';
  }
  next();
})

/** 
 * Вызов глобальных afterEach хуков, с помощью которого заканчивается время анимации загрузки
 * время загрузки - 3 секунды
 */
router.afterEach(() => {
  const timeOut_threeSec = 3000; 
  setTimeout(() => { 
    const preloader = document.getElementById('preloader');
    let loader = document.getElementById('loader');
    preloader.style.display = 'none';
    loader.style.display = 'none';
  }, timeOut_threeSec) 
  console.log('Готово');
})

export default router
