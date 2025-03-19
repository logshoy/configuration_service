<template>
  <div class="row q-pa-md">
    <q-btn class="q-mx-md" @click="enableCreateForm">Создать конфигурацию</q-btn>
    <div class="q-gutter-md row items-start">
      <q-select
        filled
        v-model="model"
        multiple
        :options="options"
        style="width: 250px"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import { useConfigurationStore } from 'stores/configurationStore';

const selectedItemStore = useConfigurationStore();


const model = ref(null)

const options = ref(['Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'])

const enableCreateForm = () => {
  selectedItemStore.enableCreateFormVisibility('service');
};

</script>
