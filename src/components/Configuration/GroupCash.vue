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

          <!-- XML Editor Button -->
          <div v-else-if="field.type === 'xml'">
            <div class="row q-mt-sm">
              <q-btn
                :label="field.label"
                color="primary"
                outline
                @click="openXmlEditor(fieldKey, field.label)"
              />
            </div>
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

    <!-- Диалог редактирования XML -->
    <q-dialog v-model="xmlEditor.show" persistent>
      <q-card style="width: 75vw; max-width: 1200px;">
        <q-card-section>
          <div class="text-h6">{{ xmlEditor.title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-editor
            v-model="xmlEditor.content"
            :toolbar="xmlToolbar"
            min-height="50vh"
            style="border: 1px solid #ccc;"
            content-class="xml-editor-content"
          />
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            label="Отмена"
            color="negative"
            v-close-popup
            class="q-mx-sm"
          />
          <q-btn
            label="Сохранить"
            color="positive"
            @click="saveXmlChanges"
            class="q-mx-sm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { settingsConfigGroup } from '/src/utils/config/settingsConfigGroup.js';
import { mergeWithDefaults } from '/src/utils/merge-defaults.js';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  emitAlways: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const settingsConfig = settingsConfigGroup;

// Состояние редактора XML
const xmlEditor = reactive({
  show: false,
  content: '',
  currentField: null,
  title: ''
});

// Настройки панели инструментов редактора
const xmlToolbar = [
  ['bold', 'italic', 'strike', 'underline'],
  ['undo', 'redo'],
  ['code'],
  ['quote', 'unordered', 'ordered'],
  ['removeFormat'],
  ['fullscreen']
];

// Используем импортированную функцию
const mergedValue = computed(() => {
  return mergeWithDefaults(props.modelValue, settingsConfig);
});

if (props.emitAlways) { // Условный эмит
  emit('update:modelValue', mergedValue.value)
}

const updateField = (key, value) => {
  const newValue = { ...props.modelValue, [key]: value };
  emit('update:modelValue', newValue);
};

// Открыть редактор XML
const openXmlEditor = (fieldKey, fieldLabel) => {
  xmlEditor.currentField = fieldKey;
  xmlEditor.content = mergedValue.value[fieldKey] || '';
  xmlEditor.title = `Редактор: ${fieldLabel}`;
  xmlEditor.show = true;
};

// Сохранить изменения XML
const saveXmlChanges = () => {
  if (xmlEditor.currentField) {
    updateField(xmlEditor.currentField, xmlEditor.content);
  }
  xmlEditor.show = false;
};
</script>

<style scoped>
.q-banner {
  font-size: 0.8rem;
  line-height: 1.2;
  padding: 8px;
}

.xml-editor-content {
  font-family: monospace;
  font-size: 14px;
}
</style>
