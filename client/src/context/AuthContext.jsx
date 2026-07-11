import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { signInWithGoogle } from '../firebase';

const AuthContext = createContext();

// Storage keys
const STORAGE_KEY = 'userInfo';

// Helper: read from both storages (rememberMe uses localStorage, session uses sessionStorage)
const readStoredUser = () => {
    try {
        const local   = localStorage.getItem(STORAGE_KEY);
        const session = sessionStorage.getItem(STORAGE_KEY);
        const raw = local || session;
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

// Helper: persist user to the appropriate storage
const writeUser = (userData, rememberMe) => {
    const json = JSON.stringify(userData);
    if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, json);
        sessionStorage.removeItem(STORAGE_KEY);
    } else {
        sessionStorage.setItem(STORAGE_KEY, json);
        localStorage.removeItem(STORAGE_KEY);
    }
};

// Helper: remove from both storages
const clearUser = () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount: restore session from storage
    useEffect(() => {
        const stored = readStoredUser();
        if (stored) setUser(stored);
        setLoading(false);
    }, []);

    // ── Email / Password Login ─────────────────────────────────────────────
    const login = async (email, password, rememberMe = false) => {
        const { data } = await api.post('/auth/login', { email, password, rememberMe });
        setUser(data);
        writeUser(data, rememberMe);
        return data;
    };

    // ── Email / Password Register ──────────────────────────────────────────
    const register = async (name, email, password, role = 'employee', employeeId = '') => {
        const { data } = await api.post('/auth/register', { name, email, password, role, employeeId });
        if (!data.requiresVerification) {
            setUser(data);
            writeUser(data, false); // session storage by default for new sign-ups
        }
        return data;
    };

    // ── Verify Registration OTP ────────────────────────────────────────────
    const verifyOtp = async (email, code) => {
        const { data } = await api.post('/auth/verify-otp', { email, code });
        setUser(data);
        writeUser(data, false);
        return data;
    };

    // ── Resend Registration OTP ───────────────────────────────────────────
    const resendOtp = async (email) => {
        const { data } = await api.post('/auth/resend-otp', { email });
        return data;
    };
 
    // ── Google Sign-In ─────────────────────────────────────────────────────
    const googleLogin = async (role = 'employee', employeeId = '') => {
        // Step 1: Open Google popup, get Firebase ID token
        const idToken = await signInWithGoogle();
        // Step 2: Send token to backend for verification + JWT generation
        const { data } = await api.post('/auth/google', { idToken, role, employeeId });
        setUser(data);
        writeUser(data, true); // Google logins always persist
        return data;
    };

    // ── Forgot Password ────────────────────────────────────────────────────
    const forgotPassword = async (email) => {
        const { data } = await api.post('/auth/forgot-password', { email });
        return data;
    };

    // ── Reset Password ─────────────────────────────────────────────────────
    const resetPassword = async (token, password) => {
        const { data } = await api.post(`/auth/reset-password/${token}`, { password });
        return data;
    };

    // ── Logout ─────────────────────────────────────────────────────────────
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Continue with local logout even if backend call fails
        }
        setUser(null);
        clearUser();
    };

    // ── Refresh user data from server ──────────────────────────────────────
    const refreshAuth = async () => {
        try {
            const { data } = await api.get('/auth/me');
            const stored = readStoredUser() || {};
            const merged = { ...stored, ...data };
            setUser(merged);
            // Keep whichever storage was originally used
            const inLocal = Boolean(localStorage.getItem(STORAGE_KEY));
            writeUser(merged, inLocal);
        } catch {
            // Silently fail — user stays logged in with cached data
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            verifyOtp,
            resendOtp,
            googleLogin,
            forgotPassword,
            resetPassword,
            logout,
            refreshAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
