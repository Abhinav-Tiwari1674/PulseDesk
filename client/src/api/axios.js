import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5001/api',
    withCredentials: true
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const user = JSON.parse(userInfo);
                if (user?.token) {
                    config.headers['Authorization'] = `Bearer ${user.token}`;
                }
            } catch (e) {
                // ignore parse errors
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercept 401/403 errors (e.g., if session changes in another tab) to force a logout/redirect
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            const message = error.response.data?.message || '';
            // If it's a authorization failure or role access denial
            if (message.includes('Access denied') || message.includes('Not authorized')) {
                localStorage.removeItem('userInfo');
                sessionStorage.removeItem('userInfo');
                // Avoid infinite redirect loops
                if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
                    window.location.href = '/login?session_expired=true';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
