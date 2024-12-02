<template>
  <q-page class="flex flex-center">
    <q-btn color="primary" icon="bluetooth" size="xl" label="Device Connection" @click="$router.push('/connection')"/>
    <q-btn color="secondary" icon="forest" size="xl" label="Data Collection" @click="$router.push('/collection')"/>
  </q-page>
</template>

<script setup>
defineOptions({
  name: 'IndexPage'
});
</script>
