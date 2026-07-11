import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
    apiKey:             import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:         import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:          import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId:  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:              import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId:      import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Log all Firebase environment variables in development mode
if (import.meta.env.DEV) {
    console.log('[PulseDesk Auth] Firebase Environment Variables Debug Log:', {
        VITE_FIREBASE_API_KEY:             import.meta.env.VITE_FIREBASE_API_KEY,
        VITE_FIREBASE_AUTH_DOMAIN:         import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        VITE_FIREBASE_PROJECT_ID:          import.meta.env.VITE_FIREBASE_PROJECT_ID,
        VITE_FIREBASE_STORAGE_BUCKET:      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        VITE_FIREBASE_MESSAGING_SENDER_ID:  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        VITE_FIREBASE_APP_ID:              import.meta.env.VITE_FIREBASE_APP_ID,
        VITE_FIREBASE_MEASUREMENT_ID:      import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    });
}

let auth = null;
let googleProvider = null;
let isConfigured = false;
let missingVarsMessage = '';

// Check if a variable is missing, empty, or a placeholder
const isMissingOrPlaceholder = (val, placeholder) => {
    return !val || val === '' || val.includes(placeholder);
};

const missingList = [];

if (isMissingOrPlaceholder(firebaseConfig.apiKey, 'your-web-api-key-here')) {
    missingList.push('VITE_FIREBASE_API_KEY (currently set to placeholder or empty)');
}
if (isMissingOrPlaceholder(firebaseConfig.authDomain, 'your-project-id')) {
    missingList.push('VITE_FIREBASE_AUTH_DOMAIN');
}
if (isMissingOrPlaceholder(firebaseConfig.projectId, 'your-project-id')) {
    missingList.push('VITE_FIREBASE_PROJECT_ID');
}
if (isMissingOrPlaceholder(firebaseConfig.appId, 'your-web-app-id-here')) {
    missingList.push('VITE_FIREBASE_APP_ID (currently set to placeholder or empty)');
}

if (missingList.length === 0) {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        googleProvider.addScope('profile');
        googleProvider.addScope('email');
        isConfigured = true;
    } catch (error) {
        console.error('[Firebase SDK] Initialization error:', error);
        missingVarsMessage = `Firebase SDK Initialization Error: ${error.message}`;
    }
} else {
    isConfigured = false;
    missingVarsMessage = `Google Sign-In is not configured. Missing or placeholder values for: ${missingList.join(', ')}. Please update client/.env`;
    console.warn(`[Firebase SDK] ${missingVarsMessage}`);
}

export const signInWithGoogle = async () => {
    if (!isConfigured || !auth || !googleProvider) {
        throw new Error(
            missingVarsMessage || 
            'Google Sign-In is not configured. Please set the environment variables in client/.env'
        );
    }
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return idToken;
};

export { auth, googleProvider, isConfigured };
