<template>
  <div>
    <!-- Секции с настройками -->
    <q-expansion-item
      v-for="(section, sectionKey) in settingsConfig"
      :key="sectionKey"
      expand-separator
      :icon="section.icon"
      :label="section.label"
      class="q-mb-md bg-grey-2"
    >
      <div class="q-pa-md">
        <!-- Поля внутри секции -->
        <div
          v-for="(field, fieldKey) in section.fields"
          :key="fieldKey"
          class="q-mb-md"
        >
          <!-- Checkbox -->
          <q-checkbox
            v-if="field.type === 'checkbox'"
            dense
            :model-value="mergedValue[fieldKey]"
            @update:model-value="(val) => updateField(fieldKey, val)"
            :label="field.label"
          />

          <!-- Text Input -->
          <q-input
            v-else-if="field.type === 'text'"
            dense
            outlined
            :model-value="mergedValue[fieldKey]"
            @update:model-value="(val) => updateField(fieldKey, val)"
            :label="field.label"
            :rules="field.rules"
          />

          <!-- Number Input -->
          <q-input
            v-else-if="field.type === 'number'"
            dense
            outlined
            type="number"
            :model-value="mergedValue[fieldKey]"
            @update:model-value="(val) => updateField(fieldKey, Number(val))"
            :label="field.label"
            :min="field.min"
            :max="field.max"
          />

          <!-- Select -->
          <q-select
            v-else-if="field.type === 'select'"
            dense
            outlined
            :model-value="mergedValue[fieldKey]"
            @update:model-value="(val) => updateField(fieldKey, val)"
            :label="field.label"
            :options="field.options"
            emit-value
            map-options
            behavior="menu"
          />

          <!-- XML Editor -->
          <div v-else-if="field.type === 'xml'">
            <label class="text-caption">{{ field.label }}</label>
            <q-editor
              :model-value="mergedValue[fieldKey]"
              @update:model-value="(val) => updateField(fieldKey, val)"
              min-height="5rem"
              :toolbar="xmlToolbar"
            />
          </div>

          <!-- Описание параметра -->
          <q-banner
            v-if="field.description"
            dense
            class="bg-blue-1 q-mt-sm"
          >
            {{ field.description }}
          </q-banner>
        </div>
      </div>
    </q-expansion-item>
  </div>
</template>

<script setup>
import { computed} from 'vue';
import { settingsConfigGroup } from '/src/utils/config/settingsConfigGroup.js';
import { mergeWithDefaults } from '/src/utils/merge-defaults.js';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue']);

const settingsConfig = settingsConfigGroup;

// Используем импортированную функцию
const mergedValue = computed(() => {
  return mergeWithDefaults(props.modelValue, settingsConfig);
});


const updateField = (key, value) => {
  const newValue = { ...props.modelValue, [key]: value };
  emit('update:modelValue', newValue);
};
</script>

<style scoped>
.q-banner {
  font-size: 0.8rem;
  line-height: 1.2;
  padding: 8px;
}

.q-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.q-item__section--side {
  padding-right: 12px;
}
</style>
