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
        <div class="q-pa-md" v-if="localItem && !isCreateFormVisible">
          <q-form @submit.prevent="saveChanges">
            <div class="row">
              <span class="q-mt-none">Свойства элемента</span>
              <q-btn type="submit" color="primary" class="q-mx-md">Сохранить</q-btn>
            </div>
            <p>ID: {{ localItem.id }}</p>
            <q-input
              class="q-ma-md"
              v-model.number="localItem.settings.width"
              rounded
              outlined
              label="Ширина"
              type="number"
            />
            <q-input
              class="q-ma-md"
              v-model.number="localItem.settings.height"
              rounded
              outlined
              label="Высота"
              type="number"
            />
            <q-input
              class="q-ma-md"
              filled
              v-model="localItem.settings.color"
              hint="Цвет"
            >
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="localItem.settings.color" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-item class="q-ma-md column"> <p>Послед. изм:</p>
              {{ localItem.lastEditedUtc }}
            </q-item>
          </q-form>
        </div>
        <FormCreateConfiguration v-if="isCreateFormVisible" />
      </q-scroll-area>
    </q-drawer>
  </div>
</template>

<script setup>
import FormCreateConfiguration from 'components/FormCreateConfiguration.vue';
import { ref, computed, watch } from 'vue';
import { useConfigurationStore } from 'stores/configurationStore';

const drawerOpen = ref(true);

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
      localItem.value.settings.width = Number(localItem.value.settings.width);
      localItem.value.settings.height = Number(localItem.value.settings.height);
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
