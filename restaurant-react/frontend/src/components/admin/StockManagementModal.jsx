import { useState, useEffect } from 'react';
import { ingredientsAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { FaBoxes, FaSearch, FaExclamationTriangle, FaPlus, FaMinus, FaEdit, FaThList, FaTimes } from 'react-icons/fa';
import { TableRowSkeleton } from '../Skeleton';

const StockManagementModal = ({ isOpen, onClose, onAddDish }) => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ stock_actuel: 0, stock_alerte: 5, unite: 'unité' });
    const { success, error } = useNotification();

    useEffect(() => {
        if (isOpen) {
            loadIngredients();
        }
    }, [isOpen]);

    const loadIngredients = async () => {
        setLoading(true);
        try {
            const response = await ingredientsAPI.getAll();
            setIngredients(response.data || []);
        } catch (err) {
            error('Erreur lors du chargement des stocks');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (ing) => {
        setEditingId(ing.id);
        setEditForm({
            stock_actuel: ing.stock_actuel,
            stock_alerte: ing.stock_alerte,
            unite: ing.unite
        });
    };

    const handleSave = async (id) => {
        try {
            await ingredientsAPI.update(id, editForm);
            setIngredients(ingredients.map(ing =>
                ing.id === id ? { ...ing, ...editForm } : ing
            ));
            setEditingId(null);
            success('Stock mis à jour avec succès');
        } catch (err) {
            error('Erreur lors de la mise à jour du stock');
        }
    };

    const handleQuickAdjust = async (id, current, delta) => {
        const newValue = Math.max(0, current + delta);
        try {
            await ingredientsAPI.update(id, { stock_actuel: newValue });
            setIngredients(ingredients.map(ing =>
                ing.id === id ? { ...ing, stock_actuel: newValue } : ing
            ));
        } catch (err) {
            error('Erreur lors de l\'ajustement rapide');
        }
    };

    const filteredIngredients = ingredients.filter(ing =>
        ing.nom.toLowerCase().includes(search.toLowerCase())
    );

    const isLowStock = (ing) => ing.stock_actuel <= ing.stock_alerte;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn flex flex-col">
                {/* Header */}
                <div className="p-6 bg-gray-800 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <FaBoxes size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Gestion des Stocks</h2>
                            <p className="text-xs font-bold opacity-80 uppercase tracking-widest text-primary">Inventaire en temps réel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onAddDish}
                            className="group relative flex items-center bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all border border-white/10"
                            title="Ajouter un plat"
                        >
                            <div className="flex items-center space-x-1 text-white">
                                <FaPlus className="text-xs" />
                                <FaThList className="text-xl" />
                            </div>
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold uppercase tracking-widest z-10">
                                Ajouter un plat
                            </span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    {/* Stats & Search Row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="relative w-full md:w-80">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="input-field pl-12 py-3 bg-gray-50 border-none focus:ring-2 ring-primary/20 transition-all font-medium"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex bg-gray-50 p-2 rounded-2xl border border-gray-100">
                            <div className="px-4 py-1 border-r border-gray-100 text-center">
                                <div className="text-xl font-black text-gray-800">{ingredients.length}</div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Total</div>
                            </div>
                            <div className="px-4 py-1 text-center">
                                <div className="text-xl font-black text-red-500">{ingredients.filter(isLowStock).length}</div>
                                <div className="text-[9px] font-bold text-red-400 uppercase tracking-tighter">Alertes</div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                        <div className="max-h-[50vh] overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ingrédient</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Actuel</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ajuster</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Seuil</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unité</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                                    ) : filteredIngredients.length > 0 ? (
                                        filteredIngredients.map((ing) => (
                                            <tr key={ing.id} className={`hover:bg-gray-50/50 transition-colors ${isLowStock(ing) ? 'bg-red-50/20' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className={`h-2 w-2 rounded-full mr-3 ${isLowStock(ing) ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                                        <span className="font-bold text-gray-800 text-sm uppercase">{ing.nom}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingId === ing.id ? (
                                                        <input
                                                            type="number"
                                                            className="w-20 px-2 py-1 border-2 border-primary/20 rounded-lg focus:ring-2 ring-primary/20 outline-none text-sm font-bold"
                                                            value={editForm.stock_actuel}
                                                            onChange={(e) => setEditForm({ ...editForm, stock_actuel: parseFloat(e.target.value) })}
                                                        />
                                                    ) : (
                                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center w-fit gap-2 ${isLowStock(ing) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            {ing.stock_actuel} <span className="opacity-60">{ing.unite}</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-1">
                                                        <button
                                                            onClick={() => handleQuickAdjust(ing.id, ing.stock_actuel, -1)}
                                                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors border border-red-50"
                                                        >
                                                            <FaMinus size={10} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleQuickAdjust(ing.id, ing.stock_actuel, 1)}
                                                            className="p-1.5 hover:bg-green-50 text-green-500 rounded-lg transition-colors border border-green-50"
                                                        >
                                                            <FaPlus size={10} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingId === ing.id ? (
                                                        <input
                                                            type="number"
                                                            className="w-16 px-2 py-1 border-2 border-primary/20 rounded-lg outline-none text-sm"
                                                            value={editForm.stock_alerte}
                                                            onChange={(e) => setEditForm({ ...editForm, stock_alerte: parseFloat(e.target.value) })}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400 font-bold text-[11px] px-2 py-0.5 bg-gray-50 rounded-md border border-gray-100">
                                                            ≤ {ing.stock_alerte}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingId === ing.id ? (
                                                        <input
                                                            type="text"
                                                            className="w-20 px-2 py-1 border-2 border-primary/20 rounded-lg outline-none text-sm"
                                                            value={editForm.unite}
                                                            onChange={(e) => setEditForm({ ...editForm, unite: e.target.value })}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400 font-bold italic text-[11px] uppercase tracking-tighter">{ing.unite}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {editingId === ing.id ? (
                                                        <div className="flex justify-end gap-2 px-1">
                                                            <button
                                                                onClick={() => handleSave(ing.id)}
                                                                className="bg-green-500 text-white p-1.5 rounded-lg shadow-sm hover:bg-green-600 transition-colors"
                                                            >
                                                                <FaPlus size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                className="bg-gray-400 text-white p-1.5 rounded-lg shadow-sm hover:bg-gray-500 transition-colors"
                                                            >
                                                                <FaTimes size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEditClick(ing)}
                                                            className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                        >
                                                            <FaEdit size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center text-gray-400">
                                                <div className="flex flex-col items-center">
                                                    <FaBoxes className="text-5xl opacity-10 mb-4" />
                                                    <p className="font-bold uppercase tracking-widest text-xs">Aucun ingrédient</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Guide */}
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex gap-6">
                            <div className="flex items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <div className="h-2 w-2 bg-red-500 rounded-full mr-2 shadow-sm shadow-red-200 animate-pulse"></div>
                                Alerte Stock
                            </div>
                            <div className="flex items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <div className="h-2 w-2 bg-green-500 rounded-full mr-2 shadow-sm shadow-green-200"></div>
                                Stock OK
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Cliquez sur <FaEdit className="inline mx-1" /> pour modifier les seuils et unités.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockManagementModal;
