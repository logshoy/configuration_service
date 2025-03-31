<template>
  <div >
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
      style="margin-left: 60px;
      background-color: aliceblue;"
      show-if-above
      v-model="drawerOpen"
      bordered
      @click="handleDrawerClick"
    >
      <q-scroll-area class="fit q-pa-md">
        <!-- Кнопка добавления -->
        <div >
        <q-btn
          ref="buttonRef"
          color="green"
          icon="add"
          class="q-mb-md"
          @click="enableCreateForm(dialogTitle)"
        >
        <q-tooltip>
      Это подсказка при наведении!
    </q-tooltip>
      </q-btn>
        <!-- Дерево элементов -->
        <q-tree
          :nodes="treeData"
          ref="treeRef"
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
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- Диалог добавления -->
  </div>
</template>

<script setup>
import { ref, computed} from 'vue';
import { useShopStore } from 'stores/shopStore';
import { useConfigurationStore } from 'stores/configurationStore';

import { useDrawerStore } from 'stores/drawerStore';

const configurationStore = useConfigurationStore();
const shopStore = useShopStore();
const treeRef = ref(null);
const buttonRef = ref(null);




const drawerStore = useDrawerStore();

const drawerOpen = computed(() => drawerStore.drawerOpenLeft);

const change = () => {
  drawerStore.setDrawerOpenLeft()
}

// создание элемента
const enableCreateForm = () => {
  const node = findNodeById(treeData.value, selectedItemId.value);
  console.log('node',node)

    if (!node?.type) {
      // Добавляем магазин
      configurationStore.enableCreateFormVisibility('shop');
    } else if (node.type === 'shop') {
      // Добавляем группу касс
      configurationStore.enableCreateFormVisibility('cashGroup');
    } else if (node.type === 'cashGroup') {
      // Добавляем кассу
      configurationStore.enableCreateFormVisibility('appCash');
    }
};

// Данные для дерева
const treeData = computed(() => shopStore.treeData);

// Выбранный элемент (синхронизирован с хранилищем)
const selectedItemId = computed({
  get: () => shopStore.branch || null,
  set: (value) => {
    configurationStore.setConfiguration(value);
    shopStore.setBranch(value);
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

// Иконки для разных типов узлов
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
    !buttonRef.value?.$el.contains(event.target)
  ) {
    configurationStore.setConfiguration(1);
    console.log('Клик вне дерева и не по кнопке');
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
  left: 340px;
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

:deep(.q-drawer) {
  box-shadow: 12px 8px 5px #ff3300;
}
</style>
