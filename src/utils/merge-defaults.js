/**
 * Функция для слияния текущих значений с настройками по умолчанию
 * @param {Object} currentValues - Текущие значения настроек
 * @param {Object} settingsConfig - Конфигурация всех параметров
 * @returns {Object} - Объединенный объект значений
 */
export const mergeWithDefaults = (currentValues, settingsConfig) => {
  const result = { ...currentValues }

  // Проходим по всем секциям и полям конфигурации
  Object.values(settingsConfig).forEach((section) => {
    Object.entries(section.fields).forEach(([key, field]) => {
      // Если значения нет в currentValues, но есть default - подставляем
      if (result[key] === undefined && field.default !== undefined) {
        result[key] = field.default
      }
    })
  })

  return result
}
