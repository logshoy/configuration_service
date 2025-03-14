<template>
  <div
    class="q-pa-md mainMenu"
    style="max-width: 350px"
  >
    <q-list
      class="rounded-borders"
    >
              <q-item>
              <q-item-section avatar>
                <q-icon name="inbox" />
              </q-item-section>

              <q-item-section>
                 <img src="/src/assets/photo_2025-03-10_12-46-15.jpg" style="width: 120px">
              </q-item-section>
          </q-item>
      <q-expansion-item

       :content-inset-level="0.5"
        
        icon="category"
        :label="$t('directories')"

      >
        <q-item>
          <span>{{ $t('shops') }}</span>
        </q-item>
        <q-item>
          <span>{{ $t('goods') }}</span>
        </q-item>

      </q-expansion-item>

      <q-expansion-item
        :content-inset-level="0.5"

        icon="settings"
        :label="$t('configuration')"
      >
        <q-item>
          <span>{{ $t('cashboxs') }}</span>
        </q-item>
        <q-item>
          <span>{{ $t('services') }}</span>
        </q-item>
        <q-item>
          <span>{{ $t('devices') }}</span>
        </q-item>


      </q-expansion-item>
    </q-list>
  </div>
</template>


<script setup>
const props = defineProps({
  miniState: Boolean,
});

console.log(props.message);
</script>

<style>

.mainMenu {
  height: calc(100% - 230px);
}
</style>
