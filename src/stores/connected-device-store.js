import { defineStore } from 'pinia';
import { ref } from 'vue';
import {numberToUUID } from '@capacitor-community/bluetooth-le';


export const connectedDeviceStore = defineStore("connectedDeviceStore",  () => {
    const isConnected = ref(false);
    const connectedDeviceID = ref("")
    const connectedDeviceName = ref("")
    const serviceSensors = "ffe34776-8d60-421a-98de-a9d137253d45"
    const characteristicSensors = "32824887-d3da-4744-bafc-47c9bc1d5c64"
    const serviceBattery = numberToUUID(0x180f)
    const characteristicBatteryLevel = numberToUUID(0x2a19)
    return { isConnected, connectedDeviceID, serviceSensors, characteristicSensors, connectedDeviceName, serviceBattery, characteristicBatteryLevel };
});

