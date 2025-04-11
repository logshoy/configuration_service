<template>
  <div>
    <!-- Поля размеров -->
    <q-input
      class="q-ma-md"
      :model-value="mergedValues.width"
      @update:model-value="updateField('width', $event)"
      label="Ширина"
      type="number"
      outlined
      required
      :min="sizeColorSettingsConfig.dimensions.width.min"
      :max="sizeColorSettingsConfig.dimensions.width.max"
    />

    <q-input
      class="q-ma-md"
      :model-value="mergedValues.height"
      @update:model-value="updateField('height', $event)"
      label="Высота"
      type="number"
      outlined
      required
      :min="sizeColorSettingsConfig.dimensions.height.min"
      :max="sizeColorSettingsConfig.dimensions.height.max"
    />

    <!-- Поле цвета -->
    <q-input
      class="q-ma-md"
      filled
      :model-value="mergedValues.color"
      @update:model-value="updateField('color', $event)"
      hint="Цвет"
    >
      <template v-slot:append>
        <q-icon name="colorize" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-color
              :model-value="mergedValues.color"
              @update:model-value="updateField('color', $event)"
            />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <!-- Секция агентов -->
    <q-expansion-item expand-separator icon="support_agent" label="Агенты">
      <q-select
        filled
        class="q-ma-md"
        :model-value="mergedValues.agents.fiscalAgent"
        :options="filteredList"
        label="Агент ФР"
        @update:model-value="updateAgentField('fiscalAgent', $event)"
        emit-value
        map-options
      />

      <q-select
        filled
        class="q-ma-md"
        :model-value="mergedValues.agents.agentPayment"
        :options="filteredListAgentPayment"
        label="Агент оплат"
        @update:model-value="updateAgentField('agentPayment', $event)"
        emit-value
        map-options
      />

      <q-select
        filled
        class="q-ma-md"
        :model-value="mergedValues.agents.agentDevice"
        :options="filteredListAgentDevice"
        label="Агент оборудования"
        @update:model-value="updateAgentField('agentDevice', $event)"
        emit-value
        map-options
      />
    </q-expansion-item>
  </div>
</template>



<script setup>
import { computed } from 'vue'
import { useConfigurationStore } from 'stores/configurationStore'
import { mergeSizeColorDefaults, settingsConfigAppCash } from '/src/utils/config/settingsConfigAppCash.js'

const selectedItemStore = useConfigurationStore()

const sizeColorSettingsConfig = settingsConfigAppCash

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

// Применяем дефолтные значения
const mergedValues = computed(() => mergeSizeColorDefaults(props.modelValue))

// Получаем списки агентов
const filteredList = computed(() =>
  selectedItemStore.typeFilteredConfigurationListService('agentFiscalization', 'serviceFiscalization')
)

const filteredListAgentPayment = computed(() =>
  selectedItemStore.typeFilteredConfigurationListService('agentPayment')
)

const filteredListAgentDevice = computed(() =>
  selectedItemStore.typeFilteredConfigurationListService('agentDevice')
)

// Универсальный метод обновления
const updateModel = (newValues) => {
  // Получаем полный объект с дефолтами
  const fullDefaults = mergeSizeColorDefaults({})

  // Сливаем текущие значения, новые значения и дефолты
  const updated = {
    ...fullDefaults,
    ...props.modelValue,
    ...newValues,
    agents: {
      ...fullDefaults.agents,
      ...props.modelValue?.agents,
      ...newValues.agents
    }
  }

  emit('update:modelValue', updated)
}

// Обновляем простые поля
const updateField = (key, value) => {
  updateModel({ [key]: value })
}

// Обновляем вложенные поля агентов
const updateAgentField = (key, value) => {
  updateModel({
    agents: {
      [key]: value
    }
  })
}
</script>
