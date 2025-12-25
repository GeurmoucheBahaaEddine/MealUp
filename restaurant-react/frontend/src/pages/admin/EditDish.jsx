import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { dishesAPI, ingredientsAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { FaUtensils, FaSave, FaImage, FaDollarSign, FaTags, FaEdit, FaArrowLeft, FaList, FaTimes, FaPlus } from 'react-icons/fa';

const EditDish = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success, error, info } = useNotification();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
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
        is_new: false,
        ingredients: [], // IDs of selected ingredients
    });

    const categories = ['Entrées', 'Plats principaux', 'Desserts', 'Boissons'];

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const [dishRes, ingredientsRes] = await Promise.all([
                    dishesAPI.getOne(id),
                    ingredientsAPI.getAll()
                ]);

                const dish = dishRes.data;
                setIngredientsPool(ingredientsRes.data);

                setFormData({
                    nom: dish.nom || '',
                    description: dish.description || '',
                    prix: dish.prix || '',
                    image_url: dish.image_url || '',
                    categorie: dish.categorie || 'Plats principaux',
                    is_popular: dish.is_popular || false,
                    is_new: dish.is_new || false,
                    ingredients: dish.ingredients ? dish.ingredients.map(ing => ({
                        id: ing.id,
                        is_extra: ing.DishIngredient ? ing.DishIngredient.is_extra : false
                    })) : [],
                });
            } catch (err) {
                error('Erreur lors de la récupération des données');
                navigate('/admin/dishes');
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, [id, error, navigate]);

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
            info(`"${newIngredientName}" ajouté (${response.data.prix} DA) et sélectionné!`);
        } catch (err) {
            error(err.response?.data?.message || 'Erreur lors de l\'ajout de l\'ingrédient');
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await dishesAPI.updateDish(id, formData);
            success('Plat mis à jour avec succès!');
            navigate('/admin/dishes');
        } catch (err) {
            error(err.response?.data?.message || 'Erreur lors de la mise à jour du plat');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link to="/admin/dishes" className="text-gray-500 hover:text-primary flex items-center transition-colors">
                        <FaArrowLeft className="mr-2" /> Retour à la gestion
                    </Link>
                </div>

                <h1 className="text-4xl font-bold text-center mb-8">
                    <FaEdit className="inline mr-3 text-primary" />
                    Modifier le plat
                </h1>

                <div className="card p-8 bg-white rounded-2xl shadow-premium border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nom du plat
                                </label>
                                <input
                                    type="text"
                                    id="nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    className="input-field w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    placeholder="Ex: Couscous Royal"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Prix (DA)
                                </label>
                                <div className="relative">
                                    <FaDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        id="prix"
                                        name="prix"
                                        value={formData.prix}
                                        onChange={handleChange}
                                        className="input-field w-full pl-12 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="Ex: 2500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="is_popular"
                                        checked={formData.is_popular}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.is_popular ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_popular ? 'translate-x-6' : ''}`}></div>
                                </div>
                                <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">Populaire (Star)</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="is_new"
                                        checked={formData.is_new}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.is_new ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_new ? 'translate-x-6' : ''}`}></div>
                                </div>
                                <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">Nouveau (Badge)</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FaUtensils className="inline mr-2" />
                                Catégorie
                            </label>
                            <select
                                id="categorie"
                                name="categorie"
                                value={formData.categorie}
                                onChange={handleChange}
                                className="input-field w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none cursor-pointer"
                                required
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="input-field w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-h-[100px]"
                                placeholder="Décrivez votre plat..."
                            ></textarea>
                        </div>

                        {/* Ingredients Selection Section */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center">
                                <FaList className="mr-2 text-primary" />
                                Ingrédients (Sélectionnez les ingrédients du plat)
                            </label>

                            <div className="flex flex-wrap gap-2 mb-6 max-h-60 overflow-y-auto p-2">
                                {ingredientsPool.map((ing) => {
                                    const selectedInfo = formData.ingredients.find(item => item.id === ing.id);
                                    const isSelected = !!selectedInfo;

                                    return (
                                        <div key={ing.id} className="relative group/ing">
                                            <button
                                                type="button"
                                                onClick={() => handleIngredientToggle(ing.id)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${isSelected
                                                    ? 'bg-primary text-white border-primary shadow-lg scale-105'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'
                                                    }`}
                                            >
                                                <span>{ing.nom}</span>
                                                {ing.prix > 0 && !isSelected && (
                                                    <span className="text-[10px] bg-gray-100 px-1 py-0.5 rounded text-gray-400">
                                                        {ing.prix} DA
                                                    </span>
                                                )}
                                                {isSelected && <FaTimes className="text-[10px]" />}
                                            </button>

                                            {isSelected && (
                                                <div className="flex mt-1 justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); toggleIngredientType(ing.id); }}
                                                        className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border transition-all ${selectedInfo.is_extra
                                                            ? 'bg-orange-500 text-white border-orange-600'
                                                            : 'bg-blue-500 text-white border-blue-600'}`}
                                                    >
                                                        {selectedInfo.is_extra ? 'Supplément' : 'Standard'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {ingredientsPool.length === 0 && (
                                    <p className="text-gray-400 italic text-sm">Aucun ingrédient dans la liste. Ajoutez-en un ci-dessous.</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="newIngredientName"
                                    name="newIngredientName"
                                    value={newIngredientName}
                                    onChange={(e) => setNewIngredientName(e.target.value)}
                                    placeholder="Nom (ex: Fromage)"
                                    className="input-field flex-[2]"
                                />
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        id="newIngredientPrice"
                                        name="newIngredientPrice"
                                        value={newIngredientPrice}
                                        onChange={(e) => setNewIngredientPrice(e.target.value)}
                                        placeholder="Prix extra"
                                        className="input-field pr-8 w-full"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">DA</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleQuickAddIngredient}
                                    className="bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all font-bold"
                                    title="Ajouter l'ingrédient"
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FaImage className="inline mr-2" />
                                URL de l'image
                            </label>
                            <input
                                type="url"
                                id="image_url"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                className="input-field w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                placeholder="https://..."
                                required
                            />
                        </div>

                        {formData.image_url && (
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Aperçu:</p>
                                <img
                                    src={formData.image_url}
                                    alt="Preview"
                                    className="w-full h-64 object-cover rounded-xl shadow-md"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`btn-primary w-full py-4 rounded-xl text-lg font-bold shadow-lg transform transition-all active:scale-95 flex items-center justify-center ${submitting ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02]'}`}
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Mise à jour...
                                </>
                            ) : (
                                <>
                                    <FaSave className="mr-2" />
                                    Enregistrer les modifications
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditDish;
