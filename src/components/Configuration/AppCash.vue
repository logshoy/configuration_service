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
  },
  emitAlways: {
    type: Boolean,
    default: false
  }
})


const emit = defineEmits(['update:modelValue'])

const mergedValues = computed(() => mergeSizeColorDefaults(props.modelValue))

if (props.emitAlways) { // Условный эмит
  emit('update:modelValue', mergedValues.value)
}

// Получаем списки агентов (восстановленная часть)
const filteredList = computed(() =>
  selectedItemStore.typeFilteredConfigurationListService('agentFiscalization', 'serviceFiscalization')
)

const filteredListAgentPayment = computed(() =>
  selectedItemStore.typeFilteredConfigurationListService('agentPayment')
)

const filteredListAgentDevice = computed(() =>
  selectedItemStore.typeFilteredConfigurationListService('agentDevice')
)

const updateModel = (newValues) => {
  const fullDefaults = mergeSizeColorDefaults({})
  const currentModel = props.modelValue || {}

  const updated = {
    ...fullDefaults,
    ...currentModel,
    ...newValues,
    agents: {
      ...fullDefaults.agents,
      ...currentModel.agents,
      ...(newValues.agents || {})
    }
  }

  const currentWithDefaults = mergeSizeColorDefaults(currentModel)
  if (isEqual(currentWithDefaults, updated)) return

  emit('update:modelValue', updated)
}

const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)

const updateField = (key, value) => {
  let processedValue = value

  if (['width', 'height'].includes(key)) {
    processedValue = Number(value)
    if (isNaN(processedValue)) return
  }

  if (mergedValues.value[key] === processedValue) return
  updateModel({ [key]: processedValue })
}

const updateAgentField = (key, value) => {
  if (mergedValues.value.agents[key] === value) return
  updateModel({ agents: { [key]: value } })
}
</script>
