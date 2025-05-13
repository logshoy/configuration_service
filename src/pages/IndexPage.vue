<template>
  <!-- <q-page> -->
  <div class="full-height">
    <!-- Компонент для копирования -->
    <CopyDialog
      v-model="copyDialogVisible"
      :source="copySource"
      :copy-type="selectedItemType"
      @confirm="handleCopyConfirm"
    />

    <!-- Компонент для перемещения -->
    <MoveDialog
      v-model="moveDialogVisible"
      :source="moveDevice"
      :copy-type="selectedItemType"
      @confirm="handleMoveConfirm"
    />

    <!-- Основной контент -->
    <div v-if="branch || !showNoSelectionMessage">
      <div class="column q-mb-md">
        <div class="row justify-between items-center">
          <div class="text-h5 q-pa-xs">{{ $t(headerTitle) }}</div>

        </div>
        <SearchInput
          v-model="searchQuery"
          @clear="clearSearch"
        />
      </div>
      <div class="row q-gutter-sm items-center">
      <ProductCard />
        <q-btn
              round
              color="teal"
              icon="content_copy"
              @click="openCopyDialog"
              title="Копировать конфигурацию"
              :disable="!canCopySelected"
            />
            <q-btn
              round
              color="orange"
              icon="drive_file_move"
              @click="openMoveDialog"
              title="Переместить конфигурацию"
              :disable="!canMoveSelected"
            />
          </div>
    </div>
    <div v-if="isLoading">Загрузка...</div>
    <div v-else-if="error">Ошибка: {{ error }}</div>
    <!-- Сообщение, если ничего не выбрано -->
    <div v-else-if="showNoSelectionMessage" class="column justify-center full-height items-center">
      <h3 class="q-mb-sm">Выбери что-то</h3>
    </div>

    <!-- Сообщение, если нет конфигураций -->
    <div v-else-if="hasNoConfigurations" class="flex flex-center column" style="min-height: 300px;">
      <h3 class="q-mb-sm">{{ noConfigurationsMessage }}</h3>
    </div>

    <!-- Отображение карточек, если есть результаты -->
      <q-scroll-area
        v-else
        class="scroll-area-custom"
        :visible="false"
        >
        <div class="row q-gutter-lg q-pa-md">
      <q-card
        v-for="item in filteredListByNode"
        :key="item.id"
        :class="['my-card', 'rounded-borders', {
          'selected-card': selectedItemId === item.id && isSameBranch && !selectedItemStore.isCreateFormVisible
        }]"
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
      </q-scroll-area>
  </div>
  <!-- </q-page> -->
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useConfigurationStore } from 'stores/configurationStore';
import { useShopStore } from 'stores/shopStore';
import { useDrawerStore } from 'stores/drawerStore';
import { useHeaderStore } from 'stores/headerStore';
import { useQuasar } from 'quasar';
import ProductCard from 'components/ProductCard.vue';
import SearchInput from 'components/Input/SearchInput.vue';
import CopyDialog from 'components/Dialog/CopyConfigurationDialog.vue';
import MoveDialog from 'components/Dialog/MoveConfigurationDialog.vue';

const $q = useQuasar();
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
const copyDialogVisible = ref(false);
const moveDialogVisible = ref(false);
const copySource = ref(null);
const moveDevice = ref(null);

const branchChanged = ref(false);

// Computed свойства
const branch = computed(() => shopStore.branch);
const isLoading = computed(() => selectedItemStore.isLoading);
const error = computed(() => selectedItemStore.error);
const isSameBranch = computed(() => lastSelectedBranch.value === branch.value);

const selectedConfiguration = computed(() => {
  return selectedItemId.value ? selectedItemStore.getConfiguration(selectedItemId.value) : null;
});

const selectedItemType = computed(() => {
  return selectedConfiguration.value?.settings?.type;
});


const canCopySelected = computed(() => {
  return !!selectedItemId.value && !branchChanged.value;
});

const canMoveSelected = computed(() => {
  return !!selectedItemId.value && !branchChanged.value;
});

const showNoSelectionMessage = computed(() => {
  return !branch.value && !selectedItemStore.getShowAllConfiguration;
});

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
  branchChanged.value = false;
};

const clearSearch = () => {
  drawerStore.setSearch('');
};


const openCopyDialog = () => {
  if (!selectedItemId.value) return;

  copySource.value = {
    id: selectedItemId.value,
    name: selectedConfiguration.value?.settings?.configurationName || 'Конфигурация',
    type: selectedItemType.value
  };

  copyDialogVisible.value = true;
};

const openMoveDialog = () => {
  if (!selectedItemId.value) return;

  moveDevice.value = {
    id: selectedItemId.value,
    name: selectedConfiguration.value?.settings?.configurationName || 'Конфигурация',
  };
  console.log( moveDevice.value)

  moveDialogVisible.value = true;
};

const handleCopyConfirm = async (params) => {
  try {
    const { newName, targetId } = params;
    const originalConfig = selectedConfiguration.value;

    if (!originalConfig) return;

    const newConfig = {
      ...originalConfig,
      settings: {
        ...originalConfig.settings,
        configurationName: newName,
        node: targetId
      }
    };

    selectedItemStore.createConfiguration(newConfig.settings);
    console.log('я сработал')
    $q.notify({
      type: 'positive',
      message: 'Конфигурация успешно скопирована'
    });

    copyDialogVisible.value = false;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Ошибка при копировании конфигурации'
    });
    console.error('Ошибка при копировании конфигурации:', error);
  }
};

const handleMoveConfirm = async (params) => {
  const { targetId } = params;

  try {
    const config = selectedConfiguration.value;
    if (!config) return;

    const updatedConfig = {
      ...config,
      settings: {
        ...config.settings,
        node: targetId
      }
    };

    selectedItemStore.updateItem(updatedConfig);

    $q.notify({
      type: 'positive',
      message: 'Конфигурация успешно перемещена'
    });

    moveDialogVisible.value = false;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Ошибка при перемещении конфигурации'
    });
    console.error('Ошибка при перемещении конфигурации:', error);
  }
};

// Watchers
watch(searchQuery, (newVal) => {
  drawerStore.setSearch(newVal);
  selectedItemId.value = null;
  branchChanged.value = true;
});

watch(() => route.path, () => {
  searchQuery.value = '';
  drawerStore.setSearch('');
  branchChanged.value = true;
});

watch(branch, (newBranch, oldBranch) => {
  if (newBranch !== oldBranch) {
    branchChanged.value = true; // Устанавливаем флаг при изменении branch
    lastSelectedBranch.value = null;
    if (newBranch) {
      searchQuery.value = '';
      drawerStore.setSearch('');
    }
  }
});

watch(storeSearch, (newVal) => {
  if (newVal !== searchQuery.value) {
    searchQuery.value = newVal;
    branchChanged.value = true;
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
.scroll-area-custom {
  height: calc(100vh - 200px); /* Подстройте под ваш макет */
  width: 100%;
}

.my-card {
  width: 250px;
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
