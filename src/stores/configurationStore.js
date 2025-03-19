// stores/configurationStore.js
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

// Константы для API
const API_BASE_URL = 'http://26.15.251.91:6003/api/v0/configuration'

export const useConfigurationStore = defineStore('configuration', {
  state: () => ({
    configurationList: [], // Список конфигураций
    isLoading: false, // Флаг загрузки
    error: null, // Ошибка, если есть
    configuration: null, // Выбранная конфигурация
    isCreateFormVisible: false, // Видимость формы создания
    typeCreateConfigutation: ''
  }),
  actions: {
    // Общая функция для обработки запросов
    async _fetchData(url, options = {}) {
      this.isLoading = true
      this.error = null

      try {
        const response = await fetch(url, options)
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`)
        }
        const data = await response.json()
        if (!data.success) {
          throw new Error('Ошибка в данных: ' + data.message)
        }
        return data.data
      } catch (err) {
        this.error = err.message
        console.error('Ошибка при выполнении запроса:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    // Загрузка списка конфигураций
    async fetchConfigurationList() {
      const data = await this._fetchData(API_BASE_URL)
      this.configurationList = data.map((config) => ({
        ...config,
        settings: JSON.parse(config.settings), // Парсим settings
      }))
    },

    // Установить выбранный элемент
    setConfiguration(newConfiguration) {
      this.configuration = newConfiguration
      console.log(this.configuration)
    },

    // Создать новую конфигурацию
    async createConfiguration(settings) {
      const id = uuidv4() // Генерируем UUID
      const newConfiguration = {
        id,
        settings: JSON.stringify(settings),
      }

      const data = await this._fetchData(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfiguration),
      })

      const configurationPinia = {
        id,
        settings,
      }

      this.configurationList.push(configurationPinia)
      return data
    },

    // Обновить конфигурацию
    async updateItem(updatedItem) {
      if (!updatedItem || typeof updatedItem !== 'object') {
        console.error('Элемент для обновления не передан или некорректен')
        return
      }

      const settingsString = JSON.stringify(updatedItem.settings)
      const data = await this._fetchData(`${API_BASE_URL}/${updatedItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsString }),
      })

      // Обновляем элемент в списке
      const index = this.configurationList.findIndex((item) => item.id === updatedItem.id)
      if (index !== -1) {
        this.configurationList[index] = updatedItem
      }

      // Обновляем выбранный элемент, если он был изменен
      if (this.configuration && this.configuration.id === updatedItem.id) {
        this.configuration = updatedItem
      }

      return data
    },

    async deleteItem(id) {
      await this._fetchData(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      })

      // Удаляем элемент из списка
      this.configurationList = this.configurationList.filter((item) => item.id !== id)

      // Сбрасываем выбранный элемент, если он был удален
      if (this.configuration && this.configuration.id === id) {
        this.configuration = null
      }
    },

    // Форма создания
    enableCreateFormVisibility(type) {
      this.isCreateFormVisible = true
      this.typeCreateConfigutation = type
      console.log(this.typeCreateConfigutation)
    },

    // Скрыть форму создания
    disableCreateFormVisibility() {
      this.isCreateFormVisible = false
    },
  },
  getters: {
    // Геттер для получения отфильтрованного списка
    filteredConfigurationList: (state) => (query) => {
      if (!query) return state.configurationList

      return state.configurationList.filter((item) => {
        const idMatch = item.id.toLowerCase().includes(query.toLowerCase())
        const settingsMatch = JSON.stringify(item.settings)
          .toLowerCase()
          .includes(query.toLowerCase())
        return idMatch || settingsMatch
      })
    },
  },
})
