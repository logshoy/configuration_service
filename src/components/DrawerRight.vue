<template>
  <div class="drawer_container">
    <q-btn
      v-if="!drawerOpen"
      class="drawer_right"
      dense
      round
      color="accent"
      icon="chevron_left"
      @click="change"
    />
    <q-btn
      v-if="drawerOpen"
      class="drawer_left"
      dense
      round
      color="accent"
      icon="chevron_right"
      @click="change"
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
        <!-- Используем новый компонент -->
        <ConfigurationProperties v-if="localItem && !isCreateFormVisible" :localItem="localItem" @save="saveChanges" />
        <FormCreateConfiguration v-if="isCreateFormVisible" />
        <div
        v-else-if="!localItem || isCreateFormVisible"
        class="flex justify-center items-center"
        style="height: 100vh;"
        >
          Выберите элемент
        </div>
      </q-scroll-area>
    </q-drawer>
  </div>
</template>

<script setup>
import FormCreateConfiguration from 'components/FormCreateConfiguration.vue';
import ConfigurationProperties from 'components/DrawerRight/ConfigurationProperties.vue'; // Импортируем новый компонент
import { ref, computed, watch } from 'vue';
import { useConfigurationStore } from 'stores/configurationStore';

import { useDrawerStore } from 'stores/drawerStore';

const drawerStore = useDrawerStore();

const drawerOpen = computed(() => drawerStore.drawerOpenRight);

const change = () => {
  console.log('я выполняюсь')
  drawerStore.setDrawerOpenRight()
}

const selectedItemStore = useConfigurationStore();
const selectedItem = computed(() => selectedItemStore.configuration); // Получаем выбранный элемент из хранилища

// Локальная копия элемента для редактирования
const localItem = ref(null);

// Видимость формы
const isCreateFormVisible = computed(() => selectedItemStore.isCreateFormVisible);

// Следим за изменением выбранного элемента
watch(
  selectedItem,
  (newValue) => {
    if (newValue) {
      // Создаем глубокую копию объекта для редактирования
      localItem.value = JSON.parse(JSON.stringify(newValue));
      // Вручную преобразуем строки в числа
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
