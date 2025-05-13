<template>
  <div>
    <div
      v-for="(agent, index) in modelValue.paymentAgents || defaultAgents"
      :key="agent.id || index"
      class="q-ma-md"
    >
      <!-- DeviceID и генерация -->
      <div class="row items-center q-my-md">
        <q-input
          label="DeviceID"
          :model-value="agent.id"
          @update:model-value="updateAgent(index, 'id', $event)"
          filled
          class="col"
        />
        <q-icon
          name="help_outline"
          size="sm"
          class="q-ml-sm cursor-help"
        >
          <q-tooltip>Идентификатор устройства. Уникален для каждого агента.</q-tooltip>
        </q-icon>
        <q-btn
          color="primary"
          icon="sync"
          @click="generateUid(index)"
          round
          padding="10px 10px"
          class="q-my-xs q-ml-md"
        />
      </div>

      <!-- Тип платежного агента -->
      <div class="row items-center q-mb-md">
        <q-select
          filled
          :model-value="agent.type"
          @update:model-value="updateAgent(index, 'type', $event)"
          :options="agentOptions"
          label="Тип платежного агента"
          class="col"
        />
        <q-icon
          name="help_outline"
          size="sm"
          class="q-ml-sm cursor-help"
        >
          <q-tooltip>Выберите тип подключаемого платежного агента (например, Inpas или Сбербанк).</q-tooltip>
        </q-icon>
      </div>

      <!-- Номер терминала -->
      <div class="row items-center q-mb-md">
        <q-input
          filled
          :model-value="agent.terminalNumber"
          @update:model-value="updateAgent(index, 'terminalNumber', $event)"
          label="Номер терминала"
          class="col"
        />
        <q-icon
          name="help_outline"
          size="sm"
          class="q-ml-sm cursor-help"
        >
          <q-tooltip>Уникальный номер терминала, присвоенный банком или системой.</q-tooltip>
        </q-icon>
      </div>

      <!-- COM порт -->
      <div class="row items-center q-mb-md">
        <q-input
          filled
          :model-value="agent.comPort"
          @update:model-value="updateAgent(index, 'comPort', $event)"
          label="COM порт"
          class="col"
        />
        <q-icon
          name="help_outline"
          size="sm"
          class="q-ml-sm cursor-help"
        >
          <q-tooltip>Порт подключения терминала (например, COM3).</q-tooltip>
        </q-icon>
      </div>

      <!-- Кнопки -->
      <div class="row q-mt-md">
        <q-btn
          v-if="index === (modelValue.paymentAgents || defaultAgents).length - 1"
          color="green"
          @click="addPaymentAgent"
          label="Добавить"
        />
        <q-btn
          v-if="(modelValue.paymentAgents || defaultAgents).length > 1"
          color="red"
          class="q-ml-md"
          @click="removePaymentAgent(index)"
          label="Удалить"
        />
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const agentOptions = [
  { label: 'Inpas', value: 'inpas' },
  { label: 'SberBank', value: 'sberbank' }
]

const defaultAgents = ref([{
  id: null,
  type: null,
  terminalNumber: '',
  comPort: ''
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

if (props.emitAlways) { // Условный эмит
  emit('update:modelValue',  { ...props.modelValue, paymentAgents: defaultAgents })
}

const generateUid = (index) => {
  updateAgent(index, 'id', uuidv4())
}

const updateAgent = (index, field, value) => {
  const agents = props.modelValue.paymentAgents ? [...props.modelValue.paymentAgents] : [...defaultAgents.value]
  agents[index][field] = value
  emit('update:modelValue', { ...props.modelValue, paymentAgents: agents })
}

const addPaymentAgent = () => {
  const agents = props.modelValue.paymentAgents ? [...props.modelValue.paymentAgents] : [...defaultAgents.value]
  agents.push({ id: null, type: null, terminalNumber: '', comPort: '' })
  emit('update:modelValue', { ...props.modelValue, paymentAgents: agents })
}

const removePaymentAgent = (index) => {
  const agents = props.modelValue.paymentAgents ? [...props.modelValue.paymentAgents] : [...defaultAgents.value]
  agents.splice(index, 1)
  emit('update:modelValue', {
    ...props.modelValue,
    paymentAgents: agents.length > 0 ? agents : [{ id: uuidv4(), type: null, terminalNumber: '', comPort: '' }]
  })
}
</script>
