import { useState, useEffect } from 'react';
import { ingredientsAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaList } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';

const IngredientsModal = ({ isOpen, onClose }) => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const { success, error } = useNotification();

    // Add state
    const [isAdding, setIsAdding] = useState(false);
    const [newIng, setNewIng] = useState({ nom: '', prix: '' });

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ nom: '', prix: '' });

    useEffect(() => {
        if (isOpen) {
            fetchIngredients();
        }
    }, [isOpen]);

    const fetchIngredients = async () => {
        setLoading(true);
        try {
            const response = await ingredientsAPI.getAll();
            setIngredients(response.data);
        } catch (err) {
            error('Erreur lors du chargement des ingrédients');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newIng.nom.trim()) return;
        setActionLoading(true);
        try {
            const response = await ingredientsAPI.create({
                nom: newIng.nom.trim(),
                prix: parseFloat(newIng.prix) || 0
            });
            setIngredients(prev => [...prev, response.data].sort((a, b) => a.nom.localeCompare(b.nom)));
            success(`"${newIng.nom}" ajouté avec succès!`);
            setNewIng({ nom: '', prix: '' });
            setIsAdding(false);
        } catch (err) {
            error(err.response?.data?.message || 'Erreur lors de l\'ajout');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditSave = async (id) => {
        if (!editForm.nom.trim()) return;
        setActionLoading(true);
        try {
            const response = await ingredientsAPI.update(id, {
                nom: editForm.nom.trim(),
                prix: parseFloat(editForm.prix) || 0
            });
            setIngredients(prev => prev.map(ing => ing.id === id ? response.data : ing));
            success('Ingrédient mis à jour!');
            setEditingId(null);
        } catch (err) {
            error(err.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (ing) => {
        if (!window.confirm(`Voulez-vous vraiment supprimer "${ing.nom}" ? Cette action est irréversible.`)) return;

        try {
            await ingredientsAPI.delete(ing.id);
            setIngredients(prev => prev.filter(item => item.id !== ing.id));
            success('Ingrédient supprimé');
        } catch (err) {
            error(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const startEdit = (ing) => {
        setEditingId(ing.id);
        setEditForm({ nom: ing.nom, prix: ing.prix });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn flex flex-col">
                {/* Header */}
                <div className="p-6 bg-gradient-primary text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <FaList size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Gestion des Ingrédients</h2>
                            <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Base de données globale</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Add Section */}
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-800">Liste des ingrédients</h3>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isAdding ? 'bg-gray-100 text-gray-600' : 'bg-primary text-white shadow-lg transform hover:scale-105'
                                }`}
                        >
                            {isAdding ? <FaTimes /> : <FaPlus />}
                            {isAdding ? 'Annuler' : 'Ajouter'}
                        </button>
                    </div>

                    {isAdding && (
                        <div className="bg-gray-50 p-4 rounded-2xl border-2 border-primary/10 animate-scaleIn">
                            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nom</label>
                                    <input
                                        type="text"
                                        id="newIngNom"
                                        name="newIngNom"
                                        value={newIng.nom}
                                        onChange={e => setNewIng({ ...newIng, nom: e.target.value })}
                                        placeholder="ex: Fromage Fondu"
                                        className="input-field py-2 text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Prix Extra (DA)</label>
                                    <input
                                        type="number"
                                        id="newIngPrix"
                                        name="newIngPrix"
                                        value={newIng.prix}
                                        onChange={e => setNewIng({ ...newIng, prix: e.target.value })}
                                        placeholder="0"
                                        className="input-field py-2 text-sm"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {actionLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <FaPlus />}
                                        Confirmer l'ajout
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Table Section */}
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                        {loading ? (
                            <div className="p-20 flex justify-center">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ingrédient</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Prix Extra</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {ingredients.map((ing) => (
                                        <tr key={ing.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 uppercase font-bold text-gray-700 text-xs">
                                                {editingId === ing.id ? (
                                                    <input
                                                        type="text"
                                                        id={`editIngNom_${ing.id}`}
                                                        name={`editIngNom_${ing.id}`}
                                                        value={editForm.nom}
                                                        onChange={e => setEditForm({ ...editForm, nom: e.target.value })}
                                                        className="input-field py-1 text-xs"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    ing.nom
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {editingId === ing.id ? (
                                                    <input
                                                        type="number"
                                                        id={`editIngPrix_${ing.id}`}
                                                        name={`editIngPrix_${ing.id}`}
                                                        value={editForm.prix}
                                                        onChange={e => setEditForm({ ...editForm, prix: e.target.value })}
                                                        className="input-field py-1 text-xs w-20 text-right"
                                                    />
                                                ) : (
                                                    <span className={`font-black ${ing.prix > 0 ? 'text-primary' : 'text-gray-300'}`}>
                                                        {ing.prix > 0 ? `${ing.prix} DA` : '0 DA'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {editingId === ing.id ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditSave(ing.id)}
                                                                className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                            >
                                                                <FaSave size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                className="p-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                                                            >
                                                                <FaTimes size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => startEdit(ing)}
                                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                            >
                                                                <FaEdit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(ing)}
                                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <FaTrash size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {ingredients.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-gray-400 italic text-sm">
                                                Aucun ingrédient dans la base.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="p-4 bg-blue-50/50 border-t border-blue-50 flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">?</div>
                    <p className="text-[10px] text-blue-800 font-medium leading-tight">
                        Les modifications ici sont globales. Supprimer un ingrédient n'est possible que s'il n'est utilisé dans aucun plat.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IngredientsModal;
