import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        // Initialize socket connection
        const socketInstance = io(API_BASE_URL.replace('/api', ''), {
            transports: ['websocket'],
            autoConnect: true
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            if (socketInstance) socketInstance.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket && user) {
            // Join user-specific room for targeted updates
            socket.emit('joinRoom', {
                userId: user.id,
                userType: user.type
            });

            console.log(`Joined room as ${user.type}_${user.id}`);
        }
    }, [socket, user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
