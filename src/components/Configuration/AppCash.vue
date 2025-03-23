<template>
  <div>
    <!-- Поле для ширины -->
    <q-input
      class="q-ma-md"
      :model-value="modelValue.width"
      @update:model-value="updateModelValue('width', $event)"
      label="Ширина"
      type="number"
      outlined
      required
    />

    <!-- Поле для высоты -->
    <q-input
      class="q-ma-md"
      :model-value="modelValue.height"
      @update:model-value="updateModelValue('height', $event)"
      label="Высота"
      type="number"
      outlined
      required
    />

    <!-- Поле для цвета -->
    <q-input
      class="q-ma-md"
      filled
      :model-value="modelValue.color"
      @update:model-value="updateModelValue('color', $event)"
      hint="Цвет"
    >
      <template v-slot:append>
        <q-icon name="colorize" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-color :model-value="modelValue.color" @update:model-value="updateModelValue('color', $event)" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const updateModelValue = (key, value) => {
  const updatedModelValue = { ...props.modelValue, [key]: value };
  emit('update:modelValue', updatedModelValue);
};
</script>
