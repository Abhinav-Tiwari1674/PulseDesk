import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let adminAuth = null;

try {
    const keyPath = join(__dirname, '../config/serviceAccountKey.json');
    const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

    if (serviceAccount && serviceAccount.project_id && serviceAccount.private_key) {
        if (getApps().length === 0) {
            initializeApp({
                credential: cert(serviceAccount)
            });
        }
        adminAuth = getAuth();
    } else {
        throw new Error('Service account file is missing project_id or private_key fields.');
    }
} catch (error) {
    console.warn(
        '[Firebase Admin] serviceAccountKey.json not loaded. ' +
        'Google Sign-In disabled. Details: ' + error.message
    );
}

export { adminAuth };
