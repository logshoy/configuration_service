<template>
  <div>
    <div class="text-h5 q-pa-xs">Конфигурации</div>
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
          class="my-card rounded-borders"
          clickable
          @click="selectItem(item)"
        >
          <q-card-section>
            <div class="text-h6">ID: {{ item.id }}</div>
            <div class="text-subtitle2">Настройки: {{ item.settings }}</div>
            <div class="text-subtitle2">Последнее изменение: {{ item.lastEditedUtc }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import ProductCard from 'components/ProductCard.vue';
import { ref, onMounted, computed } from 'vue';
import { useConfigurationStore } from 'stores/configurationStore';

const selectedItemStore = useConfigurationStore();

// Поисковый запрос
const searchQuery = ref('');

// Загружаем данные при монтировании компонента
onMounted(() => {
  selectedItemStore.fetchConfigurationList();
});

const selectItem = (item) => {
  selectedItemStore.setConfiguration(item); // Используем метод хранилища
};

// Получаем данные из хранилища
const isLoading = computed(() => selectedItemStore.isLoading);
const error = computed(() => selectedItemStore.error);

// Используем геттер filteredConfigurationList
const filteredList = computed(() => {
  const result = selectedItemStore.filteredConfigurationList(searchQuery.value);
  console.log('Результат поиска:', result); // Отладка
  return result;
});
</script>

<style scoped>
/* Стили для карточек */
.my-card {
  width: 200px; /* Фиксированная ширина карточки */
  border-radius: 10px; /* Закругленные углы */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Тень для карточки */
}

/* Контейнер для карточек */
.row {
  display: flex;
  flex-wrap: wrap; /* Перенос карточек на новую строку */
}
</style>
