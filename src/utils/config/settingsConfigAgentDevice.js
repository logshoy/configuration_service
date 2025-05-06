// Специальная конфигурация для оборудования
export const equipmentSettingsConfig = {
  equipment: {
    label: 'Оборудование',
    fields: {
      devices: {
        type: 'array',
        default: [
          {
            id: null,
            type: null,
            model: null,
            protocol: null,
            connectionType: null,
            comPort: '',
            ipAddress: '',
            port: 9100,
            cutEnabled: true,
            openCashDrawer: true,
            lineLength: 40,
            showPrices: true,
          },
        ],
      },
    },
  },
}

// Адаптер для данных оборудования
export const mergeEquipmentDefaults = (currentValues) => {
  if (!currentValues.devices || currentValues.devices.length === 0) {
    return {
      devices: [{ ...equipmentSettingsConfig.equipment.fields.devices.default[0] }],
    }
  }

  const devices = currentValues.devices.map((device) => ({
    id: device.id,
    type: device.type || null,
    model: device.model || null,
    protocol: device.protocol || null,
    connectionType: device.connectionType || null,
    comPort: device.comPort || '',
    ipAddress: device.ipAddress || '',
    port: device.port || 9100,
    cutEnabled: device.cutEnabled !== undefined ? device.cutEnabled : true,
    openCashDrawer: device.openCashDrawer !== undefined ? device.openCashDrawer : true,
    lineLength: device.lineLength || 40,
    showPrices: device.showPrices !== undefined ? device.showPrices : true,
  }))

  return { devices }
}
