<template>
  <!-- Форма создания конфигурации -->
  <div v-if="isCreateFormVisible" class="q-pa-md" ref="formContainer">
    <q-form @submit.prevent="createConfiguration">
      <div class="row">
        <span>Создание</span>
        <q-btn type="submit" color="primary" class="q-mx-md">Создать</q-btn>
        <q-btn @click="confirmcloseForm" color="negative">Отмена</q-btn>
      </div>

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
    </q-form>

    <!-- Модальное окно подтверждения -->
    <q-dialog v-model="showConfirmationDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Подтверждение</div>
          <div>Вы уверены, что хотите закрыть форму? Несохраненные данные будут потеряны.</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" @click="confirmcloseForm" />
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
const showConfirmationDialog = ref(false);

// Данные для новой конфигурации
const width = ref(0);
const height = ref(0);
const color = ref('');

// Состояние загрузки и ошибки
const isCreateFormVisible = computed(() => selectedItemStore.isCreateFormVisible);
const isLoading = computed(() => selectedItemStore.isLoading);
const error = computed(() => selectedItemStore.error);

// Обработчик кликов вне формы
const handleClickOutside = (event) => {
  if (
    formContainer.value &&
    !formContainer.value.contains(event.target) &&
    isCreateFormVisible.value
  ) {
    showConfirmationDialog.value = true;
  }
};

// Добавляем обработчик при монтировании компонента
onMounted(() => {
  setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
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

// Закрытие формы без подтверждения (при нажатии "Отмена" в форме)
const confirmcloseForm = () => {
  document.removeEventListener('click', handleClickOutside);
  showConfirmationDialog.value = false;
};

// Закрытие формы без подтверждения (при нажатии "Отмена" в форме)

// Сброс формы
const resetForm = () => {
  width.value = 0;
  height.value = 0;
  color.value = '';
};

// Создание конфигурации
const createConfiguration = async () => {
  try {
    // Формируем объект с настройками
    const settings = {
      width: width.value,
      height: height.value,
      color: color.value,
    };

    // Преобразуем объект в JSON-строку
    const newConfiguration = {
      settings: JSON.stringify(settings),
    };

    // Отправляем данные в хранилище
    const createdConfiguration = await selectedItemStore.createConfiguration(newConfiguration);
    console.log('Конфигурация создана:', createdConfiguration);

    // Очищаем форму после успешного создания
    resetForm();
    selectedItemStore.disableCreateFormVisibility();
  } catch (err) {
    console.error('Ошибка при создании конфигурации:', err);
  }
};
</script>
