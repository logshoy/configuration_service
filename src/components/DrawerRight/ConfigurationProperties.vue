<template>
  <div class="q-pa-md">
    <q-form @submit.prevent="saveChanges">
      <div class="row">
        <span class="q-mt-none">Свойства элемента</span>
        <q-btn
          type="submit"
          color="primary"
          class="q-mx-md"
          :disabled="!hasChanges"
        >
          Сохранить
        </q-btn>
      </div>
      <p>ID: {{ localItem.id }}</p>

      <!-- Условие для отображения AppCash или FiscalAgent -->
      <AppCash
        v-if="localItem.settings.typeConfiguration === 'appCash'"
        :width="localItem.settings.width"
        :height="localItem.settings.height"
        :color="localItem.settings.color"
        @update:width="updateWidth"
        @update:height="updateHeight"
        @update:color="updateColor"
      />

      <FiscalAgent
        v-if="localItem.settings.typeConfiguration === 'agentFiscalization'"
        :fiscalRegistrators="localItem.settings.fiscalRegistrators || []"
        @update:fiscalRegistrators="updateFiscalRegistrators"
      />

    </q-form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useConfigurationStore } from 'stores/configurationStore';

import AppCash from 'components/Configuration/AppCash.vue';
import FiscalAgent from 'components/Configuration/FiscalAgent.vue';

const selectedItemStore = useConfigurationStore();
const selectedItem = computed(() => selectedItemStore.configuration); // Получаем выбранный элемент из хранилища

// Локальная копия элемента для редактирования
const localItem = ref(null);

// Исходное состояние элемента (для сравнения)
const initialItem = ref(null);

// Следим за изменением выбранного элемента
watch(
  selectedItem,
  (newValue) => {
    if (newValue) {
      // Создаем глубокую копию объекта для редактирования
      localItem.value = JSON.parse(JSON.stringify(newValue));
      // Сохраняем исходное состояние
      initialItem.value = JSON.parse(JSON.stringify(newValue));
    } else {
      localItem.value = null; // Сбрасываем локальное состояние, если элемент не выбран
      initialItem.value = null;
    }
  },
  { immediate: true }
);

// Методы для обновления свойств
const updateWidth = (newWidth) => {
  localItem.value.settings.width = newWidth;
};

const updateHeight = (newHeight) => {
  localItem.value.settings.height = newHeight;
};

const updateColor = (newColor) => {
  localItem.value.settings.color = newColor;
};

const updateFiscalRegistrators = (newRegistrators) => {
  localItem.value.settings.fiscalRegistrators = newRegistrators;
};

// Вычисляемое свойство для проверки изменений
const hasChanges = computed(() => {
  if (!localItem.value || !initialItem.value) return false;
  return JSON.stringify(localItem.value) !== JSON.stringify(initialItem.value);
});

// Сохранение изменений
const saveChanges = () => {
  if (!localItem.value) {
    console.error('Локальный элемент не определен');
    return;
  }

  // Обновляем элемент в хранилище только после нажатия "Сохранить"
  selectedItemStore.updateItem(localItem.value);

  // Обновляем исходное состояние после сохранения
  initialItem.value = JSON.parse(JSON.stringify(localItem.value));
};
</script>
