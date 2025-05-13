<template>
  <div class="integrations-editor">
    <q-card
      v-for="(integration, index) in modelValue.integrations || defaultIntegrations"
      :key="integration.id || index"
      class="q-mb-md integration-card"
      flat
      bordered
    >
      <q-card-section class="bg-grey-2">
        <div class="text-h6">Интеграция #{{ index + 1 }}</div>
        <q-btn
          v-if="(modelValue.integrations || defaultIntegrations).length > 1"
          icon="delete"
          color="negative"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="removeIntegration(index)"
        />
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Тип интеграции -->
          <div class="col-12 col-md-6">
            <div class="row items-center">
              <div class="col">
                <q-select
                  filled
                  :model-value="integration.type"
                  @update:model-value="updateIntegration(index, 'type', $event)"
                  :options="integrationOptions"
                  label="Тип интеграции"
                  emit-value
                  map-options
                  clearable
                />
              </div>
              <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                <q-tooltip>Выберите тип B.O. системы </q-tooltip>
              </q-icon>
            </div>
          </div>

          <!-- Device ID -->
          <div class="col-12 col-md-6">
            <div class="row items-center q-col-gutter-sm">
              <div class="col">
                <q-input
                  filled
                  :model-value="integration.id"
                  @update:model-value="updateIntegration(index, 'id', $event)"
                  label="Device ID"
                  :readonly="!integration.id"
                />
              </div>
              <div class="col-auto">
                <q-btn
                  color="primary"
                  icon="autorenew"
                  @click="generateUid(index)"
                  round
                  dense
                />
                <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                  <q-tooltip>Уникальный идентификатор интеграции. Нажмите кнопку для генерации нового ID</q-tooltip>
                </q-icon>
              </div>
            </div>
          </div>

          <!-- URL Back Office -->
          <div class="col-12">
            <div class="row items-center">
              <div class="col">
                <q-input
                  filled
                  :model-value="integration.backOfficeUrl"
                  @update:model-value="updateIntegration(index, 'backOfficeUrl', $event)"
                  label="URL Back Office"
                  type="url"
                />
              </div>
              <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                <q-tooltip>URL адрес Back Office системы (например, https://backoffice.example.com/api)</q-tooltip>
              </q-icon>
            </div>
          </div>

          <!-- Сервисы -->
          <div class="col-12 col-md-6">
            <div class="row items-center">
              <div class="col">
                <q-select
                  filled
                  :model-value="integration.serviceStorage"
                  @update:model-value="updateIntegration(index, 'serviceStorage', $event)"
                  :options="serviceStorageOptions"
                  label="Сервис справочников"
                  emit-value
                  map-options
                  clearable
                />
              </div>
              <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                <q-tooltip>Сервис для работы со справочниками товаров</q-tooltip>
              </q-icon>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="row items-center">
              <div class="col">
                <q-select
                  filled
                  :model-value="integration.serviceOrder"
                  @update:model-value="updateIntegration(index, 'serviceOrder', $event)"
                  :options="serviceOrderOptions"
                  label="Сервис заказов"
                  emit-value
                  map-options
                  clearable
                />
              </div>
              <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                <q-tooltip>Сервис для обработки заказов</q-tooltip>
              </q-icon>
            </div>
          </div>

          <!-- Тип триггера -->
          <div class="col-12">
            <div class="row items-center">
              <div class="col">
                <q-select
                  filled
                  :model-value="integration.triggerType"
                  @update:model-value="updateIntegration(index, 'triggerType', $event)"
                  :options="typeTriggerOptions"
                  label="Тип триггера"
                  emit-value
                  map-options
                />
              </div>
              <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                <q-tooltip>Способ активации интеграции (по событию, по интервалу или по расписанию)</q-tooltip>
              </q-icon>
            </div>
          </div>

          <!-- Настройки триггеров -->
          <div class="col-12">
            <div v-if="integration.triggerType === 'subscription'" class="q-pa-sm">
              <div class="row items-center">
                <q-toggle
                  :model-value="integration.subscriptionEnabled"
                  @update:model-value="updateIntegration(index, 'subscriptionEnabled', $event)"
                  label="Активировать подписку"
                  left-label
                />
                <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                  <q-tooltip>Включите для активации подписки на события</q-tooltip>
                </q-icon>
              </div>
            </div>

            <div v-if="integration.triggerType === 'interval'" class="row items-center">
              <div class="col-auto q-pr-sm">
                <q-input
                  filled
                  :model-value="integration.intervalValue"
                  @update:model-value="updateIntegration(index, 'intervalValue', $event)"
                  type="number"
                  label="Интервал"
                  min="1"
                  style="width: 120px"
                />
              </div>
              <div class="col">минут</div>
              <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                <q-tooltip>Интервал в минутах между выполнениями интеграции</q-tooltip>
              </q-icon>
            </div>

            <div v-if="integration.triggerType === 'schedule'">
              <div class="row items-center">
                <div class="col">
                  <q-input
                    filled
                    :model-value="integration.triggerTime"
                    @update:model-value="updateIntegration(index, 'triggerTime', $event)"
                    mask="time"
                    label="Время срабатывания"
                  >
                    <template v-slot:append>
                      <q-icon name="access_time" class="cursor-pointer">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-time
                            :model-value="integration.triggerTime"
                            @update:model-value="updateIntegration(index, 'triggerTime', $event)"
                            format24h
                          />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                  <q-tooltip>Время ежедневного срабатывания интеграции (формат ЧЧ:ММ)</q-tooltip>
                </q-icon>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="text-center q-mt-md">
      <q-btn
        color="positive"
        icon="add"
        @click="addIntegration"
        label="Добавить интеграцию"
        unelevated
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useConfigurationStore } from 'stores/configurationStore'

const configurationStore = useConfigurationStore()

const integrationOptions = [
  { label: 'Entersight', value: 'Entersight' },
  { label: 'Golden Apple', value: 'GA' }
]

const typeTriggerOptions = [
  { label: 'Подписка', value: 'subscription' },
  { label: 'Интервал', value: 'interval' },
  { label: 'Расписание', value: 'schedule' }
]

// Получаем списки для выбора из хранилища
const serviceStorageOptions = computed(() =>
  configurationStore.typeFilteredConfigurationListService('serviceStorage') || []
)

const serviceOrderOptions = computed(() =>
  configurationStore.typeFilteredConfigurationListService('serviceOrder') || []
)

const defaultIntegrations = ref([{
  id: uuidv4(),
  type: null,
  backOfficeUrl: '',
  serviceStorage: null,
  serviceOrder: null,
  triggerType: null,
  subscriptionEnabled: false,
  intervalValue: 5,
  triggerTime: '00:00'
}])

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

if (props.emitAlways) {
  emit('update:modelValue', { ...props.modelValue, integrations: defaultIntegrations.value })
}

const generateUid = (index) => {
  updateIntegration(index, 'id', uuidv4())
}

const updateIntegration = (index, field, value) => {
  const integrations = props.modelValue.integrations ? [...props.modelValue.integrations] : [...defaultIntegrations.value]
  integrations[index][field] = value

  // Сбрасываем зависимые поля при смене типа триггера
  if (field === 'triggerType') {
    integrations[index].subscriptionEnabled = false
    integrations[index].intervalValue = 5
    integrations[index].triggerTime = '00:00'
  }

  emit('update:modelValue', { ...props.modelValue, integrations })
}

const addIntegration = () => {
  const integrations = props.modelValue.integrations ? [...props.modelValue.integrations] : [...defaultIntegrations.value]
  integrations.push({
    id: uuidv4(),
    type: null,
    backOfficeUrl: '',
    serviceStorage: null,
    serviceOrder: null,
    triggerType: null,
    subscriptionEnabled: false,
    intervalValue: 5,
    triggerTime: '00:00'
  })
  emit('update:modelValue', { ...props.modelValue, integrations })
}

const removeIntegration = (index) => {
  const integrations = props.modelValue.integrations ? [...props.modelValue.integrations] : [...defaultIntegrations.value]
  integrations.splice(index, 1)
  emit('update:modelValue', {
    ...props.modelValue,
    integrations: integrations.length > 0 ? integrations : [{
      id: uuidv4(),
      type: null,
      backOfficeUrl: '',
      serviceStorage: null,
      serviceOrder: null,
      triggerType: null,
      subscriptionEnabled: false,
      intervalValue: 5,
      triggerTime: '00:00'
    }]
  })
}
</script>

<style scoped>
.integration-card {
  transition: all 0.3s ease;
}

.integration-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.cursor-help {
  cursor: help;
}
</style>
