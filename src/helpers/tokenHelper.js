import jwt from 'jsonwebtoken';
import { privateKey, publicKey } from '../config/pemAdminCreate.js';

/**
 * 
 * @param {*} _id || clientSecret
 * @returns 
 */
export const createAuthToken = (_id) => 
    jwt.sign({ _id }, privateKey, { algorithm: 'RS256' });

export const verifyAuthToken = (token) => jwt.verify(token, publicKey);