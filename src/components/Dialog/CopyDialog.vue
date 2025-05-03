<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center">
        <q-icon name="content_copy" size="md" class="q-mr-sm" />
        <span class="text-h6">Копирование {{ copyType === 'shop' ? 'магазина' : copyType === 'cashGroup' ? 'группы касс' : 'кассы' }}</span>
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
          :label="`Новое название ${copyType === 'shop' ? 'магазина' : copyType === 'cashGroup' ? 'группы касс' : 'кассы'}`"
          outlined
          class="q-mb-md"
          :rules="[val => !!val || 'Обязательное поле']"
        />

        <template v-if="copyType === 'cashGroup'">
          <div class="text-subtitle2 q-mb-sm">В какой магазин скопировать?</div>
          <q-option-group
            v-model="targetShopId"
            :options="availableShops"
            type="radio"
            color="primary"
          />
        </template>

        <template v-else-if="copyType === 'cashRegister'">
          <div class="text-subtitle2 q-mb-sm">Куда скопировать?</div>
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
    required: true
  },
  copyType: {
    type: String,
    required: true,
    validator: value => ['shop', 'cashGroup', 'cashRegister'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const isLoading = ref(false);
const newName = ref('');
const targetShopId = ref(null);
const targetGroupId = ref(null);

const availableShops = computed(() => {
  return shopStore.shops.map(shop => ({
    label: shop.name,
    value: shop.id
  }));
});

const availableGroups = computed(() => {
  return shopStore.shops.flatMap(shop =>
    shop.cashGroups.map(group => ({
      label: `${shop.name} > ${group.name}`,
      value: group.id
    }))
  );
});

const canConfirm = computed(() => {
  if (!newName.value) return false;

  if (props.copyType === 'cashGroup') {
    return !!targetShopId.value;
  } else if (props.copyType === 'cashRegister') {
    return !!targetGroupId.value;
  }
  return true; // Для магазина нужен только новый имя
});

// Инициализация значений при открытии диалога
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.source) {
    newName.value = `${props.source.name} (копия)`;

    if (props.copyType === 'cashGroup') {
      targetShopId.value = props.source.shopId || null;
    } else if (props.copyType === 'cashRegister') {
      targetGroupId.value = props.source.groupId || null;
    }
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
      newName: newName.value
    };

    if (props.copyType === 'cashGroup') {
      params.targetShopId = targetShopId.value;
    } else if (props.copyType === 'cashRegister') {
      params.targetGroupId = targetGroupId.value;
    }

    emit('confirm', params);
    close();
  } finally {
    isLoading.value = false;
  }
};
</script>
