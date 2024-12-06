import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || '3000';
const env = process.env.ENV || 'local';

const db = env === 'local' ? {
    HOST: '127.0.0.1:27017',
    REPLICA: "",
    USERNAME: "",
    PASSWORD: "",
    DBNAME: 'psgc'
} : {
    HOST: process.env[`HOST_${env}_ENV`],
    REPLICA: process.env[`REPLICA_${env}_ENV`],
    USERNAME: process.env[`USERNAME_${env}_ENV`],
    PASSWORD: process.env[`PASSWORD_${env}_ENV`],
    DBNAME: process.env[`DBNAME_${env}_ENV`]    
};

const secret = process.env.SECRET || "xz%-oo!%^&j&lw&65xrk6nm(q^n@1(o!0#lwxx7**o+$9=eiti";

export default { port, env, db, secret };