<template>
  <div>
    <div v-for="(fiscal, index) in modelValue.settingCashToAgentFiscalization" :key="index" class="q-ma-md">

      <q-select
        class="q-mt-md"
        filled
        :model-value="modelValue.fiscalAgent"
        :options="filteredListCash"
        label="Касса"
        @update:model-value="updateFiscal(index,'appCash', $event)"
      />

      <q-select
        class="q-mt-md"
        filled
        :model-value="modelValue.fiscalAgent"
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
import { computed } from 'vue';

import { useConfigurationStore } from 'stores/configurationStore';

const selectedItemStore = useConfigurationStore();


const filteredListFiscalAgent = computed(() => {
  const result = selectedItemStore.typeFilteredConfigurationListService('agentFiscalization');
  return result;
});

const filteredListCash = computed(() => {
  const result = selectedItemStore.typeFilteredConfigurationListServiceApp('appCash');
  return result;
});


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
