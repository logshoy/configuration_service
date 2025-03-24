<template>
  <div>
    <div v-for="(fiscal, index) in modelValue.fiscalRegistrators" :key="index" class="q-ma-md">
        <div class="row justify-center q-my-md">
        <q-input
          label="ID"
          :model-value="fiscal.id"
          @update:model-value="updateFiscal(index, 'id', $event)"
          filled
          class="q-mx-xs"
        />
        <q-btn
          color="primary"
          icon="sync"
          @click="generateuid"
          round
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
      <q-btn
        v-if="index === modelValue.fiscalRegistrators.length - 1"
        color="green"
        class="q-mt-md"
        @click="addFiscalRegistrator"
      >
        Добавить
      </q-btn>
      <q-btn
        v-if="modelValue.fiscalRegistrators.length > 1"
        color="red"
        class="q-mt-md q-ml-md"
        @click="removeFiscalRegistrator(index)"
      >
        Удалить
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const fiscalOptions = ref([
  { label: 'АТОЛ', value: 'atol' },
  { label: 'ШТРИХ', value: 'shtrih' }
]);

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
  const updatedFiscals = [...props.modelValue.fiscalRegistrators];
  updatedFiscals[index][field] = value;
  emit('update:modelValue', { ...props.modelValue, fiscalRegistrators: updatedFiscals });
};

const addFiscalRegistrator = () => {
  const updatedFiscals = [...props.modelValue.fiscalRegistrators, { type: null, portName: '' }];
  emit('update:modelValue', { ...props.modelValue, fiscalRegistrators: updatedFiscals });
};

const removeFiscalRegistrator = (index) => {
  const updatedFiscals = props.modelValue.fiscalRegistrators.filter((_, i) => i !== index);
  emit('update:modelValue', { ...props.modelValue, fiscalRegistrators: updatedFiscals });
};
</script>
