<template>
  <div>
    <!-- Поля размеров -->
    <div class="row items-center q-ma-md">
      <q-input
        class="col"
        :model-value="mergedValues.width"
        @update:model-value="updateField('width', $event)"
        label="Ширина"
        type="number"
        outlined
        required
        :min="sizeColorSettingsConfig.dimensions.width.min"
        :max="sizeColorSettingsConfig.dimensions.width.max"
      />
      <q-icon
        name="help_outline"
        size="sm"
        class="q-ml-sm cursor-help"
      >
        <q-tooltip>
          Минимальная ширина: {{ sizeColorSettingsConfig.dimensions.width.min }},
          Максимальная ширина: {{ sizeColorSettingsConfig.dimensions.width.max }}
        </q-tooltip>
      </q-icon>
    </div>

    <div class="row items-center q-ma-md">
      <q-input
        class="col"
        :model-value="mergedValues.height"
        @update:model-value="updateField('height', $event)"
        label="Высота"
        type="number"
        outlined
        required
        :min="sizeColorSettingsConfig.dimensions.height.min"
        :max="sizeColorSettingsConfig.dimensions.height.max"
      />
      <q-icon
        name="help_outline"
        size="sm"
        class="q-ml-sm cursor-help"
      >
        <q-tooltip>
          Минимальная высота: {{ sizeColorSettingsConfig.dimensions.height.min }},
          Максимальная высота: {{ sizeColorSettingsConfig.dimensions.height.max }}
        </q-tooltip>
      </q-icon>
    </div>

    <!-- Поле цвета -->
    <div class="row items-center q-ma-md">
      <q-input
        class="col"
        filled
        :model-value="mergedValues.color"
        @update:model-value="updateField('color', $event)"
        label="Цвет"
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
      <q-icon
        name="help_outline"
        size="sm"
        class="q-ml-sm cursor-help"
      >
        <q-tooltip>
          Выберите цвет из палитры или введите HEX-код цвета
        </q-tooltip>
      </q-icon>
    </div>

    <!-- Секция агентов -->
    <q-expansion-item expand-separator icon="support_agent" label="Агенты">
      <div class="row items-center q-ma-md">
        <q-select
          class="col"
          filled
          :model-value="mergedValues.agents.fiscalAgent"
          :options="filteredList"
          label="Агент ФР"
          @update:model-value="updateAgentField('fiscalAgent', $event)"
          emit-value
          map-options
        />
        <q-icon
          name="help_outline"
          size="sm"
          class="q-ml-sm cursor-help"
        >
          <q-tooltip>
            Выберите агента для фискальных операций
          </q-tooltip>
        </q-icon>
      </div>

      <div class="row items-center q-ma-md">
        <q-select
          class="col"
          filled
          :model-value="mergedValues.agents.agentPayment"
          :options="filteredListAgentPayment"
          label="Агент оплат"
          @update:model-value="updateAgentField('agentPayment', $event)"
          emit-value
          map-options
        />
        <q-icon
          name="help_outline"
          size="sm"
          class="q-ml-sm cursor-help"
        >
          <q-tooltip>
            Выберите агента для обработки платежей
          </q-tooltip>
        </q-icon>
      </div>

      <div class="row items-center q-ma-md">
        <q-select
          class="col"
          filled
          :model-value="mergedValues.agents.agentDevice"
          :options="filteredListAgentDevice"
          label="Агент оборудования"
          @update:model-value="updateAgentField('agentDevice', $event)"
          emit-value
          map-options
        />
        <q-icon
          name="help_outline"
          size="sm"
          class="q-ml-sm cursor-help"
        >
          <q-tooltip>
            Выберите агента для управления оборудованием
          </q-tooltip>
        </q-icon>
      </div>
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

if (props.emitAlways) {
  emit('update:modelValue', mergedValues.value)
}

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

<style scoped>
.cursor-help {
  cursor: help;
}
</style>
