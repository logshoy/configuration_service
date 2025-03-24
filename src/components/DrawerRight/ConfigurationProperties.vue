<template>
  <div class="q-pa-md">
    <q-form @submit.prevent="saveChanges">
      <div class="row items-center q-mb-md">
        <q-btn
          type="submit"
          color="primary"
          class="q-mx-md"
          :disabled="!hasChanges"
          icon="save"
          round
        />
        <q-btn
          color="negative"
          icon="delete"
          @click="confirmDelete"
          class="q-mx-md"
          round
        />
      </div>

      <!-- ID и кнопка копирования на одной линии -->
      <div class="row items-center">
        <q-input
          v-model="localItem.id"
          label="ID"
          readonly
          outlined
          dense
          class="col-grow q-ma-md"
        />
        <q-btn
          color="primary"
          icon="content_copy"
          @click="copyToClipboard"
          class="q-ml-md"
          round
        />
      </div>

      <!-- Название конфигурации -->
      <q-input
        outlined
        required
        v-model="localItem.settings.configurationName"
        label="Название"
        class="q-ma-md"
      />

      <!-- Уведомление об успешном копировании -->
      <q-dialog v-model="showCopiedNotification" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">Успешно!</div>
          </q-card-section>
          <q-card-section>
            ID скопирован в буфер обмена.
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="OK" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Универсальный компонент для настроек -->
      <component
        :is="settingsComponent"
        v-if="settingsComponent"
        v-model="localItem.settings"
      />
    </q-form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useConfigurationStore } from 'stores/configurationStore';
import { useQuasar } from 'quasar';

import AppCash from 'components/Configuration/AppCash.vue';
// import FiscalAgent from 'components/Configuration/FiscalAgent.vue';
import MainService from 'components/Configuration/Service/MainService.vue';
import GroupCash from 'components/Configuration/GroupCash.vue';
import ShopСompany from 'components/Configuration/ShopСompany.vue';

// Инициализация Quasar
const $q = useQuasar();

const selectedItemStore = useConfigurationStore();
const selectedItem = computed(() => selectedItemStore.configuration);

const localItem = ref(null);
const initialItem = ref(null);
const showCopiedNotification = ref(false);

// Определяем, какой компонент настроек использовать
const settingsComponent = computed(() => {
  if (!localItem.value) return null;

  switch (localItem.value.settings.typeConfiguration) {
    case 'appCash':
      return AppCash;
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

// Отслеживаем изменения выбранного элемента
watch(
  selectedItem,
  (newValue) => {
    if (newValue) {
      // Убедимся, что свойства advance и keyboard существуют
      localItem.value = JSON.parse(JSON.stringify(newValue));
      initialItem.value = JSON.parse(JSON.stringify(newValue));
    } else {
      localItem.value = null;
      initialItem.value = null;
    }
  },
  { immediate: true }
);

// Проверка наличия изменений
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

  selectedItemStore.updateItem(localItem.value);
  initialItem.value = JSON.parse(JSON.stringify(localItem.value));
};

// Копирование ID в буфер обмена
const copyToClipboard = async () => {
  if (!localItem.value || !localItem.value.id) {
    $q.notify({
      type: 'negative',
      message: 'ID не найден',
    });
    return;
  }

  const textToCopy = localItem.value.id;

  // Проверяем, поддерживается ли Clipboard API
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(textToCopy);
      showCopiedNotification.value = true;
      return;
    } catch (error) {
      console.error('Ошибка при использовании Clipboard API:', error);
    }
  }

  // Fallback: Используем document.execCommand('copy')
  const textArea = document.createElement('textarea');
  textArea.value = textToCopy;
  document.body.appendChild(textArea);
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showCopiedNotification.value = true;
    } else {
      $q.notify({
        type: 'negative',
        message: 'Не удалось скопировать ID',
      });
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Не удалось скопировать ID',
    });
    console.log(error);
  } finally {
    document.body.removeChild(textArea);
  }
};

// Подтверждение удаления
const confirmDelete = () => {
  $q.dialog({
    title: 'Подтверждение удаления',
    message: 'Вы уверены, что хотите удалить этот элемент?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deleteItem();
  });
};

// Удаление элемента
const deleteItem = async () => {
  if (!localItem.value) {
    console.error('Локальный элемент не определен');
    return;
  }

  try {
    await selectedItemStore.deleteItem(localItem.value.id);
    $q.notify({
      type: 'positive',
      message: 'Элемент успешно удален',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Не удалось удалить элемент',
    });
    console.log(error);
  }
};
</script>

<style scoped>
</style>
