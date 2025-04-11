<template>
  <div>
    <q-select
      v-if="isCreating"
      filled
      class="q-ma-md"
      v-model="selectedServiceType"
      :options="options"
      label="Тип конфигурации"
      @update:model-value="handleServiceChange"
    />

    <component
      :is="activeComponent"
      v-if="activeComponent"
      :modelValue="modelValue"
      @update:modelValue="handleModelUpdate"
      :configurationService="selectedServiceType"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import FiscalAgent from 'components/Configuration/FiscalAgent.vue';
import PaymentAgent from 'components/Configuration/Service/PaymentAgent.vue';
import AgentDevice from 'components/Configuration/Service/AgentDevice.vue';
import ServiceFiscalization from 'components/Configuration/Service/ServiceFiscalization.vue';

const options = ref([
  { label: 'Агент оплат', value: 'agentPayment' },
  { label: 'Агент фискализации', value: 'agentFiscalization' },
  { label: 'Агент оборудования', value: 'agentDevice' },
  { label: 'Сервис фискализации', value: 'serviceFiscalization' }
]);

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  isCreating: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'update:configurationService']);

const serviceComponents = {
  agentFiscalization: FiscalAgent,
  agentPayment: PaymentAgent,
  agentDevice: AgentDevice,
  serviceFiscalization: ServiceFiscalization
};

const selectedServiceType = ref(props.modelValue.serviceType);

console.log(props.modelValue)

const activeComponent = computed(() => {
  return selectedServiceType.value?.value
    ? serviceComponents[selectedServiceType.value.value]
    : null;
});

const handleServiceChange = (newValue) => {
  selectedServiceType.value = newValue;
  emit('update:configurationService', newValue);
  // Сброс модели при изменении типа сервиса
  emit('update:modelValue', { });
};

const handleModelUpdate = (newValue) => {
  emit('update:modelValue', newValue);
};
</script>
