import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useSocket } from '../../context/SocketContext';
import { FaSearch, FaFilter, FaClock, FaCheckCircle, FaTimesCircle, FaTruck, FaEye, FaCalendarAlt, FaHistory, FaFilePdf } from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateOrderInvoice } from '../../utils/pdfGenerator';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [now, setNow] = useState(new Date());
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const { success, error } = useNotification();
    const socket = useSocket();

    // Force re-render relative times every minute
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [page, filterStatus, searchTerm]);

    useEffect(() => {
        if (!socket) return;

        socket.on('newOrder', (newOrder) => {
            success(`Nouvelle commande reçue: #${newOrder.id}`);
            if (page === 1 && (filterStatus === 'all' || filterStatus === 'en attente')) {
                setOrders(prev => [newOrder, ...prev].slice(0, 20));
            }
        });

        socket.on('orderStatusUpdated', ({ orderId, status }) => {
            setOrders(prevOrders => prevOrders.map(order =>
                order.id === orderId ? { ...order, statut: status } : order
            ));
        });

        return () => {
            socket.off('newOrder');
            socket.off('orderStatusUpdated');
        };
    }, [socket, page, filterStatus]);

    const fetchOrders = async () => {
        try {
            const response = await adminAPI.getAllOrders({
                page,
                status: filterStatus,
                search: searchTerm
            });
            setOrders(response.data.orders);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            error('Erreur lors du chargement des commandes');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await adminAPI.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(o => o.id === orderId ? { ...o, statut: newStatus } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, statut: newStatus });
            }
            success(`Commande #${orderId} mise à jour`);
        } catch (err) {
            error('Erreur lors de la mise à jour');
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        const badges = {
            'en attente': 'bg-yellow-100 text-yellow-800 ring-yellow-500/20',
            'confirmé': 'bg-blue-100 text-blue-800 ring-blue-500/20',
            'en préparation': 'bg-purple-100 text-purple-800 ring-purple-500/20',
            'en livraison': 'bg-orange-100 text-orange-800 ring-orange-500/20',
            'livré': 'bg-green-100 text-green-800 ring-green-500/20',
            'annulé': 'bg-red-100 text-red-800 ring-red-500/20',
        };
        return `px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ${badges[status] || 'bg-gray-100 text-gray-800 ring-gray-500/20'}`;
    };

    if (loading) return (
        <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
            <LoadingSpinner />
            <p className="mt-4 text-gray-500 font-medium animate-pulse">Chargement des commandes...</p>
        </div>
    );

    return (
        <div className="p-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Commandes Client</h1>
                    <p className="text-gray-600">Gérez et suivez le statut des commandes en temps réel</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center min-w-[120px]">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total</p>
                        <p className="text-2xl font-black text-primary">{orders.length}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-premium border border-gray-50 p-6 mb-8 flex flex-col lg:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                    <input
                        type="text"
                        id="orderSearch"
                        name="orderSearch"
                        placeholder="Chercher ID, Nom client ou Email..."
                        className="input-field pl-12 py-3 bg-gray-50 border-none focus:ring-2 ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 flex-1 lg:flex-none">
                        <FaFilter className="text-primary" />
                        <select
                            id="orderStatusFilter"
                            name="orderStatusFilter"
                            className="bg-transparent font-bold text-gray-700 focus:outline-none cursor-pointer"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="en attente">En attente</option>
                            <option value="confirmé">Confirmé</option>
                            <option value="en préparation">En préparation</option>
                            <option value="en livraison">En livraison</option>
                            <option value="livré">Livré</option>
                            <option value="annulé">Annulé</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-2xl shadow-premium border border-gray-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Commande</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Temps / Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-black text-gray-900">#{order.id}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">REF-{order.id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{order.client?.nom || 'Inconnu'}</div>
                                            <div className="text-gray-500 text-xs font-medium">{order.client?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-primary font-bold text-sm mb-1">
                                                <FaHistory className="mr-2 text-xs" />
                                                {formatDistanceToNow(new Date(order.date_commande), { addSuffix: true, locale: fr })}
                                            </div>
                                            <div className="text-gray-400 text-xs flex items-center">
                                                <FaCalendarAlt className="mr-2 text-[10px]" />
                                                {format(new Date(order.date_commande), 'dd MMM yyyy, HH:mm')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-lg font-black text-gray-900">{(order.total || 0).toLocaleString()} <span className="text-xs">DA</span></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={getStatusBadge(order.statut)}>{order.statut}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                {order.statut === 'en attente' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order.id, 'confirmé')}
                                                            className="p-2.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm"
                                                            title="Confirmer"
                                                        >
                                                            <FaCheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order.id, 'annulé')}
                                                            className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                                                            title="Annuler"
                                                        >
                                                            <FaTimesCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                {['confirmé', 'en préparation'].includes(order.statut) && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order.id, order.statut === 'confirmé' ? 'en préparation' : 'en livraison')}
                                                        className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all font-bold text-xs"
                                                    >
                                                        {order.statut === 'confirmé' ? 'Préparer' : 'Livrer'}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleViewOrder(order)}
                                                    className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary rounded-xl transition-all"
                                                    title="Détails"
                                                >
                                                    <FaEye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => generateOrderInvoice(order)}
                                                    className="p-2.5 bg-orange-50 text-orange-600 hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm"
                                                    title="Télécharger Facture"
                                                >
                                                    <FaFilePdf size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic">
                                        Aucune commande trouvée
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="text-sm font-medium text-gray-500 hover:text-primary disabled:opacity-50"
                    >
                        Précédent
                    </button>
                    <span className="text-sm text-gray-600">Page {page} sur {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="text-sm font-medium text-gray-500 hover:text-primary disabled:opacity-50"
                    >
                        Suivant
                    </button>
                </div>
            </div>

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slideUp">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Commande #{selectedOrder.id}</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    {format(new Date(selectedOrder.date_commande), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all shadow-sm"
                            >
                                <FaTimesCircle size={24} />
                            </button>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            {/* Client Info */}
                            <div className="mb-8 bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Informations Client</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Nom</p>
                                        <p className="font-bold text-gray-800">{selectedOrder.client?.nom}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Email</p>
                                        <p className="font-bold text-gray-800">{selectedOrder.client?.email}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Adresse de livraison</p>
                                        <p className="font-bold text-gray-800 leading-relaxed italic underline decoration-primary/20">{selectedOrder.adresse_livraison || selectedOrder.client?.adresse}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-8">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Articles commandés</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/20 transition-all group">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm font-black text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                    {item.quantite}x
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 group-hover:text-primary transition-colors">{item.plat_nom}</p>
                                                    <p className="text-xs text-gray-400 font-medium">{(item.plat_prix || 0).toLocaleString()} DA / unité</p>
                                                    {/* Display removals */}
                                                    {item.customization && item.customization.removed && item.customization.removed.length > 0 && (
                                                        <p className="text-[10px] text-red-500 font-black uppercase mt-1 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 italic">
                                                            Sans: {item.customization.removed.join(', ')}
                                                        </p>
                                                    )}
                                                    {/* Display extras */}
                                                    {item.customization && item.customization.added && item.customization.added.length > 0 && (
                                                        <p className="text-[10px] text-green-600 font-black uppercase mt-1 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 italic">
                                                            Plus: {item.customization.added.map(e => e.nom).join(', ')}
                                                        </p>
                                                    )}
                                                    {/* Fallback for old data or single array */}
                                                    {item.customization && Array.isArray(item.customization) && item.customization.length > 0 && (
                                                        <p className="text-[10px] text-red-500 font-black uppercase mt-1 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 italic">
                                                            Sans: {item.customization.join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="font-black text-gray-900 group-hover:text-primary transition-colors">{(item.plat_prix * item.quantite).toLocaleString()} <span className="text-[10px]">DA</span></p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-gray-500 font-bold">Sous-total</p>
                                    <p className="font-bold text-gray-800">{(selectedOrder.total || 0).toLocaleString()} DA</p>
                                </div>
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-gray-500 font-bold text-lg">Statut actuel</p>
                                    <span className={getStatusBadge(selectedOrder.statut)}>{selectedOrder.statut}</span>
                                </div>
                                <div className="flex justify-between items-center bg-primary text-white p-6 rounded-2xl shadow-xl">
                                    <p className="text-xl font-black uppercase tracking-widest">Total</p>
                                    <p className="text-4xl font-black">{(selectedOrder.total || 0).toLocaleString()} <span className="text-sm">DA</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 transition-all rounded-xl"
                            >
                                Fermer
                            </button>
                            {selectedOrder.statut === 'en attente' && (
                                <button
                                    onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmé')}
                                    className="px-8 py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 active:scale-95 transition-all"
                                >
                                    Confirmer la commande
                                </button>
                            )}
                            <button
                                onClick={() => generateOrderInvoice(selectedOrder)}
                                className="px-6 py-3 bg-primary text-white font-black rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-600/20 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <FaFilePdf /> Facture PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
