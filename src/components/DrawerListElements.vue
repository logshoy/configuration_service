<template>
  <div class="drawer_container">
    <!-- Кнопка управления drawer -->
    <q-btn
      class="drawer_button"
      :class="drawerOpen ? 'drawer_right' : 'drawer_left'"
      dense round color="blue"
      :icon="drawerOpen ? 'chevron_left' : 'chevron_right'"
      @click="change"
      :style="drawerOpen ? { left: `${drawerWidthValue + 55}px` } : { left: '75px' }"
    />

    <!-- Drawer с деревом -->
    <q-drawer
      style="background-color: #f5f9ff; margin-left: 75px;"
      :width="drawerWidthValue"
      v-model="drawerOpen"
      bordered
      :overlay="false"
      behavior="desktop"
      @click="handleDrawerClick"
    >
      <q-scroll-area class="fit q-pa-md">
        <!-- Группа кнопок управления -->
        <div class="row q-mb-md no-wrap " ref="buttonsContainer">
          <!-- Кнопка добавления -->
          <div>
            <q-btn
              color="green-8"
              icon="add"
              dense
              glossy
              @click="enableCreateForm"
            >
              <q-tooltip>Добавить новый элемент</q-tooltip>
            </q-btn>

            <!-- Кнопка перемещения -->
            <q-btn
              color="deep-orange-8"
              icon="drive_file_move"
              dense
              glossy
              class="q-ml-sm"
              @click="openMoveDialog"
              :disable="!canMoveSelected"
            >
              <q-tooltip>Переместить выбранный элемент</q-tooltip>
            </q-btn>

            <!-- Кнопка копирования -->
            <q-btn
              color="teal-8"
              icon="content_copy"
              dense
              glossy
              class="q-ml-sm"
              @click="openCopyDialog"
              :disable="!canCopySelected"
            >
              <q-tooltip>Копировать кассу</q-tooltip>
            </q-btn>

            <q-btn
              color="purple-8"
              :icon="showAll ? 'visibility_off' : 'visibility'"
              dense
              glossy
              class="q-ml-sm"
              @click="showAllConfigurations"
            >
              <q-tooltip>
                {{ showAll ? 'Скрыть все конфигурации' : 'Показать все конфигурации' }}
              </q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Дерево элементов -->
        <q-tree
          :nodes="treeData"
          ref="treeRef"
          node-key="id"
          selected-color="primary"
          v-model:selected="selectedItemId"
          default-expand-all
          class="colorful-tree"
        >
          <template v-slot:default-header="prop">
            <div class="row items-center tree-node"
              :data-node-type="prop.node.type"
              :class="{
                'selected-node': selectedItemId === prop.node.id,
                [`node-type-${prop.node.type}`]: true
              }">
              <q-icon
                :name="getIcon(prop.node)"
                class="q-mr-sm"
                size="1.2em"
                :color="getIconColor(prop.node)"
              />
              <span class="node-label">
                {{ prop.node.label }}
              </span>
              <q-badge v-if="prop.node.status"
                      :color="getBadgeColor(prop.node.status)"
                      class="q-ml-sm">
                {{ prop.node.status }}
              </q-badge>
            </div>
          </template>
        </q-tree>
      </q-scroll-area>
    </q-drawer>

    <!-- Компонент перемещения -->
    <MoveDialog
      v-model="moveDialogVisible"
      :device="moveDevice"
      :deviceType="selectedItem?.type"
      @confirm="handleMoveConfirm"
    />

    <!-- Компонент копирования -->
    <CopyDialog
      v-model="copyDialogVisible"
      :source="copySource"
      :copyType="selectedItem?.type"
      @confirm="handleCopyConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useShopStore } from 'stores/shopStore';
import { useConfigurationStore } from 'stores/configurationStore';
import { useDrawerStore } from 'stores/drawerStore';

import CopyDialog from '/src/components/Dialog/CopyDialog.vue';
import MoveDialog from '/src/components/Dialog/MoveDialog.vue';

const shopStore = useShopStore();
const configurationStore = useConfigurationStore();
const drawerStore = useDrawerStore();

const treeRef = ref(null);
const buttonsContainer = ref(null);
const windowWidth = ref(window.innerWidth);
const drawerWidthValue = ref(315);

// Состояние drawer
const drawerOpen = computed(() => drawerStore.drawerOpenLeft);
const change = () => drawerStore.setDrawerOpenLeft();

// Логика динамической ширины
const calculateWidth = () => {
  const minScreenWidth = 1024;
  const maxScreenWidth = 1920;
  const minWidth = 245;
  const maxWidth = 315;

  if (windowWidth.value <= minScreenWidth) return minWidth;
  if (windowWidth.value >= maxScreenWidth) return maxWidth;

  const ratio = (windowWidth.value - minScreenWidth) / (maxScreenWidth - minScreenWidth);
  return Math.round(minWidth + ratio * (maxWidth - minWidth));
};

const updateDrawerWidth = () => {
  drawerWidthValue.value = calculateWidth();
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  updateDrawerWidth();
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  updateDrawerWidth();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

// Данные дерева
const treeData = computed(() => shopStore.treeData);
const selectedItemId = computed({
  get: () => shopStore.branch || null,
  set: (value) => {
    configurationStore.setConfiguration(value);
    shopStore.setBranch(value);
  }
});

const selectedItem = computed(() => {
  return findNodeById(treeData.value, selectedItemId.value);
});

// Проверка возможности перемещения/копирования
const canMoveSelected = computed(() => {
   return ['cashGroup', 'cashRegister'].includes(selectedItem.value?.type);
});

const showAll = computed(() => configurationStore.showAllConfiguration);

// Логика перемещения кассы
const moveDialogVisible = ref(false);
const moveDevice = ref(null);

const openMoveDialog = () => {
  if (!selectedItem.value) return;

  // Для групп касс передаем shopId, для касс - groupId
  if (selectedItem.value.type === 'cashGroup') {
    moveDevice.value = {
      id: selectedItem.value.id,
      name: selectedItem.value.label,
      shopId: selectedItem.value.shopId
    };
  } else {
    moveDevice.value = {
      id: selectedItem.value.id,
      name: selectedItem.value.label,
      groupId: selectedItem.value.cashGroupId
    };
  }

  moveDialogVisible.value = true;
};

const handleMoveConfirm = async (targetId) => {
  try {
    if (!selectedItem.value) {
      console.error('Не выбран элемент для перемещения');
      return;
    }

    let success;

    if (selectedItem.value.type === 'cashGroup') {
      success = await shopStore.moveCashGroup(
        selectedItem.value.id,
        targetId
      );
    } else {
      success = await shopStore.moveCashRegister(
        selectedItem.value.id,
        targetId
      );
    }

    if (success) {
      const newSelectedId = selectedItem.value.id;
      shopStore.setBranch(null);
      nextTick(() => {
        shopStore.setBranch(newSelectedId);
      });

      moveDialogVisible.value = false;
    }
  } catch (error) {
    console.error('Ошибка при перемещении:', error);
  }
};

// Логика копирования кассы
const copyDialogVisible = ref(false);
const copySource = ref(null);

const canCopySelected = computed(() => {
  return ['shop', 'cashGroup', 'cashRegister'].includes(selectedItem.value?.type);
});

const openCopyDialog = () => {
  if (!selectedItem.value) return;

  const commonFields = {
    id: selectedItem.value.id,
    name: selectedItem.value.label,
  };

  if (selectedItem.value.type === 'shop') {
    copySource.value = {
      ...commonFields,
      shopId: selectedItem.value.id
    };
  } else if (selectedItem.value.type === 'cashGroup') {
    copySource.value = {
      ...commonFields,
      shopId: selectedItem.value.shopId
    };
  } else if (selectedItem.value.type === 'cashRegister') {
    copySource.value = {
      ...commonFields,
      code: `${selectedItem.value.id.slice(0, 4).toUpperCase()}`,
      groupId: selectedItem.value.cashGroupId
    };
  }

  copyDialogVisible.value = true;
};

const handleCopyConfirm = async (params) => {
  try {
    const { newName } = params;

    if (selectedItem.value.type === 'shop') {
      shopStore.copyShop(selectedItem.value.id, newName);
    } else if (selectedItem.value.type === 'cashGroup') {
      shopStore.copyCashGroup(selectedItem.value.id, params.targetShopId, newName);
    } else if (selectedItem.value.type === 'cashRegister') {
      const sourceCash = shopStore.getCashRegisterById(selectedItem.value.id);

      const originalSettings = configurationStore.getConfiguration(sourceCash.id);
      const cashData = {
        ...sourceCash,
        settings: originalSettings
      };
      shopStore.addCashRegisterCopy(
        params.targetGroupId,
        cashData,
        newName
      );
    }

    copyDialogVisible.value = false;
  } catch (error) {
    console.error('Ошибка при копировании:', error);
  }
};

// Остальные методы
const enableCreateForm = () => {
  const node = findNodeById(treeData.value, selectedItemId.value);

  if (!node?.type) {
    configurationStore.enableCreateFormVisibility('shop');
  } else if (node.type === 'shop') {
    configurationStore.enableCreateFormVisibility('cashGroup');
  } else if (node.type === 'cashGroup') {
    configurationStore.enableCreateFormVisibility('appCash');
  }
};

const findNodeById = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const getIcon = (node) => {
  return {
    shop: 'store',
    cashGroup: 'group',
    cashRegister: 'point_of_sale'
  }[node.type];
};

const getIconColor = (node) => {
  const colors = {
    shop: 'deep-purple',
    cashGroup: 'orange',
    cashRegister: 'green'
  };
  return colors[node.type] || 'grey';
};

const getBadgeColor = (status) => {
  const statusColors = {
    new: 'green',
    modified: 'orange',
    deleted: 'red',
    archived: 'blue'
  };
  return statusColors[status] || 'grey';
};

const handleDrawerClick = (event) => {
  const isButton = event.target.closest('.q-btn') !== null;
  const isTree = treeRef.value?.$el?.contains(event.target);

  if (!isButton && !isTree) {
    shopStore.setBranch(null);
  }
};

const showAllConfigurations = () => {
  configurationStore.toggleViewMode()
};
</script>

<style scoped>
.drawer_button {
  position: fixed;
  top: 50%;
  z-index: 2222;
  transition: all 0.3s ease;
}

.action-buttons {
  background: linear-gradient(90deg, #f5f9ff 0%, #e6f0ff 100%);
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.button-group {
  display: flex;
  gap: 6px;
}

.colorful-tree {
  --tree-indent: 24px;
}

.tree-node {
  padding: 4px 8px;
  margin: 2px 0;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
}

.node-type-shop {
  background-color: #f3e5f5;
  border-left: 3px solid #9c27b0;
}

.node-type-cashGroup {
  background-color: #fff3e0;
  border-left: 3px solid #ff9800;
}

.node-type-cashRegister {
  background-color: #e8f5e9;
  border-left: 3px solid #4caf50;
}

.selected-node {
  background-color: #e3f2fd !important;
  border-left: 12px solid #2196f3 !important;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3);
}

.node-label {
  transition: color 0.3s ease;
  color: #333;
}

:deep(.q-tree__node--selected) .node-label {
  color: #0d47a1;
}

:deep(.q-drawer) {
  box-shadow: 12px 8px 5px rgba(73, 62, 129, 0.078);
  background: linear-gradient(180deg, #f5f9ff 0%, #e6f0ff 100%);
}

/* :deep(.q-tree__node:before) {
  content: '';
  position: absolute;
  left: -18px;
  top: -12px;
  width: 1px;
  height: calc(100% + 24px);
  border-left: 2px solid;
  color: black;
} */

:deep(.q-tree__node[data-node-type="shop"]:before) {
  border-color: #9c27b0 !important; /* Фиолетовый для магазинов */
}

:deep(.q-tree__node[data-node-type="cashGroup"]:before) {
  border-color: #ff9800 !important; /* Оранжевый для групп касс */
}

:deep(.q-tree__node[data-node-type="cashRegister"]:before) {
  border-color: #4caf50 !important; /* Зеленый для касс */
}

/* Стили для горизонтальных соединителей */
:deep(.q-tree__node-connector) {
  position: relative;
}

:deep(.q-tree__node-connector:after) {
  content: '';
  position: absolute;
  top: 50%;
  left: -18px;
  width: 16px;
  border-top: 2px solid;
}

:deep([data-node-type="shop"] .q-tree__node-connector:after) {
  border-color: #9c27b0 !important;
}

:deep([data-node-type="cashGroup"] .q-tree__node-connector:after) {
  border-color: #ff9800 !important;
}

:deep([data-node-type="cashRegister"] .q-tree__node-connector:after) {
  border-color: #4caf50 !important;
}


:deep(.q-tree__node[data-node-type="shop"]:before) {
  border-color: #9c27b0 !important;
}

:deep(.q-tree__node[data-node-type="cashGroup"]:before) {
  border-color: #ff9800 !important;
}

:deep(.q-tree__node[data-node-type="cashRegister"]:before) {
  border-color: #4caf50 !important;
}

/* Горизонтальные линии */
:deep([data-node-type="shop"] .q-tree__node-connector:after) {
  border-color: #9c27b0 !important;
}

:deep([data-node-type="cashGroup"] .q-tree__node-connector:after) {
  border-color: #ff9800 !important;
}

:deep([data-node-type="cashRegister"] .q-tree__node-connector:after) {
  border-color: #4caf50 !important;
}

.row.q-mb-md.no-wrap {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.q-badge {
  font-size: 0.7em;
  padding: 2px 5px;
  margin-left: 8px;
}
</style>
