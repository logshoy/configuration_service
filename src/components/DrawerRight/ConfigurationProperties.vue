<template>
  <div class="q-pa-md">
    <q-form @submit.prevent="saveChanges">
      <div class="row items-center q-mb-md justify-between">
  <div class="row items-center">
    <q-btn
      type="submit"
      color="primary"
      class="q-mx-md"
      :disabled="!hasChanges"
      icon="save"
      round
    />
    <q-btn
      color="negative"
      icon="delete"
      @click="confirmDelete"
      class="q-mx-md"
      round
    />
    <q-btn
      color="secondary"
      :icon="!showJsonEditor ? 'code' : 'topic'"
      @click="toggleJsonEditor"
      class="q-mx-md"
      round
    />
  </div>

  <q-btn
    color="secondary"
    :icon="!fullScreenConfiguration ? 'open_in_full' : ' close_fullscreen'"
    @click="toggleFullScreen"
    class="q-mx-md"
    round
  />
</div>

      <!-- ID и кнопка копирования на одной линии -->
      <div class="row items-center" v-if="!showJsonEditor">
        <q-input
          v-model="localItem.id"
          label="ID"
          readonly
          outlined
          dense
          class="col-grow q-ma-md"
          hide-bottom-space
        />
        <q-btn
          color="primary"
          icon="content_copy"
          @click="copyToClipboard"
          class="q-ml-md"
          round
        />
      </div>

      <!-- Название конфигурации -->
      <div class="row items-center q-ma-md">
        <q-input
          v-if="!showJsonEditor"
          outlined
          required
          v-model="localItem.settings.configurationName"
          label="Название"
          class="col"
          hide-bottom-space
        />
        <q-icon
          name="help_outline"
          size="sm"
          class="q-ml-sm cursor-help"
        >
          <q-tooltip>
            Название конфигурации
          </q-tooltip>
        </q-icon>
      </div>

      <!-- Уведомление об успешном копировании -->
      <q-dialog v-model="showCopiedNotification" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">Успешно!</div>
          </q-card-section>
          <q-card-section>
            ID скопирован в буфер обмена.
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="OK" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- JSON редактор -->
      <q-card v-if="showJsonEditor" class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Редактор JSON</div>
          <q-input
            v-model="jsonContent"
            type="textarea"
            outlined
            autogrow
            class="q-mt-md"
            @update:model-value="handleJsonChange"
            hide-bottom-space
          />
          <q-banner v-if="jsonError" class="bg-negative text-white q-mt-md">
            {{ jsonError }}
          </q-banner>
        </q-card-section>
      </q-card>

      <!-- Универсальный компонент для настроек -->
      <component
        :is="settingsComponent"
        v-if="settingsComponent && !showJsonEditor"
        v-model="localItem.settings"
        :isCreating="false"
      />
    </q-form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useConfigurationStore } from 'stores/configurationStore'
import { useShopStore } from 'stores/shopStore'
import { useDrawerStore } from 'stores/drawerStore'

import { useQuasar } from 'quasar'
import { validateServiceFiscalization } from 'src/utils/validators.js'
import AppCash from 'components/Configuration/AppCash.vue'
import MainService from 'components/Configuration/Service/MainService.vue'
import GroupCash from 'components/Configuration/GroupCash.vue'
import ShopСompany from 'components/Configuration/ShopСompany.vue'

const $q = useQuasar()
const selectedItemStore = useConfigurationStore()
const shopStore = useShopStore()

const drawerStore = useDrawerStore()



const selectedItem = computed(() => selectedItemStore.configuration)
const localItem = ref(null)
const initialItem = ref(null)
const showCopiedNotification = ref(false)
const showJsonEditor = ref(false)
const jsonContent = ref('')
const jsonError = ref(null)
const hasJsonChanges = ref(false)

const fullScreenConfiguration = computed(() => drawerStore.fullScreenConfiguration);

// Функция для преобразования объекта в JSON (только поле settings)
const toJsonSettingsOnly = (obj) => {
  if (!obj || !obj.settings) return ''
  return JSON.stringify(obj.settings, null, 2)
}

// Определяем, какой компонент настроек использовать
const settingsComponent = computed(() => {
  if (!localItem.value) return null

  switch (localItem.value.settings.configurationType) {
    case 'appCash':
      return AppCash
    case 'service':
      return MainService
    case 'cashGroup':
      return GroupCash
    case 'shop':
      return ShopСompany
    default:
      return null
  }
})

// Отслеживаем изменения выбранного элемента
watch(
  selectedItem,
  (newValue) => {
    if (newValue) {
      localItem.value = JSON.parse(JSON.stringify(newValue))
      initialItem.value = JSON.parse(JSON.stringify(newValue))
      jsonContent.value = toJsonSettingsOnly(localItem.value)
      hasJsonChanges.value = false
    } else {
      localItem.value = null
      initialItem.value = null
      jsonContent.value = ''
    }
  },
  { immediate: true }
)

// Проверка наличия изменений
const hasChanges = computed(() => {
  if (!localItem.value || !initialItem.value) return false
  return JSON.stringify(localItem.value) !== JSON.stringify(initialItem.value) || hasJsonChanges.value
})

// Переключение JSON редактора
const toggleJsonEditor = () => {
  showJsonEditor.value = !showJsonEditor.value
  if (showJsonEditor.value) {
    jsonContent.value = toJsonSettingsOnly(localItem.value)
    hasJsonChanges.value = false
  }
}

// Обработка изменений в JSON
const handleJsonChange = () => {
  try {
    const parsed = JSON.parse(jsonContent.value)
    if (JSON.stringify(parsed) !== JSON.stringify(localItem.value.settings)) {
      hasJsonChanges.value = true
    } else {
      hasJsonChanges.value = false
    }
    jsonError.value = null
  } catch (e) {
    jsonError.value = 'Невалидный JSON: ' + e.message
    hasJsonChanges.value = false
  }
}

// Сохранение изменений
const saveChanges = async () => {
  try {
    // Если есть изменения в JSON, сначала применяем их
    if (hasJsonChanges.value) {
      const parsedSettings = JSON.parse(jsonContent.value)
      localItem.value = {
        ...localItem.value,
        settings: parsedSettings
      }
      hasJsonChanges.value = false
    }

    validateServiceFiscalization(localItem.value.settings)

    // 1. Обновляем конфигурацию в хранилище
    selectedItemStore.updateItem(localItem.value)

    // 2. Если изменилось имя, обновляем его в shopStore
    if (localItem.value.settings.configurationName !== initialItem.value.settings.configurationName) {
      await shopStore.updateNodeName(
        localItem.value.id,
        localItem.value.settings.configurationName
      )
    }

    // 3. Сохраняем текущее состояние как исходное
    initialItem.value = JSON.parse(JSON.stringify(localItem.value))

    $q.notify({
      type: 'positive',
      message: 'Изменения успешно сохранены'
    })
  } catch (err) {
    console.error('Ошибка при сохранении изменений:', err)
    $q.notify({
      type: 'negative',
      message: 'Ошибка при сохранении: ' + err.message
    })
  }
}

// Копирование ID в буфер обмена
const copyToClipboard = async () => {
  if (!localItem.value || !localItem.value.id) {
    $q.notify({
      type: 'negative',
      message: 'ID не найден'
    })
    return
  }

  const textToCopy = localItem.value.id

  // Проверяем, поддерживается ли Clipboard API
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(textToCopy)
      showCopiedNotification.value = true
      return
    } catch (error) {
      console.error('Ошибка при использовании Clipboard API:', error)
    }
  }

  // Fallback: Используем document.execCommand('copy')
  const textArea = document.createElement('textarea')
  textArea.value = textToCopy
  document.body.appendChild(textArea)
  textArea.select()

  try {
    const successful = document.execCommand('copy')
    if (successful) {
      showCopiedNotification.value = true
    } else {
      $q.notify({
        type: 'negative',
        message: 'Не удалось скопировать ID'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Не удалось скопировать ID'
    })
    console.log(error)
  } finally {
    document.body.removeChild(textArea)
  }
}

// Подтверждение удаления
const confirmDelete = () => {
  $q.dialog({
    title: 'Подтверждение удаления',
    message: 'Вы уверены, что хотите удалить этот элемент?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    deleteItem()
  })
}

// Удаление элемента
const deleteItem = async () => {
  if (!localItem.value) {
    console.error('Локальный элемент не определен')
    return
  }

  try {
    const shopStore = useShopStore()
    const success = shopStore.deleteNodeIfEmpty(localItem.value.id)

    if (success) {
      // Дополнительно удаляем конфигурацию из configurationStore
      await selectedItemStore.deleteItem(localItem.value.id)

      $q.notify({
        type: 'positive',
        message: 'Элемент успешно удален'
      })
    } else {
      $q.notify({
        type: 'warning',
        message: 'Нельзя удалить элемент - он содержит вложенные объекты'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Не удалось удалить элемент'
    })
    console.error(error)
  }
}


const toggleFullScreen = () => {
  drawerStore.setfullScreenConfiguration()
};


</script>
