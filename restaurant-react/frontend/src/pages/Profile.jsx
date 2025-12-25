import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, ordersAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaSignOutAlt, FaEdit, FaLock, FaSave, FaTimes, FaKey, FaChartPie, FaShoppingCart, FaHistory, FaUtensils, FaCreditCard, FaCalendarAlt, FaCalendarWeek } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
    const { user, logout, setUser } = useAuth();
    const { success, error } = useNotification();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);
    const [stats, setStats] = useState(null);

    const [formData, setFormData] = useState({
        nom: user?.nom || '',
        adresse: user?.adresse || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                nom: user.nom,
                adresse: user.adresse,
            });
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const response = await ordersAPI.getMyStats();
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authAPI.updateProfile(formData);
            setUser(response.data.user);
            success('Profil mis à jour!');
            setIsEditing(false);
        } catch (err) {
            error(err.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return error('Les nouveaux mots de passe ne correspondent pas');
        }
        if (passwordData.newPassword.length < 6) {
            return error('Le nouveau mot de passe doit faire au moins 6 caractères');
        }

        setLoading(true);
        try {
            await authAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            success('Mot de passe mis à jour!');
            setIsChangingPassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            error(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-primary text-white p-10 rounded-3xl text-center relative overflow-hidden shadow-2xl">
                        <div className="hero-pattern absolute inset-0 opacity-20"></div>
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-black text-white border-4 border-white/30 shadow-inner">
                                {user?.nom?.charAt(0).toUpperCase()}
                            </div>
                            <h1 className="text-2xl font-black mb-1 tracking-tight">{user?.nom}</h1>
                            <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Client V.I.P</p>
                        </div>
                    </div>

                    <div className="card p-6 shadow-xl border-none">
                        {isEditing ? (
                            <form onSubmit={handleProfileUpdate} className="space-y-4 animate-fadeIn">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <FaEdit className="mr-3 text-primary" /> Modifier mon profil
                                </h2>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nom complet</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            id="profileNom"
                                            name="profileNom"
                                            className="input-field pl-12 py-2.5 text-sm"
                                            value={formData.nom}
                                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Adresse</label>
                                    <div className="relative">
                                        <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            id="profileAdresse"
                                            name="profileAdresse"
                                            className="input-field pl-12 py-2.5 text-sm"
                                            value={formData.adresse}
                                            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button type="submit" disabled={loading} className="flex-1 btn-primary text-xs py-2.5 flex items-center justify-center">
                                        <FaSave className="mr-2" /> Enregistrer
                                    </button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-700 text-xs py-2.5 rounded-xl hover:bg-gray-200 transition-all font-semibold flex items-center justify-center">
                                        <FaTimes className="mr-2" /> Annuler
                                    </button>
                                </div>
                            </form>
                        ) : isChangingPassword ? (
                            <form onSubmit={handlePasswordChange} className="space-y-4 animate-fadeIn">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <FaKey className="mr-3 text-primary" /> Nouveau mot de passe
                                </h2>
                                <div>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        placeholder="Mot de passe actuel"
                                        className="input-field text-sm"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        placeholder="Nouveau mot de passe"
                                        className="input-field text-sm"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" disabled={loading} className="flex-1 btn-primary text-xs py-2.5 flex items-center justify-center">
                                        <FaSave className="mr-2" /> Mettre à jour
                                    </button>
                                    <button type="button" onClick={() => setIsChangingPassword(false)} className="flex-1 bg-gray-100 text-gray-700 text-xs py-2.5 rounded-xl hover:bg-gray-200 transition-all font-semibold flex items-center justify-center">
                                        <FaTimes className="mr-2" /> Annuler
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-5">
                                <div className="flex items-center group">
                                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform mr-4 shadow-sm">
                                        <FaEnvelope />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                                        <p className="text-sm font-bold text-gray-700 truncate">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center group">
                                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform mr-4 shadow-sm">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adresse</p>
                                        <p className="text-sm font-bold text-gray-700">{user?.adresse}</p>
                                    </div>
                                    <button onClick={() => setIsEditing(true)} className="text-gray-300 hover:text-primary transition-colors">
                                        <FaEdit />
                                    </button>
                                </div>

                                <div className="pt-4 space-y-3">
                                    <button
                                        onClick={() => setIsChangingPassword(true)}
                                        className="w-full text-xs font-bold text-primary py-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all flex items-center justify-center"
                                    >
                                        <FaLock className="mr-2" /> Sécurité du compte
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-xs font-bold text-red-500 py-3 rounded-xl bg-red-50 hover:bg-red-100 transition-all flex items-center justify-center"
                                    >
                                        <FaSignOutAlt className="mr-2" /> Se déconnecter
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Dashboards */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card p-6 bg-white shadow-lg border-none flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                <FaHistory />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</p>
                                {statsLoading ? <div className="h-5 w-12 bg-gray-100 animate-pulse mt-1 rounded"></div> : <p className="text-xl font-black text-gray-800">{stats?.totalOrders}</p>}
                            </div>
                        </div>

                        <div className="card p-6 bg-white shadow-lg border-none flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                                <FaChartPie />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Status</p>
                                {statsLoading ? <div className="h-5 w-20 bg-gray-100 animate-pulse mt-1 rounded"></div> : <p className="text-sm font-bold text-green-600 uppercase tracking-tighter">{stats?.lastOrderStatus}</p>}
                            </div>
                        </div>

                        <div className="card p-6 bg-white shadow-lg border-none flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                <FaShoppingCart />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items in Cart</p>
                                {statsLoading ? <div className="h-5 w-10 bg-gray-100 animate-pulse mt-1 rounded"></div> : <p className="text-xl font-black text-gray-800">{stats?.cartItemCount || 0}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Spending Dashboard */}
                    <div className="card p-8 shadow-xl border-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-primary/5">
                            <FaCreditCard size={120} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center tracking-tight">
                            <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mr-4">
                                <FaCreditCard />
                            </span>
                            Mes Dépenses
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                            <div className="space-y-2">
                                <p className="flex items-center text-xs font-black text-gray-400 uppercase tracking-widest">
                                    <FaHistory className="mr-2 text-primary" /> À vie
                                </p>
                                {statsLoading ? (
                                    <div className="h-10 w-full bg-gray-100 animate-pulse rounded-xl"></div>
                                ) : (
                                    <p className="text-3xl font-black text-gray-800">
                                        {(stats?.totalSpentLifetime || 0).toLocaleString()} <span className="text-sm font-bold text-gray-300 uppercase">da</span>
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 border-l-2 border-dashed border-gray-100 pl-8">
                                <p className="flex items-center text-xs font-black text-gray-400 uppercase tracking-widest">
                                    <FaCalendarAlt className="mr-2 text-primary" /> Ce mois
                                </p>
                                {statsLoading ? (
                                    <div className="h-10 w-full bg-gray-100 animate-pulse rounded-xl"></div>
                                ) : (
                                    <p className="text-3xl font-black text-gray-800">
                                        {(stats?.totalSpentMonth || 0).toLocaleString()} <span className="text-sm font-bold text-gray-300 uppercase">da</span>
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 border-l-2 border-dashed border-gray-100 pl-8">
                                <p className="flex items-center text-xs font-black text-gray-400 uppercase tracking-widest">
                                    <FaCalendarWeek className="mr-2 text-primary" /> Cette semaine
                                </p>
                                {statsLoading ? (
                                    <div className="h-10 w-full bg-gray-100 animate-pulse rounded-xl"></div>
                                ) : (
                                    <p className="text-3xl font-black text-gray-800">
                                        {(stats?.totalSpentWeek || 0).toLocaleString()} <span className="text-sm font-bold text-gray-300 uppercase">da</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Loyalty Progress Bar (Visual only) */}
                        <div className="mt-12 bg-gray-50 p-6 rounded-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm font-black text-gray-700">Progression vers Statut Gourmet Excellence</p>
                                <span className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full uppercase">GOLD</span>
                            </div>
                            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                                <div className="bg-gradient-primary h-full w-[85%] relative">
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 italic font-medium">85% des objectifs atteints cette année ! Bravo {user?.nom} !</p>
                        </div>
                    </div>

                    {/* Most Ordered Dish Card */}
                    <div className="card p-0 shadow-xl border-none overflow-hidden bg-gradient-to-br from-orange-500 to-primary text-white h-[200px] flex group cursor-pointer hover:shadow-2xl transition-all duration-500">
                        <div className="flex-grow p-10 flex flex-col justify-center relative z-10">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4 w-fit">
                                Votre plat fétiche
                            </span>
                            {statsLoading ? (
                                <div className="h-10 w-48 bg-white/10 animate-pulse rounded-xl"></div>
                            ) : stats?.mostOrderedDish ? (
                                <>
                                    <h3 className="text-4xl font-black tracking-tighter mb-2 group-hover:scale-105 transition-transform duration-500">{stats.mostOrderedDish.nom}</h3>
                                    <p className="text-sm font-bold opacity-80 italic">Commandé {stats.mostOrderedDish.count} fois par vous !</p>
                                </>
                            ) : (
                                <h3 className="text-2xl font-black">Prêt pour votre premier festin ?</h3>
                            )}
                        </div>
                        <div className="w-48 bg-white/10 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
                            <FaUtensils size={100} className="text-white/20 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700" />
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
