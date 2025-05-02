<template>
  <div>
    <div
      v-for="(fiscal, index) in modelValue.fiscalRegistrators || defaultFiscals"
      :key="fiscal.id || index"
      class="q-ma-md"
    >
      <div class="row justify-between q-my-md">
        <q-input
          label="DeviceID"
          :model-value="fiscal.id"
          @update:model-value="updateFiscal(index, 'id', $event)"
          filled
          class="q-mx-xs input"
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
          v-if="index === (modelValue.fiscalRegistrators || defaultFiscals).length - 1"
          color="green"
          @click="addFiscalRegistrator"
          label="Добавить"
        />
        <q-btn
          v-if="(modelValue.fiscalRegistrators || defaultFiscals).length > 1"
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
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const fiscalOptions = [
  { label: 'АТОЛ', value: 'atol' },
  { label: 'ШТРИХ', value: 'shtrih' }
]

const defaultFiscals = ref([{ id: null, type: null, portName: '' }])

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

if (props.emitAlways) { // Условный эмит
   emit('update:modelValue',  { ...props.modelValue, fiscalRegistrators: defaultFiscals })
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
  fiscals.push({ id: null, type: null, portName: '' })
  emit('update:modelValue', { ...props.modelValue, fiscalRegistrators: fiscals })
}

const removeFiscalRegistrator = (index) => {
  const fiscals = props.modelValue.fiscalRegistrators ? [...props.modelValue.fiscalRegistrators] : [...defaultFiscals.value]
  fiscals.splice(index, 1)
  emit('update:modelValue', {
    ...props.modelValue,
    fiscalRegistrators: fiscals.length > 0 ? fiscals : [{ id: uuidv4(), type: null, portName: '' }]
  })
}
</script>

<style scoped>

.input{
  width: 90wh;
}

</style>
