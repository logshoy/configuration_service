export const validateServiceFiscalization = (configurationData) => {
  console.log('[VALIDATION] Проверка конфигурации:', configurationData)

  if (configurationData.localUniqueCashMode !== true) {
    console.log('[VALIDATION] Проверка уникальности отключена (localUniqueCashMode ≠ true)')
    return true
  }

  if (!configurationData.settingCashToAgentFiscalization) {
    console.warn('[VALIDATION] settingCashToAgentFiscalization отсутствует')
    return true
  }

  const entries = configurationData.settingCashToAgentFiscalization
  const uniqueCashIds = new Set()

  for (const item of entries) {
    // Извлекаем ID кассы (поддержка форматов: строка или {value: string})
    const appCashId = item.appCash?.value ?? item.appCash

    if (!appCashId) {
      console.warn('[VALIDATION] Пропуск элемента без appCash:', item)
      continue
    }

    console.log('[VALIDATION] Проверка кассы:', appCashId)

    if (uniqueCashIds.has(appCashId)) {
      console.error('[VALIDATION] Найден дубликат кассы:', appCashId)
      throw new Error('Касса может быть добавлена только один раз (localUniqueCashMode = true)')
    }

    uniqueCashIds.add(appCashId)
  }

  console.log('[VALIDATION] Дубликатов касс не найдено')
  return true
}
