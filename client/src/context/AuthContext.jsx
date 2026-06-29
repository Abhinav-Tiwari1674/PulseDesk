import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in and fetch current workspace details
    const checkAuth = async () => {
        try {
            const storedUser = localStorage.getItem('userInfo');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // If user has a current workspace, fetch its details
                if (parsedUser.currentWorkspace) {
                    try {
                        // Store the workspace ID in localStorage to ensure the request interceptor attaches it
                        localStorage.setItem('currentWorkspaceId', parsedUser.currentWorkspace);
                        const { data } = await api.get('/workspaces/current');
                        setWorkspace(data);
                    } catch (wsErr) {
                        console.error('Failed to fetch workspace details:', wsErr);
                        // If it fails with a 403 or 404, maybe workspace was deleted or user was removed
                        if (wsErr.response?.status === 403 || wsErr.response?.status === 404) {
                            setWorkspace(null);
                            // Clear workspace info from user
                            const updatedUser = { ...parsedUser, currentWorkspace: null };
                            setUser(updatedUser);
                            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                            localStorage.removeItem('currentWorkspaceId');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Auth verification error:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            if (data.currentWorkspace) {
                localStorage.setItem('currentWorkspaceId', data.currentWorkspace);
                try {
                    const wsRes = await api.get('/workspaces/current');
                    setWorkspace(wsRes.data);
                } catch (err) {
                    console.error('Error fetching workspace after login:', err);
                }
            } else {
                setWorkspace(null);
                localStorage.removeItem('currentWorkspaceId');
            }
            return data;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setWorkspace(null);
            localStorage.removeItem('currentWorkspaceId');
            return data;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error on backend:', err);
        }
        setUser(null);
        setWorkspace(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('currentWorkspaceId');
    };

    // Call this after creating a workspace or when a join request is approved
    const selectWorkspace = async (workspaceId) => {
        if (!workspaceId) {
            setWorkspace(null);
            localStorage.removeItem('currentWorkspaceId');
            if (user) {
                const updatedUser = { ...user, currentWorkspace: null };
                setUser(updatedUser);
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            }
            return;
        }

        localStorage.setItem('currentWorkspaceId', workspaceId);
        try {
            const { data } = await api.get('/workspaces/current');
            setWorkspace(data);
            
            if (user) {
                const updatedUser = { ...user, currentWorkspace: workspaceId, role: data.role };
                setUser(updatedUser);
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error('Error selecting workspace:', err);
            throw err;
        }
    };

    // Force refresh user & workspace data from the backend
    const refreshAuth = async () => {
        try {
            const { data: userData } = await api.get('/auth/me');
            const storedUser = localStorage.getItem('userInfo');
            const parsedUser = storedUser ? JSON.parse(storedUser) : {};
            const mergedUser = { ...parsedUser, ...userData };
            setUser(mergedUser);
            localStorage.setItem('userInfo', JSON.stringify(mergedUser));

            if (userData.currentWorkspace) {
                localStorage.setItem('currentWorkspaceId', userData.currentWorkspace);
                const { data: wsData } = await api.get('/workspaces/current');
                setWorkspace(wsData);
            } else {
                setWorkspace(null);
                localStorage.removeItem('currentWorkspaceId');
            }
        } catch (err) {
            console.error('Error refreshing auth data:', err);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            workspace, 
            loading, 
            login, 
            register, 
            logout, 
            selectWorkspace, 
            refreshAuth 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
