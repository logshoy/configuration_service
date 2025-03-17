<template>
  <div>
    <!-- Кнопка для открытия/закрытия QDrawer -->
    <q-btn
      v-if="!drawerOpen"
      class="drawer_button drawer_left"
      dense
      round
      color="blue"
      icon="chevron_right"
      @click="change"
    />
    <q-btn
      v-if="drawerOpen"
      class="drawer_button drawer_right"
      dense
      round
      color="blue"
      icon="chevron_left"
      @click="change"
    />
    <!-- QDrawer с информацией -->
    <q-drawer
      style="margin-left: 50px; background-color: aliceblue;;"
      show-if-above
      v-model="drawerOpen"
      class="q-pa-md"
    >
      <q-scroll-area class="fit">
        <q-btn color="green" icon="add" />
        <q-list class="rounded-borders">
          <q-expansion-item
            switch-toggle-side
            :content-inset-level="0.5"
            label="Магазин №1"
          >
            <q-expansion-item
              switch-toggle-side
              :content-inset-level="0.5"
              label="Группа касс 1"
            >
              <q-item
                clickable
                @click="selectItem('Касса 1', 'cash1-group1-shop1')"
                :class="{ selected: selectedItemId === 'cash1-group1-shop1' }"
              >
                <q-item-section>Касса 1</q-item-section>
              </q-item>
              <q-item
                clickable
                @click="selectItem('Касса 2', 'cash2-group1-shop1')"
                :class="{ selected: selectedItemId === 'cash2-group1-shop1' }"
              >
                <q-item-section>Касса 2</q-item-section>
              </q-item>
            </q-expansion-item>
            <q-expansion-item
              switch-toggle-side
              :content-inset-level="0.5"
              label="Группа касс 2"
            >
              <q-item
                clickable
                @click="selectItem('Касса 1', 'cash1-group2-shop1')"
                :class="{ selected: selectedItemId === 'cash1-group2-shop1' }"
              >
                <q-item-section>Касса 1</q-item-section>
              </q-item>
            </q-expansion-item>
          </q-expansion-item>

          <q-expansion-item
            :content-inset-level="0.5"
            switch-toggle-side
            label="Магазин №2"
          >
            <q-expansion-item
              switch-toggle-side
              :content-inset-level="0.5"
              label="Группа касс 1"
            >
              <q-item
                clickable
                @click="selectItem('Касса 1', 'cash1-group1-shop2')"
                :class="{ selected: selectedItemId === 'cash1-group1-shop2' }"
              >
                <q-item-section>Касса 1</q-item-section>
              </q-item>
              <q-item
                clickable
                @click="selectItem('Касса 2', 'cash2-group1-shop2')"
                :class="{ selected: selectedItemId === 'cash2-group1-shop2' }"
              >
                <q-item-section>Касса 2</q-item-section>
              </q-item>
            </q-expansion-item>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useConfigurationStore } from 'stores/configurationStore'; // Импортируйте хранилище

const configurationStore = useConfigurationStore(); // Используйте хранилище

const drawerOpen = ref(true);
const selectedItemId = ref(null); // Состояние для хранения id выбранного элемента

const change = () => {
  drawerOpen.value = !drawerOpen.value;
};

// Метод для выбора элемента
const selectItem = (itemName, itemId) => {
  selectedItemId.value = itemId; // Обновляем id выбранного элемента
  configurationStore.setConfiguration({
    settings: {
      name: itemName,
      typeConfiguration: 'AppCash',
      id: itemId, // Передаем id в хранилище
    },
  });
  console.log('Выбран элемент:', itemName, 'ID:', itemId);
};
</script>

<style scoped>
.drawer_button {
  position: fixed;
  top: 50%;
  z-index: 2222; /* Увеличиваем z-index, чтобы кнопки были поверх других элементов */
}

.drawer_left {
  left: 55px; /* Расстояние от правого края, учитывая ширину QDrawer */
}

.drawer_right {
  left: 330px; /* Расстояние от правого края, учитывая ширину QDrawer */
}

/* Стили для выделения выбранного элемента */
.selected {
  background-color: #e0f7fa; /* Цвет фона для выделения */
  font-weight: bold; /* Жирный шрифт */
  border-left: 4px solid #00bcd4; /* Синяя полоса слева */
}
</style>
