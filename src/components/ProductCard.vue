<template>
  <div class="row q-pa-xs">
    <q-btn
      @click="enableCreateForm"
      :disable="!shopStore.branch"
      color="green"
    >
      Создать сервис
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
