<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center">
        <q-icon name="drive_file_move" size="md" class="q-mr-sm" />
        <span class="text-h6">Перемещение {{ nodeTypeLabel }}</span>
      </q-card-section>

      <q-card-section>
        <div class="text-body1 q-mb-sm">
          Перемещаем: <strong>{{ device.name }}</strong>
        </div>

        <q-separator class="q-mb-md" />

        <div class="text-subtitle2 q-mb-sm">Куда переместить?</div>

        <template v-if="nodeType === 'cashGroup'">
          <q-option-group
            v-model="targetId"
            :options="availableShops"
            type="radio"
            color="primary"
          />

          {{ availableShops }}
        </template>

        <template v-else-if="nodeType === 'cashRegister'">
          <q-option-group
            v-model="targetId"
            :options="availableGroups"
            type="radio"
            color="primary"
          />
          {{ availableGroups }}
        </template>

        <div v-else-if="nodeType === 'shop'" class="text-negative">
          Магазины нельзя перемещать
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Отмена" color="grey" @click="close" />
        <q-btn
          label="Переместить"
          color="primary"
          :loading="isLoading"
          @click="handleConfirm"
          :disable="!canMove"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useShopStore } from 'stores/shopStore';
import { useConfigurationStore } from 'stores/configurationStore';

const shopStore = useShopStore();
const configStore = useConfigurationStore();

const props = defineProps({
  modelValue: Boolean,
  device: {
    type: Object,
    default: null,
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const isLoading = ref(false);
const targetId = ref(null);

const nodeType = computed(() => {
  return props.device?.id ? shopStore.getNodeType(props.device.id) : null;
});

const nodeTypeLabel = computed(() => {
  return {
    shop: 'магазина',
    cashGroup: 'группы касс',
    cashRegister: 'кассы'
  }[nodeType.value] || 'устройства';
});


const availableShops = computed(() => {
  return shopStore.shops
    .filter(shop => shop.id !== props.device?.shopId)
    .map(shop => ({
      label: shop.name,
      value: shop.id
    }));
});

const availableGroups = computed(() => {
  console.log(shopStore.shops)
  return shopStore.shops.flatMap(shop =>
    shop.cashGroups
      .map(group => ({
        label: `${shop.name} > ${group.name}`,
        value: group.id
      }))
  );
});

const canMove = computed(() => {
  if (nodeType.value === 'shop') return false;
  return !!targetId.value;
});

const close = () => {
  emit('update:modelValue', false);
  targetId.value = null;
};

const handleConfirm = async () => {
  if (!canMove.value) return;

  isLoading.value = true;
  try {
    const nodeId = props.device.id;
    const target = targetId.value;
    const type = nodeType.value;

    // Обновляем структуру данных
    if (type === 'cashGroup') {
      // 1. Перемещаем группу касс в другой магазин
      const sourceShop = shopStore.shops.find(shop =>
        shop.cashGroups.some(g => g.id === nodeId)
      );

      if (sourceShop) {
        const groupIndex = sourceShop.cashGroups.findIndex(g => g.id === nodeId);
        const group = sourceShop.cashGroups[groupIndex];

        // Удаляем из исходного магазина
        sourceShop.cashGroups.splice(groupIndex, 1);

        // Добавляем в целевой магазин
        const targetShop = shopStore.shops.find(s => s.id === target);
        if (targetShop) {
          targetShop.cashGroups.push(group);

          // 2. Обновляем конфигурацию группы
          const groupConfig = configStore.getConfiguration(nodeId);
          if (groupConfig) {
            await configStore.updateItem({
              ...groupConfig,
              settings: {
                ...groupConfig.settings,
                node: target
              }
            });
          }

          // 3. Обновляем конфигурации всех касс в группе
          for (const cashRegister of group.cashRegisters) {
            const cashConfig = configStore.getConfiguration(cashRegister.id);
            if (cashConfig) {
              await configStore.updateItem({
                ...cashConfig,
                settings: {
                  ...cashConfig.settings,
                  node: nodeId // Кассы остаются привязаны к группе
                }
              });
            }
          }
        }
      }
    }
    else if (type === 'cashRegister') {
      // 1. Перемещаем кассу в другую группу
      const sourceGroup = shopStore.shops.flatMap(shop =>
        shop.cashGroups.find(g => g.cashRegisters.some(cr => cr.id === nodeId))
      ).find(Boolean);

      if (sourceGroup) {
        const cashIndex = sourceGroup.cashRegisters.findIndex(cr => cr.id === nodeId);
        const cashRegister = sourceGroup.cashRegisters[cashIndex];

        // Удаляем из исходной группы
        sourceGroup.cashRegisters.splice(cashIndex, 1);

        // Добавляем в целевую группу
        const targetGroup = shopStore.shops.flatMap(shop =>
          shop.cashGroups.find(g => g.id === target)
        ).find(Boolean);

        if (targetGroup) {
          targetGroup.cashRegisters.push(cashRegister);

          // 2. Обновляем конфигурацию кассы
          const cashConfig = configStore.getConfiguration(nodeId);
          if (cashConfig) {
            await configStore.updateItem({
              ...cashConfig,
              settings: {
                ...cashConfig.settings,
                node: target
              }
            });
          }
        }
      }
    }

    shopStore.persistState();
    emit('confirm', { targetId: target, moveType: type });
    close();
  } catch (error) {
    console.error('Ошибка при перемещении:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>
