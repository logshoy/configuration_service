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
        <div class="row q-mb-md no-wrap"             ref="buttonRef">
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
            @click="openMoveDialogForSelected"
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
            @click="openCopyDialogForSelected"
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

    <!-- Модальное окно перемещения -->
    <q-dialog v-model="moveDialogVisible" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-icon name="drive_file_move" size="md" class="q-mr-sm" />
          <span class="text-h6">Перемещение устройства</span>
        </q-card-section>

        <q-card-section>
          <div class="text-body1 q-mb-sm">
            Вы хотите переместить: <strong>{{ moveData.deviceName }}</strong>
          </div>
          <div class="text-caption q-mb-md">
            Code: {{ moveData.deviceCode }} | ID: {{ moveData.deviceId }}
          </div>

          <q-separator class="q-mb-md" />

          <div class="text-subtitle2 q-mb-sm">Куда переместить?</div>
          <q-option-group
            v-model="moveData.targetGroupId"
            :options="availableGroups"
            type="radio"
            color="primary"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="grey" v-close-popup />
          <q-btn
            label="Переместить"
            color="primary"
            :loading="isMoving"
            @click="confirmMove"
            :disable="!moveData.targetGroupId"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Модальное окно копирования -->
    <q-dialog v-model="copyDialogVisible" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-icon name="content_copy" size="md" class="q-mr-sm" />
          <span class="text-h6">Копирование кассы</span>
        </q-card-section>

        <q-card-section>
          <div class="text-body1 q-mb-sm">
            Копируем кассу: <strong>{{ copyData.sourceName }}</strong>
          </div>
          <div class="text-caption q-mb-md">
            Code: {{ copyData.sourceCode }} | ID: {{ copyData.sourceId }}
          </div>

          <q-separator class="q-mb-md" />

          <q-input
            v-model="copyData.newName"
            label="Название копии"
            outlined
            class="q-mb-md"
            :rules="[val => !!val || 'Обязательное поле']"
          />

          <div class="text-subtitle2 q-mb-sm">Куда скопировать?</div>
          <q-option-group
            v-model="copyData.targetGroupId"
            :options="availableCopyGroups"
            type="radio"
            color="primary"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="grey" v-close-popup />
          <q-btn
            label="Копировать"
            color="primary"
            :loading="isCopying"
            @click="confirmCopy"
            :disable="!copyData.targetGroupId || !copyData.newName"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>


<script setup>
import { ref, computed } from 'vue';
import { useShopStore } from 'stores/shopStore';
import { useConfigurationStore } from 'stores/configurationStore';
import { useDrawerStore } from 'stores/drawerStore';
import { v4 as uuidv4 } from 'uuid';

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
const isMoving = ref(false);
const moveData = ref({
  deviceId: null,
  deviceName: '',
  deviceCode: '',
  sourceGroupId: null,
  targetGroupId: null
});

const availableGroups = computed(() => {
  if (!moveData.value.sourceGroupId) return [];

  return shopStore.shops.flatMap(shop =>
    shop.cashGroups
      .filter(group => group.id !== moveData.value.sourceGroupId)
      .map(group => ({
        label: `${shop.name} > ${group.name}`,
        value: group.id
      }))
  );
});

const openMoveDialogForSelected = () => {
  if (!selectedItem.value) return;
  openMoveDialog(selectedItem.value);
};

const openMoveDialog = (node) => {
  moveData.value = {
    deviceId: node.id,
    deviceName: node.label,
    deviceCode: `CR-${node.id.slice(0, 4).toUpperCase()}`,
    sourceGroupId: node.cashGroupId,
    targetGroupId: null
  };
  moveDialogVisible.value = true;
};

const confirmMove = async () => {
  try {
    isMoving.value = true;
    console.log('ss')
    const success = await shopStore.moveCashRegister(
      moveData.value.deviceId,
      moveData.value.targetGroupId
    );

    if (success) {
      moveDialogVisible.value = false;
    }
  } finally {
    isMoving.value = false;
  }
};

// Логика копирования кассы
const copyDialogVisible = ref(false);
const isCopying = ref(false);
const copyData = ref({
  sourceId: null,
  sourceName: '',
  sourceCode: '',
  sourceGroupId: null,
  targetGroupId: null,
  newName: ''
});

const availableCopyGroups = computed(() => {
  return shopStore.shops.flatMap(shop =>
    shop.cashGroups.map(group => ({
      label: `${shop.name} > ${group.name}`,
      value: group.id
    }))
  );
});

const openCopyDialogForSelected = () => {
  if (!selectedItem.value) return;
  openCopyDialog(selectedItem.value);
};

const openCopyDialog = (node) => {
  copyData.value = {
    sourceId: node.id,
    sourceName: node.label,
    sourceCode: `CR-${node.id.slice(0, 4).toUpperCase()}`,
    sourceGroupId: node.cashGroupId,
    targetGroupId: node.cashGroupId, // По умолчанию текущая группа
    newName: `${node.label} (копия)`
  };
  copyDialogVisible.value = true;
};

const confirmCopy = async () => {
  try {
    isCopying.value = true;

    const sourceCash = shopStore.getCashRegisterById(copyData.value.sourceId);
    if (!sourceCash) return;

    const originalSettings = configurationStore.getConfiguration(sourceCash.id);
    const newId = uuidv4();

    // Клонируем настройки и обновляем нужные поля
    const newSettings = JSON.parse(JSON.stringify(originalSettings));
    newSettings.appId = newId; // Заменяем appId, если он у тебя называется иначе — поправь

    const newCash = {
      id: newId,
      name: copyData.value.newName,
      ...sourceCash,
    };

    const success = await shopStore.addCashRegisterCopy(
      copyData.value.targetGroupId,
      newCash
    );

    if (success) {
      await configurationStore.createConfiguration(newSettings, newId);
      copyDialogVisible.value = false;
    }
  } finally {
    isCopying.value = false;
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
