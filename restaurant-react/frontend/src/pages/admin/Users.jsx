import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
    FaUsers, FaSearch, FaUserShield, FaUserEdit,
    FaUserCheck, FaUserTimes, FaExclamationCircle,
    FaEnvelope, FaMapMarkerAlt, FaCalendarAlt
} from 'react-icons/fa';
import { TableRowSkeleton } from '../../components/Skeleton';

const Users = () => {
    const { success, error, info } = useNotification();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [page, searchQuery]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getUsers({
                search: searchQuery,
                page,
                limit: 10
            });
            setUsers(res.data.users);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            error('Erreur lors du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        try {
            await adminAPI.updateUserStatus(user.id, newStatus);
            setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
            if (selectedUser?.id === user.id) setSelectedUser({ ...selectedUser, status: newStatus });

            if (newStatus === 'inactive') {
                info(`Le compte de ${user.nom} a été désactivé.`);
            } else {
                success(`Le compte de ${user.nom} a été réactivé.`);
            }
        } catch (err) {
            error('Erreur lors de la mise à jour du statut');
        }
    };

    const handleToggleRole = async (user) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        try {
            await adminAPI.updateUserRole(user.id, newRole);
            setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
            if (selectedUser?.id === user.id) setSelectedUser({ ...selectedUser, role: newRole });
            success(`Rôle de ${user.nom} mis à jour en ${newRole}.`);
        } catch (err) {
            error('Erreur lors de la mise à jour du rôle');
        }
    };

    const openUserDetails = async (userId) => {
        try {
            setFetchingDetails(true);
            setShowModal(true); // Show modal immediately with loading state
            const res = await adminAPI.getUserDetails(userId);
            setSelectedUser(res.data);
        } catch (err) {
            error('Erreur lors du chargement des détails');
            setShowModal(false);
        } finally {
            setFetchingDetails(false);
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                        <FaUsers className="mr-3 text-primary" />
                        Gestion des Utilisateurs
                    </h1>
                    <p className="text-gray-500 mt-1">Gérez les rôles et les accès de vos clients</p>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        id="userSearch"
                        name="userSearch"
                        placeholder="Rechercher nom, email..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        className="input-field pl-10 pr-4 py-2 w-full md:w-64"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-700">Utilisateur</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Rôle</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Statut</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Inscription</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                [...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        Aucun utilisateur trouvé
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                                                    {user.nom?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-800">{user.nom}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {user.status === 'active' ? 'Actif' : 'Banni'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {new Date(user.date_inscription).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => openUserDetails(user.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Détails"
                                                >
                                                    <FaUserEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleRole(user)}
                                                    className={`p-2 rounded-lg transition-colors ${user.role === 'admin' ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-400 hover:bg-gray-100'
                                                        }`}
                                                    title={user.role === 'admin' ? "Rétrograder en utilisateur" : "Promouvoir admin"}
                                                    disabled={user.email === 'admin@example.com'}
                                                >
                                                    <FaUserShield />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`p-2 rounded-lg transition-colors ${user.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={user.status === 'active' ? "Bannir" : "Réactiver"}
                                                    disabled={user.email === 'admin@example.com'}
                                                >
                                                    {user.status === 'active' ? <FaUserTimes /> : <FaUserCheck />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                        <span className="text-sm text-gray-600">Page {page} sur {totalPages}</span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                            >
                                Précédent
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white relative shrink-0">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white"
                            >
                                <FaUserTimes size={24} />
                            </button>
                            <div className="flex items-center">
                                <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold mr-6 border-2 border-white/50">
                                    {selectedUser?.nom?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedUser.nom}</h2>
                                    <div className="flex items-center text-white/80 mt-1">
                                        <FaEnvelope className="mr-2 text-sm" />
                                        {selectedUser.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            {fetchingDetails ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                    <p className="text-gray-500 font-medium">Récupération des données...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center text-gray-700">
                                                <FaMapMarkerAlt className="w-10 text-primary" />
                                                <div>
                                                    <div className="text-sm text-gray-500 font-semibold uppercase">Adresse</div>
                                                    <div>{selectedUser.adresse || 'N/A'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-gray-700">
                                                <FaCalendarAlt className="w-10 text-primary" />
                                                <div>
                                                    <div className="text-sm text-gray-500 font-semibold uppercase">Membre depuis</div>
                                                    <div>{selectedUser.date_inscription ? new Date(selectedUser.date_inscription).toLocaleDateString('fr-FR', {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    }) : 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="font-bold text-gray-700">Statut du compte</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedUser.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {selectedUser.status === 'active' ? 'Actif' : 'Banni'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-gray-700">Niveau d'accès</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {selectedUser.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold mb-4 flex items-center">
                                            <FaCalendarAlt className="mr-2 text-primary" />
                                            Commandes Récentes
                                        </h3>
                                        {selectedUser.orders && selectedUser.orders.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedUser.orders.map(order => (
                                                    <div key={order.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                                                        <div>
                                                            <div className="font-semibold text-gray-800">#ORD-{order.id}</div>
                                                            <div className="text-xs text-gray-500">{new Date(order.date_commande).toLocaleString()}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-primary">{(order.total || 0).toLocaleString()} DA</div>
                                                            <div className="text-xs uppercase font-bold text-gray-400">{order.statut}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-gray-50 rounded-xl text-gray-500 italic">
                                                Aucune commande passée
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            disabled={selectedUser.email === 'admin@example.com'}
                                            onClick={() => handleToggleStatus(selectedUser)}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${selectedUser.status === 'active'
                                                ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                                } disabled:opacity-50`}
                                        >
                                            {selectedUser.status === 'active' ? 'Désactiver le compte' : 'Réactiver le compte'}
                                        </button>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold transition-all"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
