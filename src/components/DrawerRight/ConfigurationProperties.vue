<template>
  <div class="q-pa-md">
    <q-form @submit.prevent="saveChanges">
      <div class="row">
        <span class="q-mt-none">Свойства элемента</span>
        <q-btn type="submit" color="primary" class="q-mx-md">Сохранить</q-btn>
      </div>
      <p>ID: {{ localItem.id }}</p>

      <!-- Условие для отображения AppCash или FiscalAgent -->
      <AppCash
        v-if="localItem.settings.typeConfiguration === 'appCash'"
        :width="localItem.settings.width"
        :height="localItem.settings.height"
        :color="localItem.settings.color"
        @update:width="localItem.settings.width = $event"
        @update:height="localItem.settings.height = $event"
        @update:color="localItem.settings.color = $event"
      />

      <FiscalAgent
        v-if="localItem.settings.typeConfiguration === 'agentFiscalization'"
        :fiscalRegistrators="localItem.settings.fiscalRegistrators || []"
        @update:fiscalRegistrators="localItem.settings.fiscalRegistrators = $event"
      />

      <q-item class="q-ma-md column">
        <p>Послед. изм:</p>
        {{ localItem.lastEditedUtc }}
      </q-item>
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

// Следим за изменением выбранного элемента
watch(
  selectedItem,
  (newValue) => {
    if (newValue) {
      // Создаем глубокую копию объекта для редактирования
      localItem.value = JSON.parse(JSON.stringify(newValue));
      // Вручную преобразуем строки в числа
      localItem.value.settings.width = Number(localItem.value.settings.width);
      localItem.value.settings.height = Number(localItem.value.settings.height);
    } else {
      localItem.value = null; // Сбрасываем локальное состояние, если элемент не выбран
    }
  },
  { immediate: true }
);

// Сохранение изменений
const saveChanges = () => {
  if (!localItem.value) {
    console.error('Локальный элемент не определен');
    return;
  }

  // Обновляем элемент в хранилище только после нажатия "Сохранить"
  selectedItemStore.updateItem(localItem.value);
};
</script>
