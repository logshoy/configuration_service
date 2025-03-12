<template>
  <q-select
    v-model="selectedLocale"
    :options="localeOptions"
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

    // Доступные языки
    const locales = [
      { value: 'en-US', label: 'English' },
      { value: 'ru-RU', label: 'Русский' },
    ];

    // Преобразуем массив объектов в массив значений для q-select
    const localeOptions = locales.map((loc) => loc.value);

    // Выбранный язык (значение, например, 'en-US')
    const selectedLocale = locale.value;

    // Метод для смены языка
    const changeLocale = (newLocale) => {
      localStorage.setItem('locale', newLocale);
      window.location.reload(); // Перезагружаем страницу для применения языка
    };

    return {
      selectedLocale,
      localeOptions,
      changeLocale,
    };
  },
};
</script>
