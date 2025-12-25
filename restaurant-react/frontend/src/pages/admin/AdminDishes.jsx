import { useState, useEffect } from 'react';
import { dishesAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { FaUtensils, FaPlus, FaToggleOn, FaToggleOff, FaEdit, FaTrash, FaSearch, FaList, FaBoxes } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TableRowSkeleton } from '../../components/Skeleton';
import IngredientsModal from '../../components/admin/IngredientsModal';
import StockManagementModal from '../../components/admin/StockManagementModal';
import AddDishModal from '../../components/admin/AddDishModal';

const AdminDishes = () => {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isIngredientsModalOpen, setIsIngredientsModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
    const { success, error } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('openStock') === 'true') {
            setIsStockModalOpen(true);
            // Optionally clear the param to avoid re-opening on manual refreshes if staying on the page
            navigate('/admin/dishes', { replace: true });
        }
    }, [location, navigate]);

    useEffect(() => {
        loadDishes();
    }, []);

    const loadDishes = async () => {
        setLoading(true);
        try {
            const response = await dishesAPI.getAll({ includeUnavailable: 'true' });
            setDishes(response.data || []);
        } catch (err) {
            error('Erreur lors du chargement des plats');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAvailability = async (id) => {
        try {
            const response = await dishesAPI.toggleAvailability(id);
            setDishes(dishes.map(dish =>
                dish.id === id ? { ...dish, is_available: response.data.dish.is_available } : dish
            ));
            success(response.data.message);
        } catch (err) {
            error('Erreur lors de la modification de la disponibilité');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le plat "${name}" ?`)) {
            try {
                await dishesAPI.deleteDish(id);
                setDishes(dishes.filter(dish => dish.id !== id));
                success('Plat supprimé avec succès');
            } catch (err) {
                error('Erreur lors de la suppression du plat');
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/edit-dish/${id}`);
    };

    const filteredDishes = dishes.filter(dish =>
        dish.nom.toLowerCase().includes(search.toLowerCase()) ||
        dish.categorie.toLowerCase().includes(search.toLowerCase())
    );

    const formatCurrency = (value) => {
        return (value || 0).toLocaleString() + ' DA';
    };

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2 font-display">Gestion des Plats</h1>
                    <p className="text-gray-600 font-medium">Gérez le menu et la disponibilité de vos plats</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsStockModalOpen(true)}
                        className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg transform hover:scale-105 transition-all text-sm"
                    >
                        <FaBoxes className="mr-2" /> Gestion Stocks
                    </button>
                    <button
                        onClick={() => setIsIngredientsModalOpen(true)}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg transform hover:scale-105 transition-all text-sm"
                    >
                        <FaList className="mr-2" /> Ingrédients
                    </button>
                    <button
                        onClick={() => setIsAddDishModalOpen(true)}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg transform hover:scale-105 transition-all text-sm"
                    >
                        <FaPlus className="mr-2" /> Ajouter un Plat
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            id="dishSearch"
                            name="dishSearch"
                            placeholder="Rechercher un plat ou une catégorie..."
                            className="input-field pl-12 py-3 bg-gray-50 border-none focus:ring-2 ring-primary/20 transition-all font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center text-xs font-black text-gray-400 uppercase tracking-widest">
                        Total: <span className="ml-2 px-3 py-1 bg-primary/10 text-primary rounded-full">{filteredDishes.length} plats</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Plat</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Catégorie</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Prix</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                            ) : filteredDishes.length > 0 ? (
                                filteredDishes.map((dish) => (
                                    <tr key={dish.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                                    <img
                                                        src={dish.image_url}
                                                        alt={dish.nom}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{dish.nom}</div>
                                                    <div className="text-xs text-gray-500">ID: #{dish.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                            {dish.categorie}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                                            {formatCurrency(dish.prix)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleAvailability(dish.id)}
                                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${dish.is_available
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                            >
                                                {dish.is_available ? (
                                                    <><FaToggleOn className="text-lg" /> <span>DISPONIBLE</span></>
                                                ) : (
                                                    <><FaToggleOff className="text-lg" /> <span>INDISPONIBLE</span></>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(dish.id)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <FaEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(dish.id, dish.nom)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <FaTrash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <FaUtensils className="text-4xl text-gray-200 mb-4" />
                                            <p className="text-lg font-medium">Aucun plat trouvé</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <IngredientsModal
                isOpen={isIngredientsModalOpen}
                onClose={() => setIsIngredientsModalOpen(false)}
            />
            <StockManagementModal
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                onAddDish={() => { setIsStockModalOpen(false); setIsAddDishModalOpen(true); }}
            />
            <AddDishModal
                isOpen={isAddDishModalOpen}
                onClose={() => setIsAddDishModalOpen(false)}
                onDishAdded={loadDishes}
            />
        </div>
    );
};

export default AdminDishes;
