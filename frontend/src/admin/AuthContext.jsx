import { createContext, useContext, useState } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
    const [admin, setAdmin] = useState(() => {
        try { return JSON.parse(localStorage.getItem('admin_user') || 'null'); } catch { return null; }
    });

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        setToken(data.token);
        setAdmin(data.admin);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setToken('');
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ token, admin, login, logout, isAuthed: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAdminAuth = () => useContext(AuthContext);
