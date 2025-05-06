<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center">
        <q-icon name="drive_file_move" size="md" class="q-mr-sm" />
        <span class="text-h6">Перемещение {{ deviceType === 'cashGroup' ? 'группы касс' : 'устройства' }}</span>
      </q-card-section>

      <q-card-section>
        <div class="text-body1 q-mb-sm">
          Вы хотите переместить: <strong>{{ device.name }}</strong>
        </div>
        <div class="text-caption q-mb-md">
          Code: {{ device.code }} | ID: {{ device.id }}
        </div>

        <q-separator class="q-mb-md" />
        {{ deviceType }}
        <template v-if="deviceType === 'cashGroup'">
          <div class="text-subtitle2 q-mb-sm">В какой магазин переместить?</div>
          <q-option-group
            v-model="targetShopId"
            :options="availableShops"
            type="radio"
            color="primary"
          />
        </template>

        <template v-else>
          <div class="text-subtitle2 q-mb-sm">Куда переместить?</div>
          <q-option-group
            v-model="targetGroupId"
            :options="availableGroups"
            type="radio"
            color="primary"
          />
        </template>
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

const shopStore = useShopStore();

const props = defineProps({
  modelValue: Boolean,
  device: {
    type: Object,
    default: null,
  },
  deviceType: {
    type: String,
    validator: value => ['cashGroup', 'cashRegister'].includes(value),
    default: 'cashRegister'
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const isLoading = ref(false);
const targetShopId = ref(null);
const targetGroupId = ref(null);

const availableShops = computed(() => {
  return shopStore.shops
    .filter(shop => shop.id !== props.device.shopId)
    .map(shop => ({
      label: shop.name,
      value: shop.id
    }));
});

const availableGroups = computed(() => {
  if (!props.device?.groupId) return [];
  return shopStore.shops.flatMap(shop =>
    shop.cashGroups
      .filter(group => group.id !== props.device.groupId)
      .map(group => ({
        label: `${shop.name} > ${group.name}`,
        value: group.id
      }))
  );
});

const canMove = computed(() => {
  return props.deviceType === 'cashGroup'
    ? !!targetShopId.value
    : !!targetGroupId.value;
});

const close = () => {
  emit('update:modelValue', false);
  targetShopId.value = null;
  targetGroupId.value = null;
};

const handleConfirm = async () => {
  if (!canMove.value) return;

  isLoading.value = true;
  try {
    const targetId = props.deviceType === 'cashGroup'
      ? targetShopId.value
      : targetGroupId.value;

    emit('confirm', targetId);
    close();
  } finally {
    isLoading.value = false;
  }
};
</script>
