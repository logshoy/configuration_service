<template>
  <div>
    <ProductCard />
    <div v-if="isLoading">Загрузка...</div>
    <div v-else-if="error">Ошибка: {{ error }}</div>
    <div v-else class="q-pa-md">
      <div v-if="!filteredListByNode" class="flex justify-center items center">
        <h3 > Выбери что-то</h3>
      </div>
      <div v-if="filteredListByNode" class="row q-gutter-md">
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
            <!-- <div >{{ item.settings }}</div> -->
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted} from 'vue';
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

const selectItem = (item) => {
  selectedItemStore.setConfiguration(item);
  selectedItemId.value = item;
};

onMounted(() => {
  selectedItemStore.fetchConfigurationList();
});

const filteredListByNode = computed(() => {
  return selectedItemStore.filteredConfigurationList({
    query: search.value,
    nodeId: branch.value
  });
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
</style>
