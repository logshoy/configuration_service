import { defineBoot } from '#q-app/wrappers'
import i18n from '../i18n'
// import { createI18n } from 'vue-i18n'
// import messages from 'src/i18n'

export default defineBoot(({ app }) => {
  // const i18n = createI18n({
  //   locale: 'ru-RU',
  //   globalInjection: true,
  //   messages
  // })

  // Set i18n instance on app
  app.use(i18n)
})
