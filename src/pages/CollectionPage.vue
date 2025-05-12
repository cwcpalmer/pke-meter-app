
<template>
    <q-page class="flex flex-center">
    <div class="q-pa-md">
    <q-option-group
      v-model="separator"
      inline
      class="q-mb-md"
      :options="separatorOptions"
    />
    <q-markup-table separator="cell" flat bordered class="bg-green-2">
        <thead class="bg-green-4">
            <tr>
            <th class="text-left">Reading</th>
            <th class="text-left">Value</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td class="text-left">Temperature</td>
                <td class="text-left">{{  phoneDataStore.temp }}</td>
                </tr>
                <tr>
                <td class="text-left">Temperature 2</td>
                <td class="text-left">{{  phoneDataStore.temp2 }}</td>
                </tr>
                <tr>
                <td class="text-left">Latitude</td>
                <td class="text-left">{{  phoneDataStore.lastLocation.latitude }}</td>
                </tr>
                <tr>
                <td class="text-left">Longitude</td>
                <td class="text-left">{{  phoneDataStore.lastLocation.longitude }}</td>
                </tr>
                <tr>
                <td class="text-left">Time</td>
                <td class="text-left">{{ phoneDataStore.lastTimeStamp == null ? '' : formatter.format(new Date(phoneDataStore.lastTimeStamp)) }}</td>
            </tr>
        </tbody>
        </q-markup-table>
    </div>
        
      <q-btn color="negative" size="xl" icon="arrow_back" label="Back" @click="$router.push('/')"/>
      <q-btn color="positive" size="xl" icon="help" label="Upload" @click="dbUpload()"/>
      <!-- <q-btn color="positive" size="xl" icon="help" label="View" @click="dbView()"/> -->
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
    import { gatheredPhoneData } from "../stores/gathered-phone-data-store.js";

    const databaseStore = dbStore()
    const showUpload = ref(false)
    const deviceStore = connectedDeviceStore();
    const progress = ref(0)
    const phoneDataStore = gatheredPhoneData()
    const formatter = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

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
            //await new Promise(resolve => setTimeout(resolve, 200))

            fetch(`https://www.geoappdata.com/api/v1/`, {
                method: "POST",
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    action: "saveSensorReading",
                    params: {
                        timestamp: results.values[i].timestamp,
                        lat: results.values[i].lat,
                        lon: results.values[i].lon,
                        extSensorId: results.values[i].extSensorId,
                        readingValue: results.values[i].readingValue,
                        extDeviceMac: results.values[i].extDeviceMac,
                        name: deviceStore.connectedDeviceName,
                        authCode: "JohnDevice123"
                    }
                })
            })
            .then(response => response.json())
            .then( async data => {
                if (data.success) {
                    console.log("successful")
                    curCount++
                    await databaseStore.deleteRecord(results.values[i].readingId)
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
  