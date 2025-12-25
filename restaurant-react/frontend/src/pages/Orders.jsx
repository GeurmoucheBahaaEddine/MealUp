
import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';
import { FaBox, FaClock, FaCheck, FaTimes, FaCalendarAlt, FaMoneyBillWave, FaReceipt } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import LoadingSpinner from '../components/LoadingSpinner';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useNotification();
    const socket = useSocket();

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('orderStatusUpdated', ({ orderId, status }) => {
            setOrders(prevOrders => prevOrders.map(order => {
                if (order.id === orderId) {
                    success(`Commande #${orderId}: Statut mis à jour à "${status}"`);
                    return { ...order, statut: status };
                }
                return order;
            }));
        });

        return () => {
            socket.off('orderStatusUpdated');
        };
    }, [socket, success]);

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getMyOrders();
            setOrders(response.data);
        } catch (err) {
            error('Erreur lors du chargement des commandes');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'en attente': 'badge badge-warning',
            'confirmé': 'badge badge-info',
            'livré': 'badge badge-success',
        };
        return badges[status] || 'badge';
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8">
                <FaReceipt className="inline mr-3" />
                Mes Commandes
            </h1>

            {orders.length === 0 ? (
                <div className="card p-12 text-center">
                    <FaReceipt className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-600 mb-4">Aucune commande</h2>
                    <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande</p>
                    <a href="/menu" className="btn-primary inline-block">
                        Commander Maintenant
                    </a>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="card p-6 border-l-4 border-primary">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Commande #{order.id}</h3>
                                    <p className="text-gray-600 flex items-center">
                                        <FaClock className="mr-2" />
                                        {new Date(order.date_commande).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={getStatusBadge(order.statut)}>
                                        {order.statut}
                                    </span>
                                    <p className="text-3xl font-bold text-primary mt-2">
                                        {(order.total || 0).toLocaleString()} DA
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Articles commandés:</h4>
                                <div className="space-y-2">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-gray-700">
                                            <div className="flex flex-col">
                                                <span className="font-bold">
                                                    {item.quantite}x {item.plat_nom}
                                                </span>
                                                {/* Display removals */}
                                                {item.customization && item.customization.removed && item.customization.removed.length > 0 && (
                                                    <span className="text-xs text-red-500 italic mt-1 font-medium bg-red-50/50 px-2 py-0.5 rounded-lg border border-red-100 self-start">
                                                        Sans: {item.customization.removed.join(', ')}
                                                    </span>
                                                )}
                                                {/* Display extras */}
                                                {item.customization && item.customization.added && item.customization.added.length > 0 && (
                                                    <span className="text-xs text-green-600 italic mt-1 font-medium bg-green-50/50 px-2 py-0.5 rounded-lg border border-green-100 self-start">
                                                        Avec: {item.customization.added.map(e => e.nom).join(', ')}
                                                    </span>
                                                )}
                                                {/* Fallback for old data or single array */}
                                                {item.customization && Array.isArray(item.customization) && item.customization.length > 0 && (
                                                    <span className="text-xs text-red-500 italic mt-1 font-medium bg-red-50/50 px-2 py-0.5 rounded-lg border border-red-100 self-start">
                                                        Sans: {item.customization.join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="font-semibold">
                                                {((item.plat_prix || 0) * item.quantite).toLocaleString()} DA
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
