import crypto from 'node:crypto';

export const encryptPassword = (password, _id) => {
    let hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    let saltData = {_id};
    
    return crypto.createHmac('sha256', JSON.stringify(saltData) + hashedPassword).digest('hex');
};
