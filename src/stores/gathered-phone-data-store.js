import { defineStore } from 'pinia';
import { ref } from 'vue';

export const gatheredPhoneData = defineStore("gatheredPhoneData", {
    state: () => {
        const lastTimeStamp = ref(null)
        const lastLocation = ref({})
        const temp = ref(null)
        const temp2 = ref(null)
        const battery = ref(0)
        const batteryIcon = ref("battery_unknown")
        return { lastTimeStamp, lastLocation, temp, temp2, battery, batteryIcon }
    },
    actions: {
        reset() {
            this.lastTimeStamp = null
            this.lastLocation = {}
            this.temp = null
            this.temp2 = null
            this.batteryIcon = "battery_unknown"
            this.battery = 0
        }
    }
})