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
    dialogCreate: false,
    typeCreateConfigutation: '',
    showAllConfiguration: false,
    selectedServiceType: null,
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
      this.configurationList = data // Предполагаем, что сервер возвращает уже готовые объекты
    },

    // Установить выбранный элемент
    setConfiguration(id) {
      if (!this.isCreateFormVisible) {
        if (id != null) {
          this.configuration = this.configurationList.find((item) => item.id === id)
        } else {
          this.configuration = null
        }
      } else {
        this.dialogCreate = true
      }
    },

    setSelectedServiceType(type) {
      this.selectedServiceType = type
    },

    // Создать новую конфигурацию
    async createConfiguration(settings, id = null) {
      if (!id) {
        id = uuidv4()
      }

      let newConfiguration = {
        id,
        settings, // Отправляем объект напрямую, без преобразования в строку
      }

      const data = await this._fetchData(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfiguration), // Здесь все равно нужно преобразование для отправки
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

      const data = await this._fetchData(`${API_BASE_URL}/${updatedItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: updatedItem.settings }), // Преобразование только для отправки
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
    },

    // Скрыть форму создания
    disableCreateFormVisibility() {
      this.isCreateFormVisible = false
    },

    toggleViewMode() {
      this.showAllConfiguration = !this.showAllConfiguration
      console.log()
    },

    disableDialogCreate() {
      this.dialogCreate = false
    },
  },
  getters: {
    // Геттер для получения отфильтрованного списка
    filteredConfigurationList:
  (state) =>
  ({ query = null, nodeId = null, serviceType = null }) => {
    let result = [...state.configurationList]

    if (!state.showAllConfiguration) {
      if (nodeId == null) return []
      result = result.filter((item) => item.settings.node == nodeId)
    }

    if (query?.trim()) {
      const searchTerm = query.toLowerCase()
      result = result.filter((item) => {
        const idMatch = item.id.toLowerCase().includes(searchTerm)
        const nameMatch = item.settings?.configurationName?.toLowerCase().includes(searchTerm)
        return idMatch || nameMatch
      })
    }

    if (serviceType !== null) {
      const typeValue = typeof serviceType === 'object' ? serviceType.value : serviceType
      result = result.filter((item) => item.settings?.serviceType?.value === typeValue)
    }

    return result
  },

    // Геттер для получения отфильтрованного списка по типу
    typeFilteredConfigurationListService:
      (state) =>
      (...types) => {
        // Если не передано ни одного типа или передан пустой массив/undefined
        if (!types || types.length === 0) {
          return state.configurationList.map((item) => ({
            id: item.id,
            configurationName: item.settings?.configurationName,
          }))
        }

        return state.configurationList
          .filter((item) => types.includes(item.settings?.serviceType?.value))
          .map((item) => ({
            value: item.id,
            label: item.settings?.configurationName,
          }))
      },

    typeFilteredConfigurationListServiceApp: (state) => (type) => {
      if (!type) {
        return state.configurationList.map((item) => ({
          id: item.id,
          configurationName: item.settings?.configurationName,
        }))
      }

      return state.configurationList
        .filter((item) => {
          return item.settings?.configurationType === type
        })
        .map((item) => ({
          value: item.id,
          label: item.settings?.configurationName,
        }))
    },

    getConfiguration: (state) => (id) => {
      return state.configurationList.find((item) => item.id === id) || null
    },

    getShowAllConfiguration: (state) => state.showAllConfiguration,
  },
})
