<template>
    <q-page class="flex flex-center">
      <q-btn color="negative" size="xl" icon="arrow_back" label="Back" @click="$router.push('/')"/>
      <q-btn color="positive" size="xl" icon="help" label="Test" @click="dbTest()"/>

    </q-page>
  </template>
  
  <script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { connectedDeviceStore } from "../stores/connected-device-store.js";
    import { dbStore } from "../stores/database-store.js";

    const databaseStore = dbStore()

    const deviceStore = connectedDeviceStore();
    
    onMounted( async () => {
      await databaseStore.openDatabase()
    });


    const dbTest = async () => {
        await databaseStore.test() 
        await databaseStore.storeDeviceData(deviceStore.connectedDeviceName, deviceStore.connectedDeviceID)
    };


  </script>
  