<template>
  <q-input
    rounded
    outlined
    :label="label"
    type="search"
    :placeholder="placeholder"
    :model-value="modelValue"
    @update:model-value="handleInput"
    clearable
    @clear="handleClear"
    :debounce="debounceTime"
    :class="inputClass"
    :style="inputStyle"
  >
    <template v-if="$slots.prepend" v-slot:prepend>
      <slot name="prepend"></slot>
    </template>
    <template v-if="$slots.append" v-slot:append>
      <slot name="append"></slot>
    </template>
  </q-input>
</template>

<script setup>
import { debounce } from 'quasar'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Поиск'
  },
  placeholder: {
    type: String,
    default: 'Введите текст для поиска'
  },
  debounceTime: {
    type: Number,
    default: 300
  },
  inputClass: {
    type: String,
    default: ''
  },
  inputStyle: {
    type: [String, Object],
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'clear', 'input'])

// Оптимизированный обработчик ввода с debounce
const handleInput = debounce((value) => {
  emit('update:modelValue', value)
  emit('input', value)
}, props.debounceTime)

// Очистка поиска
const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>
