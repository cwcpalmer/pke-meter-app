import { defineStore } from 'pinia';
import { ref } from 'vue';

export const gatheredPhoneData = defineStore("gatheredPhoneData", () => {
    const lastTimeStamp = ref(0)
    const lastLocation = ref({})
    return { lastTimeStamp, lastLocation }
})