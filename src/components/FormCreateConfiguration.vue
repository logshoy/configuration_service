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

      <!-- Блок для appCash -->
      <div v-if="typeConfiguration?.value === 'appCash'">
        <!-- Поле для ширины -->
        <q-input
          class="q-ma-md"
          v-model.number="width"
          label="Ширина"
          type="number"
          outlined
          required
        />

        <!-- Поле для высоты -->
        <q-input
          class="q-ma-md"
          v-model.number="height"
          label="Высота"
          type="number"
          outlined
          required
        />

        <!-- Поле для цвета -->
        <q-input
          class="q-ma-md"
          filled
          v-model="color"
          hint="Цвет"
        >
          <template v-slot:append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color v-model="color" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <!-- Блок для agentFiscalization -->
      <div v-if="typeConfiguration?.value === 'agentFiscalization'">
        <!-- Динамические строки для фискальных регистраторов -->
        <div v-for="(fiscal, index) in fiscalRegistrators" :key="index" class="q-ma-md">
          <q-select
            filled
            v-model="fiscal.type"
            :options="fiscalOptions"
            label="Тип фискального регистратора"
          />
          <q-input
            filled
            v-model="fiscal.portName"
            label="PortName"
            class="q-mt-md"
          />
          <q-btn
            v-if="index === fiscalRegistrators.length - 1"
            color="green"
            class="q-mt-md"
            @click="addFiscalRegistrator"
          >
            Добавить
          </q-btn>
          <q-btn
            v-if="fiscalRegistrators.length > 1"
            color="red"
            class="q-mt-md q-ml-md"
            @click="removeFiscalRegistrator(index)"
          >
            Удалить
          </q-btn>
        </div>
      </div>
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

const selectedItemStore = useConfigurationStore();
const formContainer = ref(null);
const isDropdownOpen = ref(false);
const showConfirmationDialog = ref(false);

// Данные для новой конфигурации
const width = ref(0);
const height = ref(0);
const color = ref('');
const typeConfiguration = ref(null);

// Данные для фискальных регистраторов
const fiscalRegistrators = ref([
  { type: null, portName: '' } // Начальная строка
]);

const options = ref([
  {
    label: 'Касса',
    value: 'appCash',
    description: 'Search engine',
    category: '1'
  },
  {
    label: 'Агент фискализации',
    value: 'agentFiscalization',
    description: 'Social media',
    category: '1'
  }
]);

const fiscalOptions = ref([
  { label: 'АТОЛ', value: 'atol' },
  { label: 'ШТРИХ', value: 'shtrih' }
]);

// Состояние загрузки и ошибки
const isCreateFormVisible = computed(() => selectedItemStore.isCreateFormVisible);
const isLoading = computed(() => selectedItemStore.isLoading);
const error = computed(() => selectedItemStore.error);

// Добавление новой строки для фискального регистратора
const addFiscalRegistrator = () => {
  fiscalRegistrators.value.push({ type: null, portName: '' });
};

// Удаление строки для фискального регистратора
const removeFiscalRegistrator = (index) => {
  fiscalRegistrators.value.splice(index, 1);
};

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
  fiscalRegistrators.value = [{ type: null, portName: '' }]; // Сброс фискальных регистраторов
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
        typeConfiguration: typeConfiguration.value.value,
        fiscalRegistrators: fiscalRegistrators.value
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

<style scoped>
/* Кастомные стили для выпадающего списка */
.custom-popup {
  position: absolute !important;
  top: 100% !important;
  left: 0 !important;
  margin-top: 4px !important;
}
</style>
