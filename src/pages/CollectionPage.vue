<template>
    <q-page class="flex flex-center">
      <q-btn color="negative" size="xl" icon="arrow_back" label="Back" @click="$router.push('/')"/>
      <q-btn color="positive" size="xl" icon="help" label="Upload" @click="dbUpload()"/>
      <q-btn color="positive" size="xl" icon="help" label="View" @click="dbView()"/>
      <q-circular-progress
      show-value
      font-size="12px"
      :value="progress"
      size="50px"
      :thickness="0.22"
      color="teal"
      track-color="grey-3"
      class="q-ma-md"
      v-if = "showUpload"
    >
      {{ progress }}%
    </q-circular-progress>
    </q-page>
  </template>
  
  <script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { connectedDeviceStore } from "../stores/connected-device-store.js";
    import { dbStore } from "../stores/database-store.js";

    const databaseStore = dbStore()
    const showUpload = ref(false)
    const deviceStore = connectedDeviceStore();
    const progress = ref(0)
    
    onMounted( async () => {
      await databaseStore.openDatabase()
    });


    const dbUpload = async () => {
        showUpload.value = true
        let results = await databaseStore.getAllRecords() 
        let length = results.values.length
        let curCount = 0
        progress.value = 0

        for (let i = 0 ; i < length ; i++) {
            //artificial timer for demo purposes
            await new Promise(resolve => setTimeout(resolve, 200))

            fetch(`https://www.packageinstaller.zip/api/`, {
                method: "POST",
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    query: {
                        dataset: "pke",
                        action: "saveSensorReading",
                        params: {
                            timestamp: results.values[i].timestamp,
                            lat: results.values[i].lat,
                            lon: results.values[i].lon,
                            extSensorId: results.values[i].extSensorId,
                            readingValue: results.values[i].readingValue,
                            extDeviceMac: results.values[i].extDeviceMac
                        }
                    }
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log("successful")
                    curCount++
                    databaseStore.deleteRecord(results.values[i].recordId)
                    progress.value = Math.round(curCount * 100 / length)
                }
                else {
                    console.log("failed")
                    showUpload.value = false
                }
            })
        }
        showUpload.value = false

    };

    const dbView = async () => {
        await databaseStore.view() 
    };


  </script>
  