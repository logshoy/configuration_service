// Конфигурация дефолтных значений
export const settingsConfigServiceFiscal = {
  localUniqueCashMode: {
    type: 'checkbox',
    default: false,
  },
  settingCashToAgentFiscalization: {
    type: 'array',
    default: [
      {
        appCash: null,
        fiscalAgent: null,
      },
    ],
  },
}

// Функция для слияния с дефолтными значениями
export const mergeSettingsConfigServiceFiscalDefaults = (currentValues) => {
  return {
    localUniqueCashMode:
      currentValues.localUniqueCashMode ?? settingsConfigServiceFiscal.localUniqueCashMode.default,
    settingCashToAgentFiscalization: currentValues.settingCashToAgentFiscalization?.length
      ? currentValues.settingCashToAgentFiscalization
      : [...settingsConfigServiceFiscal.settingCashToAgentFiscalization.default],
  }
}

// Хелпер для работы с массивом касс и агентов
export const useCashAgentHelpers = () => {
  const addPair = (currentPairs) => {
    return [...currentPairs, { appCash: null, fiscalAgent: null }]
  }

  const removePair = (currentPairs, index) => {
    const updated = currentPairs.filter((_, i) => i !== index)
    return updated.length > 0
      ? updated
      : [...settingsConfigServiceFiscal.settingCashToAgentFiscalization.default]
  }

  return {
    addPair,
    removePair,
  }
}
