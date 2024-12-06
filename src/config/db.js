import environment from "./environment.js";
import mongoose from "mongoose";

const schema = mongoose.Schema;
const dbname = environment.db.DBNAME;
const replica = environment.db.REPLICA;
const dbhost = environment.db.HOST;
const username = environment.db.USERNAME;
const password = environment.db.PASSWORD;

let mongoconnection;
let credentials = "";

if(username !== "" && password !== ""){
    credentials = `${username}:${password}@`;
}

if(replica){
    mongoconnection = `mongodb://${credentials}${dbhost}/${dbname}?replicaSet=${MONGODB_REPLICA_SET}`;
} else {
    mongoconnection = `mongodb://${credentials}${dbhost}/${dbname}`;
}

console.log(`connecting to mongoose connection: \n\n${mongoconnection}\n`);

mongoose
    .set("debug", false)
    .connect(mongoconnection)
    .then(() => {
        console.log("\x1b[1m\x1b[32mconnected to mongodb\x1b[0m"); 
    })
    .catch((err) => {
        console.log("MongoError: ", err);
    });

export default {
    mongoose,
    mongoconnection,
    schema
};