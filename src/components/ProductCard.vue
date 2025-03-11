<template>
  <div class="row q-pa-md">
    <q-btn class="q-mx-md">Создать сервис</q-btn>
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

<script>
import { ref } from 'vue'

export default {
  setup () {
    return {
      model: ref(null),
      options: [
        'Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'
      ]
    }
  }
}
</script>
