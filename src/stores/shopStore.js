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
      let sourceShop = null;
      let sourceGroup = null;

      for (const shop of this.shops) {
        for (const group of shop.cashGroups) {
          const registerExists = group.cashRegisters.some(cr => cr.id === cashRegisterId);
          if (registerExists) {
            sourceShop = shop;
            sourceGroup = group;
            break;
          }
        }
        if (sourceGroup) break;
      }

      if (!sourceShop || !sourceGroup) {
        console.error('Исходная группа не найдена');
        return false;
      }

      // 2. Находим целевую группу (в любом магазине)
      let targetShop = null;
      let targetGroup = null;

      for (const shop of this.shops) {
        targetGroup = shop.cashGroups.find(group => group.id === targetGroupId);
        if (targetGroup) {
          targetShop = shop;
          break;
        }
      }

      if (!targetGroup) {
        console.error('Целевая группа не найдена');
        return false;
      }

      // 3. Находим и перемещаем кассу
      const registerIndex = sourceGroup.cashRegisters.findIndex(cr => cr.id === cashRegisterId);
      if (registerIndex === -1) {
        console.error('Касса не найдена в исходной группе');
        return false;
      }

      const [movedRegister] = sourceGroup.cashRegisters.splice(registerIndex, 1);

      // Обновляем ссылки у кассы
      movedRegister.shopId = targetShop.id;
      movedRegister.cashGroupId = targetGroup.id;

      targetGroup.cashRegisters.push(movedRegister);

      // 4. Обновляем конфигурацию кассы
      const configurationStore = useConfigurationStore();
      const cashRegisterConfig = configurationStore.getConfiguration(cashRegisterId);

      if (cashRegisterConfig) {
        // Создаем обновленную конфигурацию
        const updatedConfig = {
          ...cashRegisterConfig,
          settings: {
            ...cashRegisterConfig.settings,
            node: targetGroup.id // Обновляем node в настройках
          }
        };

        // Вызываем updateItem для обновления конфигурации
        configurationStore.updateItem(updatedConfig);
      }

      this.persistState();
      console.log('Успешно перемещено', {
        from: { shopId: sourceShop.id, groupId: sourceGroup.id },
        to: { shopId: targetShop.id, groupId: targetGroup.id }
      });
      return true;
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
      const configurationStore = useConfigurationStore()
      const group = this.findCashGroupById(groupId)

      if (group) {
        // Генерируем новый ID один раз
        const newId = uuidv4()

        // Создаем копию кассы с новым ID
        const newCashRegister = {
          ...cashData,
          id: newId,
        }

        group.cashRegisters.push(newCashRegister)

        // Создаем конфигурацию с тем же ID

        console.log(cashData)
        cashData.settings.settings.configurationName = cashData.name

        configurationStore.createConfiguration(
          {
            ...cashData.settings.settings,
          },
          newId,
        )

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
