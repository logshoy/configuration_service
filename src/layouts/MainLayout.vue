<template>
  <q-layout view="lpr lpr lpr">
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
      <q-page-container style="width: 100%">
        <q-layout view="hHh rpR fFf">
          <q-page-container style="width: 100%">
            <div class="_content_center main">
              <DrawerListElements/>
              <div class="text-h5 q-pa-xs">{{ $t(headerTitle) }}</div>
              <q-input
                rounded
                outlined
                label="Поиск"
                type="search"
                placeholder="Введите текст для поиска"
                :model-value="searchQuery"
                @update:model-value="handleSearchInput"
                clearable
                @clear="clearSearch"
              />
              <slot name="content">
                <!-- Default content if no slot is provided -->
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
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia'
import { debounce } from 'quasar'

import { useDrawerStore } from 'stores/drawerStore';
import { useConfigurationStore } from 'stores/configurationStore';
import { useHeaderStore } from 'stores/headerStore'

import EssentialLink from 'components/EssentialLink.vue';
import DrawerLeftFooter from 'components/DrawerLeftFooter.vue';
import DrawerListElements from 'components/DrawerListElements.vue';
import DrawerRight from 'components/DrawerRight.vue';

const route = useRoute();

const drawerStore = useDrawerStore();
const selectedItemStore = useConfigurationStore();
const headerStore = useHeaderStore()

const { title: headerTitle } = storeToRefs(headerStore)
const { search: storeSearch } = storeToRefs(drawerStore)

// Локальная копия для быстрого отображения в input
const searchQuery = ref(storeSearch.value || '');

// Computed properties
const shouldMiniState = computed(() => {
  return drawerStore.miniState && !drawerStore.isLocked;
});

const isLoading = computed(() => selectedItemStore.isLoading);
const error = computed(() => selectedItemStore.error);
// const drawerOpen = ref(true)

// Обработчики
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

// Оптимизированный обработчик ввода с debounce
const handleSearchInput = debounce((value) => {
  searchQuery.value = value;
  drawerStore.setSearch(value);
}, 300);

// Очистка поиска
const clearSearch = () => {
  searchQuery.value = '';
  drawerStore.setSearch('');
};

// Синхронизация при изменении route
watch(() => route.path, () => {
  searchQuery.value = '';
  drawerStore.setSearch('');
});

// Следим за изменениями в хранилище (на случай внешних изменений)
watch(storeSearch, (newVal) => {
  searchQuery.value = newVal;
});

// Expose values to slots
defineExpose({
  searchQuery,
  isLoading,
  error,
});
</script>

<style>
._content_center {
  display: flex;
  width: 100%;
  padding: 20px 25px 20px 25px;
  flex: 1;
  flex-direction: column;
}
</style>
