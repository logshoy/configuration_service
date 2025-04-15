// Специальная конфигурация для платежных агентов
export const paymentAgentSettingsConfig = {
  payment: {
    label: 'Платежные агенты',
    fields: {
      paymentAgents: {
        type: 'array',
        default: [
          {
            id: null,
            type: null,
            terminalNumber: '',
            comPort: '',
          },
        ],
      },
    },
  },
}

// Адаптер для данных платежных агентов
export const mergePaymentAgentDefaults = (currentValues) => {
  // Если нет ни одного агента, добавляем новый с дефолтными значениями
  if (!currentValues.paymentAgents || currentValues.paymentAgents.length === 0) {
    return {
      paymentAgents: [{ ...paymentAgentSettingsConfig.payment.fields.paymentAgents.default[0] }],
    }
  }

  // Применяем дефолты к каждому агенту
  const agents = currentValues.paymentAgents.map((agent) => ({
    id: agent.id || null,
    type: agent.type || null,
    terminalNumber: agent.terminalNumber || '',
    comPort: agent.comPort || '',
  }))

  return { paymentAgents: agents }
}
