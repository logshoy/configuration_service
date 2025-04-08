<template>
  <div>
    <!-- Кнопка управления drawer -->
    <q-btn
      class="drawer_button"
      :class="drawerOpen ? 'drawer_right' : 'drawer_left'"
      dense round color="blue"
      :icon="drawerOpen ? 'chevron_left' : 'chevron_right'"
      @click="change"
    />

    <!-- Drawer с деревом -->
    <q-drawer
      style="background-color: aliceblue;"
      :width="315"
      show-if-above
      v-model="drawerOpen"
      bordered
      @click="handleDrawerClick"
    >
      <q-scroll-area class="fit q-pa-md">
        <!-- Группа кнопок управления -->
        <div class="row q-mb-md no-wrap" ref="buttonRef">
          <!-- Кнопка добавления -->
          <q-btn
            color="green"
            icon="add"
            dense
            @click="enableCreateForm"
          >
            <q-tooltip>Добавить новый элемент</q-tooltip>
          </q-btn>

          <!-- Кнопка перемещения -->
          <q-btn
            color="orange"
            icon="drive_file_move"
            dense
            class="q-ml-sm"
            @click="openMoveDialog"
            :disable="!canMoveSelected"
          >
            <q-tooltip>Переместить выбранный элемент</q-tooltip>
          </q-btn>

          <!-- Кнопка копирования -->
          <q-btn
            color="teal"
            icon="content_copy"
            dense
            class="q-ml-sm"
            @click="openCopyDialog"
            :disable="!canCopySelected"
          >
            <q-tooltip>Копировать кассу</q-tooltip>
          </q-btn>
        </div>

        <!-- Дерево элементов -->
        <q-tree
          :nodes="treeData"
          ref="treeRef"
          node-key="id"
          selected-color="primary"
          v-model:selected="selectedItemId"
          default-expand-all
        >
          <template v-slot:default-header="prop">
            <div class="row items-center"
              :class="{ 'selected-node': selectedItemId === prop.node.id }">
              <q-icon
                :name="getIcon(prop.node)"
                class="q-mr-sm"
                size="1.2em"
              />
              <span>
                {{ prop.node.label }}
              </span>
            </div>
          </template>
        </q-tree>
      </q-scroll-area>
    </q-drawer>

    <!-- Компонент перемещения -->
    <MoveDialog
      v-model="moveDialogVisible"
      :device="moveDevice"
      @confirm="handleMoveConfirm"
    />

    <!-- Компонент копирования -->
    <CopyDialog
      v-model="copyDialogVisible"
      :source="copySource"
      @confirm="handleCopyConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick  } from 'vue';
import { useShopStore } from 'stores/shopStore';
import { useConfigurationStore } from 'stores/configurationStore';
import { useDrawerStore } from 'stores/drawerStore';


import CopyDialog from '/src/components/Dialog/CopyDialog.vue';
import MoveDialog from '/src/components/Dialog/MoveDialog.vue';

const shopStore = useShopStore();
const configurationStore = useConfigurationStore();
const drawerStore = useDrawerStore();

const treeRef = ref(null);
const buttonRef = ref(null);

// Состояние drawer
const drawerOpen = computed(() => drawerStore.drawerOpenLeft);
const change = () => drawerStore.setDrawerOpenLeft();

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
  return selectedItem.value?.type === 'cashRegister';
});

const canCopySelected = computed(() => {
  return selectedItem.value?.type === 'cashRegister';
});

// Логика перемещения кассы
const moveDialogVisible = ref(false);
const moveDevice = ref(null);

const openMoveDialog = () => {
  if (!selectedItem.value) return;

  moveDevice.value = {
    id: selectedItem.value.id,
    name: selectedItem.value.label,
    groupId: selectedItem.value.cashGroupId
  };

  moveDialogVisible.value = true;
};

const handleMoveConfirm = async (targetGroupId) => {
  try {
    if (!selectedItem.value) {
      console.error('Не выбрана касса для перемещения');
      return;
    }

    const success = await shopStore.moveCashRegister(
      selectedItem.value.id,
      targetGroupId
    );

    if (success) {
      // Принудительно обновляем выбранный элемент
      const newSelectedId = selectedItem.value.id;
      shopStore.setBranch(null); // Сбрасываем выбор
      nextTick(() => {
        shopStore.setBranch(newSelectedId); // Восстанавливаем выбор
      });

      moveDialogVisible.value = false;
      console.log('Перемещение завершено успешно');
    } else {
      console.error('Не удалось переместить кассу');
    }
  } catch (error) {
    console.error('Ошибка при перемещении кассы:', error);
  }
};

// Логика копирования кассы
const copyDialogVisible = ref(false);
const copySource = ref(null);

const openCopyDialog = () => {
  if (!selectedItem.value) return;

  copySource.value = {
    id: selectedItem.value.id,
    name: selectedItem.value.label,
    code: `CR-${selectedItem.value.id.slice(0, 4).toUpperCase()}`,
    groupId: selectedItem.value.cashGroupId
  };

  copyDialogVisible.value = true;
};

const handleCopyConfirm = async ({ targetGroupId, newName }) => {
  try {
    const sourceCash = shopStore.getCashRegisterById(copySource.value.id);
    if (!sourceCash) return;

    const originalSettings = configurationStore.getConfiguration(sourceCash.id);

    // Подготавливаем данные для копирования
    const cashData = {
      ...sourceCash,
      name: newName,
      settings: originalSettings // Передаем настройки вместе с данными кассы
    };

    const success = await shopStore.addCashRegisterCopy(
      targetGroupId,
      cashData
    );

    if (success) {
      copyDialogVisible.value = false;
    }
  } catch (error) {
    console.error('Ошибка при копировании кассы:', error);
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

const handleDrawerClick = (event) => {
  if (
    treeRef.value?.$el &&
    !treeRef.value.$el.contains(event.target) &&
    buttonRef.value?.$el &&
    !buttonRef.value.$el.contains(event.target)
  ) {
    shopStore.setBranch(null);
  }
};
</script>

<style scoped>
.drawer_button {
  position: fixed;
  top: 50%;
  z-index: 2222;
  transition: left 0.3s ease;
}

.drawer_left {
  left: 75px;
}

.drawer_right {
  left: 370px;
}

:deep(.q-tree__node--selected) {
  background-color: #e0f7fa;
  font-weight: bold;
  border-left: 4px solid #00bcd4;
}

.selected-node {
  background-color: #e0f7fa;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
}

:deep(.q-drawer) {
  box-shadow: 12px 8px 5px rgba(73, 62, 129, 0.078);
}

.row.q-mb-md.no-wrap {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}
</style>
