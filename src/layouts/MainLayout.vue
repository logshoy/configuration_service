<template>
  <q-layout view="hHh lpR fFf">
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
          <div style="height: 100%">
            <EssentialLink />
            <DrawerLeftFooter />
          </div>
        </q-drawer>
      </div>
      <div class="_content_center">
        <q-page-container  :style="contentStyle">
          <router-view />
        </q-page-container>
      </div>

    </div>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDrawerStore } from 'stores/drawerStore';
import EssentialLink from 'components/EssentialLink.vue';
import DrawerLeftFooter from 'components/DrawerLeftFooter.vue';


const drawerStore = useDrawerStore();
const leftDrawerOpen = ref(false);

// Вычисляемое свойство для miniState
const shouldMiniState = computed(() => {
  return drawerStore.miniState && !drawerStore.isLocked;
});

// Вычисляемое свойство для стилей контейнера
const contentStyle = computed(() => {
  return {
    width: drawerStore.drawerOpenRight ? 'calc(100% - 300px)' : '100%',
    transition: 'width 0.3s ease', // Плавный переход
  };
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



</style>
