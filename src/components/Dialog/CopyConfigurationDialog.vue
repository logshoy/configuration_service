<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center">
        <q-icon name="content_copy" size="md" class="q-mr-sm" />
        <span class="text-h6">Копирование конфигурации</span>
      </q-card-section>

      <q-card-section>
        <div class="text-body1 q-mb-sm">
          Копируем: <strong>{{ source.name }}</strong>
        </div>
        <div class="text-caption q-mb-md">
          ID: {{ source.id }}
        </div>

        <q-separator class="q-mb-md" />

        <q-input
          v-model="newName"
          label="Новое название"
          outlined
          class="q-mb-md"
          :rules="[val => !!val || 'Обязательное поле']"
        />

        <div class="text-subtitle2 q-mb-sm">Куда скопировать?</div>
        <q-tree
          :nodes="availableNodes"
          node-key="id"
          selected-color="primary"
          v-model:selected="targetNodeId"
          default-expand-all
          :filter="filterText"
        >
          <template v-slot:default-header="prop">
            <div class="row items-center">
              <q-icon :name="getNodeIcon(prop.node)" class="q-mr-sm" />
              <span>{{ prop.node.label }}</span>
            </div>
          </template>
        </q-tree>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Отмена" color="grey" @click="close" />
        <q-btn
          label="Копировать"
          color="primary"
          :loading="isLoading"
          @click="handleConfirm"
          :disable="!canConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useShopStore } from 'stores/shopStore';

const shopStore = useShopStore();

const props = defineProps({
  modelValue: Boolean,
  source: {
    type: Object,
    default: null,
  },
  copyType: {
    type: String,
    default: 'configuration'
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const isLoading = ref(false);
const newName = ref('');
const targetNodeId = ref(null);
const filterText = ref('');

// Определяем тип исходного узла
const nodeType = computed(() => {
  if (!props.source?.id) return null;
  return shopStore.getNodeType(props.source.id);
});

// Доступные узлы для копирования (исключая сам элемент, если он является узлом)
const availableNodes = computed(() => {
  const nodes = shopStore.getTreeDataCopy();

  // Если источник является узлом дерева, исключаем его и его дочерние элементы
  if (nodeType.value) {
    const removeNode = (nodesList, idToRemove) => {
      for (let i = 0; i < nodesList.length; i++) {
        if (nodesList[i].id === idToRemove) {
          nodesList.splice(i, 1);
          return true;
        }
        if (nodesList[i].children) {
          if (removeNode(nodesList[i].children, idToRemove)) {
            return true;
          }
        }
      }
      return false;
    };

    removeNode(nodes, props.source.id);
  }

  return nodes;
});

const canConfirm = computed(() => {
  return newName.value && targetNodeId.value;
});

// Иконки для узлов дерева
const getNodeIcon = (node) => {
  const icons = {
    shop: 'store',
    cashGroup: 'group',
    cashRegister: 'point_of_sale',
    default: 'folder'
  };
  return icons[node.type] || icons.default;
};

// Инициализация при открытии
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.source) {
    newName.value = `${props.source.name} (копия)`;
    targetNodeId.value = null;
  }
});

const close = () => {
  emit('update:modelValue', false);
};

const handleConfirm = async () => {
  if (!canConfirm.value) return;

  isLoading.value = true;
  try {
    const params = {
      newName: newName.value,
      targetId: targetNodeId.value,
      sourceType: nodeType.value || props.copyType
    };

    emit('confirm', params);
    close();
  } finally {
    isLoading.value = false;
  }
};
</script>
