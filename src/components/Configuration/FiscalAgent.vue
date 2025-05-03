<template>
  <div>
    <q-expansion-item
      v-for="(fiscal, index) in modelValue.fiscalRegistrators || defaultFiscals"
      :key="fiscal.id || index"
      group="fiscals"
      :label="fiscal.name || `Фискальный регистратор ${index + 1}`"
      :caption="getFiscalCaption(fiscal)"
      header-class="bg-grey-2"
      class="q-mb-sm"
    >
      <div class="q-pa-md">
        <q-input
          filled
          label="Название"
          :model-value="fiscal.name"
          @update:model-value="updateFiscal(index, 'name', $event)"
          class="q-mb-md"
        />

        <div class="row justify-between q-mb-md">
          <q-input
            label="DeviceID"
            :model-value="fiscal.id"
            @update:model-value="updateFiscal(index, 'id', $event)"
            filled
            class="col-grow q-mr-sm"
          />
          <q-btn
            color="primary"
            icon="sync"
            @click="generateuid(index)"
            round
            padding="10px"
          />
        </div>

        <q-select
          filled
          :model-value="fiscal.type"
          @update:model-value="updateFiscal(index, 'type', $event)"
          :options="fiscalOptions"
          label="Тип фискального регистратора"
          class="q-mb-md"
        />

        <q-input
          filled
          :model-value="fiscal.portName"
          @update:model-value="updateFiscal(index, 'portName', $event)"
          label="PortName"
          class="q-mb-md"
        />

        <div class="row justify-end">
          <q-btn
            v-if="(modelValue.fiscalRegistrators || defaultFiscals).length > 1"
            color="red"
            icon="delete"
            @click="removeFiscalRegistrator(index)"
            class="q-mr-sm"
          />
          <q-btn
            v-if="index === (modelValue.fiscalRegistrators || defaultFiscals).length - 1"
            color="green"
            icon="add"
            @click="addFiscalRegistrator"
          />
        </div>
      </div>
    </q-expansion-item>

    <q-btn
      v-if="!modelValue.fiscalRegistrators?.length"
      color="primary"
      icon="add"
      label="Добавить фискальный регистратор"
      @click="addFiscalRegistrator"
      class="full-width q-mt-sm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const fiscalOptions = [
  { label: 'АТОЛ', value: 'atol' },
  { label: 'ШТРИХ', value: 'shtrih' }
]

const defaultFiscals = ref([{
  id: uuidv4(),
  name: '',
  type: null,
  portName: ''
}])

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

if (props.emitAlways) {
  emit('update:modelValue', { ...props.modelValue, fiscalRegistrators: defaultFiscals.value })
}

const getFiscalLabel = (value) => {
  return fiscalOptions.find(opt => opt.value === value)?.label || 'Неизвестный'
}

const getFiscalCaption = (fiscal) => {
  const parts = []
  if (fiscal.type) parts.push(`Тип: ${getFiscalLabel(fiscal.type)}`)
  if (fiscal.portName) parts.push(`Порт: ${fiscal.portName}`)
  return parts.join(' | ') || 'Не настроен'
}

const generateuid = (index) => {
  updateFiscal(index, 'id', uuidv4())
}

const updateFiscal = (index, field, value) => {
  const fiscals = props.modelValue.fiscalRegistrators ? [...props.modelValue.fiscalRegistrators] : [...defaultFiscals.value]
  fiscals[index][field] = value
  emit('update:modelValue', { ...props.modelValue, fiscalRegistrators: fiscals })
}

const addFiscalRegistrator = () => {
  const fiscals = props.modelValue.fiscalRegistrators ? [...props.modelValue.fiscalRegistrators] : [...defaultFiscals.value]
  fiscals.push({
    id: uuidv4(),
    name: '',
    type: null,
    portName: ''
  })
  emit('update:modelValue', { ...props.modelValue, fiscalRegistrators: fiscals })
}

const removeFiscalRegistrator = (index) => {
  const fiscals = props.modelValue.fiscalRegistrators ? [...props.modelValue.fiscalRegistrators] : [...defaultFiscals.value]
  fiscals.splice(index, 1)
  emit('update:modelValue', {
    ...props.modelValue,
    fiscalRegistrators: fiscals.length > 0 ? fiscals : [{
      id: uuidv4(),
      name: '',
      type: null,
      portName: ''
    }]
  })
}
</script>

<style scoped>
.q-expansion-item {
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 4px;
}
</style>
