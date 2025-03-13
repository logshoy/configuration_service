<template>
  <q-item clickable v-ripple>
    <q-item-section avatar>
      <q-icon name="translate" />
    </q-item-section>
    <q-item-section>
      <q-btn flat>
        {{ $t('language') }}: {{ selectedLocaleLabel }}
        <q-menu
          anchor="bottom right"
          self="bottom left"
          @show="handleMenuShow"
          @hide="handleMenuHide"
        >
          <q-list>
            <q-item
              v-for="locale in locales"
              :key="locale.value"
              clickable
              @click="changeLocale(locale.value)"
            >
              <q-item-section>
                <q-item-label>{{ locale.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref, computed, watch } from 'vue';
import { useDrawerStore } from 'stores/drawerStore';

const { locale } = useI18n();
const drawerStore = useDrawerStore();

// Доступные языки
const locales = [
  { value: 'en-US', label: 'English' },
  { value: 'ru-RU', label: 'Русский' },
];

// Выбранный язык (реактивное значение)
const selectedLocale = ref(locale.value);

// Название выбранного языка
const selectedLocaleLabel = computed(() => {
  const selected = locales.find((loc) => loc.value === selectedLocale.value);
  return selected?.label || '';
});

// Метод для смены языка
const changeLocale = (newLocale) => {
  locale.value = newLocale; // Обновляем язык в i18n
  selectedLocale.value = newLocale; // Обновляем выбранный язык
  localStorage.setItem('locale', newLocale); // Сохраняем язык в localStorage

  // Устанавливаем miniState в false
  drawerStore.setMiniState(false);
};

// Обработчик открытия меню
const handleMenuShow = () => {
  console.log('я работаю')
  drawerStore.lockMiniState(true); // Блокируем закрытие
};

// Обработчик закрытия меню
const handleMenuHide = () => {
  drawerStore.lockMiniState(false); // Разблокируем закрытие
};

// Следим за изменениями языка
watch(
  () => locale.value,
  (newVal) => {
    selectedLocale.value = newVal;
  }
);
</script>

<style scoped>
.q-btn {
  padding: 8px 16px;
  color: inherit;
}

.q-menu {
  min-width: 160px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
}

.q-item__section--avatar {
  min-width: 40px;
}
</style>
