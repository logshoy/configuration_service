// Конфигурация дефолтных значений для языков
export const settingsConfigShop = {
  language: {
    type: 'select',
    default: 'en',
    options: [
      { label: 'Русский', value: 'ru' },
      { label: 'English', value: 'en' },
    ],
  },
}

// Функция для слияния с дефолтными значениями
export const mergesettingsConfigShopDefaults = (currentValues) => {
  return {
    language: currentValues.language || settingsConfigShop.language.default,
  }
}
