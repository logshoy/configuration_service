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

    moveCashRegister(cashRegisterId, fromCashGroupId, toCashGroupId) {

      console.log(12)

      // Находим магазин, содержащий исходную группу касс
      const shop = this.shops.find((shop) =>
        shop.cashGroups.some((group) => group.id === fromCashGroupId),
      )

      if (!shop) return false

      // Находим исходную и целевую группы касс
      const fromGroup = shop.cashGroups.find((group) => group.id === fromCashGroupId)
      const toGroup = shop.cashGroups.find((group) => group.id === toCashGroupId)

      if (!fromGroup || !toGroup) return false

      // Находим кассу для перемещения
      const cashRegisterIndex = fromGroup.cashRegisters.findIndex((cr) => cr.id === cashRegisterId)

      if (cashRegisterIndex === -1) return false

      // Удаляем кассу из исходной группы
      const [cashRegister] = fromGroup.cashRegisters.splice(cashRegisterIndex, 1)

      // Добавляем кассу в целевую группу
      toGroup.cashRegisters.push(cashRegister)

      this.persistState()
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

    addCashRegisterCopy(groupId, cashData) {
      const group = this.findCashGroupById(groupId)
      if (group) {
        group.cashRegisters.push(cashData)
        this.persistState()
        return true
      }
      return false
    },

    findCashGroupById(groupId) {
      for (const shop of this.shops) {
        const group = shop.cashGroups.find((g) => g.id === groupId)
        if (group) return group
      }
      return null
    },
  },
})
