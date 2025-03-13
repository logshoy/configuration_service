<template>
  <q-layout no-scroll view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar style="" class="justify-center">
        <LanguageSettings />
      </q-toolbar>
    </q-header>

    <div class="_content_center">
      <q-page-container>
        <router-view />
      </q-page-container>
    </div>
  </q-layout>
</template>

<script setup>
import LanguageSettings from 'components/DrawerLeftFooter/LanguageSettings.vue';
</script>

<style scoped>
/* Стили для layout */
._content_center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5; /* Фоновый цвет */
}
</style>
