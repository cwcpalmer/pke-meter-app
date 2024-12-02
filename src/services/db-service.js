import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite"


class Database{

    constructor() {
        this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    }

    async openDatabase(){
        const retCC = (await this.sqliteConnection.checkConnectionsConsistency()).result;
        const isConn = (await this.sqliteConnection.isConnection("puppies", false)).result;
        let db;
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
        
        await db.open();
        const res = await db.isDBOpen();
        if (!res.result) {
            alert("db not open")
        }
        else {
            alert("db open")
        }

        return db;
    }

    async closeDatabase(){
        const isConn = (await this.sqliteConnection.isConnection("puppies", false)).result;
        if (isConn) {
            try {
            alert("tryna unmount")
            await this.sqliteConnection.closeConnection("puppies", false);
            }
            catch {
                const isConn = (await this.sqliteConnection.isConnection("puppies", false)).result;
                if (isConn) {
                    alert("close failed")
                }
            }   
        }
        alert("unmountin")
    }
}

export default Database;