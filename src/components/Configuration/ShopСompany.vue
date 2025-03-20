<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <q-select
      filled
      class="q-ma-md"
      v-model="selectedLanguage"
      :options="optionsLanguage"
      label="Выберите язык"
      @update:model-value="updateLanguage"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

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
  language: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:language']);

// Локальное состояние для выбранного языка
const selectedLanguage = ref(props.language);


// Обновляем язык при изменении выбора
const updateLanguage = (value) => {
  emit('update:language', value);
};
</script>
