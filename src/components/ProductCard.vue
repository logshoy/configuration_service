<template>
  <div class="row q-pa-md">
    <q-btn class="q-mx-md" @click="enableCreateForm">Создать конфигурацию сервиса</q-btn>

  </div>
</template>

<script setup>

import { useConfigurationStore } from 'stores/configurationStore';

const selectedItemStore = useConfigurationStore();


const enableCreateForm = () => {
  selectedItemStore.enableCreateFormVisibility('service');
};

</script>
