import { useState, useEffect } from 'react';
import { dishesAPI, ingredientsAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { FaPlus, FaTimes, FaSave, FaList, FaUtensils } from 'react-icons/fa';

const AddDishModal = ({ isOpen, onClose, onDishAdded }) => {
    const { success, error, info } = useNotification();
    const [loadingField, setLoadingField] = useState(false);
    const [ingredientsPool, setIngredientsPool] = useState([]);
    const [newIngredientName, setNewIngredientName] = useState('');
    const [newIngredientPrice, setNewIngredientPrice] = useState('');
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        prix: '',
        image_url: '',
        categorie: 'Plats principaux',
        is_popular: false,
        is_new: true,
        ingredients: [],
    });

    const categories = ['Entrées', 'Plats principaux', 'Desserts', 'Boissons'];

    useEffect(() => {
        if (isOpen) {
            fetchIngredients();
        }
    }, [isOpen]);

    const fetchIngredients = async () => {
        try {
            const response = await ingredientsAPI.getAll();
            setIngredientsPool(response.data);
        } catch (err) {
            console.error('Error fetching ingredients:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleIngredientToggle = (ingredientId) => {
        const isSelected = formData.ingredients.find(ing => ing.id === ingredientId);

        let updatedIngredients;
        if (isSelected) {
            updatedIngredients = formData.ingredients.filter(ing => ing.id !== ingredientId);
        } else {
            updatedIngredients = [...formData.ingredients, { id: ingredientId, is_extra: false }];
        }

        setFormData({ ...formData, ingredients: updatedIngredients });
    };

    const toggleIngredientType = (ingredientId) => {
        setFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.map(ing =>
                ing.id === ingredientId ? { ...ing, is_extra: !ing.is_extra } : ing
            )
        }));
    };

    const handleQuickAddIngredient = async () => {
        if (!newIngredientName.trim()) return;
        try {
            const response = await ingredientsAPI.create({
                nom: newIngredientName.trim(),
                prix: parseFloat(newIngredientPrice) || 0
            });
            setIngredientsPool([...ingredientsPool, response.data]);
            setFormData({
                ...formData,
                ingredients: [...formData.ingredients, { id: response.data.id, is_extra: false }]
            });
            setNewIngredientName('');
            setNewIngredientPrice('');
            info(`"${newIngredientName}" ajouté et sélectionné!`);
        } catch (err) {
            error(err.response?.data?.message || 'Erreur lors de l\'ajout de l\'ingrédient');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingField(true);
        try {
            await dishesAPI.createDish(formData);
            success('Plat ajouté avec succès!');
            if (onDishAdded) onDishAdded();
            onClose();
            // Reset form
            setFormData({
                nom: '',
                description: '',
                prix: '',
                image_url: '',
                categorie: 'Plats principaux',
                is_popular: false,
                is_new: true,
                ingredients: [],
            });
        } catch (err) {
            error(err.response?.data?.message || 'Erreur lors de l\'ajout du plat');
        } finally {
            setLoadingField(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn flex flex-col">
                {/* Header */}
                <div className="p-6 bg-primary text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <FaUtensils size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Ajouter un nouveau plat</h2>
                            <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Configuration du menu</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nom du plat</label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    className="input-field py-3"
                                    placeholder="Ex: Couscous Royal"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Prix (DA)</label>
                                <input
                                    type="number"
                                    name="prix"
                                    value={formData.prix}
                                    onChange={handleChange}
                                    className="input-field py-3"
                                    placeholder="Ex: 2500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 items-center justify-center">
                            <label className="flex items-center gap-3 cursor-pointer group unselectable">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="is_popular"
                                        checked={formData.is_popular}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${formData.is_popular ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
                                    <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_popular ? 'translate-x-5' : ''}`}></div>
                                </div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest transition-colors group-hover:text-primary">Populaire</span>
                            </label>

                            <div className="h-4 w-px bg-gray-200"></div>

                            <label className="flex items-center gap-3 cursor-pointer group unselectable">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="is_new"
                                        checked={formData.is_new}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${formData.is_new ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_new ? 'translate-x-5' : ''}`}></div>
                                </div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest transition-colors group-hover:text-primary">Nouveau</span>
                            </label>

                            <div className="h-4 w-px bg-gray-200"></div>

                            <div className="flex-1 max-w-[200px]">
                                <select
                                    name="categorie"
                                    value={formData.categorie}
                                    onChange={handleChange}
                                    className="w-full bg-white border-none rounded-xl text-xs font-bold text-gray-700 py-2 px-3 focus:ring-2 ring-primary/20 appearance-none cursor-pointer"
                                    required
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="input-field min-h-[80px] py-3 text-sm"
                                placeholder="Décrivez votre plat..."
                            ></textarea>
                        </div>

                        {/* Ingredients Selection Row */}
                        <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center">
                                    <FaList className="mr-2 text-primary" />
                                    Composition du plat ({formData.ingredients.length})
                                </label>
                            </div>

                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                {ingredientsPool.map((ing) => {
                                    const selectedInfo = formData.ingredients.find(item => item.id === ing.id);
                                    const isSelected = !!selectedInfo;

                                    return (
                                        <div key={ing.id} className="flex flex-col gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleIngredientToggle(ing.id)}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border flex items-center gap-2 ${isSelected
                                                    ? 'bg-primary text-white border-primary shadow-md'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'
                                                    }`}
                                            >
                                                <span>{ing.nom}</span>
                                                {isSelected && <FaTimes size={8} />}
                                            </button>
                                            {isSelected && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleIngredientType(ing.id)}
                                                    className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter self-center ${selectedInfo.is_extra
                                                        ? 'bg-orange-100 text-orange-600 border border-orange-200'
                                                        : 'bg-blue-100 text-blue-600 border border-blue-200'}`}
                                                >
                                                    {selectedInfo.is_extra ? 'Extra' : 'Bout'}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newIngredientName}
                                    onChange={(e) => setNewIngredientName(e.target.value)}
                                    placeholder="Nouveau..."
                                    className="input-field py-2 text-xs flex-[2]"
                                />
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        value={newIngredientPrice}
                                        onChange={(e) => setNewIngredientPrice(e.target.value)}
                                        placeholder="Prix extra"
                                        className="input-field py-2 text-xs w-full pr-8"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-300">DA</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleQuickAddIngredient}
                                    className="bg-primary/10 text-primary p-2 rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all"
                                >
                                    <FaPlus size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Visual (URL Image)</label>
                            <input
                                type="url"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                className="input-field py-3 text-sm"
                                placeholder="https://..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loadingField}
                            className={`btn-primary w-full py-4 text-sm tracking-widest font-black uppercase shadow-xl ${loadingField ? 'opacity-70' : 'hover:scale-[1.01] transition-all'}`}
                        >
                            {loadingField ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Traitement...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <FaSave />
                                    Enregistrer le plat
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddDishModal;
