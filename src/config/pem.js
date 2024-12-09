import forge from 'node-forge';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

function generateAndSaveKeys() {
    const keys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
    const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);

    fs.writeFileSync(path.join(rootDir, 'private_key.pem'), privateKeyPem);
    fs.writeFileSync(path.join(rootDir, 'public_key.pem'), publicKeyPem);

    console.log('Keys generated and saved successfully.');
};

const privateKeyFile = path.join(rootDir, 'private_key.pem');
const publicKeyFile = path.join(rootDir, 'public_key.pem');

if (!fs.existsSync(privateKeyFile) || !fs.existsSync(publicKeyFile)) 
    generateAndSaveKeys();

export const privateKey = fs.readFileSync(privateKeyFile, 'utf8');
export const publicKey = fs.readFileSync(publicKeyFile, 'utf8');

// globalThis.privateKey = privateKey;
// globalThis.publicKey = publicKey;
