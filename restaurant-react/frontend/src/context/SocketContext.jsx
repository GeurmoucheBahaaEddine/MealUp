import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        // Use the API URL but remove the /api suffix for the socket connection
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const socketUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

        const newSocket = io(socketUrl);
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket && user) {
            socket.emit('joinRoom', user.id);
        }
    }, [socket, user]);

    const contextValue = useMemo(() => socket, [socket]);

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};
