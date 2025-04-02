export const validateServiceFiscalization = (configurationData) => {
  console.log('Validating configuration:', configurationData)

  // Проверка уникальности appCash.id требуется только при localUniqueCashMode === true
  if (configurationData.localUniqueCashMode === true) {
    console.log('Проверка уникальности касс активирована (localUniqueCashMode === true)')

    if (configurationData.settingCashToAgentFiscalization) {
      const appCashIds = new Set()
      const hasDuplicates = configurationData.settingCashToAgentFiscalization.some((item) => {
        if (!item.appCash?.value) {
          console.warn('Обнаружен элемент без appCash.value', item)
          return false
        }

        if (appCashIds.has(item.appCash.value)) {
          console.error('Найден дубликат кассы:', item.appCash.value)
          return true
        }

        appCashIds.add(item.appCash.value)
        return false
      })

      if (hasDuplicates) {
        throw new Error(
          'Кассы в настройках фискализации должны быть уникальными при включенном режиме localUniqueCashMode',
        )
      }
    } else {
      console.warn('settingCashToAgentFiscalization отсутствует, проверка уникальности невозможна')
    }
  } else {
    console.log('Проверка уникальности касс пропущена (localUniqueCashMode !== true)')
  }

  return true
}
