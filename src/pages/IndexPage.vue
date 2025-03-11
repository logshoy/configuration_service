<template>
  <div>
  <span>Сервисы</span>
  <q-input
    rounded
    outlined
    label="Поиск"
    type="search"
    placeholder="Введите 3 символа для поиска"
  >
  </q-input>
  <ProductCard />
  <div class="q-pa-md">
    <!-- Контейнер для карточек -->
    <div class="row q-gutter-md">
      <!-- Динамическое создание карточек -->
      <q-card
        v-for="item in configurationList"
        :key="item.id"
        class="my-card rounded-borders"
        clickable
        :active="selectedItem?.id === item.id"
        @click="selectItem(item)"
      >
        <q-card-section>
          <div class="text-h6">{{ item.name }}</div>
          <div class="text-subtitle2">Код: {{ item.code }}</div>
          <div class="text-subtitle2">ID: {{ item.id }}</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</div>
</template>

<script setup>
import { computed } from 'vue';

import { useConfigurationStore } from 'stores/configurationStore';

import ProductCard from 'components/ProductCard.vue';

const selectedItemStore  = useConfigurationStore();;


const configurationList = computed(() => selectedItemStore.configurationList);

const selectItem = (item) => {
  selectedItemStore.setConfiguration(item); // Используем метод хранилища
};

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
