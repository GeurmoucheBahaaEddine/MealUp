import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, ingredientsAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { FaShoppingCart, FaDollarSign, FaUsers, FaUtensils, FaArrowUp, FaArrowDown, FaShoppingBag, FaMoneyBillWave, FaExclamationTriangle } from 'react-icons/fa';
import StatCard from '../../components/admin/StatCard';
import { StatSkeleton, TableRowSkeleton } from '../../components/Skeleton';
import { useSocket } from '../../context/SocketContext';
import { format } from 'date-fns';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [topDishes, setTopDishes] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7days');
    const { success, error } = useNotification();
    const socket = useSocket();

    useEffect(() => {
        loadDashboardData();
    }, [period]);

    useEffect(() => {
        if (!socket) return;

        socket.on('newOrder', (newOrder) => {
            success(`Nouvelle commande reçue: #${newOrder.id} `);
            setRecentOrders(prev => [newOrder, ...prev].slice(0, 5));
            setStats(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    totalOrders: prev.totalOrders + 1,
                    todayOrders: prev.todayOrders + 1,
                    totalRevenue: prev.totalRevenue + newOrder.total,
                    todayRevenue: prev.todayRevenue + newOrder.total
                };
            });
        });

        return () => {
            socket.off('newOrder');
        };
    }, [socket, success]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, salesRes, topDishesRes, recentOrdersRes, lowStockRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getSalesAnalytics(period),
                adminAPI.getTopDishes(),
                adminAPI.getRecentOrders(5),
                ingredientsAPI.getLowStock()
            ]);

            setStats(statsRes.data);
            setSalesData(salesRes.data);
            setTopDishes(topDishesRes.data);
            setRecentOrders(recentOrdersRes.data);
            setLowStock(lowStockRes.data);
        } catch (err) {
            error('Erreur lors du chargement du tableau de bord');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return (value || 0).toLocaleString() + ' DA';
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Tableau de Bord</h1>
                <p className="text-gray-600">Vue d'overview de votre restaurant</p>
            </div>

            {/* Statistics Cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Revenu"
                        value={formatCurrency(stats?.totalRevenue)}
                        change={`+ ${formatCurrency(stats?.todayRevenue)} aujourd'hui`}
                        icon={FaMoneyBillWave}
                        trend="up"
                        color="success"
                    />
                    <StatCard
                        title="Commandes"
                        value={stats?.totalOrders || 0}
                        change={`+${stats?.todayOrders} aujourd'hui`}
                        icon={FaShoppingBag}
                        color="primary"
                    />
                    <StatCard
                        title="Clients"
                        value={stats?.totalUsers || 0}
                        change="Utilisateurs inscrits"
                        icon={FaUsers}
                        color="info"
                    />
                    <StatCard
                        title="Plats"
                        value={stats?.totalDishes || 0}
                        change="Au menu"
                        icon={FaUtensils}
                        color="warning"
                    />
                </div >
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Sales Chart */}
                <div className="bg-white rounded-2xl shadow-premium p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Ventes</h2>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="px-4 py-2 border-2 border-gray-100 rounded-xl focus:border-primary focus:outline-none bg-white text-sm"
                        >
                            <option value="7days">7 derniers jours</option>
                            <option value="30days">30 derniers jours</option>
                            <option value="12months">12 derniers mois</option>
                        </select>
                    </div>
                    <div className="h-[300px] min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value, name) => [
                                        name === 'revenue' ? formatCurrency(value) : value,
                                        name === 'revenue' ? 'Revenu' : 'Commandes'
                                    ]}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#e65100" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="revenue" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Dishes Chart */}
                <div className="bg-white rounded-2xl shadow-premium p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Plats Populaires</h2>
                    <div className="h-[300px] min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={(topDishes || []).slice(0, 5)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="plat_nom" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`${value} vendus`, 'Quantité']}
                                />
                                <Bar dataKey="total_sold" fill="#e65100" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Low Stock Alerts Widget */}
            {!loading && lowStock.length > 0 && (
                <div className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-red-700 font-bold">
                            <FaExclamationTriangle className="mr-3 text-xl animate-pulse" />
                            <h2 className="text-xl">Alertes Stock Faible</h2>
                        </div>
                        <Link to="/admin/dishes?openStock=true" className="text-red-600 font-bold hover:underline text-sm">Gérer le stock</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {lowStock.slice(0, 4).map(ing => (
                            <div key={ing.id} className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-gray-800">{ing.nom}</div>
                                    <div className="text-xs text-red-500 font-black uppercase tracking-tighter">
                                        Reste: {ing.stock_actuel} {ing.unite}
                                    </div>
                                </div>
                                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Orders & Top Dishes Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800">Commandes Récentes</h3>
                        <Link to="/admin/orders" className="text-primary hover:underline text-sm font-medium">Tout voir</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={3} />)
                                ) : (
                                    recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {order.client?.nom || 'Client'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {formatCurrency(order.total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${order.statut === 'livré' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {order.statut}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Dishes Table */}
                <div className="bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="text-xl font-bold text-gray-800">Top 5 Plats</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Plat</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Vendus</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Revenu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={3} />)
                                ) : (
                                    topDishes.slice(0, 5).map((dish, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 flex items-center">
                                                <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs mr-3">
                                                    {index + 1}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">{dish.plat_nom}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                                {dish.total_sold}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-primary">
                                                {formatCurrency(parseFloat(dish.total_revenue))}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
