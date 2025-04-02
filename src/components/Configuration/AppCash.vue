<template>
  <div>
    <!-- Поле для ширины -->
    <q-input
      class="q-ma-md"
      :model-value="modelValue.width"
      @update:model-value="updateModelValue('width', $event)"
      label="Ширина"
      type="number"
      outlined
      required
    />

    <!-- Поле для высоты -->
    <q-input
      class="q-ma-md"
      :model-value="modelValue.height"
      @update:model-value="updateModelValue('height', $event)"
      label="Высота"
      type="number"
      outlined
      required
    />

    <!-- Поле для цвета -->
    <q-input
      class="q-ma-md"
      filled
      :model-value="modelValue.color"
      @update:model-value="updateModelValue('color', $event)"
      hint="Цвет"
    >
      <template v-slot:append>
        <q-icon name="colorize" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-color :model-value="modelValue.color" @update:model-value="updateModelValue('color', $event)" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <q-expansion-item
        expand-separator
        icon="support_agent"
        label="Агенты"
      >
    <q-select
      filled
      class="q-ma-md"
      :model-value="modelValue.fiscalAgent"
      :options="filteredList"
      label="Агент ФР"
      @update:model-value="updateModelValue('fiscalAgent', $event)"
    />

    <q-select
      filled
      class="q-ma-md"
      :model-value="modelValue.agentPayment"
      :options="filteredListAgentPayment"
      label="Агент оплат"
      @update:model-value="updateModelValue('agentPayment', $event)"
    />

    <q-select
      filled
      class="q-ma-md"
      :model-value="modelValue.agentDevice"
      :options="filteredListAgentDevice"
      label="Агент оборудования"
      @update:model-value="updateModelValue('agentDevice', $event)"
    />
    </q-expansion-item>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useConfigurationStore } from 'stores/configurationStore';

const selectedItemStore = useConfigurationStore();

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const filteredList = computed(() => {
  const result = selectedItemStore.typeFilteredConfigurationListService('agentFiscalization');
  return result;
});


const filteredListAgentPayment = computed(() => {
  const result = selectedItemStore.typeFilteredConfigurationListService('agentPayment');
  return result;
});

const filteredListAgentDevice = computed(() => {
  const result = selectedItemStore.typeFilteredConfigurationListService('agentDevice');
  return result;
});

const emit = defineEmits(['update:modelValue']);

const updateModelValue = (key, value) => {
  const updatedModelValue = { ...props.modelValue, [key]: value };
  emit('update:modelValue', updatedModelValue);
};
</script>
