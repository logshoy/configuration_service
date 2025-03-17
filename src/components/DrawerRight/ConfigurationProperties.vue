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
      <!-- {{ localItem }} -->
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
import { useQuasar } from 'quasar';

import AppCash from 'components/Configuration/AppCash.vue';
import FiscalAgent from 'components/Configuration/FiscalAgent.vue';

const $q = useQuasar();
const selectedItemStore = useConfigurationStore();
const selectedItem = computed(() => selectedItemStore.configuration);

const localItem = ref(null);
const initialItem = ref(null);
const showCopiedNotification = ref(false);

watch(
  selectedItem,
  (newValue) => {
    if (newValue) {
      localItem.value = JSON.parse(JSON.stringify(newValue));
      initialItem.value = JSON.parse(JSON.stringify(newValue));
    } else {
      localItem.value = null;
      initialItem.value = null;
    }
  },
  { immediate: true }
);

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

const hasChanges = computed(() => {
  if (!localItem.value || !initialItem.value) return false;
  return JSON.stringify(localItem.value) !== JSON.stringify(initialItem.value);
});

const saveChanges = () => {
  if (!localItem.value) {
    console.error('Локальный элемент не определен');
    return;
  }

  selectedItemStore.updateItem(localItem.value);
  initialItem.value = JSON.parse(JSON.stringify(localItem.value));
};

const copyToClipboard = async () => {
  if (!localItem.value || !localItem.value.id) {
    $q.notify({
      type: 'negative',
      message: 'ID не найден',
    });
    return;
  }

  try {
    await navigator.clipboard.writeText(localItem.value.id);
    showCopiedNotification.value = true;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Не удалось скопировать ID',
    });
    console.log(error);
  }
};

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
