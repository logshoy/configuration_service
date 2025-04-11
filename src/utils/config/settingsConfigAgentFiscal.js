// Специальная конфигурация для фискальных регистраторов
export const fiscalSettingsConfig = {
  fiscal: {
    label: 'Фискальные регистраторы',
    fields: {
      fiscalRegistrators: {
        type: 'array',
        default: [
          {
            id: null,
            type: null,
            portName: '',
          },
        ],
      },
    },
  },
}

// Адаптер для фискальных данных
export const mergeFiscalDefaults = (currentValues) => {
  // Если нет ни одного регистратора, добавляем новый с дефолтными значениями
  if (!currentValues.fiscalRegistrators || currentValues.fiscalRegistrators.length === 0) {
    return {
      fiscalRegistrators: [{ ...fiscalSettingsConfig.fiscal.fields.fiscalRegistrators.default[0] }],
    }
  }

  // Применяем дефолты к каждому регистратору
  const registrators = currentValues.fiscalRegistrators.map((reg) => ({
    id: reg.id,
    type: reg.type ?? null,
    portName: reg.portName ?? '',
  }))

  return { fiscalRegistrators: registrators }
}
