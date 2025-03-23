<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <!-- Поле для выбора языка -->
    <q-select
      filled
      class="q-ma-md"
      :model-value="modelValue.language"
      :options="optionsLanguage"
      label="Выберите язык"
      @update:model-value="updateModelValue('language', $event)"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const optionsLanguage = ref([
  {
    label: 'Русский',
    value: 'ru',
  },
  {
    label: 'English',
    value: 'en',
  }
]);

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

// Обновляем значение в modelValue
const updateModelValue = (key, value) => {
  const updatedModelValue = { ...props.modelValue, [key]: value };
  emit('update:modelValue', updatedModelValue);
};

// Следим за изменениями modelValue.language
watch(
  () => props.modelValue.language,
  (newValue) => {
    if (newValue !== props.modelValue.language) {
      updateModelValue('language', newValue);
    }
  }
);
</script>
