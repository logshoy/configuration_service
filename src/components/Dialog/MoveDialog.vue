<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)">
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center">
        <q-icon name="drive_file_move" size="md" class="q-mr-sm" />
        <span class="text-h6">Перемещение устройства</span>
      </q-card-section>

      <q-card-section>
        <div class="text-body1 q-mb-sm">
          Вы хотите переместить: <strong>{{ device.name }}</strong>
        </div>
        <div class="text-caption q-mb-md">
          Code: {{ device.code }} | ID: {{ device.id }}
        </div>

        <q-separator class="q-mb-md" />

        <div class="text-subtitle2 q-mb-sm">Куда переместить?</div>
        <q-option-group
          v-model="selectedGroup"
          :options="availableGroups"
          type="radio"
          color="primary"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Отмена"
          color="grey"
          @click="$emit('update:modelValue', false)"
        />
        <q-btn
          label="Переместить"
          color="primary"
          :loading="loading"
          @click="handleConfirm"
          :disable="!selectedGroup"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  device: Object,
  availableGroups: Array,
  loading: Boolean
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const selectedGroup = ref(null)

watch(() => props.modelValue, (val) => {
  if (!val) selectedGroup.value = null
})

const handleConfirm = () => {
  emit('confirm', selectedGroup.value)
  emit('update:modelValue', false)
}
</script>
