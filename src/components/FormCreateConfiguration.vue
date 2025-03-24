<template>
  <div v-if="isCreateFormVisible" class="q-pa-md" ref="formContainer">
    <q-form @submit.prevent="createConfiguration">
      <div class="row">
        <span>Создание</span>
        <q-btn type="submit" color="primary" class="q-mx-md">Создать</q-btn>
        <q-btn @click="confirmCloseForm" color="negative">X</q-btn>
      </div>

      <q-input
        outlined
        required
        v-model="configurationName"
        label="Название"
        class="q-ma-md"
      />

      <!-- Универсальный компонент для настроек -->
      <component
        :is="settingsComponent"
        v-if="settingsComponent"
        v-model="settings"
        :configurationService="configurationService"
        @update:configurationService="configurationService = $event"
        :isCreating="isCreating"
      />

      <!-- Модальное окно подтверждения -->
      <q-dialog v-model="showConfirmationDialog">
        <q-card>
          <q-card-section>
            <div class="text-h6">Подтверждение</div>
            <div>Вы уверены, что хотите закрыть форму? Несохраненные данные будут потеряны.</div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Отмена" color="primary" @click="closeForm" />
            <q-btn flat label="Закрыть" color="negative" @click="confirmClose" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <div v-if="isLoading">Создание конфигурации...</div>
      <div v-if="error" class="text-negative">Ошибка: {{ error }}</div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useConfigurationStore } from 'stores/configurationStore';
import { useShopStore } from 'stores/shopStore';

import CashSettings from './Configuration/AppCash.vue';
// import FiscalAgent from 'components/Configuration/FiscalAgent.vue';
import MainService from 'components/Configuration/Service/MainService.vue';
import GroupCash from './Configuration/GroupCash.vue';
import ShopСompany from './Configuration/ShopСompany.vue';

const selectedItemStore = useConfigurationStore();
const shopeStore = useShopStore();

const formContainer = ref(null);
const showConfirmationDialog = ref(false);
const configurationName = ref(null);
const configurationService = ref(null);
const settings = ref({});
const isCreating = ref(true);

const typeConfiguration = computed(() => selectedItemStore.typeCreateConfigutation);
const isCreateFormVisible = computed(() => selectedItemStore.isCreateFormVisible);
const isLoading = computed(() => selectedItemStore.isLoading);
const error = computed(() => selectedItemStore.error);
const configuration = computed(() => selectedItemStore.configuration);
const treeData = computed(() => shopeStore.treeData);

// Определяем, какой компонент настроек использовать
const settingsComponent = computed(() => {
  switch (typeConfiguration.value) {
    case 'appCash':
      return CashSettings;
    case 'service':
      return MainService;
    case 'cashGroup':
      return GroupCash;
    case 'shop':
      return ShopСompany;
    default:
      return null;
  }
});

// Инициализация настроек в зависимости от типа конфигурации
const initializeSettings = () => {
  switch (typeConfiguration.value) {
    case 'appCash':
      settings.value = { width: 800, height: 600, color: '#fffffff' };
      break;
    case 'service':
      settings.value = { fiscalRegistrators: [{ type: null, portName: '' }] };
      break;
    case 'cashGroup':
      settings.value = { keyboard: true, advance: false };
      break;
    case 'shop':
      settings.value = { language: { label: 'Русский', value: 'ru' } };
      break;
    default:
      settings.value = {};
  }
};

// Следим за изменением типа конфигурации и инициализируем настройки
watch(typeConfiguration, () => {
  initializeSettings();
}, { immediate: true });

// Закрытие формы с подтверждением
const confirmClose = () => {
  selectedItemStore.disableCreateFormVisibility();
  showConfirmationDialog.value = false;
  resetForm();
};

// Закрытие формы без подтверждения
const confirmCloseForm = () => {
  selectedItemStore.disableCreateFormVisibility();
  showConfirmationDialog.value = false;
};

// Закрытие формы без подтверждения (при нажатии "Отмена" в диалоге)
const closeForm = () => {
  showConfirmationDialog.value = false;
};

// Сброс формы
const resetForm = () => {
  configurationName.value = null;
  initializeSettings();
};

// Поиск узла по ID
const findNodeById = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Очистка лишних полей из настроек
const cleanSettings = (settings) => {
  const allowedFields = {
    appCash: ['width', 'height', 'color'],
    service: ['fiscalRegistrators'],
    cashGroup: ['keyboard', 'advance'],
    shop: ['language'],
  };

  const fieldsToKeep = allowedFields[typeConfiguration.value] || [];
  const cleanedSettings = {};

  fieldsToKeep.forEach((field) => {
    if (settings[field] !== undefined) {
      cleanedSettings[field] = settings[field];
    }
  });

  return cleanedSettings;
};

// Создание конфигурации
const createConfiguration = async () => {
  try {
    let node;
    if (configuration.value) {
      node = findNodeById(treeData.value, configuration.value.id);
    }

    // Очищаем настройки от лишних полей
    const cleanedSettings = cleanSettings(settings.value);

    // Формируем объект configurationData
    const configurationData = {
      configurationName: configurationName.value,
      typeConfiguration: typeConfiguration.value,
      ...cleanedSettings, // Передаем только нужные настройки
    };

    // Если serviceType задан, добавляем его в configurationData
    if (configurationService.value) {
      configurationData.serviceType = configurationService.value;
    }

    switch (typeConfiguration.value) {
      case 'appCash':
        shopeStore.addCashRegister(node.shopId, node.id, configurationName.value, configurationData);
        break;
      case 'service':
        selectedItemStore.createConfiguration(configurationData);
        break;
      case 'cashGroup':
        shopeStore.addCashGroup(configuration.value.id, configurationName.value, configurationData);
        break;
      case 'shop':
        shopeStore.addShop(configurationName.value, configurationData);
        break;
    }

    resetForm();
    selectedItemStore.disableCreateFormVisibility();
  } catch (err) {
    console.error('Ошибка при создании конфигурации:', err);
  }
};
</script>
