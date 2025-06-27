export const settingsConfigAppCash = {
  dimensions: {
    width: {
      type: 'number',
      default: 1024,
      min: 1024,
      max: 5000,
    },
    height: {
      type: 'number',
      default: 768,
      min: 768,
      max: 5000,
    },
  },
  color: {
    type: 'color',
    default: '#FFFFFF',
  },
  agents: {
    fiscalAgent: {
      type: 'select',
      default: null,
    },
    fiscalAgentLegalEntity: { type: 'select', default: null }, // новое
    fiscalAgentPrinter: { type: 'select', default: null },
    agentPayment: {
      type: 'select',
      default: null,
    },
    agentDevice: {
      type: 'select',
      default: null,
    },
  },
}

export const mergeSizeColorDefaults = (currentValues = {}) => {
  return {
    width: currentValues.width ?? settingsConfigAppCash.dimensions.width.default,
    height: currentValues.height ?? settingsConfigAppCash.dimensions.height.default,
    color: currentValues.color ?? settingsConfigAppCash.color.default,
    agents: {
      fiscalAgent:
        currentValues.agents?.fiscalAgent ?? settingsConfigAppCash.agents.fiscalAgent.default,
      agentPayment:
        currentValues.agents?.agentPayment ?? settingsConfigAppCash.agents.agentPayment.default,
      agentDevice:
        currentValues.agents?.agentDevice ?? settingsConfigAppCash.agents.agentDevice.default,
      fiscalAgentLegalEntity:
        currentValues.agents?.fiscalAgentLegalEntity ??
        settingsConfigAppCash.agents.fiscalAgentLegalEntity.default,
      fiscalAgentPrinter:
        currentValues.agents?.fiscalAgentPrinter ??
        settingsConfigAppCash.agents.fiscalAgentPrinter.default,
    },
  }
}
