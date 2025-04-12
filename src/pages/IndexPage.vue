<template>
  <div>
    <ProductCard />
    <div v-if="isLoading">Загрузка...</div>
    <div v-else-if="error">Ошибка: {{ error }}</div>
    <div v-else class="q-pa-md">
      <!-- Сообщение, если ничего не выбрано -->
      <div v-if="!branch" class="flex flex-center column" style="min-height: 200px;">
        <h3 class="q-mb-sm">Выбери что-то</h3>
      </div>

      <!-- Сообщение, если нет конфигураций -->
      <div v-else-if="hasNoConfigurations" class="flex flex-center column" style="min-height: 200px;">
        <h3 class="q-mb-sm">{{ noConfigurationsMessage }}</h3>
      </div>

      <!-- Отображение карточек, если есть результаты -->
      <div v-else class="row q-gutter-md">
        <q-card
          v-for="item in filteredListByNode"
          :key="item.id"
          :class="['my-card', 'rounded-borders', { 'selected-card': selectedItemId == item.id }]"
          clickable
          @click="selectItem(item.id)"
        >
          <q-card-section>
            <div class="text-h6">{{ item.settings.configurationName }}</div>
            <br>
            <div class="text-subtitle2">ID: {{ item.id }}</div>
            <br>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useConfigurationStore } from 'stores/configurationStore';
import { useShopStore } from 'stores/shopStore';
import { useDrawerStore } from 'stores/drawerStore';
import ProductCard from 'components/ProductCard.vue';

const selectedItemStore = useConfigurationStore();
const selectedItemId = ref(null);

const shopStore = useShopStore();
const drawerStore = useDrawerStore();

const branch = computed(() => shopStore.branch);
const search = computed(() => drawerStore.search);

// Добавляем watch для отслеживания изменений search
watch(search, () => {
  // При изменении поискового запроса сбрасываем выбранный элемент
  selectedItemId.value = null;
});

const selectItem = (item) => {
  selectedItemStore.setConfiguration(item);
  selectedItemId.value = item;
};

onMounted(() => {
  selectedItemStore.fetchConfigurationList();
});

const filteredListByNode = computed(() => {
  const result = selectedItemStore.filteredConfigurationList({
    query: search.value,
    nodeId: branch.value
  });
  // Всегда возвращаем массив (пустой, если нет результатов)
  return result || [];
});

// Вычисляемые свойства для управления состоянием
const isLoading = computed(() => selectedItemStore.isLoading);
const error = computed(() => selectedItemStore.error);

const hasNoConfigurations = computed(() => {
  return branch.value && filteredListByNode.value.length === 0;
});

const noConfigurationsMessage = computed(() => {
  return search.value
    ? 'Ничего не найдено 😞'
    : 'Тут пусто';
});

</script>

<style scoped>
.my-card {
  width: 200px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.selected-card {
  border: 2px solid #1976d2;
  background-color: #e3f2fd;
  transform: scale(1.05);
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
