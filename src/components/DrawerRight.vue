<template>
  <div class="drawer_container">
    <q-btn
      v-if="!drawerOpen"
      class="drawer_right"
      dense
      round
      color="accent"
      icon="chevron_left"
      @click="drawerOpen = !drawerOpen"
    />
    <q-btn
      v-if="drawerOpen"
      class="drawer_left"
      dense
      round
      color="accent"
      icon="chevron_right"
      @click="drawerOpen = !drawerOpen"
    />
    <!-- QDrawer с информацией -->
    <q-drawer
      overlay
      v-model="drawerOpen"
      side="right"
      bordered
      :width="315"
      behavior="desktop"
      persistent="false"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md" v-if="localItem">
          <q-form @submit.prevent="saveChanges">
            <div class="row">
              <span class="q-mt-none">Свойства элемента</span>
              <q-btn type="submit" class="row q-mx-md">Сохранить</q-btn>
            </div>

            <q-input
              class="q-ma-md"
              v-model="localItem.id"
              rounded
              outlined
              label="ID"
            />
            <q-input
              class="q-ma-md"
              v-model="localItem.name"
              rounded
              outlined
              label="Имя"
            />
            <q-input
              class="q-ma-md"
              v-model="localItem.code"
              rounded
              outlined
              label="Код"
            />
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useConfigurationStore } from 'stores/configurationStore';

const drawerOpen = ref(true);

const selectedItemStore = useConfigurationStore();
const selectedItem = computed(() => selectedItemStore.configuration); // Получаем выбранный элемент из хранилища

// Локальная копия элемента для редактирования
const localItem = ref({});

// Следим за изменением выбранного элемента
watch(
  selectedItem,
  (newValue) => {
    if (newValue) {
      // Копируем данные выбранного элемента в локальное состояние
      localItem.value = { ...newValue };
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
