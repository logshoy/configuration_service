<template>
  <div>
    <!-- Кнопка управления drawer -->
    <q-btn
      class="drawer_button"
      :class="drawerOpen ? 'drawer_right' : 'drawer_left'"
      dense round color="blue"
      :icon="drawerOpen ? 'chevron_left' : 'chevron_right'"
      @click="drawerOpen = !drawerOpen"
    />

    <!-- Drawer с деревом -->
    <q-drawer
      style="margin-left: 50px; background-color: aliceblue"
      show-if-above
      v-model="drawerOpen"
    >
      <q-scroll-area class="fit q-pa-md">
        <!-- Кнопка добавления -->
        <q-btn
          color="green"
          icon="add"
          class="q-mb-md"
          @click="openAddDialog"
        />

        <!-- Дерево элементов -->
        <q-tree
          ref="treeRef"
          :nodes="treeData"
          node-key="id"
          selected-color="primary"
          v-model:selected="selectedItemId"
          default-expand-all
        >
          <!-- Кастомный рендеринг узлов -->
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

    <!-- Диалог добавления -->
    <q-dialog v-model="showAddDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Добавить {{ dialogTitle }}</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="newItemName" :label="`Название ${dialogTitle}`" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="negative" v-close-popup />
          <q-btn flat label="Добавить" color="positive" @click="addItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useShopStore } from 'stores/shopStore';
import { useConfigurationStore } from 'stores/configurationStore';

const configurationStore = useConfigurationStore();
const shopStore = useShopStore();
const treeRef = ref(null);
const drawerOpen = ref(true);
const showAddDialog = ref(false);
const newItemName = ref('');

// Данные для дерева
const treeData = computed(() => shopStore.treeData);

// Выбранный элемент (синхронизирован с хранилищем)
const selectedItemId = computed({
  get: () => configurationStore.configuration?.id || null,
  set: (value) => {
    const node = findNodeById(treeData.value, value);
    if (node) {
      configurationStore.setConfiguration({
        id: node.id,
        settings: {
          name: node.label,
          typeConfiguration: 'AppCash',
        }
      });
    }
  }
});

// Поиск узла по ID
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

// Обработчик выбора узла
// const handleNodeSelect = (id) => {
//   const node = findNodeById(treeData.value, id);
//   if (node) {
//     configurationStore.setConfiguration({
//       id: node.id,
//       settings: {
//         name: node.label,
//         typeConfiguration: 'AppCash'
//       }
//     });
//   }
// };

// Иконки для разных типов узлов
const getIcon = (node) => {
  return {
    shop: 'store',
    cashGroup: 'group',
    cashRegister: 'point_of_sale'
  }[node.type];
};

// Открытие диалога добавления
const openAddDialog = () => {
  newItemName.value = '';
  showAddDialog.value = true;
};

// Добавление нового элемента
const addItem = () => {
  if (newItemName.value.trim()) {
    shopStore.addNewItem({
      name: newItemName.value,
      parentId: selectedItemId.value
    });
    showAddDialog.value = false;
  }
};
</script>

<style scoped>
/* Стили для кнопки drawer */
.drawer_button {
  position: fixed;
  top: 50%;
  z-index: 2222;
  transition: left 0.3s ease;
}

.drawer_left {
  left: 55px;
}

.drawer_right {
  left: 330px;
}

/* Стили для выделенных узлов */
:deep(.q-tree__node--selected) {
  background-color: #e0f7fa;
  font-weight: bold;
  border-left: 4px solid #00bcd4;
}

.selected-node {
  background-color: #e0f7fa; /* Цвет фона для выделения */
  font-weight: bold; /* Жирный шрифт */
  padding: 4px 8px;
  border-radius: 4px;
}
</style>
