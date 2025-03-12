<template>
  <div v-if="isCreateFormVisible" class="q-pa-md" ref="formContainer">
    <q-form @submit.prevent="createConfiguration">
      <div class="row">
        <span>Создание</span>
        <q-btn type="submit" color="primary" class="q-mx-md">Создать</q-btn>
        <q-btn @click="confirmCloseForm" color="negative">X</q-btn>
      </div>

      <q-select
        filled
        class="q-ma-md"
        v-model="typeConfiguration"
        :options="options"
        label="Тип конфигурации"
        @popup-show="isDropdownOpen = true"
        @popup-hide="isDropdownOpen = false"
      />

      <!-- Компонент для настроек кассы -->
      <CashSettings
        v-if="typeConfiguration?.value === 'appCash'"
        :width="width"
        :height="height"
        :color="color"
        @update:width="width = $event"
        @update:height="height = $event"
        @update:color="color = $event"
      />

      <!-- Компонент для настроек агента фискализации -->
      <FiscalAgentSettings
        v-if="typeConfiguration?.value === 'agentFiscalization'"
        :fiscalRegistrators="fiscalRegistrators"
        @update:fiscalRegistrators="fiscalRegistrators = $event"
      />
    </q-form>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useConfigurationStore } from 'stores/configurationStore';
import CashSettings from './Configuration/AppCash.vue';
import FiscalAgentSettings from './Configuration/FiscalAgent.vue';

const selectedItemStore = useConfigurationStore();
const formContainer = ref(null);
const isDropdownOpen = ref(false);
const showConfirmationDialog = ref(false);

// Данные для новой конфигурации
const width = ref(0);
const height = ref(0);
const color = ref('');
const typeConfiguration = ref(null);
const fiscalRegistrators = ref([{ type: null, portName: '' }]);

const options = ref([
  {
    label: 'Касса',
    value: 'appCash',
    category: '1'
  },
  {
    label: 'Агент фискализации',
    value: 'agentFiscalization',
    category: '1'
  }
]);

// Состояние загрузки и ошибки
const isCreateFormVisible = computed(() => selectedItemStore.isCreateFormVisible);
const isLoading = computed(() => selectedItemStore.isLoading);
const error = computed(() => selectedItemStore.error);

// Обработчик кликов вне формы
const handleClickOutside = (event) => {
  if (
    formContainer.value &&
    !formContainer.value.contains(event.target) &&
    isCreateFormVisible.value &&
    !isDropdownOpen.value
  ) {
    showConfirmationDialog.value = true;
  }
};

// Добавляем обработчик при монтировании компонента
onMounted(() => {
  setTimeout(() => {
    // document.addEventListener('click', handleClickOutside);
  }, 300);
});

// Удаляем обработчик при размонтировании компонента
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Закрытие формы с подтверждением
const confirmClose = () => {
  document.removeEventListener('click', handleClickOutside);
  selectedItemStore.disableCreateFormVisibility();
  showConfirmationDialog.value = false;
  resetForm();
};

// Закрытие формы без подтверждения
const confirmCloseForm = () => {
  document.removeEventListener('click', handleClickOutside);
  selectedItemStore.disableCreateFormVisibility();
  showConfirmationDialog.value = false;
};

// Закрытие формы без подтверждения (при нажатии "Отмена" в диалоге)
const closeForm = () => {
  document.removeEventListener('click', handleClickOutside);
  showConfirmationDialog.value = false;
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 100);
};

// Сброс формы
const resetForm = () => {
  width.value = 0;
  height.value = 0;
  color.value = '';
  typeConfiguration.value = null;
  fiscalRegistrators.value = [{ type: null, portName: '' }];
};

// Создание конфигурации
const createConfiguration = async () => {
  try {
    let settings = null;

    if (typeConfiguration.value?.value === 'appCash') {
      settings = {
        width: width.value,
        height: height.value,
        color: color.value,
        typeConfiguration: typeConfiguration.value.value
      };
    } else if (typeConfiguration.value?.value === 'agentFiscalization') {
      settings = {
        fiscalRegistrators: fiscalRegistrators.value,
        typeConfiguration: typeConfiguration.value.value
      };
    }

    const newConfiguration = {
      settings: JSON.stringify(settings),
    };

    const createdConfiguration = await selectedItemStore.createConfiguration(newConfiguration);
    console.log('Конфигурация создана:', createdConfiguration);

    resetForm();
    selectedItemStore.disableCreateFormVisibility();
  } catch (err) {
    console.error('Ошибка при создании конфигурации:', err);
  }
};
</script>
