<template>
  <div>
    <div
      v-for="(integration, index) in modelValue.integrations || defaultIntegrations"
      :key="integration.id || index"
      class="q-ma-md"
    >
      <q-select
        filled
        :model-value="integration.type"
        @update:model-value="updateIntegration(index, 'type', $event)"
        :options="integrationOptions"
        label="Тип интеграции"
        class="col q-mb-md"
      />

      <div class="row justify-between q-my-md">
        <q-input
          label="DeviceID"
          :model-value="integration.id"
          @update:model-value="updateIntegration(index, 'id', $event)"
          filled
          class="q-mx-xs"
        />
        <q-btn
          color="primary"
          icon="sync"
          @click="generateUid(index)"
          round
          padding="10px 10px"
          class="q-my-xs"
        />
      </div>

      <q-input
        filled
        :model-value="integration.backOfficeUrl"
        @update:model-value="updateIntegration(index, 'backOfficeUrl', $event)"
        label="URL Back Office"
        class="q-mb-md"
      />

      <div class="q-mb-md">
        <q-select
          filled
          :model-value="integration.serviceStorage"
          @update:model-value="updateIntegration(index, 'serviceStorage', $event)"
          :options="serviceStorageOptions"
          label="Выберите сервис справочников"

        />
      </div>

      <div class="q-mb-md">
        <q-select
          filled
          :model-value="integration.serviceOrder"
          @update:model-value="updateIntegration(index, 'serviceOrder', $event)"
          :options="serviceOrderOptions"
          label="Выберите сервис заказов"

        />
      </div>

      <q-select
        filled
        :model-value="integration.triggerType"
        @update:model-value="updateIntegration(index, 'triggerType', $event)"
        :options="typeTriggerOptions"
        label="Тип триггера"

        emit-value
        map-options
        class="q-mb-md"
      />

              <!-- multiple
        use-chips -->

      <div v-if="integration.triggerType === 'subscription'" class="q-mb-md">
        <q-toggle
          :model-value="integration.subscriptionEnabled"
          @update:model-value="updateIntegration(index, 'subscriptionEnabled', $event)"
          label="Подписка"
        />
      </div>

      <div v-if="integration.triggerType === 'interval'" class="q-mb-md">
        <q-input
          filled
          :model-value="integration.intervalValue"
          @update:model-value="updateIntegration(index, 'intervalValue', $event)"
          type="number"
          label="Интервал (мин)"
          min="1"
          style="width: 150px"
        />
      </div>

      <div v-if="integration.triggerType === 'schedule'" class="q-mb-md">
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
                <q-time :model-value="integration.triggerTime" @update:model-value="updateIntegration(index, 'triggerTime', $event)" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="row q-mt-md">
        <q-btn
          v-if="index === (modelValue.integrations || defaultIntegrations).length - 1"
          color="green"
          @click="addIntegration"
          label="Добавить интеграцию"
        />
        <q-btn
          v-if="(modelValue.integrations || defaultIntegrations).length > 1"
          color="red"
          class="q-ml-md"
          @click="removeIntegration(index)"
          label="Удалить"
        />
      </div>
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
  { label: 'GA', value: 'GA' }
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
  id: null,
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
    id: null,
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
