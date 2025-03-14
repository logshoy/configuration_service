<template>
  <div>

    <div class="_content_center">
    <DrawerListElements/>
    <div class="text-h5 q-pa-xs">{{ $t('configuration') }}</div>
    <div>{{ $t('success') }}</div>
    <q-input
      rounded
      outlined
      label="Поиск"
      type="search"
      placeholder="Введите текст для поиска"
      v-model="searchQuery"
    />
    <ProductCard />
    <div v-if="isLoading">Загрузка...</div>
    <div v-else-if="error">Ошибка: {{ error }}</div>
    <div v-else class="q-pa-md">
      <!-- Контейнер для карточек -->
      <div class="row q-gutter-md">
        <!-- Динамическое создание карточек -->
        <q-card
          v-for="item in filteredList"
          :key="item.id"
          :class="['my-card', 'rounded-borders', { 'selected-card': item.id === selectedItemId }]"
          clickable
          @click="selectItem(item)"
        >
          <q-card-section>
            <div class="text-h6">ID: {{ item.id }}</div>
            <div class="text-subtitle2">Настройки: {{ item.settings }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
      <DrawerRight />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useConfigurationStore } from 'stores/configurationStore';

import ProductCard from 'components/ProductCard.vue';
import DrawerRight from 'components/DrawerRight.vue';
import DrawerListElements from 'components/DrawerListElements.vue';


const selectedItemStore = useConfigurationStore();

// Поисковый запрос
const searchQuery = ref('');

// ID выбранного элемента
const selectedItemId = ref(null);

// Загружаем данные при монтировании компонента
onMounted(() => {
  selectedItemStore.fetchConfigurationList();
});

const selectItem = (item) => {
  selectedItemStore.setConfiguration(item); // Используем метод хранилища
  selectedItemId.value = item.id; // Обновляем ID выбранного элемента
};

// Получаем данные из хранилища
const isLoading = computed(() => selectedItemStore.isLoading);
const error = computed(() => selectedItemStore.error);

// Используем геттер filteredConfigurationList
const filteredList = computed(() => {
  const result = selectedItemStore.filteredConfigurationList(searchQuery.value);
  return result;
});
</script>

<style scoped>
/* Стили для карточек */
.my-card {
  width: 200px; /* Фиксированная ширина карточки */
  border-radius: 10px; /* Закругленные углы */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Тень для карточки */
  transition: all 0.3s ease; /* Плавное изменение стилей */
}

/* Стили для выделенной карточки */
.selected-card {
  border: 2px solid #1976d2; /* Синяя рамка */
  background-color: #e3f2fd; /* Светло-голубой фон */
  transform: scale(1.05); /* Увеличение карточки */
}

.drawer_right {
  z-index: 99999;
  margin-top: 50vh;
  right: 5px;
  position: absolute;
  display: flex;
}

.drawer_left {
  z-index: 99999;
  margin-top: 50vh;
  right: 300px;
  position: absolute;
}


._content_center {
  display: flex;
  width: 100%;
  padding: 30px 25px 20px 60px;
  flex: 1;
  flex-direction: column;
}

</style>
