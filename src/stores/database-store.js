import { defineStore } from 'pinia';
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite"

let db;

async function configDatabase() {
    const dbConfig = [
        {
            toVersion: 1,
            statements: [
                `CREATE TABLE IF NOT EXISTS sensors (
                sensorId INTEGER PRIMARY KEY,
                name VARCHAR(64) NOT NULL
                );`,
                `CREATE TABLE IF NOT EXISTS devices (
                deviceMac VARCHAR(18) PRIMARY KEY,
                name VARCHAR(64) NOT NULL
                );`,
                `CREATE TABLE IF NOT EXISTS sensor_readings (
                readingId INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                lat DECIMAL(10, 6),
                lon DECIMAL (10, 6),
                extSensorId INTEGER,
                readingValue DECIMAL(64, 32),
                extDeviceMac VARCHAR(18)
                )`
            ]

        }
    ]

    await CapacitorSQLite.addUpgradeStatement({
        database: "puppies",
        upgrade: dbConfig,
    });

}

export const dbStore = defineStore("dbStore", {
    state: () => {
        return { }
    
    },


    actions: {

        async test() {
           let results2 = await db.query(`SELECT * FROM sensor_readings`)
           console.log(results2)
           
        },

        async openDatabase(){
            this.sqliteConnection = new SQLiteConnection(CapacitorSQLite)

            const retCC = (await this.sqliteConnection.checkConnectionsConsistency()).result;
            const isConn = (await this.sqliteConnection.isConnection("puppies", false)).result;
            
            if (retCC && isConn) {
                db = await this.sqliteConnection.retreiveConnection("puppies", false);
            }
            else{
                db = await this.sqliteConnection.createConnection(
                "puppies",
                false,
                "no-encryption",
                1,
                false
                );
            }
            
            await configDatabase()

            await db.open();
            
            const res = await db.isDBOpen();
            if (!res.result) {
                alert("db not open")
            }
            else {
                this.sensorPopulator()
            }

            return db;
        },

        async closeDatabase() {
            const isConn = (await this.sqliteConnection.isConnection("puppies", false)).result;
            if (isConn) {
                try {
                await this.sqliteConnection.closeConnection("puppies", false);
                }
                catch {
                    const isConn = (await this.sqliteConnection.isConnection("puppies", false)).result;
                    if (isConn) {
                        alert("close failed")
                    }
                }   
            }
        },
        
        async storeDeviceData(name, id) {
            if (id != '') {
                console.log(await db.query(`SELECT * FROM sensors`))
                let result = await db.query(`SELECT * FROM devices WHERE deviceMac=?`, [id])
                if(result.values.length == 0) {
                    await db.query(`INSERT INTO devices (deviceMac, name) VALUES (?, ?)`, [id, name])
                }
            }
            else {
                console.log("No ID found")
            }
        },

        async sensorPopulator() {
            let tempCheck = await db.query(`SELECT * FROM sensors WHERE sensorId=1`)
            if (tempCheck.values.length == 0) {
                await db.query(`INSERT INTO sensors (sensorId, name) VALUES (1, "Temperature")`)
            }
        },

        async dataInsertion(timestamp, lat, long, sensorId, sensorData, deviceId){
            await db.query(`INSERT INTO sensor_readings (timestamp, lat, lon, extSensorid, readingValue, extDeviceMac) VALUES (?, ?, ?, ?, ?, ?)`, [timestamp, lat, long, sensorId, sensorData, deviceId])
        }
    }
})