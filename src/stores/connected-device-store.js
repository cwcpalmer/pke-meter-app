import { defineStore } from 'pinia';
import { ref } from 'vue';


export const connectedDeviceStore = defineStore("connectedDeviceStore",  () => {
    const isConnected = ref(false);
    const connectedDeviceID = ref("")
    const connectedDeviceName = ref("")
    const serviceSensors = "ffe34776-8d60-421a-98de-a9d137253d45"
    const characteristicSensors = "32824887-d3da-4744-bafc-47c9bc1d5c64"
    return { isConnected, connectedDeviceID, serviceSensors, characteristicSensors, connectedDeviceName };
});

