<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
        <q-select
        filled
        class="q-ma-md"
        v-model="language"
        :options="optionsLanguage"
        label="Выберите язык"
      />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const language = ref(null)

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

//
</script>
