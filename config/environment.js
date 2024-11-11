import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || '3000';
const env = process.env.ENV || 'dev';

const db = {
    HOST: process.env[`HOST_${env}_ENV`],
    REPLICA: process.env[`REPLICA_${env}_ENV`],
    USERNAME: process.env[`USERNAME_${env}_ENV`],
    PASSWORD: process.env[`PASSWORD_${env}_ENV`],
    DBNAME: process.env[`DBNAME_${env}_ENV`]
};

export default {port, env, db};