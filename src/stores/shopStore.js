// stores/shopStore.js
import { defineStore } from 'pinia'

export const useShopStore = defineStore('shop', {
  state: () => ({
    shops: [
      {
        id: 'shop1',
        name: 'Магазин №1',
        cashGroups: [
          {
            id: 'group1',
            name: 'Группа касс 1',
            cashRegisters: [
              { id: 'cash1-group1-shop1', name: 'Касса 1' },
              { id: 'cash2-group1-shop1', name: 'Касса 2' },
            ],
          },
        ],
      },
      {
        id: 'shop2',
        name: 'Магазин №1',
        cashGroups: [
          {
            id: 'group2',
            name: 'Группа касс 1',
            cashRegisters: [
              { id: 'cash1-group1-shop2', name: 'Касса 1' },
              { id: 'cash2-group1-shop2', name: 'Касса 2' },
            ],
          },
        ],
      },
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
    addShop(name) {
      const newShop = {
        id: `shop${this.shops.length + 1}`,
        name,
        cashGroups: [],
      }
      this.shops.push(newShop)
    },
    addCashGroup(shopId, name) {
      const shop = this.shops.find((s) => s.id === shopId)
      if (shop) {
        const newCashGroup = {
          id: `group${shop.cashGroups.length + 1}`,
          name,
          cashRegisters: [],
        }
        shop.cashGroups.push(newCashGroup)
      }
    },
    addCashRegister(shopId, cashGroupId, name) {
      console.log('добавляю', shopId, cashGroupId, name)
      const shop = this.shops.find((s) => s.id === shopId)
      if (shop) {
        const cashGroup = shop.cashGroups.find((g) => g.id === cashGroupId)
        if (cashGroup) {
          const newCashRegister = {
            id: `cash${cashGroup.cashRegisters.length + 1}-${cashGroupId}-${shopId}`,
            name,
          }
          cashGroup.cashRegisters.push(newCashRegister)
        }
      }
    },
  },
})
