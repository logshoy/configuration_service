<template>
  <div
    class="q-pa-md"
    style="max-width: 350px"
  >
    <q-list
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
      <LanguageSettings/>
      <q-item clickable v-ripple @click="goBack">
        <q-item-section avatar>
          <q-icon color="red" name="logout" />
      </q-item-section>
        <q-item-section>Выход</q-item-section>
      </q-item>


    </q-list>
  </div>
</template>


<script setup>
import LanguageSettings from 'components/DrawerLeftFooter/LanguageSettings.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.go(-1); // Назад
};



const props = defineProps({
  miniState: Boolean,
});

console.log(props.message);
</script>
