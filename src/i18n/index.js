import { createI18n } from 'vue-i18n'
import enUS from './en-US'
import ruRU from './ru-RU'

// Загружаем язык из localStorage или используем язык по умолчанию
const savedLocale = localStorage.getItem('locale') || 'en-US'

// Создаем экземпляр i18n
const i18n = createI18n({
  locale: savedLocale, // Устанавливаем текущий язык
  fallbackLocale: 'en-US', // Резервный язык
  messages: {
    'en-US': enUS, // Английские переводы
    'ru-RU': ruRU, // Русские переводы
  },
})

export default i18n
