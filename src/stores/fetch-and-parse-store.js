import { defineStore } from 'pinia';
import { gatheredPhoneData } from "stores/gathered-phone-data-store.js";
import { Geolocation } from '@capacitor/geolocation'
import { dbStore } from "../stores/database-store.js";
import { connectedDeviceStore } from "../stores/connected-device-store.js";


const phoneDataStore = gatheredPhoneData()
const databaseStore = dbStore()
const deviceStore = connectedDeviceStore();


export const parseStore = defineStore("parseStore", {
    state: () => {
        return { }
        
    },
    
    
    actions: {

        async parseData(value) {
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
                let temp = value.getFloat32(curIndex, true);
                temp = Math.round((temp + Number.EPSILON) * 100) / 100
                //alert(`temperature: ${temp}` + "\u00B0C")
                curIndex += 4
                phoneDataStore.temp = temp
                await databaseStore.dataInsertion(geoData.timestamp, geoData.coords.latitude, geoData.coords.longitude, 1, temp, deviceStore.connectedDeviceID, deviceStore.connectedDeviceName)
        
            }
            if (flags & 0b00000010) {
                // temp sensor 2
                let temp2 = value.getFloat32(curIndex, true);
                temp2 = Math.round((temp2 + Number.EPSILON) * 100) / 100
                //alert(`temperature: ${temp}` + "\u00B0C")
                curIndex += 4
                phoneDataStore.temp2 = temp2
                await databaseStore.dataInsertion(geoData.timestamp, geoData.coords.latitude, geoData.coords.longitude, 2, temp2, deviceStore.connectedDeviceID, deviceStore.connectedDeviceName)
            }      
    }
}
})