import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useHeaderStore } from 'stores/headerStore'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to) => {
    // В SSR режиме store может быть недоступен сразу
    if (process.env.SERVER) return

    const headerStore = useHeaderStore()

    // Рекурсивно ищем title в meta текущего и родительских маршрутов
    const findTitleInMeta = (route) => {
      if (route.meta && route.meta.title) return route.meta.title
      if (route.matched && route.matched.length > 0) {
        for (let i = route.matched.length - 1; i >= 0; i--) {
          if (route.matched[i].meta && route.matched[i].meta.title) {
            return route.matched[i].meta.title
          }
        }
      }
      return 'default_title' // Заголовок по умолчанию
    }

    headerStore.setTitle(findTitleInMeta(to))
  })

  return Router
})
