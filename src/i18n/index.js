import { createI18n } from 'vue-i18n'
import enUS from './en-US' // Английские переводы
import ruRU from './ru-RU' // Русские переводы
// import { createI18n } from 'vue-i18n'
// import messages from 'src/i18n'

// Загружаем язык из localStorage или используем язык по умолчанию
const savedLocale = localStorage.getItem('locale') || 'ru-RU'


// Создаем экземпляр i18n
const i18n = createI18n({
  locale: savedLocale,
  globalInjection: true,
  fallbackLocale: 'en-US', // Резервный язык
  messages: {
    'en-US': enUS, // Английские переводы
    'ru-RU': ruRU, // Русские переводы
  },
})

export default i18n
