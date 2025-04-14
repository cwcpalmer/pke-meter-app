<template>
  <router-view />
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { dbStore } from "stores/database-store.js";
import { connectedDeviceStore } from "stores/connected-device-store.js";
import { BleClient, numbersToDataView } from '@capacitor-community/bluetooth-le';

defineOptions({
  name: 'App'
})

const databaseStore = dbStore()
let loopTimer
const deviceStore = connectedDeviceStore()


onMounted( async () => {
      await databaseStore.openDatabase()
      loopTimer = setInterval(() => {
        if(deviceStore.isConnected) {
            BleClient.writeWithoutResponse(deviceStore.connectedDeviceID, 
            deviceStore.serviceSensors,
            deviceStore.characteristicSensors,
            numbersToDataView([0b00000011]))

            
        }
      }, 10000)
    });
    
    onBeforeUnmount( async () => {
        clearInterval(loopTimer)
        await databaseStore.closeDatabase() 
    })

// ==============================================================================================================================

 

</script>
