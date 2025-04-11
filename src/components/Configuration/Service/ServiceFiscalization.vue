<template>
  <div>
    <q-checkbox
      v-model="mergedValues.localUniqueCashMode"
      label="Одна касса один агент"
      class="q-mb-md"
      @update:model-value="updateField('localUniqueCashMode', $event)"
    />

    <div
      v-for="(pair, index) in mergedValues.settingCashToAgentFiscalization"
      :key="index"
      class="q-ma-md"
    >
      <q-select
        class="q-mt-md"
        filled
        :model-value="pair.appCash"
        :options="filteredListCash"
        label="Касса"
        @update:model-value="updateCashAgentPair(index, 'appCash', $event)"
        emit-value
        map-options
      />

      <q-select
        class="q-mt-md"
        filled
        :model-value="pair.fiscalAgent"
        :options="filteredListFiscalAgent"
        label="Агент ФР"
        @update:model-value="updateCashAgentPair(index, 'fiscalAgent', $event)"
        emit-value
        map-options
      />

      <div class="row q-mt-md">
        <q-btn
          v-if="index === mergedValues.settingCashToAgentFiscalization.length - 1"
          color="green"
          @click="handleAddPair"
          label="Добавить"
        />
        <q-btn
          v-if="mergedValues.settingCashToAgentFiscalization.length > 1"
          color="red"
          class="q-ml-md"
          @click="handleRemovePair(index)"
          label="Удалить"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useConfigurationStore } from 'stores/configurationStore'
import {
  mergeSettingsConfigServiceFiscalDefaults,
  useCashAgentHelpers
} from '/src/utils/config/settingsConfigServiceFiscal.js'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  configurationService: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])
const selectedItemStore = useConfigurationStore()
const { addPair, removePair } = useCashAgentHelpers()

// Применяем дефолтные значения
const mergedValues = computed(() => mergeSettingsConfigServiceFiscalDefaults(props.modelValue))

// Получаем списки для выбора
const filteredListFiscalAgent = computed(() =>
  selectedItemStore.typeFilteredConfigurationListService('agentFiscalization')
)

const filteredListCash = computed(() =>
  selectedItemStore.typeFilteredConfigurationListServiceApp('appCash')
)

// Обновление значений
const updateField = (key, value) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const updateCashAgentPair = (index, field, value) => {
  const updated = [...mergedValues.value.settingCashToAgentFiscalization]
  updated[index][field] = value
  updateField('settingCashToAgentFiscalization', updated)
}

const handleAddPair = () => {
  const updated = addPair(mergedValues.value.settingCashToAgentFiscalization)
  updateField('settingCashToAgentFiscalization', updated)
}

const handleRemovePair = (index) => {
  const updated = removePair(mergedValues.value.settingCashToAgentFiscalization, index)
  updateField('settingCashToAgentFiscalization', updated)
}
</script>
