// stores/configurationStore.js
import { defineStore } from 'pinia'

export const useConfigurationStore = defineStore('configuration', {
  state: () => ({
    configurationList: [
      {
        id: 1000398,
        code: 132,
        name: 'dsfadsCoffee-toffee 300 мл',
      },
      {
        id: 1000399,
        code: 133,
        name: 'Coffee-toffee 500 мл',
      },
      {
        id: 1000396,
        code: 130,
        name: 'Toffee 300 мл',
      },
      {
        id: 1000397,
        code: 131,
        name: 'Toffee 500 мл',
      },
      {
        id: 1000394,
        code: 128,
        name: 'Гибкскус. прямые ягоды. специи 300 мл',
      },
      {
        id: 1000395,
        code: 129,
        name: 'Гибкскус. прямые ягоды. специи 500 мл',
      },
      // Убедитесь, что id уникальны и нет дубликатов
    ],

    configuration: null, // Выбранный элемент
  }),
  actions: {
    // Установить выбранный элемент
    setConfiguration(newConfiguration) {
      if (!newConfiguration || typeof newConfiguration !== 'object') {
        console.error('Некорректный элемент для выбора')
        return
      }
      this.configuration = newConfiguration
    },

    // Обновить элемент в списке
    updateItem(updatedItem) {
      if (!updatedItem || typeof updatedItem !== 'object') {
        console.error('Элемент для обновления не передан или некорректен')
        return
      }

      const index = this.configurationList.findIndex((item) => item.id === updatedItem.id)
      if (index === -1) {
        console.error('Элемент с таким ID не найден')
        return
      }

      // Обновляем элемент в списке
      this.configurationList[index] = updatedItem

      // Обновляем выбранный элемент, если он был изменен
      if (this.configuration && this.configuration.id === updatedItem.id) {
        this.configuration = updatedItem
      }
    },
  },
})
