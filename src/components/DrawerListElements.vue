<template>
  <div>
    <!-- Кнопка для открытия/закрытия QDrawer -->
    <q-btn
      v-if="!drawerOpen"
      class="drawer_button drawer_left"
      dense
      round
      color="blue"
      icon="chevron_right"
      @click="change"
    />
    <q-btn
      v-if="drawerOpen"
      class="drawer_button drawer_right"
      dense
      round
      color="blue"
      icon="chevron_left"
      @click="change"
    />
    <!-- QDrawer с информацией -->
    <q-drawer
      style="margin-left: 50px; background-color: aliceblue;;"
      show-if-above
      v-model="drawerOpen"
      class="q-pa-md">
      <q-scroll-area class="fit">
        <q-btn color="green" icon="add"/>
        <q-list
      class="rounded-borders"
    >
      <q-expansion-item
         switch-toggle-side
        :content-inset-level="0.5"
        label="Магазин №1"

      >
        <q-expansion-item
         switch-toggle-side
        :content-inset-level="0.5"
        label="Группа касс 1"

      >
        <q-item>
          <span>Касса 1</span>
        </q-item>
        <q-item>
          <span>Касса 2</span>
        </q-item>

      </q-expansion-item>
        <q-expansion-item
       switch-toggle-side
        :content-inset-level="0.5"
        label="Группа касс 2"

      >
        <q-item>
          <span>Касса 1</span>
        </q-item>


      </q-expansion-item>

      </q-expansion-item>

      <q-expansion-item
        :content-inset-level="0.5"
        switch-toggle-side
        label="Магазин №2"
      >
        <q-expansion-item
        switch-toggle-side
        :content-inset-level="0.5"
        label="Группа касс 1"

      >
        <q-item>
          <span>Касса 1</span>
        </q-item>
        <q-item>
          <span>Касса 2</span>
        </q-item>

      </q-expansion-item>

      </q-expansion-item>
    </q-list>
      </q-scroll-area>
    </q-drawer>
  </div>
</template>

<script setup>

import { ref} from 'vue';
// import { useDrawerStore } from 'stores/drawerStore';

// const drawerStore = useDrawerStore();

const drawerOpen = ref(true)

const change = () => {
  drawerOpen.value = !drawerOpen.value
}



</script>

<style scoped>
.drawer_button {
  position: fixed;
  top: 50%;
  z-index: 2222; /* Увеличиваем z-index, чтобы кнопки были поверх других элементов */
}

.drawer_left {
  left: 55px; /* Расстояние от правого края, учитывая ширину QDrawer */
}

.drawer_right {
  left: 330px; /* Расстояние от правого края, учитывая ширину QDrawer */
}
</style>
