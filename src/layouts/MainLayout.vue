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
          :mini="shouldMiniState"
          @mouseenter="handleDrawerEnter"
          @mouseleave="handleDrawerLeave"
          mini-to-overlay
        >
          <div style="height: 100%;">
            <EssentialLink />
            <DrawerLeftFooter />
          </div>
        </q-drawer>
      </div>
      <div class="_content_center">
        <q-page-container :style="pageContainerStyle">
          <router-view />
        </q-page-container>
      </div>
      <DrawerRight />
    </div>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDrawerStore } from 'stores/drawerStore';
import EssentialLink from 'components/EssentialLink.vue';
import DrawerLeftFooter from 'components/DrawerLeftFooter.vue';
import DrawerRight from 'components/DrawerRight.vue';

const drawerStore = useDrawerStore();
const leftDrawerOpen = ref(false);

// Вычисляемое свойство для miniState
const shouldMiniState = computed(() => {
  return drawerStore.miniState && !drawerStore.isLocked;
});

// Обработчик при наведении на drawer
const handleDrawerEnter = () => {
  if (!drawerStore.isLocked) {
    drawerStore.setMiniState(false);
  }
};

// Обработчик при уходе курсора с drawer
const handleDrawerLeave = () => {
  if (!drawerStore.isLocked) {
    drawerStore.setMiniState(true);
  }
};
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
  position: absolute;
  display: flex;
}

.drawer_left {
  z-index: 99999;
  margin-top: 50vh;
  right: 300px;
  position: absolute;
}

.drawer_container {
  width: 0px;
}
</style>
