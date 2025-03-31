// stores/shopStore.js
import { defineStore } from 'pinia'
import { useConfigurationStore } from './configurationStore'
import { v4 as uuidv4 } from 'uuid'

export const useShopStore = defineStore('shop', {
  state: () => ({
    shops: [
      {
        id: '2f4728ce-e7fc-42b8-bfdf-0b76317b87e8',
        name: 'Магазин №1',
        cashGroups: [
          {
            id: '92289205-5c41-460d-a501-fa1acae0d0a1',
            name: 'Группа 2',
            cashRegisters: [{ id: '01adaf56-4fff-4a34-b7f7-3a10f91054cf', name: 'Касса 2' }],
          },
        ],
      },
    ],
  }),
  branch: null,
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
    setBranch(id) {
      console.log(id)
      if (id != null) {
        this.branch = id
      } else {
        this.branch = null
      }
      console.log(this.branch)
    },
    addShop(name, settings) {
      const configurationStore = useConfigurationStore()
      const id = uuidv4()
      const newShop = {
        id: id,
        name,
        cashGroups: [],
      }
      this.shops.push(newShop)
      configurationStore.createConfiguration(settings, id)
    },
    addCashGroup(shopId, name, settings) {
      const configurationStore = useConfigurationStore()
      const id = uuidv4()
      const shop = this.shops.find((s) => s.id === shopId)
      if (shop) {
        const newCashGroup = {
          id: id,
          name,
          cashRegisters: [],
        }
        shop.cashGroups.push(newCashGroup)
      }
      configurationStore.createConfiguration(settings, id)
    },
    addCashRegister(shopId, cashGroupId, name, settings) {
      const configurationStore = useConfigurationStore()
      const id = uuidv4()
      const shop = this.shops.find((s) => s.id === shopId)
      if (shop) {
        const cashGroup = shop.cashGroups.find((g) => g.id === cashGroupId)
        if (cashGroup) {
          const newCashRegister = {
            id: id,
            name,
          }
          cashGroup.cashRegisters.push(newCashRegister)
        }
      }
      configurationStore.createConfiguration(settings, id)
    },
  },
})
