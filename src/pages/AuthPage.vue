<template>
  <q-card class="auth-card">
    <q-card-section>
      <img src="/src/assets/photo_2025-03-10_12-46-15.jpg" style="width: 300px">
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="handleLogin">
        <q-input
          v-model="username"
          label="Имя пользователя"
          outlined
          class="q-mb-md"
        />

        <q-input
          v-model="password"
          label="Пароль"
          type="password"
          outlined
          class="q-mb-md"
        />

        <q-btn
          type="submit"
          color="primary"
          label="Вход"
          class="full-width"
          to="/"
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();

const username = ref('');
const password = ref('');

const handleLogin = () => {
  if (username.value && password.value) {
    // Логика авторизации
    $q.notify({
      type: 'positive',
      message: 'Успешный вход!',
    });

    // Перенаправление на главную страницу
    router.push('/');
  } else {
    $q.notify({
      type: 'negative',
      message: 'Заполните все поля',
    });
  }
};
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.full-width {
  width: 100%;
}
</style>
