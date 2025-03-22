// stores/shopStore.js
import { defineStore } from 'pinia'
import { useConfigurationStore } from './configurationStore'
import { v4 as uuidv4 } from 'uuid'

export const useShopStore = defineStore('shop', {
  state: () => ({
    shops: [
       {
        id: '8a564c6d-cba7-4ec0-ac19-9a6ebe365a32',
        name: 'Магазин №1',
        cashGroups: [
          // {
          //   id: 'group1',
          //   name: 'Группа касс 1',
          //   cashRegisters: [
          //     { id: 'cash1-group1-shop1', name: 'Касса 1' },
          //     { id: 'cash2-group1-shop1', name: 'Касса 2' },
          //   ],
          // },
        ],
      },
      // {
      //   id: 'shop2',
      //   name: 'Магазин №1',
      //   cashGroups: [
      //     {
      //       id: 'group2',
      //       name: 'Группа касс 1',
      //       cashRegisters: [
      //         { id: 'cash1-group1-shop2', name: 'Касса 1' },
      //         { id: 'cash2-group1-shop2', name: 'Касса 2' },
      //       ],
      //     },
      //   ],
      // },
    ],
  }),
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
