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
        :rules="[val => !!val || 'Поле обязательно для заполнения']"
        lazy-rules
        :color="!configurationName ? 'negative' : 'primary'"
        :bg-color="!configurationName ? 'red-1' : ''"
      />

      <!-- Универсальный компонент для настроек -->
      <component
        :is="settingsComponent"
        v-if="settingsComponent"
        v-model="settings"
        :configurationService="configurationService"
        @update:configurationService="configurationService = $event"
        :isCreating="isCreating"
        :emit-always="true"
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
import { ref, computed } from 'vue';
import { useConfigurationStore } from 'stores/configurationStore';
import { useShopStore } from 'stores/shopStore';

import { validateServiceFiscalization } from 'src/utils/validators.js';

import CashSettings from './Configuration/AppCash.vue';
import MainService from 'components/Configuration/Service/MainService.vue';
import GroupCash from './Configuration/GroupCash.vue';
import ShopСompany from './Configuration/ShopСompany.vue';

const selectedItemStore = useConfigurationStore();
const shopeStore = useShopStore();

const formContainer = ref(null);

const configurationName = ref(null);
const configurationService = ref(null);
const settings = ref({});
const isCreating = ref(true);

const configurationType = computed(() => selectedItemStore.typeCreateConfigutation);
const isCreateFormVisible = computed(() => selectedItemStore.isCreateFormVisible);
const isLoading = computed(() => selectedItemStore.isLoading);
const error = computed(() => selectedItemStore.error);
const configuration = computed(() => selectedItemStore.configuration);
const treeData = computed(() => shopeStore.treeData);

const showConfirmationDialog = computed(() => selectedItemStore.dialogCreate);

// Определяем, какой компонент настроек использовать
const settingsComponent = computed(() => {
  switch (configurationType.value) {
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
  selectedItemStore.disableDialogCreate();
};

// Сброс формы
const resetForm = () => {
  configurationName.value = null;
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

// const cleanSettings = (settings) => {
//   const allowedFields = {
//     appCash: ['width', 'height', 'color', 'fiscalAgent'],
//     service: {
//       agentFiscalization: ['fiscalRegistrators'],
//       serviceFiscalization: ['settingCashToAgentFiscalization', 'localUniqueCashMode'],
//       default: []
//     },
//     cashGroup: ['keyboard', 'advance'],
//     shop: ['language']
//   };

//   const cleanedSettings = {};
//   const configType = configurationType.value;

//   // Для типа 'service' учитываем подтип сервиса
//   if (configType === 'service') {
//     const serviceType = configurationService.value?.value;
//     const fields = allowedFields.service[serviceType] || allowedFields.service.default;

//     fields.forEach(field => {
//       if (settings[field] !== undefined) {
//         cleanedSettings[field] = settings[field];
//       }
//     });
//   }
//   // Для остальных типов
//   else if (allowedFields[configType]) {
//     allowedFields[configType].forEach(field => {
//       if (settings[field] !== undefined) {
//         cleanedSettings[field] = settings[field];
//       }
//     });
//   }

//   return cleanedSettings;
// };

// Создание конфигурации
const createConfiguration = async () => {

  console.log(configuration.value.id, configurationName.value)

  try {
    let node;
    if (configuration.value) {
      node = findNodeById(treeData.value, configuration.value.id);
    }
    // const cleanedSettings = cleanSettings(settings.value);
    const configurationData = {
      configurationName: configurationName.value,
      configurationType: configurationType.value,
      node: configuration.value?.id,
      ...settings.value,
      // ...cleanedSettings,
    };

    if (configurationService.value) {
      configurationData.serviceType = configurationService.value;
    }



    switch (configurationType.value) {
      case 'appCash':
        shopeStore.addCashRegister(node.shopId, node.id, configurationName.value, configurationData);
        break;
      case 'service':
        switch (configurationService.value?.value) {
          case 'agentFiscalization':
            selectedItemStore.createConfiguration(configurationData);
            break;
          case 'serviceFiscalization':
            validateServiceFiscalization(configurationData);
            selectedItemStore.createConfiguration(configurationData);
            break;
          default:
            selectedItemStore.createConfiguration(configurationData);
        }
        break;
      case 'cashGroup':
        console.log(configuration.value.id, configurationName.value, configurationData)
        shopeStore.addCashGroup(configuration.value.id, configurationName.value, configurationData);
        break;
      case 'shop':
        shopeStore.addShop(configurationName.value, configurationData);
        break;
      default:
        console.warn('Unknown configuration type:', configurationType.value);
    }

    selectedItemStore.disableCreateFormVisibility();
  } catch (err) {
    console.error('Ошибка при создании конфигурации:', err);
    alert(err);
  }
};
</script>
