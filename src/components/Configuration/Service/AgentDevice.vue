<template>
  <div class="equipment-editor">
    <!-- Список карточек оборудования -->
    <div class="row q-col-gutter-md q-mx-xs">
      <div
        v-for="(device, index) in modelValue.devices || defaultDevices"
        :key="device.id || index"
        class="col-12 col-lg-4"
      >
        <q-card class="text-bold equipment-card cursor-pointer" @click="openEditDialog(index)">
          <q-card-section>
            <div class="row">
              <div class="col">
                <div>{{ getDeviceTitle(device) }}</div>
                <div class="text-caption">ID: {{ device.id }}</div>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  round
                  icon="delete"
                  color="negative"
                  @click.stop="removeDevice(index)"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Кнопка добавления -->
      <div class="col-12 col-lg-4">
        <q-card class="bg-positive add-card cursor-pointer" @click="addDevice">
          <q-card-section class="flex flex-center full-height bg-positive text-white">
            <div class="text-center">
              <q-icon name="add" size="xl" />
              <div class="text-subtitle1 q-mt-sm">Добавить оборудование</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Диалог редактирования -->
    <q-dialog v-model="editDialog" persistent>
      <q-card style="min-width: 50vw">
        <q-card-section class="bg-grey-2">
          <div class="text-h6">
            {{ editingIndex === -1 ? 'Новое оборудование' : `Редактирование #${editingIndex + 1}` }}
          </div>
        </q-card-section>

        <q-card-section class="scroll" style="max-height: 70vh">
          <div class="row q-col-gutter-md">
            <!-- Device ID -->
            <div class="col-12 col-md-6">
              <div class="row items-center q-col-gutter-sm">
                <div class="col">
                  <q-input
                    filled
                    v-model="editingDevice.id"
                    label="Device ID"
                    readonly
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    color="primary"
                    icon="autorenew"
                    @click="generateUid()"
                    round
                    dense
                  />
                  <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                    <q-tooltip>
                      Уникальный идентификатор оборудования.<br>
                      Нажмите кнопку для генерации нового ID.
                    </q-tooltip>
                  </q-icon>
                </div>
              </div>
            </div>

            <!-- Тип оборудования -->
            <div class="col-12 col-md-6">
              <div class="row items-center">
                <div class="col">
                  <q-select
                    filled
                    v-model="editingDevice.type"
                    :options="equipmentTypeOptions"
                    label="Тип оборудования"
                    emit-value
                    map-options
                    @update:model-value="onTypeChange"
                    clearable
                  />
                </div>
                <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                  <q-tooltip>
                    Выберите тип оборудования из списка.<br>
                    Это определит доступные модели и настройки.
                  </q-tooltip>
                </q-icon>
              </div>
            </div>

            <!-- Модель оборудования -->
            <div class="col-12 col-md-6" v-if="editingDevice.type">
              <div class="row items-center">
                <div class="col">
                  <q-select
                    filled
                    v-model="editingDevice.model"
                    :options="getModelOptions(editingDevice.type)"
                    label="Модель"
                    emit-value
                    map-options
                    clearable
                  />
                </div>
                <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                  <q-tooltip>
                    Выберите модель оборудования.<br>
                    Доступные модели зависят от выбранного типа.
                  </q-tooltip>
                </q-icon>
              </div>
            </div>

            <!-- Порт подключения -->
            <div class="col-12 col-md-6">
              <div class="row items-center">
                <div class="col">
                  <q-select
                    filled
                    v-model="editingDevice.connectionType"
                    :options="connectionOptions"
                    label="Тип подключения"
                    emit-value
                    map-options
                    clearable
                  />
                </div>
                <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                  <q-tooltip>
                    Выберите способ подключения оборудования.<br>
                    Это определит дополнительные настройки подключения.
                  </q-tooltip>
                </q-icon>
              </div>
            </div>

            <!-- Настройки подключения -->
            <div class="col-12 col-md-6" v-if="editingDevice.connectionType === 'com'">
              <div class="row items-center">
                <div class="col">
                  <q-input
                    filled
                    v-model="editingDevice.comPort"
                    label="COM порт"
                  />
                </div>
                <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                  <q-tooltip>
                    Укажите COM порт для подключения (например, COM1, COM3).<br>
                    Проверьте правильность порта в диспетчере устройств.
                  </q-tooltip>
                </q-icon>
              </div>
            </div>

            <div class="col-12 col-md-6" v-if="editingDevice.connectionType === 'network'">
              <div class="row items-center">
                <div class="col">
                  <q-input
                    filled
                    v-model="editingDevice.ipAddress"
                    label="IP адрес"
                  />
                </div>
                <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                  <q-tooltip>
                    Укажите IP адрес оборудования в сети.<br>
                    Пример: 192.168.1.100
                  </q-tooltip>
                </q-icon>
              </div>
            </div>

            <div class="col-12 col-md-6" v-if="editingDevice.connectionType === 'network'">
              <div class="row items-center">
                <div class="col">
                  <q-input
                    filled
                    v-model="editingDevice.port"
                    label="Порт"
                    type="number"
                  />
                </div>
                <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                  <q-tooltip>
                    Укажите порт для сетевого подключения.<br>
                    По умолчанию: 9100 (стандартный порт для принтеров)
                  </q-tooltip>
                </q-icon>
              </div>
            </div>

            <!-- Дополнительные настройки -->
            <div class="col-12" v-if="editingDevice.type">
              <q-expansion-item
                label="Дополнительные настройки"
                class="bg-grey-1 q-mt-sm"
              >
                <template v-slot:header>
                  <div class="row items-center">
                    <div>Дополнительные настройки</div>
                    <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                      <q-tooltip>
                        Дополнительные параметры работы оборудования.<br>
                        Настройки зависят от выбранного типа устройства.
                      </q-tooltip>
                    </q-icon>
                  </div>
                </template>

                <div class="q-pa-md">
                  <template v-if="editingDevice.type === 'printer'">
                    <div class="row items-center">
                      <q-toggle
                        v-model="editingDevice.cutEnabled"
                        label="Автоотрезка чека"
                        left-label
                      />
                      <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                        <q-tooltip>
                          Включите, если принтер должен автоматически<br>
                          отрезать чек после печати.
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="row items-center q-mt-sm">
                      <q-toggle
                        v-model="editingDevice.openCashDrawer"
                        label="Открытие денежного ящика"
                        left-label
                      />
                      <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                        <q-tooltip>
                          Включите, если принтер должен открывать<br>
                          денежный ящик после печати чека.
                        </q-tooltip>
                      </q-icon>
                    </div>
                  </template>

                  <template v-if="editingDevice.type === 'customerDisplay'">
                    <div class="row items-center">
                      <div class="col">
                        <q-input
                          filled
                          v-model="editingDevice.lineLength"
                          label="Количество символов в строке"
                          type="number"
                          min="20"
                          max="80"
                        />
                      </div>
                      <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                        <q-tooltip>
                          Укажите максимальное количество символов<br>
                          в одной строке дисплея (обычно 20-80 символов).
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="row items-center q-mt-sm">
                      <q-toggle
                        v-model="editingDevice.showPrices"
                        label="Показывать цены"
                        left-label
                      />
                      <q-icon name="help_outline" size="sm" class="q-ml-sm cursor-help">
                        <q-tooltip>
                          Включите, чтобы показывать цены товаров<br>
                          на дисплее покупателя.
                        </q-tooltip>
                      </q-icon>
                    </div>
                  </template>
                </div>
              </q-expansion-item>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="negative" v-close-popup />
          <q-btn label="Сохранить" color="positive" @click="saveDevice" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

// Опции для типов оборудования
const equipmentTypeOptions = [
  { label: 'Принтер чеков', value: 'printer' },
  { label: 'Дисплей покупателя', value: 'customerDisplay' }
]

// Опции для моделей оборудования
const equipmentModels = {
  printer: [
    { label: 'ESCPOS', value: 'ESCPOS' },
    { label: 'TM200', value: 'TM200' }
  ],
  customerDisplay: [
    { label: 'LCD-200', value: 'lcd200' },
    { label: 'LCD-320', value: 'lcd320' }
  ]
}

// Типы подключения
const connectionOptions = [
  { label: 'COM порт', value: 'com' },
  { label: 'USB', value: 'usb' },
  { label: 'Сеть (TCP/IP)', value: 'network' }
]

const defaultDevices = ref([{
  id: uuidv4(),
  type: null,
  model: null,
  connectionType: null,
  comPort: '',
  ipAddress: '',
  port: 9100,
  cutEnabled: true,
  openCashDrawer: true,
  lineLength: 40,
  showPrices: true
}])

// Состояние диалога
const editDialog = ref(false)
const editingIndex = ref(-1)
const editingDevice = ref(null)

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

// Получить название для карточки
const getDeviceTitle = (device) => {
  if (!device.type) return 'Новое оборудование'

  const type = equipmentTypeOptions.find(t => t.value === device.type)?.label || device.type
  const model = equipmentModels[device.type]?.find(m => m.value === device.model)?.label || device.model

  return `${type}${model ? ` (${model})` : ''}`
}

// Открыть диалог редактирования
const openEditDialog = (index) => {
  editingIndex.value = index
  editingDevice.value = JSON.parse(JSON.stringify(
    props.modelValue.devices
      ? props.modelValue.devices[index]
      : defaultDevices.value[index]
  ))
  editDialog.value = true
}

// Сохранить изменения
const saveDevice = () => {
  const devices = props.modelValue.devices
    ? [...props.modelValue.devices]
    : [...defaultDevices.value]

  if (editingIndex.value === -1) {
    devices.push(editingDevice.value)
  } else {
    devices[editingIndex.value] = editingDevice.value
  }

  emit('update:modelValue', { ...props.modelValue, devices })
  editDialog.value = false
}

// Добавить новое устройство
const addDevice = () => {
  editingIndex.value = -1
  editingDevice.value = {
    id: uuidv4(),
    type: null,
    model: null,
    connectionType: null,
    comPort: '',
    ipAddress: '',
    port: 9100,
    cutEnabled: true,
    openCashDrawer: true,
    lineLength: 40,
    showPrices: true
  }
  editDialog.value = true
}

// Удалить устройство
const removeDevice = (index) => {
  const devices = props.modelValue.devices
    ? [...props.modelValue.devices]
    : [...defaultDevices.value]

  devices.splice(index, 1)
  emit('update:modelValue', {
    ...props.modelValue,
    devices: devices.length > 0 ? devices : [{
      id: uuidv4(),
      type: null,
      model: null,
      connectionType: null,
      comPort: '',
      ipAddress: '',
      port: 9100,
      cutEnabled: true,
      openCashDrawer: true,
      lineLength: 40,
      showPrices: true
    }]
  })
}

// Получить варианты моделей для типа
const getModelOptions = (type) => {
  return equipmentModels[type] || []
}

// Обработчик смены типа
const onTypeChange = () => {
  editingDevice.value.model = null
}

// Сгенерировать новый ID
const generateUid = () => {
  editingDevice.value.id = uuidv4()
}
</script>

<style scoped>
.equipment-card {
  transition: all 0.3s ease;
  height: 100%;
}

.equipment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.add-card {
  height: 100%;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-no-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cursor-help {
  cursor: help;
}
</style>
