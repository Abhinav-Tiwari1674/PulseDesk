import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let adminAuth = null;

try {
    // 1. Try to load from environment variables first (production/Render setup)
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
        // Format the private key to handle escaped newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.substring(1, privateKey.length - 1);
        }

        if (getApps().length === 0) {
            initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey
                })
            });
        }
        adminAuth = getAuth();
        console.log('✅ [Firebase Admin] Initialized successfully using environment variables.');
    } else {
        // 2. Fallback to serviceAccountKey.json (local development)
        const keyPath = join(__dirname, '../config/serviceAccountKey.json');
        const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

        if (serviceAccount && serviceAccount.project_id && serviceAccount.private_key) {
            if (getApps().length === 0) {
                initializeApp({
                    credential: cert(serviceAccount)
                });
            }
            adminAuth = getAuth();
            console.log('✅ [Firebase Admin] Initialized successfully using serviceAccountKey.json.');
        } else {
            throw new Error('Service account file is missing project_id or private_key fields.');
        }
    }
} catch (error) {
    console.warn(
        '[Firebase Admin] Initialization failed. Google Sign-In disabled. Details: ' + error.message
    );
}

export { adminAuth };
