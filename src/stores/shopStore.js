// stores/shopStore.js
import { defineStore } from 'pinia'
import { useConfigurationStore } from './configurationStore'
import { v4 as uuidv4 } from 'uuid'

// Ключ для localStorage
const STORAGE_KEY = 'shopStoreData'

export const useShopStore = defineStore('shop', {
  state: () => {
    // Пытаемся загрузить shops из localStorage
    const savedData = localStorage.getItem(STORAGE_KEY)
    return {
      shops: savedData ? JSON.parse(savedData).shops : [],
      branch: null,
    }
  },

  getters: {
    treeData: (state) => {
      return state.shops.map((shop) => ({
        id: shop.id,
        label: shop.name,
        type: 'shop',
        children: shop.cashGroups.map((cashGroup) => ({
          id: cashGroup.id,
          label: cashGroup.name,
          type: 'cashGroup',
          shopId: shop.id,
          children: cashGroup.cashRegisters.map((cashRegister) => ({
            id: cashRegister.id,
            label: cashRegister.name,
            type: 'cashRegister',
            shopId: shop.id,
            cashGroupId: cashGroup.id,
          })),
        })),
      }))
    },
  },

  actions: {
    // Сохраняем текущее состояние в localStorage
    persistState() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          shops: this.shops,
          branch: this.branch,
        }),
      )
    },

    setBranch(id) {
      this.branch = id !== null ? id : null
      this.persistState()
    },

    addShop(name, settings) {
      const configurationStore = useConfigurationStore()
      const newShop = {
        id: uuidv4(),
        name,
        cashGroups: [],
      }
      this.shops.push(newShop)
      configurationStore.createConfiguration(settings, newShop.id)
      this.persistState()
    },

    addCashGroup(shopId, name, settings) {
      const configurationStore = useConfigurationStore()
      const shop = this.shops.find((s) => s.id === shopId)

      if (shop) {
        const newCashGroup = {
          id: uuidv4(),
          name,
          cashRegisters: [],
        }
        shop.cashGroups.push(newCashGroup)
        configurationStore.createConfiguration(settings, newCashGroup.id)
        this.persistState()
      }
    },

    addCashRegister(shopId, cashGroupId, name, settings) {
      const configurationStore = useConfigurationStore()
      const shop = this.shops.find((s) => s.id === shopId)

      if (shop) {
        const cashGroup = shop.cashGroups.find((g) => g.id === cashGroupId)
        if (cashGroup) {
          const newCashRegister = {
            id: uuidv4(),
            name,
          }
          cashGroup.cashRegisters.push(newCashRegister)
          configurationStore.createConfiguration(settings, newCashRegister.id)
          this.persistState()
        }
      }
    },

    // Очистка хранилища
    clearStorage() {
      this.shops = []
      this.branch = null
      localStorage.removeItem(STORAGE_KEY)
    },

    moveCashRegister(cashRegisterId, targetGroupId) {
      // 1. Находим исходную группу и магазин
      let sourceShop = null
      let sourceGroup = null

      for (const shop of this.shops) {
        for (const group of shop.cashGroups) {
          const registerExists = group.cashRegisters.some((cr) => cr.id === cashRegisterId)
          if (registerExists) {
            sourceShop = shop
            sourceGroup = group
            break
          }
        }
        if (sourceGroup) break
      }

      if (!sourceShop || !sourceGroup) {
        console.error('Исходная группа не найдена')
        return false
      }

      // 2. Находим целевую группу (в любом магазине)
      let targetShop = null
      let targetGroup = null

      for (const shop of this.shops) {
        targetGroup = shop.cashGroups.find((group) => group.id === targetGroupId)
        if (targetGroup) {
          targetShop = shop
          break
        }
      }

      if (!targetGroup) {
        console.error('Целевая группа не найдена')
        return false
      }

      // 3. Находим и перемещаем кассу
      const registerIndex = sourceGroup.cashRegisters.findIndex((cr) => cr.id === cashRegisterId)
      if (registerIndex === -1) {
        console.error('Касса не найдена в исходной группе')
        return false
      }

      const [movedRegister] = sourceGroup.cashRegisters.splice(registerIndex, 1)

      // Обновляем ссылки у кассы
      movedRegister.shopId = targetShop.id
      movedRegister.cashGroupId = targetGroup.id

      targetGroup.cashRegisters.push(movedRegister)

      // 4. Обновляем конфигурацию кассы
      const configurationStore = useConfigurationStore()
      const cashRegisterConfig = configurationStore.getConfiguration(cashRegisterId)

      if (cashRegisterConfig) {
        // Создаем обновленную конфигурацию
        const updatedConfig = {
          ...cashRegisterConfig,
          settings: {
            ...cashRegisterConfig.settings,
            node: targetGroup.id, // Обновляем node в настройках
          },
        }

        // Вызываем updateItem для обновления конфигурации
        configurationStore.updateItem(updatedConfig)
      }

      this.persistState()
      console.log('Успешно перемещено', {
        from: { shopId: sourceShop.id, groupId: sourceGroup.id },
        to: { shopId: targetShop.id, groupId: targetGroup.id },
      })
      return true
    },
    getCashRegisterById(id) {
      for (const shop of this.shops) {
        for (const group of shop.cashGroups) {
          const found = group.cashRegisters.find((cr) => cr.id === id)
          if (found) return found
        }
      }
      return null
    },

    // В разделе actions добавим новые методы:

    async copyShop(originalShopId, newName) {
      const configurationStore = useConfigurationStore()
      const originalShop = this.shops.find((s) => s.id === originalShopId)
      if (!originalShop) return false

      // Получаем конфигурацию оригинального магазина
      const originalConfig = configurationStore.getConfiguration(originalShopId)

      // Создаем новый магазин
      const newShop = {
        id: uuidv4(),
        name: newName,
        cashGroups: [], // Пустые группы, без копирования вложенных элементов
      }

      this.shops.push(newShop)

      // Создаем конфигурацию для нового магазина
      if (originalConfig) {
        const newSettings = {
          ...originalConfig.settings,
          configurationName: newName,
        }
        configurationStore.createConfiguration(newSettings, newShop.id)
      }

      this.persistState()
      return true
    },

    async copyCashGroup(originalGroupId, targetShopId, newName) {
      const configurationStore = useConfigurationStore()

      // Находим исходную группу и ее магазин
      let originalGroup = null
      let originalShop = null

      for (const shop of this.shops) {
        const group = shop.cashGroups.find((g) => g.id === originalGroupId)
        if (group) {
          originalGroup = group
          originalShop = shop
          break
        }
      }

      if (!originalGroup || !originalShop) return false

      // Находим целевой магазин
      const targetShop = this.shops.find((s) => s.id === targetShopId)
      if (!targetShop) return false

      // Получаем конфигурацию оригинальной группы
      const originalConfig = configurationStore.getConfiguration(originalGroupId)

      // Создаем новую группу
      const newGroup = {
        id: uuidv4(),
        name: newName,
        cashRegisters: [], // Пустые кассы, без копирования вложенных элементов
      }

      targetShop.cashGroups.push(newGroup)

      // Создаем конфигурацию для новой группы
      if (originalConfig) {
        const newSettings = {
          ...originalConfig.settings,
          configurationName: newName,
          node: targetShopId, // Обновляем привязку к новому магазину
        }
        configurationStore.createConfiguration(newSettings, newGroup.id)
      }

      this.persistState()
      return true
    },

    // ... остальные методы без изменений ..

    // Обновим метод addCashRegisterCopy для работы с конфигурациями
    async addCashRegisterCopy(targetGroupId, cashData, newName) {
      const configurationStore = useConfigurationStore()
      const targetGroup = this.findCashGroupById(targetGroupId)

      if (!targetGroup) {
        console.error('Целевая группа не найдена')
        return false
      }

      // Создаем новый ID для копии
      const newId = uuidv4()

      // Создаем копию кассы с новым ID и именем
      const newCashRegister = {
        ...cashData,
        id: newId,
        name: newName,
        shopId: targetGroup.shopId,
        cashGroupId: targetGroupId,
      }

      // Добавляем кассу в целевую группу
      targetGroup.cashRegisters.push(newCashRegister)

      // Создаем новую конфигурацию для копии
      if (cashData.settings) {
        const newSettings = {
          ...cashData.settings.settings,
          configurationName: newName,
          node: targetGroupId,
        }
        configurationStore.createConfiguration(newSettings, newId)
      }

      this.persistState()
      return true
    },

    findCashGroupById(groupId) {
      for (const shop of this.shops) {
        const group = shop.cashGroups.find((g) => g.id === groupId)
        if (group) return group
      }
      return null
    },

    updateNodeName(nodeId, newName) {
      // Ищем магазин
      const shop = this.shops.find((s) => s.id === nodeId)
      if (shop) {
        shop.name = newName
        this.persistState()
        return 'shop'
      }

      // Ищем группу касс
      for (const shop of this.shops) {
        const group = shop.cashGroups.find((g) => g.id === nodeId)
        if (group) {
          group.name = newName
          this.persistState()
          return 'cashGroup'
        }
      }

      // Ищем кассу
      for (const shop of this.shops) {
        for (const group of shop.cashGroups) {
          const register = group.cashRegisters.find((cr) => cr.id === nodeId)
          if (register) {
            register.name = newName
            this.persistState()
            return 'cashRegister'
          }
        }
      }

      return null
    },

    /**
     * Получает тип узла по ID
     * @param {string} nodeId - ID элемента
     * @returns {string|null} - Тип узла ('shop', 'cashGroup', 'cashRegister') или null если не найден
     */
    getNodeType(nodeId) {
      if (this.shops.some((s) => s.id === nodeId)) return 'shop'

      for (const shop of this.shops) {
        if (shop.cashGroups.some((g) => g.id === nodeId)) return 'cashGroup'
      }

      for (const shop of this.shops) {
        for (const group of shop.cashGroups) {
          if (group.cashRegisters.some((cr) => cr.id === nodeId)) return 'cashRegister'
        }
      }

      return null
    },

    deleteNodeIfEmpty(nodeId) {
      // Определяем тип узла
      const nodeType = this.getNodeType(nodeId)

      // Если узел не найден ,
      if (!nodeType) {
        console.error(`Узел с ID ${nodeId} не найден`)
        return true
      }

      // Удаление кассы (кассы всегда можно удалить, так как у них нет вложенных элементов)
      if (nodeType === 'cashRegister') {
        for (const shop of this.shops) {
          for (const group of shop.cashGroups) {
            const index = group.cashRegisters.findIndex((register) => register.id === nodeId)
            if (index !== -1) {
              group.cashRegisters.splice(index, 1)
              this.persistState()
              return true
            }
          }
        }
        return false
      }

      // Удаление группы касс
      if (nodeType === 'cashGroup') {
        for (const shop of this.shops) {
          const index = shop.cashGroups.findIndex((group) => group.id === nodeId)
          if (index !== -1) {
            if (shop.cashGroups[index].cashRegisters.length > 0) {
              console.error(
                `Нельзя удалить группу касс "${shop.cashGroups[index].name}" - она содержит кассы`,
              )
              return false
            }
            shop.cashGroups.splice(index, 1)
            this.persistState()
            return true
          }
        }
        return false
      }

      // Удаление магазина
      if (nodeType === 'shop') {
        const index = this.shops.findIndex((shop) => shop.id === nodeId)
        if (index !== -1) {
          if (this.shops[index].cashGroups.length > 0) {
            console.error(
              `Нельзя удалить магазин "${this.shops[index].name}" - он содержит группы касс`,
            )
            return false
          }
          this.shops.splice(index, 1)
          this.persistState()
          return true
        }
        return false
      }

      console.error(`Неизвестный тип узла для ID ${nodeId}`)
      return false
    },
  },
})
