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
        


    </q-page>
  </template>
  
  <script setup>
    import { BleClient } from '@capacitor-community/bluetooth-le';
    import { ref, reactive, onMounted } from 'vue';
    import { Geolocation } from '@capacitor/geolocation'
    import { connectedDeviceStore } from "../stores/connected-device-store.js";
    import { gatheredPhoneData } from "../stores/gathered-phone-data-store.js";
    import { dbStore } from "../stores/database-store.js";
    import { parseStore } from "../stores/fetch-and-parse-store.js"
    import { KeepAwake } from '@capacitor-community/keep-awake';


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
    const parse = parseStore()


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
        await BleClient.connect(selectedDevice.value.device.deviceId, async (deviceId) => {
            // In-line callback to report connection lost
            deviceStore.isConnected = false
            deviceStore.connectedDeviceID = ""
            deviceStore.connectedDeviceName = ""

            phoneDataStore.reset()
            await KeepAwake.allowSleep();

        });
        deviceStore.connectedDeviceID = selectedDevice.value.device.deviceId
        deviceStore.connectedDeviceName = selectedDevice.value.device.name

        let services = await BleClient.getServices(deviceStore.connectedDeviceID)
        deviceStore.isConnected = true

        await KeepAwake.keepAwake();

       
    // start watching for notifications 
    
        await BleClient.startNotifications(
            deviceStore.connectedDeviceID,
            deviceStore.serviceSensors,
            deviceStore.characteristicSensors,
            (value) => {
                parse.parseData(value)
            }
        );
        
        await BleClient.startNotifications(
            deviceStore.connectedDeviceID,
            deviceStore.serviceBattery,
            deviceStore.characteristicBatteryLevel,
            (value) => {
                phoneDataStore.battery = value.getUint8(0)
                if (value.getUint8(0) >= 75) {
                    phoneDataStore.batteryIcon = "battery_full"
                }
                else if (value.getUint8(0) >= 25) {
                    phoneDataStore.batteryIcon = "battery_3_bar"
                }
                else {
                    phoneDataStore.batteryIcon = "battery_alert"
                }
                
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
    }

    const appTest = async () => {
        this.$root.testFunction()
    }
    
</script>