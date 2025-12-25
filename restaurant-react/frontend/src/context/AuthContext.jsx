import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNotification } from './NotificationContext';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { success, error, info } = useNotification();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await authAPI.getCurrentUser();
                setUser(response.data);
            }
        } catch (err) {
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            success(response.data.message);
            return true;
        } catch (err) {
            error(err.response?.data?.message || 'Erreur de connexion');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            await authAPI.register(userData);
            success('Compte créé avec succès! Vous pouvez maintenant vous connecter.');
            return true;
        } catch (err) {
            error(err.response?.data?.message || 'Erreur lors de la création du compte');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        info('Vous êtes déconnecté!');
    };

    const value = useMemo(() => ({
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
    }), [user, loading, login, register, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
