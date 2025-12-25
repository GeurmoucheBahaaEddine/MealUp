import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { FaChartPie, FaClock, FaUsers, FaDownload, FaFilePdf } from 'react-icons/fa';
import { generateSalesSummary } from '../../utils/pdfGenerator';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#e65100', '#fb8c00', '#ffb74d', '#ffe0b2', '#bf360c', '#d84315'];

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [categoryData, setCategoryData] = useState([]);
    const [hourlyData, setHourlyData] = useState([]);
    const [customerData, setCustomerData] = useState([]);
    const { error, info } = useNotification();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [catRes, hourlyRes, custRes] = await Promise.all([
                adminAPI.getCategoryAnalytics(),
                adminAPI.getHourlyAnalytics(),
                adminAPI.getCustomerAnalytics()
            ]);
            setCategoryData(catRes.data);
            setHourlyData(hourlyRes.data);
            setCustomerData(custRes.data);
        } catch (err) {
            error('Erreur lors du chargement des rapports');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (data, title) => {
        generateSalesSummary(data, title);
        info(`Exportation du rapport "${title}" en cours...`);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-8">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 mb-2 font-display">Analyses Avancées</h1>
                    <p className="text-gray-500 font-medium italic">Plongez dans les données de votre restaurant</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Category Performance */}
                <div className="bg-white rounded-3xl shadow-premium p-8 border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <FaChartPie size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Ventes par Catégorie</h2>
                        </div>
                        <button
                            onClick={() => handleExport(categoryData, 'Ventes par Catégorie')}
                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                            title="Exporter en PDF"
                        >
                            <FaFilePdf size={20} />
                        </button>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="revenue"
                                    nameKey="category"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`${value.toLocaleString()} DA`, 'Revenu']}
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Hourly Trends */}
                <div className="bg-white rounded-3xl shadow-premium p-8 border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                                <FaClock size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Affluence Horaire</h2>
                        </div>
                        <button
                            onClick={() => handleExport(hourlyData, 'Affluence Horaire')}
                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                        >
                            <FaFilePdf size={20} />
                        </button>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="hour"
                                    tickFormatter={(hour) => `${hour}h`}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    formatter={(value, name) => [value, name === 'count' ? 'Commandes' : 'Revenu']}
                                    labelFormatter={(hour) => `Heure: ${hour}h`}
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="count" fill="#fb8c00" radius={[6, 6, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-4 italic font-medium">
                        Identifiez vos périodes de pointe pour optimiser votre personnel.
                    </p>
                </div>
            </div>

            {/* Customers Leaderboard */}
            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                            <FaUsers size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Top 5 Clients Fidèles</h2>
                    </div>
                    <button
                        onClick={() => handleExport(customerData, 'Classement Clients')}
                        className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-orange-200 transition-all hover:scale-105 active:scale-95"
                    >
                        <FaDownload /> Télécharger
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Rang</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                                <th className="px-8 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Commandes</th>
                                <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Dépensé</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {customerData.map((cust, index) => (
                                <tr key={cust.user_id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                                index === 1 ? 'bg-gray-200 text-gray-700' :
                                                    index === 2 ? 'bg-orange-200 text-orange-800' :
                                                        'bg-gray-100 text-gray-400'
                                            }`}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div>
                                            <div className="font-bold text-gray-900">{cust.client.nom}</div>
                                            <div className="text-xs text-gray-500">{cust.client.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600">
                                            {cust.order_count} plats
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-primary">
                                        {cust.total_spent?.toLocaleString()} DA
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
