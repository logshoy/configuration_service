<template>
  {{ f }}
  <br/>
  <br/>
  {{ fiscalSettings }}
  <div>
    <!-- Выбор типа сервиса -->
    <q-select
      filled
      class="q-ma-md"
      v-model="localConfigurationService"
      :options="options"
      label="Тип конфигурации"
      v-if="isCreating"
    />

    <!-- Компонент для фискального агента -->
    <FiscalAgent
      v-if="localConfigurationService?.value === 'agentFiscalization'"
      v-model="f"
    />

    <!-- Компонент для платежного агента -->
    <PaymentAgent
      v-if="localConfigurationService?.value === 'agentPayment'"
      v-model="f"
    />

    <AgentDevice
      v-if="localConfigurationService?.value === 'agentDevice'"
      v-model="f"
    />
    <ServiceFiscalization
      v-if="localConfigurationService?.value === 'serviceFiscalization'"
      v-model="f"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
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
    required: false,
    default: null
  },
  isCreating: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'update:configurationService']);

// Локальные настройки для каждого типа сервиса
const fiscalSettings = ref(props.modelValue.fiscalRegistrators || {});
const paymentSettings = ref(props.modelValue.paymentSettings || {});

// Локальное состояние для выбора типа сервиса
const localConfigurationService = ref(props.modelValue.serviceType);

// Локальный объект для передачи данных в дочерний компонент
const f = ref({ ...props.modelValue });

// Следим за изменениями props.modelValue и синхронизируем с f
watch(
  () => props.modelValue,
  (newValue) => {
    f.value = { ...newValue };
  },
  { deep: true }
);

// Следим за изменениями props.modelValue.serviceType
watch(
  () => props.modelValue.serviceType,
  (newValue) => {
    if (localConfigurationService.value !== newValue) {
      localConfigurationService.value = newValue;
    }
  }
);

// Отслеживаем изменения локальных настроек и отправляем их в родительский компонент
watch(
  [fiscalSettings, paymentSettings],
  ([fiscal, payment]) => {
    const updatedSettings = {
      ...props.modelValue,
      fiscalRegistrators: fiscal,
      paymentSettings: payment,
    };
    emit('update:modelValue', updatedSettings);
  },
  { deep: true }
);

// Отслеживаем изменения выбора типа сервиса
watch(localConfigurationService, (newValue) => {
  emit('update:configurationService', newValue);
});
</script>
