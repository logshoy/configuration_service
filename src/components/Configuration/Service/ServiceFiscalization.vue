<template>
  <div>
     <q-checkbox
      v-model="localUniqueCashMode"
      label="Одна касса один агент"
      class="q-mb-md"
      @update:model-value="updateUniqueMode"
    />

    <div v-for="(CashToAgentFiscalization, index) in modelValue.settingCashToAgentFiscalization" :key="index" class="q-ma-md">
      <q-select
        class="q-mt-md"
        filled
        :model-value="CashToAgentFiscalization.appCash"
        :options="filteredListCash"
        label="Касса"
        @update:model-value="updateFiscal(index,'appCash', $event)"
      />
      <q-select
        class="q-mt-md"
        filled
        :model-value="CashToAgentFiscalization.fiscalAgent"
        :options="filteredListFiscalAgent"
        label="Агент ФР"
        @update:model-value="updateFiscal(index,'fiscalAgent', $event)"
      />

      <q-btn
        v-if="index === modelValue.settingCashToAgentFiscalization.length - 1"
        color="green"
        class="q-mt-md"
        @click="addCashToAgentFiscalization"
      >
        Добавить
      </q-btn>
      <q-btn
        v-if="modelValue.settingCashToAgentFiscalization.length > 1"
        color="red"
        class="q-mt-md q-ml-md"
        @click="removeCashToAgentFiscalization(index)"
      >
        Удалить
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { useConfigurationStore } from 'stores/configurationStore';

const selectedItemStore = useConfigurationStore();

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  configurationService: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

// Локальная переменная для чекбокса
const localUniqueCashMode = ref(props.modelValue.localUniqueCashMode || false);

// Следим за изменениями в modelValue и обновляем локальное значение
watch(() => props.modelValue.localUniqueCashMode, (newVal) => {
  localUniqueCashMode.value = newVal;
});

// Обновляем modelValue при изменении чекбокса
const updateUniqueMode = (value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    localUniqueCashMode: value
  });
};

const filteredListFiscalAgent = computed(() => {
  const result = selectedItemStore.typeFilteredConfigurationListService('agentFiscalization');
  return result;
});

const filteredListCash = computed(() => {
  const result = selectedItemStore.typeFilteredConfigurationListServiceApp('appCash');
  return result;
});

const updateFiscal = (index, field, value) => {
  const updatedFiscals = [...props.modelValue.settingCashToAgentFiscalization];
  updatedFiscals[index][field] = value;
  emit('update:modelValue', { ...props.modelValue, settingCashToAgentFiscalization: updatedFiscals });
};

const addCashToAgentFiscalization = () => {
  const updatedFiscals = [...props.modelValue.settingCashToAgentFiscalization, { id:null, type: null, portName: '' }];
  emit('update:modelValue', { ...props.modelValue, settingCashToAgentFiscalization: updatedFiscals });
};

const removeCashToAgentFiscalization = (index) => {
  const updatedFiscals = props.modelValue.settingCashToAgentFiscalization.filter((_, i) => i !== index);
  emit('update:modelValue', { ...props.modelValue, settingCashToAgentFiscalization: updatedFiscals });
};
</script>
