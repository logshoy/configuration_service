Не сработало исправь

<template>
  <div>
    <q-select
      v-if="isCreating"
      filled
      class="q-ma-md"
      v-model="localConfigurationService"
      :options="options"
      label="Тип конфигурации"
      @update:model-value="handleServiceChange"
    />

    <component
      :is="activeComponent"
      v-if="activeComponent"
      :modelValue="f"
      @update:modelValue="handleModelUpdate"
      :configurationService="localConfigurationService"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
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
  configurationService: {
    type: Object,
    default: null
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

const localConfigurationService = ref(props.modelValue.serviceType || props.configurationService);
const f = ref(JSON.parse(JSON.stringify(props.modelValue)));

const activeComponent = computed(() => {
  return localConfigurationService.value?.value
    ? serviceComponents[localConfigurationService.value.value]
    : null;
});

// Обработчик изменения сервиса
const handleServiceChange = (newValue) => {
  localConfigurationService.value = newValue;
  emit('update:configurationService', newValue);
};

// Обработчик изменения модели
const handleModelUpdate = (newValue) => {
  f.value = JSON.parse(JSON.stringify(newValue));
  emit('update:modelValue', JSON.parse(JSON.stringify(newValue)));
};

// Однонаправленный поток данных - только реагируем на внешние изменения
watch(() => props.modelValue, (newValue) => {
  if (JSON.stringify(f.value) !== JSON.stringify(newValue)) {
    f.value = JSON.parse(JSON.stringify(newValue));
  }
}, { deep: true });

watch(() => props.configurationService, (newValue) => {
  if (JSON.stringify(localConfigurationService.value) !== JSON.stringify(newValue)) {
    localConfigurationService.value = JSON.parse(JSON.stringify(newValue));
  }
}, { deep: true });
</script>
