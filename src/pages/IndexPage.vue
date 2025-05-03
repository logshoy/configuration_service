<template>
  <div class="full-height">
    <div v-if="branch">
      <div class="column q-mb-md" >
        <div class="text-h5 q-pa-xs">{{ $t(headerTitle) }}</div>
        <SearchInput
          v-model="searchQuery"
          @clear="clearSearch"
          class="q-mb-md"
        />
      </div>

      <ProductCard />
    </div>
    <div v-if="isLoading">Загрузка...</div>
    <div v-else-if="error">Ошибка: {{ error }}</div>
      <!-- Сообщение, если ничего не выбрано -->
      <div v-else-if="!branch" class="column justify-center full-height items-center" >
        <h3 class="q-mb-sm">Выбери что-то</h3>
      </div>

      <!-- Сообщение, если нет конфигураций -->
      <div v-else-if="hasNoConfigurations" class="flex flex-center column" style="min-height: 300px;">
        <h3 class="q-mb-sm">{{ noConfigurationsMessage }}</h3>
      </div>

      <!-- Отображение карточек, если есть результаты -->
      <div v-else class="row q-gutter-md">
        <q-card
          v-for="item in filteredListByNode"
          :key="item.id"
          :class="['my-card', 'rounded-borders', { 'selected-card': selectedItemId === item.id && isSameBranch }]"
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useConfigurationStore } from 'stores/configurationStore';
import { useShopStore } from 'stores/shopStore';
import { useDrawerStore } from 'stores/drawerStore';
import { useHeaderStore } from 'stores/headerStore';
import ProductCard from 'components/ProductCard.vue';
import SearchInput from 'components/Input/SearchInput.vue';

const route = useRoute();
const selectedItemStore = useConfigurationStore();
const shopStore = useShopStore();
const drawerStore = useDrawerStore();
const headerStore = useHeaderStore();

const { title: headerTitle } = storeToRefs(headerStore);
const { search: storeSearch } = storeToRefs(drawerStore);

// Состояние компонента
const selectedItemId = ref(null);
const lastSelectedBranch = ref(null);
const searchQuery = ref(storeSearch.value || '');

// Computed свойства
const branch = computed(() => shopStore.branch);
const isLoading = computed(() => selectedItemStore.isLoading);
const error = computed(() => selectedItemStore.error);
const isSameBranch = computed(() => lastSelectedBranch.value === branch.value);

const filteredListByNode = computed(() => {
  const result = selectedItemStore.filteredConfigurationList({
    query: searchQuery.value,
    nodeId: branch.value
  });
  return result || [];
});

const hasNoConfigurations = computed(() => {
  return branch.value && filteredListByNode.value.length === 0;
});

const noConfigurationsMessage = computed(() => {
  return searchQuery.value
    ? 'Ничего не найдено 😞'
    : 'Тут пусто';
});

// Методы
const selectItem = (item) => {
  selectedItemStore.setConfiguration(item);
  selectedItemId.value = item;
  lastSelectedBranch.value = branch.value;
};

const clearSearch = () => {
  drawerStore.setSearch('');
};

// Watchers
watch(searchQuery, (newVal) => {
  drawerStore.setSearch(newVal);
  selectedItemId.value = null;
});

watch(() => route.path, () => {
  searchQuery.value = '';
  drawerStore.setSearch('');
});

watch(branch, (newBranch) => {
  lastSelectedBranch.value = null;
  // Сбрасываем поиск при смене ветки
  if (newBranch) {
    searchQuery.value = '';
    drawerStore.setSearch('');
  }
});

watch(storeSearch, (newVal) => {
  if (newVal !== searchQuery.value) {
    searchQuery.value = newVal;
  }
});

watch(branch, () => {
  lastSelectedBranch.value = null;
});

// Хуки жизненного цикла
onMounted(() => {
  selectedItemStore.fetchConfigurationList();
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

.flex.items-center.justify-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
</style>
