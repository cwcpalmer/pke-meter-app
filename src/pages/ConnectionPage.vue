<template>
    <q-page>
        <q-btn color="primary" icon="bluetooth" size="lg" @click="scanBle()" :disable="scanDisabled" :loading="scanDisabled" style="display: block; width: 100%;">
            Scan Devices
            <template v-slot:loading>
                <q-spinner-gears class="on-left" />
                Scanning...
            </template>

        </q-btn>

        <q-radio @click="clickedDevice" v-model="selectedDevice" v-for="device in foundDevices" :key="device.device.deviceId" :val="device" :label="device.device.name + ' (' + device.device.deviceId + ')'"/>
        <q-btn v-if="!deviceStore.isConnected" @click="connectDevice()" color="primary" icon="bluetooth" size="lg" label="Connect" style="display: block; width: 100%;"/>
        <q-btn v-else @click="disconnectDevice()" color="red" icon="bluetooth" size="lg" label="Disconnect" style="display: block; width: 100%;"/>
        <q-btn color="negative" icon="arrow_back" size="lg" label="Back" @click="$router.push('/');" style="display: block; width: 100%;"/>
        {{  phoneDataStore.lastLocation }}
        {{  phoneDataStore.lastTimeStamp }}
        {{ debugInfo }}

    </q-page>
  </template>
  
  <script setup>
    import { BleClient } from '@capacitor-community/bluetooth-le';
    import { ref, reactive, onMounted } from 'vue';
    import { Geolocation } from '@capacitor/geolocation'
    import { connectedDeviceStore } from "../stores/connected-device-store.js";
    import { gatheredPhoneData } from "../stores/gathered-phone-data-store.js";
    import { dbStore } from "../stores/database-store.js";
 


// ======================================================================
// Set up variables

    const scanDisabled = ref(false);
    let foundDevices = reactive([]);
    const selectedDevice = ref({});
    let scanTimer = null;
    const deviceStore = connectedDeviceStore();
    const phoneDataStore = gatheredPhoneData()
    const debugInfo = ref({})
    const databaseStore = dbStore()
    

// ======================================================================


    const stopScanning = async () => {
        await BleClient.stopLEScan();
        scanDisabled.value = false;
    }

    onMounted( async () => {
      await databaseStore.openDatabase()
    });

// ======================================================================
// Bluetooth device scanning 
    const scanBle = async () => {
        try {
            // Start BLE and start scanning for device match
            scanDisabled.value = true;
            foundDevices.length = 0;
            await BleClient.initialize();
            await BleClient.requestLEScan(
                {
                    namePrefix: "PKE Meter"
                },
                (result) => {
                    foundDevices.push(result)
                }
            )

            //Stop scan after a specific amount of time
            scanTimer = setTimeout(async () => {
                scanTimer = null;
                await stopScanning();
            }, 5000)

        } catch (error) {
            console.log(error);
        }
    }

// ======================================================================
// Stop scaning if a device is selected
    const clickedDevice = async () => {
        if(scanTimer) {
            clearTimeout(scanTimer)
            await stopScanning();
        }
        
    }

    const connectDevice = async () => {
        await BleClient.connect(selectedDevice.value.device.deviceId, (deviceId) => {
            deviceStore.isConnected = false
        });
        deviceStore.connectedDeviceID = selectedDevice.value.device.deviceId
        deviceStore.connectedDeviceName = selectedDevice.value.device.name

        let services = await BleClient.getServices(deviceStore.connectedDeviceID)
        deviceStore.isConnected = true

        
       
    // start watching for notifications 
        await BleClient.startNotifications(
            deviceStore.connectedDeviceID,
            deviceStore.serviceSensors,
            deviceStore.characteristicSensors,
            (value) => {
                parseData(value)
            }
        );
    }

    const disconnectDevice = async () => {
        await BleClient.stopNotifications(
            deviceStore.connectedDeviceID,
            deviceStore.serviceSensors,
            deviceStore.characteristicSensors
        )
        await BleClient.disconnect(deviceStore.connectedDeviceID);
        deviceStore.isConnected = false
        deviceStore.connectedDeviceID = ""
        deviceStore.connectedDeviceName = ""
    }

    const parseData = async (value) => {
        const flags = value.getUint8(0);
        let curIndex = 1
        let geoData = await Geolocation.getCurrentPosition()
        phoneDataStore.lastLocation = {
            latitude: geoData.coords.latitude,
            longitude: geoData.coords.longitude
        }
        phoneDataStore.lastTimeStamp = geoData.timestamp
        if (flags & 0b00000001) {
            // temp sensor
            let temp = value.getFloat32(1, true);
            temp = Math.round((temp + Number.EPSILON) * 100) / 100
            //alert(`temperature: ${temp}` + "\u00B0C")
            curIndex += 4

            await databaseStore.dataInsertion(geoData.timestamp, geoData.coords.latitude, geoData.coords.longitude, 1, temp, deviceStore.connectedDeviceID)

        }

    }

    
  </script>
  