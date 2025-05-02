<template>
  <div class="row q-pa-md">
    <q-btn
      class="q-mx-md"
      @click="enableCreateForm"
      :disable="!shopStore.branch"
      color="primary"
    >
      Создать конфигурацию сервиса
    </q-btn>
  </div>
</template>

<script setup>
import { useShopStore } from 'stores/shopStore'
import { useConfigurationStore } from 'stores/configurationStore'

const shopStore = useShopStore()
const configurationStore = useConfigurationStore()

const enableCreateForm = () => {
  if (shopStore.branch) {
    configurationStore.enableCreateFormVisibility('service')
  }
}
</script>
