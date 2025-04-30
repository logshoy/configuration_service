<template>
  <div>
    <q-select
      v-if="isCreating"
      filled
      class="q-ma-md"
      v-model="localServiceType"
      :options="options"
      label="Тип конфигурации"
      @update:model-value="handleServiceChange"
    />

    <!-- Настройки порта и протокола -->
    <div class="row q-ma-md">
      <q-select
        v-model="localConfig.protocol"
        :options="protocolOptions"
        label="Протокол"
        outlined
        dense
        class="col q-mr-sm"
        @update:model-value="updateModel"
      />
      <q-input
        v-model.number="localConfig.port"
        type="number"
        label="Порт"
        outlined
        dense
        class="col"
        :rules="portRules"
        @update:model-value="updateModel"
      />
    </div>

    <component
      :is="activeComponent"
      v-if="activeComponent"
      :modelValue="localConfig"
      @update:modelValue="handleModelUpdate"
      :configurationService="localServiceType"
      :emitAlways="props.emitAlways"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { DEFAULT_SERVICE_PORTS, PROTOCOL_OPTIONS } from 'src/utils/config/servicePorts';

import FiscalAgent from 'components/Configuration/FiscalAgent.vue';
import PaymentAgent from 'components/Configuration/Service/PaymentAgent.vue';
import AgentDevice from 'components/Configuration/Service/AgentDevice.vue';
import ServiceFiscalization from 'components/Configuration/Service/ServiceFiscalization.vue';
import CardDispenser from 'components/Configuration/Service/AgentCardDispenser.vue';
import CardReader from 'components/Configuration/Service/AgentCardReader.vue';
import ServiceDiscount from 'components/Configuration/Service/ServiceDiscount.vue';
import DKLinkMark from 'components/Configuration/Service/DKLinkMark.vue';
import AgentExchange from 'components/Configuration/Service/AgentExchange.vue';
import ServiceStorage from 'components/Configuration/Service/ServiceStorage.vue';
import ServiceOrder from 'components/Configuration/Service/ServiceOrder.vue';

const options = ref([
  { label: 'Агент оплат', value: 'agentPayment' },
  { label: 'Агент фискализации', value: 'agentFiscalization' },
  { label: 'Агент оборудования', value: 'agentDevice' },
  { label: 'Сервис фискализации', value: 'serviceFiscalization' },
  { label: 'Агент диспенсоров для карт', value: 'agentCardDispenser' },
  { label: 'Агент считывателей карта', value: 'agentCardReader' },
  { label: 'DKLinkMark Модуль ГосСистем', value: 'serviceDKLinkMark' },
  { label: 'Сервис скидок', value: 'serviceDiscount' },
  { label: 'Агент обмена', value: 'agentExchange' },
  { label: 'Сервис справочников', value: 'serviceStorage' },
  { label: 'Сервис заказов', value: 'serviceOrder' }
]);

const protocolOptions = PROTOCOL_OPTIONS;

const portRules = [
  val => val > 0 && val <= 65535 || 'Порт должен быть между 1 и 65535',
  val => Number.isInteger(val) || 'Порт должен быть целым числом'
];

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      protocol: 'http',
      port: null,
      serviceType: null
    })
  },
  isCreating: {
    type: Boolean,
    required: true,
  },
  emitAlways: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'update:configurationService']);

// Локальные копии для избежания мутации пропсов
const localConfig = ref({...props.modelValue});
const localServiceType = ref(props.modelValue.serviceType);

// Инициализация при создании
if (props.isCreating) {
  localConfig.value = {
    protocol: 'http',
    port: null,
    serviceType: null
  };
  emit('update:modelValue', localConfig.value);
}

const serviceComponents = {
  agentFiscalization: FiscalAgent,
  agentPayment: PaymentAgent,
  agentDevice: AgentDevice,
  serviceFiscalization: ServiceFiscalization,
  agentCardDispenser: CardDispenser,
  agentCardReader: CardReader,
  serviceDKLinkMark: DKLinkMark,
  serviceDiscount: ServiceDiscount,
  agentExchange: AgentExchange,
  serviceOrder: ServiceOrder,
  serviceStorage: ServiceStorage
};

const activeComponent = computed(() => {
  return localServiceType.value?.value
    ? serviceComponents[localServiceType.value.value]
    : null;
});

const handleServiceChange = (newValue) => {
  localServiceType.value = newValue;

  // Установка порта по умолчанию для выбранной службы
  const defaultPort = DEFAULT_SERVICE_PORTS[newValue.value];

  const newConfig = {
    ...localConfig.value,
    serviceType: newValue,
    port: defaultPort
  };

  localConfig.value = newConfig;
  emit('update:modelValue', newConfig);
  emit('update:configurationService', newValue);
};

const handleModelUpdate = (newValue) => {
  const updatedConfig = {
    ...localConfig.value,
    ...newValue
  };
  localConfig.value = updatedConfig;
  emit('update:modelValue', updatedConfig);
};

const updateModel = () => {
  emit('update:modelValue', localConfig.value);
};

// Обновление локального состояния при изменении пропсов
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localConfig.value)) {
    localConfig.value = {...newVal};
    localServiceType.value = newVal.serviceType;
  }
}, { deep: true });

// Валидация порта
watch(() => localConfig.value.port, (newVal) => {
  if (newVal && (newVal < 1 || newVal > 65535)) {
    console.error('Некорректный номер порта');
  }
});
</script>

<style scoped>
/* Дополнительные стили при необходимости */
</style>
