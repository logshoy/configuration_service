<template>
  <div class="drawer_container">
    <!-- Кнопка для открытия/закрытия QDrawer -->
    <q-btn
      v-if="!drawerOpen"
      class="drawer_button drawer_right"
      dense
      round
      color="accent"
      icon="chevron_left"
      @click="change"
    />
    <q-btn
      v-if="drawerOpen"
      class="drawer_button"
      dense
      round
      color="accent"
      icon="chevron_right"
      @click="change"
      :style="{ right: `${drawerWidthValue - 15}px` }"
    />
    <!-- QDrawer с информацией -->
    <q-drawer
      v-model="drawerOpen"
      side="right"
      bordered
      :overlay="drawerStore.fullScreenConfiguration"
      :width="drawerWidthValue"
      behavior="desktop"
    >
      <q-scroll-area class="fit">
        <ConfigurationProperties v-if="localItem && !isCreateFormVisible" :localItem="localItem" @save="saveChanges" />
        <FormCreateConfiguration v-if="isCreateFormVisible" />
        <div
          v-else-if="!localItem || isCreateFormVisible"
          class="flex justify-center items-center"
          style="height: 90vh;"
        >
          <h5>Выберите элемент</h5>
        </div>
      </q-scroll-area>
    </q-drawer>
  </div>
</template>

<script setup>
import FormCreateConfiguration from 'components/FormCreateConfiguration.vue';
import ConfigurationProperties from 'components/DrawerRight/ConfigurationProperties.vue';
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useConfigurationStore } from 'stores/configurationStore';
import { useDrawerStore } from 'stores/drawerStore';

const drawerStore = useDrawerStore();
const drawerOpen = computed(() => drawerStore.drawerOpenRight);

const change = () => {
  drawerStore.setDrawerOpenRight();
}

const selectedItemStore = useConfigurationStore();
const selectedItem = computed(() => selectedItemStore.configuration);

const fullScreenConfiguration = computed(() => drawerStore.fullScreenConfiguration);

const localItem = ref(null);
const isCreateFormVisible = computed(() => selectedItemStore.isCreateFormVisible);

// Логика динамической ширины
const windowWidth = ref(window.innerWidth);
const drawerWidthValue = ref(315);

const calculateWidth = () => {
  const minScreenWidth = 1024;
  const maxScreenWidth = 1920;
  let minWidth = 0
  let maxWidth = 980;

  if (!fullScreenConfiguration.value) {
    minWidth = 385;
    maxWidth = 980;
  } else {
    minWidth = 655;
    maxWidth = 1480;
  }


  if (windowWidth.value <= minScreenWidth) return minWidth;
  if (windowWidth.value >= maxScreenWidth) return maxWidth;

  const ratio = (windowWidth.value - minScreenWidth) / (maxScreenWidth - minScreenWidth);
  return Math.round(minWidth + ratio * (maxWidth - minWidth));
};

// Computed свойство без side effects
const drawerWidth = computed(() => {
  return calculateWidth();
});

// Watcher для обновления значения ширины
watch([windowWidth, drawerWidth], () => {
  drawerWidthValue.value = calculateWidth();
}, { immediate: true });

// Обработчик изменения размера окна
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

// Следим за изменением выбранного элемента
watch(selectedItem, (newValue) => {
  localItem.value = newValue ? JSON.parse(JSON.stringify(newValue)) : null;
}, { immediate: true });

// Сохранение изменений
const saveChanges = () => {
  if (localItem.value) {
    selectedItemStore.updateItem(localItem.value);
  }
};
</script>

<style scoped>
.drawer_button {
  position: fixed;
  top: 50%;
  z-index: 9322;
}

.drawer_right {
  right: 0px;
}

:deep(.q-drawer) {
  box-shadow: -12px 8px 5px rgba(73, 62, 129, 0.078);
}
</style>
