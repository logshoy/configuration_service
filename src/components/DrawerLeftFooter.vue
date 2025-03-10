<template>
  <div
    class="q-pa-md"
    style="max-width: 350px"
  >
    <q-list
      class="rounded-borders"
    >
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="info" />
        </q-item-section>

        <q-item-section>Информация о системе</q-item-section>
      </q-item>

      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon  name="settings" />
        </q-item-section>

        <q-item-section>Настройки</q-item-section>
      </q-item>

            <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="translate" />
        </q-item-section>

        <q-item-section>Язык</q-item-section>
      </q-item>
            <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon color="red" name="logout" />
        </q-item-section>

        <q-item-section>Выход</q-item-section>
      </q-item>


    </q-list>
  </div>
</template>


<script setup>
const props = defineProps({
  miniState: Boolean,
});

console.log(props.message);
</script>
