<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <q-select
      filled
      class="q-ma-md"
      :model-value="mergedValues.language"
      :options="languageOptions"
      label="Выберите язык"
      @update:model-value="updateLanguage"
      emit-value
      map-options
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { mergesettingsConfigShopDefaults, settingsConfigShop } from '/src/utils/config/settingsConfigShop.js'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  emitAlways: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// Получаем опции из конфига
const languageOptions = settingsConfigShop.language.options

// Применяем дефолтные значения
const mergedValues = computed(() => {
  return mergesettingsConfigShopDefaults(props.modelValue)
})

if (props.emitAlways) { // Условный эмит
  emit('update:modelValue', mergedValues.value)
}

// Обновляем значение
const updateLanguage = (value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    language: value
  })
}
</script>
