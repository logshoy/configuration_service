const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: {
          title: 'configuration', // ключ перевода
        },
      },
      {
        path: '/users',
        component: () => import('pages/UsersPage.vue'),
        meta: {
          title: 'users', // ключ перевода
        },
      },
    ],
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/AuthPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]




export default routes
