// stores/configurationStore.js
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid' // Импортируем функцию для генерации UUID

export const useConfigurationStore = defineStore('configuration', {
  state: () => ({
    configurationList: [], // Список конфигураций
    isLoading: false, // Флаг загрузки
    error: null, // Ошибка, если есть
    configuration: null, // Выбранная конфигурация
    isCreateFormVisible: false, // Видимость формы создания
  }),
  actions: {
    // Асинхронный метод для загрузки данных с внешнего сервиса
    async fetchConfigurationList() {
      this.isLoading = true
      this.error = null

      try {
        // Выполняем запрос к внешнему сервису
        const response = await fetch('http://26.15.251.91:6003/api/v0/configuration')

        // Проверяем, что ответ успешный (статус 200-299)
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`)
        }

        // Парсим JSON-ответ
        const data = await response.json()

        // Проверяем, что данные успешно получены
        if (!data.success) {
          throw new Error('Ошибка в данных: ' + data.message)
        }

        this.configurationList = data.data.map((config) => ({
          ...config,
          settings: JSON.parse(config.settings), // Парсим settings
        }))
      } catch (err) {
        this.error = err.message // Сохраняем ошибку
        console.error('Ошибка при загрузке конфигураций:', err)
      } finally {
        this.isLoading = false
      }
    },

    // Установить выбранный элемент
    setConfiguration(newConfiguration) {
      if (!newConfiguration || typeof newConfiguration !== 'object') {
        console.error('Некорректный элемент для выбора')
        return
      }
      this.configuration = newConfiguration
    },

    // Создать новую конфигурацию
    async createConfiguration(newConfiguration) {
      this.isLoading = true
      this.error = null

      try {
        // Генерируем UUID для новой конфигурации
        const id = uuidv4()

        // Добавляем UUID в объект конфигурации
        const configurationWithId = {
          ...newConfiguration,
          id, // Добавляем сгенерированный UUID
        }

        // Отправляем POST-запрос для создания новой конфигурации
        const response = await fetch('http://26.15.251.91:6003/api/v0/configuration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(configurationWithId), // Данные новой конфигурации с UUID
        })

        // Проверяем, что ответ успешный (статус 200-299)
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`)
        }

        // Парсим JSON-ответ
        const data = await response.json()

        // Проверяем, что данные успешно получены
        if (!data.success) {
          throw new Error('Ошибка в данных: ' + data.message)
        }

        // Добавляем новую конфигурацию в список
        this.configurationList.push(data.data)

        // Возвращаем созданную конфигурацию
        return data.data
      } catch (err) {
        this.error = err.message // Сохраняем ошибку
        console.error('Ошибка при создании конфигурации:', err)
        throw err // Пробрасываем ошибку для обработки в компоненте
      } finally {
        this.isLoading = false
      }
    },
    async updateItem(updatedItem) {
      if (!updatedItem || typeof updatedItem !== 'object') {
        console.error('Элемент для обновления не передан или некорректен')
        return
      }

      this.isLoading = true
      this.error = null

      try {
        // Преобразуем настройки в JSON-строку
        const settingsString = JSON.stringify(updatedItem.settings)

        // Отправляем PATCH-запрос для обновления конфигурации
        const response = await fetch(
          `http://26.15.251.91:6003/api/v0/configuration/${updatedItem.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ settings: settingsString }), // Отправляем только settings
          },
        )

        // Проверяем, что ответ успешный (статус 200-299)
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`)
        }

        // Парсим JSON-ответ
        const data = await response.json()

        // Проверяем, что данные успешно получены
        if (!data.success) {
          throw new Error('Ошибка в данных: ' + data.message)
        }

        // Обновляем элемент в списке
        const index = this.configurationList.findIndex((item) => item.id === updatedItem.id)
        if (index !== -1) {
          this.configurationList[index] = updatedItem
        }

        // Обновляем выбранный элемент, если он был изменен
        if (this.configuration && this.configuration.id === updatedItem.id) {
          this.configuration = updatedItem
        }
      } catch (err) {
        this.error = err.message // Сохраняем ошибку
        console.error('Ошибка при обновлении конфигурации:', err)
        throw err // Пробрасываем ошибку для обработки в компоненте
      } finally {
        this.isLoading = false
      }
    },

    // Показать форму создания
    enableCreateFormVisibility() {
      this.isCreateFormVisible = true
    },

    // Скрыть форму создания
    disableCreateFormVisibility() {
      this.isCreateFormVisible = false
    },
  },
  getters: {
    // Геттер для получения отфильтрованного списка (опционально)
    filteredConfigurationList: (state) => (query) => {
      if (!query) return state.configurationList // Если запрос пустой, возвращаем весь список

      return state.configurationList.filter((item) => {
        // Ищем по ID
        const idMatch = item.id.toLowerCase().includes(query.toLowerCase())

        // Ищем по настройкам (если settings — это объект, преобразуем его в строку)
        const settingsMatch = JSON.stringify(item.settings)
          .toLowerCase()
          .includes(query.toLowerCase())

        return idMatch || settingsMatch
      })
    },
  }
})
