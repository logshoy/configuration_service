<template>
  <q-layout view="hHh lpr fff">
    <div class="flex">
      <div>
        <q-drawer
          show-if-above
          bordered
          :mini="shouldMiniState"
          @mouseenter="handleDrawerEnter"
          @mouseleave="handleDrawerLeave"
          :mini-width="75"
          mini-to-overlay
        >
          <div style="height: 100%">
            <EssentialLink />
            <DrawerLeftFooter />
          </div>
        </q-drawer>
      </div>
      <q-page-container class="container">
        <q-layout view="hHh LpR fff">
          <q-page-container class="container">
            <div class="_content_center main no-scroll">
              <DrawerListElements/>
              <slot name="content">
                <router-view />
              </slot>
              <DrawerRight />
            </div>
          </q-page-container>
        </q-layout>
      </q-page-container>
    </div>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue';



import { useDrawerStore } from 'stores/drawerStore';
import { useConfigurationStore } from 'stores/configurationStore';

import EssentialLink from 'components/EssentialLink.vue';
import DrawerLeftFooter from 'components/DrawerLeftFooter.vue';
import DrawerListElements from 'components/DrawerListElements.vue';
import DrawerRight from 'components/DrawerRight.vue';

const drawerStore = useDrawerStore();
const selectedItemStore = useConfigurationStore();



// Computed properties
const shouldMiniState = computed(() => {
  return drawerStore.miniState && !drawerStore.isLocked;
});

const isLoading = computed(() => selectedItemStore.isLoading);
const error = computed(() => selectedItemStore.error);

// Обработчики событий
const handleDrawerEnter = () => {
  if (!drawerStore.isLocked) {
    drawerStore.setMiniState(false);
  }
};

const handleDrawerLeave = () => {
  if (!drawerStore.isLocked) {
    drawerStore.setMiniState(true);
  }
};

// Очистка поиска

// Синхронизация с хранилищем при изменении поискового запроса

// Сброс поиска при смене роута


// Синхронизация при внешних изменениях


defineExpose({
  isLoading,
  error,
});
</script>

<style scoped>
._content_center {
  display: flex;
  width: 100%;
  padding: 20px 25px 20px 25px;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.container {
  width: 100%;
  height: 100vh;
}
</style>
