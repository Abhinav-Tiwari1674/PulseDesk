import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true
});

// Automatically attach JWT token and current Workspace ID to every request
api.interceptors.request.use(
    (config) => {
        // Attach JWT token
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

        // Attach workspace ID header
        const currentWorkspaceId = localStorage.getItem('currentWorkspaceId');
        if (currentWorkspaceId) {
            config.headers['x-workspace-id'] = currentWorkspaceId;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
