import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [history, setHistory] = useState([]);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, []);

    const addNotification = useCallback((type, message, duration = 3000) => {
        const id = uuidv4();
        const newNotification = { id, type, message, timestamp: new Date() };

        setNotifications((prev) => [...prev, newNotification]);
        setHistory((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50 in history

        if (duration) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    }, [removeNotification]);

    const success = useCallback((message, duration) => addNotification('success', message, duration), [addNotification]);
    const error = useCallback((message, duration) => addNotification('error', message, duration), [addNotification]);
    const info = useCallback((message, duration) => addNotification('info', message, duration), [addNotification]);
    const warning = useCallback((message, duration) => addNotification('warning', message, duration), [addNotification]);

    const contextValue = useMemo(() => ({
        notifications,
        history,
        addNotification,
        removeNotification,
        success,
        error,
        info,
        warning,
        clearHistory: () => setHistory([])
    }), [notifications, history, addNotification, removeNotification, success, error, info, warning]);
    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
        </NotificationContext.Provider>
    );
};

// Internal component to display notifications
const NotificationContainer = ({ notifications, removeNotification }) => {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClose={() => removeNotification(notification.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

const NotificationItem = ({ notification, onClose }) => {
    const icons = {
        success: <FaCheckCircle className="text-green-500 text-xl" />,
        error: <FaExclamationCircle className="text-red-500 text-xl" />,
        info: <FaInfoCircle className="text-blue-500 text-xl" />,
        warning: <FaExclamationTriangle className="text-yellow-500 text-xl" />,
    };

    const bgColors = {
        success: 'bg-white border-l-4 border-green-500',
        error: 'bg-white border-l-4 border-red-500',
        info: 'bg-white border-l-4 border-blue-500',
        warning: 'bg-white border-l-4 border-yellow-500',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            layout
            className={`pointer-events-auto w-80 shadow-lg rounded-lg p-4 flex items-start space-x-3 ${bgColors[notification.type]}`}
        >
            <div className="flex-shrink-0 mt-0.5">
                {icons[notification.type]}
            </div>
            <div className="flex-1">
                <p className="text-gray-800 font-medium text-sm leading-snug">
                    {notification.message}
                </p>
            </div>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
            >
                <FaTimes />
            </button>
        </motion.div>
    );
};
