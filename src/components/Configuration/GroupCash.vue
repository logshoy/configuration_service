<template>
  <div>
    <!-- Чекбокс для включения "Работа с авансом" -->
    <q-checkbox
      class="q-ma-md"
      :model-value="modelValue?.advance"
      @update:model-value="(value) => updateModelValue('advance', value)"
      label="Работа с авансом"
    />

    <!-- Чекбокс для включения "Цифровая клавиатура" -->
    <q-checkbox
      class="q-ma-md"
      :model-value="modelValue?.keyboard"
      @update:model-value="(value) => updateModelValue('keyboard', value)"
      label="Цифровая клавиатура"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

// Функция для обновления modelValue
const updateModelValue = (key, value) => {
  const updatedModelValue = { ...props.modelValue, [key]: value };
  emit('update:modelValue', updatedModelValue);
};
</script>
