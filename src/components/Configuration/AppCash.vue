<template>
  <div>
    <!-- Поле для ширины -->
    <q-input
      class="q-ma-md"
      :model-value="width"
      @update:model-value="$emit('update:width', $event)"
      label="Ширина"
      type="number"
      outlined
      required
    />

    <!-- Поле для высоты -->
    <q-input
      class="q-ma-md"
      :model-value="height"
      @update:model-value="$emit('update:height', $event)"
      label="Высота"
      type="number"
      outlined
      required
    />

    <!-- Поле для цвета -->
    <q-input
      class="q-ma-md"
      filled
      :model-value="color"
      @update:model-value="$emit('update:color', $event)"
      hint="Цвет"
    >
      <template v-slot:append>
        <q-icon name="colorize" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-color :model-value="color" @update:model-value="$emit('update:color', $event)" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup>
defineProps({
  width: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    required: true
  }
});

defineEmits(['update:width', 'update:height', 'update:color']);
</script>
