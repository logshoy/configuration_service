<template>
  <div>
    <!-- Выбор типа сервиса -->
    <q-select
      filled
      class="q-ma-md"
      v-model="localConfigurationService"
      :options="options"
      label="Тип конфигурации"
    />
    {{ configurationService }}

    <!-- Компонент для фискального агента -->
    <FiscalAgent
      v-if="localConfigurationService?.value === 'agentFiscalization'"
      v-model="fiscalSettings"
    />

    <!-- Компонент для платежного агента -->
    <PaymentAgent
      v-if="localConfigurationService?.value === 'agentPayment'"
      v-model="paymentSettings"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import FiscalAgent from 'components/Configuration/FiscalAgent.vue';
import PaymentAgent from 'components/Configuration/Service/PaymentAgent.vue';

const options = ref([
  {
    label: 'Агент оплат',
    value: 'agentPayment',
  },
  {
    label: 'Агент фискализации',
    value: 'agentFiscalization',
  }
]);

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  configurationService: {
    type: Object,
    required: true,
  }
});

const emit = defineEmits(['update:modelValue', 'update:configurationService']);

// Локальные настройки для каждого типа сервиса
const fiscalSettings = ref({ fiscalRegistrators: props.modelValue.fiscalRegistrators || [{ type: null, portName: '' }] });
const paymentSettings = ref(props.modelValue.paymentSettings || {});

// Локальное состояние для выбора типа сервиса
const localConfigurationService = ref(props.configurationService);

// Отслеживаем изменения локальных настроек и отправляем их в родительский компонент
watch([fiscalSettings, paymentSettings], ([fiscal, payment]) => {
  const updatedSettings = {
    ...props.modelValue,
    fiscalRegistrators: fiscal.fiscalRegistrators,
    paymentSettings: payment,
  };
  emit('update:modelValue', updatedSettings);
}, { deep: true });

// Отслеживаем изменения выбора типа сервиса
watch(localConfigurationService, (newValue) => {
  emit('update:configurationService', newValue);
});
</script>
