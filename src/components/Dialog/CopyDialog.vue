<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center">
        <q-icon name="content_copy" size="md" class="q-mr-sm" />
        <span class="text-h6">Копирование кассы</span>
      </q-card-section>

      <q-card-section>
        <div class="text-body1 q-mb-sm">
          Копируем кассу: <strong>{{ source.name }}</strong>
        </div>
        <div class="text-caption q-mb-md">
          ID: {{ source.id }}
        </div>

        <q-separator class="q-mb-md" />

        <q-input
          v-model="newName"
          label="Название копии"
          outlined
          class="q-mb-md"
          :rules="[val => !!val || 'Обязательное поле']"
        />

        <div class="text-subtitle2 q-mb-sm">Куда скопировать?</div>
        <q-option-group
          v-model="targetGroupId"
          :options="availableGroups"
          type="radio"
          color="primary"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Отмена" color="grey" @click="close" />
        <q-btn
          label="Копировать"
          color="primary"
          :loading="isLoading"
          @click="handleConfirm"
          :disable="!targetGroupId || !newName"
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
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const isLoading = ref(false);
const newName = ref('');
const targetGroupId = ref(null);

// Инициализация значений при открытии диалога
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.source) {
    newName.value = `${props.source.name} (копия)`;
    targetGroupId.value = props.source.groupId || null;
  }
});

const availableGroups = computed(() => {
  return shopStore.shops.flatMap(shop =>
    shop.cashGroups.map(group => ({
      label: `${shop.name} > ${group.name}`,
      value: group.id
    }))
  );
});

const close = () => {
  emit('update:modelValue', false);
  // Не сбрасываем значения здесь, чтобы сохранить состояние при повторном открытии
};

const handleConfirm = async () => {
  if (!targetGroupId.value || !newName.value) return;

  isLoading.value = true;
  try {
    emit('confirm', {
      targetGroupId: targetGroupId.value,
      newName: newName.value
    });
    close();
  } finally {
    isLoading.value = false;
  }
};
</script>
