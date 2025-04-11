<template>
  <div>
    <div
      v-for="(fiscal, index) in mergedFiscals"
      :key="fiscal.id"
      class="q-ma-md"
    >
      <div class="row justify-between q-my-md">
        <q-input
          label="DeviceID"
          :model-value="fiscal.id"
          @update:model-value="updateFiscal(index, 'id', $event)"
          filled
          class="q-mx-xs"
        />
        <q-btn
          color="primary"
          icon="sync"
          @click="generateuid(index)"
          round
          padding="10px 10px"
          class="q-my-xs"
        />
      </div>

      <q-select
        filled
        :model-value="fiscal.type"
        @update:model-value="updateFiscal(index, 'type', $event)"
        :options="fiscalOptions"
        label="Тип фискального регистратора"
      />

      <q-input
        filled
        :model-value="fiscal.portName"
        @update:model-value="updateFiscal(index, 'portName', $event)"
        label="PortName"
        class="q-mt-md"
      />

      <div class="row q-mt-md">
        <q-btn
          v-if="index === mergedFiscals.length - 1"
          color="green"
          @click="addFiscalRegistrator"
          label="Добавить"
        />
        <q-btn
          v-if="mergedFiscals.length > 1"
          color="red"
          class="q-ml-md"
          @click="removeFiscalRegistrator(index)"
          label="Удалить"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { mergeFiscalDefaults } from 'src/utils/config/settingsConfigAgentFiscal.js'
import { v4 as uuidv4 } from 'uuid'

const fiscalOptions = [
  { label: 'АТОЛ', value: 'atol' },
  { label: 'ШТРИХ', value: 'shtrih' }
]

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const mergedFiscals = computed(() => {
  return mergeFiscalDefaults(props.modelValue).fiscalRegistrators
})

const generateuid = (index) => {
  updateFiscal(index, 'id', uuidv4())
}

const updateFiscal = (index, field, value) => {
  const updated = [...mergedFiscals.value]
  updated[index][field] = value
  emitUpdate(updated)
}

const addFiscalRegistrator = () => {
  const updated = [...mergedFiscals.value, { id: null, type: null, portName: '' }]
  emitUpdate(updated)
}

const removeFiscalRegistrator = (index) => {
  const updated = mergedFiscals.value.filter((_, i) => i !== index)
  emitUpdate(updated.length > 0 ? updated : [{ id: uuidv4(), type: null, portName: '' }])
}

const emitUpdate = (fiscals) => {
  emit('update:modelValue', { fiscalRegistrators: fiscals })
}
</script>
