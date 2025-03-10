<template>
  <q-layout no-scroll view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

      </q-toolbar>
    </q-header>


   <div class="flex">
    <div>
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above

      bordered
      :mini="miniState"
        @mouseenter="miniState = false"
        @mouseleave="miniState = true"
        mini-to-overlay
    >
      <q-list class="justify-between" style="height: 100%;">

        <EssentialLink :miniState="miniState" />
        <DrawerLeftFooter/>
      </q-list>
      <div>

      </div>
    </q-drawer>
    </div>
    <div class="_content_center">

      <q-page-container :style="pageContainerStyle">
        <router-view />
      </q-page-container>
    </div>

  <div class="drawer_container">
        <q-btn
        v-if="!drawerOpen"
                class="drawer_right"
                dense
                round
                color="accent"
                icon="chevron_left"
                @click="drawerOpen = !drawerOpen"
              />
        <q-btn
                v-if="drawerOpen"
                class="drawer_left"
                dense
                round
                color="accent"
                icon="chevron_right"
                @click="drawerOpen = !drawerOpen"
              />
        <!-- QDrawer с информацией -->
        <q-drawer
          overlay
          v-model="drawerOpen"
          side="right"
          bordered
          :width="315"
          behavior="desktop"
          persistent="false"
        >
          <q-scroll-area class="fit">


            <div
              class="q-pa-md"
              v-if="selectedItem"
              >
              <h5 class="q-mt-none">Свойства элемента</h5>
              <p><strong>ID:</strong> {{ selectedItem.id }}</p>
              <p><strong>Имя:</strong> {{ selectedItem.name }}</p>
              <p><strong>Описание:</strong> {{ selectedItem.description }}</p>
            </div>
          </q-scroll-area>

        </q-drawer>
        </div>

      </div>


  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'

import { useConfigurationStore } from 'stores/configurationStore';

import EssentialLink from 'components/EssentialLink.vue'
import DrawerLeftFooter from 'components/DrawerLeftFooter.vue'

const miniState = ref(true)
const drawerOpen = ref(true);

const selectedItemStore = useConfigurationStore();
const selectedItem = computed(() => selectedItemStore.configuration); // Получаем выбранный элемент из хранилища


</script>
<style>

._content_center {
    display: flex;
    width: 100%;
    padding: 20px 25px 20px 10px;
    flex: 1;
    flex-direction: column;
}

.drawer_right {
  z-index: 99999;
  margin-top: 50vh;
  right: 5px;
  position:absolute;
  display: flex;
}

.drawer_left {
  z-index: 99999;
  margin-top: 50vh;
  right: 300px;
  position:absolute;
}

.drawer_container{
  width: 0px;
}

.q-page-container {
  padding-right: 330px;
  /* padding-left: 300px; */
}

@media (min-width: 1200px) {
  .q-page-container {
    padding-right: 350px;
    /* padding-left: 400px; */
  }
}

@media (min-width: 1600px) {
  .q-page-container {
    padding-right: 400px;
    /* padding-left: 600px; */
  }
}

</style>
