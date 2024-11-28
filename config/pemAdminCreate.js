import forge from 'node-forge';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import userModel from '../models/user.js';
import mongo from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function createSuperAdmin() {
  const superAdminData = {
    _id: new mongo.mongoose.Types.ObjectId("67404ae44d9f5e1f2c6eb4dd"),
    role: 'Admin',
    email: 'microservice@gov.ph',
    author: 'DICT',
    password: 'a809b89f698687b86efdbfada80b400df4793f1139067d27e160014b12a0de10',
    isActive: true,
  };

  await userModel.deleteOne({
    email: superAdminData.email,
    role: superAdminData.role,
  });

  try {
    const admin = new userModel(superAdminData);
    await admin.save();
  } catch (error) {
    throw error;
  }
};

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

if (!fs.existsSync(privateKeyFile) || !fs.existsSync(publicKeyFile)) {
    generateAndSaveKeys();
    createSuperAdmin();
}

export const privateKey = fs.readFileSync(privateKeyFile, 'utf8');
export const publicKey = fs.readFileSync(publicKeyFile, 'utf8');

// globalThis.privateKey = privateKey;
// globalThis.publicKey = publicKey;
