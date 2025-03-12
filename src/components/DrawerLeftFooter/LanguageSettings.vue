<template>
  <q-select
    v-model="locale"
    :options="locales"
    label="Выберите язык"
    outlined
    @update:model-value="changeLocale"
  />
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  setup() {
    const { locale } = useI18n();

    const locales = [
      { value: 'en', label: 'English' },
      { value: 'ru', label: 'Русский' },
    ];

    const changeLocale = (newLocale) => {
      localStorage.setItem('locale', newLocale);
      window.location.reload(); // Перезагружаем страницу для применения языка
    };

    return {
      locale,
      locales,
      changeLocale,
    };
  },
};
</script>
