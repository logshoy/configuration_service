<template>
  <div v-if="isCreateFormVisible" class="q-pa-md" ref="formContainer">
    <q-form @submit.prevent="createConfiguration">
      <div class="row">
        <span>Создание</span>
        <q-btn type="submit" color="primary" class="q-mx-md">Создать</q-btn>
        <q-btn @click="confirmCloseForm" color="negative">X</q-btn>
      </div>
      {{ typeConfiguration }}
      <q-input
        outlined
        required
        v-model="configurationName"
        label="Название"
        class="q-ma-md"
      />
      <q-select
        v-if="typeConfiguration === 'service'"
        filled
        class="q-ma-md"
        v-model="configurationService"
        :options="options"
        label="Тип конфигурации"
      />

      <!-- Компонент для настроек кассы -->
      <CashSettings
        v-if="typeConfiguration === 'appCash'"
        :width="width"
        :height="height"
        :color="color"
        @update:width="width = $event"
        @update:height="height = $event"
        @update:color="color = $event"
      />

      <!-- Компонент для настроек агента фискализации -->
      <FiscalAgentSettings
        v-if="configurationService?.value === 'agentFiscalization'"
        :fiscalRegistrators="fiscalRegistrators"
        @update:fiscalRegistrators="fiscalRegistrators = $event"
      />
      <GroupCash
        v-if="typeConfiguration === 'cashGroup'"
        v-model:modelValue="parentSettings"
        @update:parentSettings="parentSettings = $event"
      />
      <ShopСompany
        v-if="typeConfiguration === 'shop'"
        :language="language"
        @update:language="language = $event"
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
import { ref, computed } from 'vue';
import { useConfigurationStore } from 'stores/configurationStore';
import { useShopStore } from 'stores/shopStore';



import CashSettings from './Configuration/AppCash.vue';
import FiscalAgentSettings from './Configuration/FiscalAgent.vue';
import GroupCash from './Configuration/GroupCash.vue';
import ShopСompany from './Configuration/ShopСompany.vue';

const selectedItemStore = useConfigurationStore();
const shopeStore = useShopStore();


const formContainer = ref(null);
const showConfirmationDialog = ref(false);
const configurationName = ref(null)

// Данные для новой конфигурации
const width = ref(0);
const height = ref(0);
const color = ref('');

const typeConfiguration = computed(() => selectedItemStore.typeCreateConfigutation);

const configurationService = ref(null)

const fiscalRegistrators = ref([{ type: null, portName: '' }]);

const language = ref(null)

const parentSettings = ref({
  keyboard: false,
  advance: false, // Другие свойства объекта
});

const options = ref([
  {
    label: 'Агент оплат',
    value: 'agentPayment',
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
const configuration = computed(() => selectedItemStore.configuration);



// Удаляем обработчик при размонтировании компонента


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
  width.value = 0;
  height.value = 0;
  color.value = '';
  fiscalRegistrators.value = [{ type: null, portName: '' }];
};

const treeData = computed(() => shopeStore.treeData);


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


// Создание конфигурации
const createConfiguration = async () => {
  try {
    let settings = null;



    if (typeConfiguration.value === 'appCash') {
      const node = findNodeById(treeData.value, configuration.value.id);
      console.log('node', node)
      settings = {
        configurationName: configurationName.value,
        width: width.value,
        height: height.value,
        color: color.value,
        typeConfiguration: typeConfiguration.value
      };
      shopeStore.addCashRegister(node.shopId, node.id, configurationName.value , settings);
    } else if (typeConfiguration.value === 'service') {
      settings = {
        configurationName: configurationName.value,
        configurationService: configurationService.value,
        fiscalRegistrators: fiscalRegistrators.value,
        typeConfiguration: typeConfiguration.value
      };
    } else if (typeConfiguration.value === 'cashGroup') {
      settings = {
        typeConfiguration: typeConfiguration.value,
        configurationName: configurationName.value,
        parentSettings: parentSettings.value
        // keyboard: parentSettings.value.keyboard,
        // advance: parentSettings.value.advance

      };
      shopeStore.addCashGroup(configuration.value.id ,configurationName.value , settings);
    }
    else if (typeConfiguration.value === 'shop') {
      settings = {
        typeConfiguration: typeConfiguration.value,
        configurationName: configurationName.value,
        language: language.value
      };

      console.log(settings)
      shopeStore.addShop(configurationName.value , settings);
    }

    // const createdConfiguration = await selectedItemStore.createConfiguration(settings);
    // console.log('Конфигурация создана:', createdConfiguration);

    resetForm();
    selectedItemStore.disableCreateFormVisibility();
  } catch (err) {
    console.error('Ошибка при создании конфигурации:', err);
  }
};



</script>
