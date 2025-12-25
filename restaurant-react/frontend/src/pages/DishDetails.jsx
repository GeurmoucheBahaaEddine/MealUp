import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dishesAPI, reviewsAPI, cartAPI, ingredientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { FaHeart, FaShoppingCart, FaStar, FaArrowLeft, FaUtensils, FaClock, FaTimes, FaPlus, FaPlusCircle } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

const DishDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { success, error, info } = useNotification();

    const [dish, setDish] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [removedIngredients, setRemovedIngredients] = useState([]);
    const [addedExtras, setAddedExtras] = useState([]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [dishRes, reviewsRes] = await Promise.all([
                dishesAPI.getOne(id),
                reviewsAPI.getByDish(id)
            ]);
            setDish(dishRes.data);
            setReviews(reviewsRes.data);

            // Reset customization on new dish load
            setRemovedIngredients([]);
            setAddedExtras([]);
        } catch (err) {
            error('Erreur lors du chargement du plat');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const toggleRemoved = (ingredientNom) => {
        setRemovedIngredients(prev =>
            prev.includes(ingredientNom)
                ? prev.filter(name => name !== ingredientNom)
                : [...prev, ingredientNom]
        );
    };

    const toggleExtra = (ingredient) => {
        setAddedExtras(prev =>
            prev.find(item => item.id === ingredient.id)
                ? prev.filter(item => item.id !== ingredient.id)
                : [...prev, ingredient]
        );
    };

    const calculateCurrentPrice = () => {
        if (!dish) return 0;
        const extrasTotal = addedExtras.reduce((sum, item) => sum + (item.prix || 0), 0);
        return dish.prix + extrasTotal;
    };

    const addToCart = async () => {
        if (!isAuthenticated) {
            error('Veuillez vous connecter pour commander');
            navigate('/login');
            return;
        }

        try {
            const customization = {
                removed: removedIngredients,
                added: addedExtras
            };
            await cartAPI.addToCart(dish.id, quantity, customization);
            success(`${quantity}x ${dish.nom} ajouté au panier!`);

            if (removedIngredients.length > 0 || addedExtras.length > 0) {
                let msg = 'Personnalisation: ';
                if (removedIngredients.length > 0) msg += `Sans ${removedIngredients.join(', ')} `;
                if (addedExtras.length > 0) msg += `Avec supplément ${addedExtras.map(e => e.nom).join(', ')}`;
                info(msg);
            }
        } catch (err) {
            error('Erreur lors de l\'ajout au panier');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!dish) return null;

    const standardIngredients = (dish.ingredients || []).filter(ing => !ing.DishIngredient?.is_extra);
    const extraIngredients = (dish.ingredients || []).filter(ing => !!ing.DishIngredient?.is_extra);

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-400 hover:text-primary mb-6 transition-all font-medium"
            >
                <FaArrowLeft className="mr-2" /> Retour au menu
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                {/* Available Image */}
                <div className="rounded-3xl overflow-hidden shadow-2xl h-[400px] lg:h-[600px] relative group border-4 border-white">
                    <img
                        src={dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                        alt={dish.nom}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'; }}
                    />
                    {dish.is_popular && (
                        <div className="absolute top-6 right-6 bg-yellow-400 text-yellow-900 px-5 py-2 rounded-2xl font-black shadow-xl uppercase tracking-tighter transform rotate-3">
                            Populaire ✨
                        </div>
                    )}
                </div>

                {/* Dish Info */}
                <div className="flex flex-col justify-center">
                    <div className="mb-0">
                        <span className="bg-secondary/10 text-secondary font-black uppercase tracking-[0.2em] text-[10px] px-3 py-1 rounded-full mb-4 inline-block">
                            {dish.categorie}
                        </span>
                        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 leading-none">{dish.nom}</h1>

                        <div className="flex items-center space-x-6 mb-8">
                            <div className="flex items-center bg-yellow-400/10 px-4 py-2 rounded-2xl border border-yellow-400/20">
                                <FaStar className="text-yellow-500 mr-2 text-xl" />
                                <span className="font-black text-gray-900 text-lg">{dish.average_rating || 0}</span>
                                <span className="text-gray-500 ml-2 font-medium">({dish.review_count} avis)</span>
                            </div>
                            <div className="flex items-center text-gray-500 font-bold bg-gray-100 px-4 py-2 rounded-2xl">
                                <FaClock className="mr-2 text-primary" />
                                <span>20-30 min</span>
                            </div>
                        </div>

                        <div className="text-5xl font-black text-primary mb-10 flex items-baseline">
                            {calculateCurrentPrice().toLocaleString()}
                            <span className="text-xl ml-2 font-bold opacity-60 uppercase">DA</span>
                            {addedExtras.length > 0 && (
                                <span className="text-sm ml-4 font-bold text-green-500 bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                                    Extra: +{addedExtras.reduce((sum, item) => sum + item.prix, 0)} DA
                                </span>
                            )}
                        </div>

                        <div className="prose prose-lg text-gray-500 font-medium leading-relaxed mb-10 max-w-none border-l-4 border-gray-100 pl-6 italic">
                            {dish.description || "Une expérience gustative unique préparée avec passion par nos chefs."}
                        </div>

                        {/* Customization Section */}
                        <div className="space-y-8 py-8 border-y border-gray-100">
                            {/* Standard Ingredients (Removable) */}
                            {standardIngredients.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaUtensils className="text-secondary text-sm" />
                                        Ingrédients inclus
                                        <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium ml-2">Standard</span>
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {standardIngredients.map((ing) => (
                                            <button
                                                key={ing.id}
                                                onClick={() => toggleRemoved(ing.nom)}
                                                className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 font-bold text-sm ${removedIngredients.includes(ing.nom)
                                                    ? 'bg-red-50 border-red-200 text-red-500 scale-95'
                                                    : 'bg-white border-gray-100 text-gray-700 hover:border-secondary/30 hover:shadow-md'
                                                    }`}
                                            >
                                                <span className={removedIngredients.includes(ing.nom) ? 'line-through opacity-60' : ''}>
                                                    {ing.nom}
                                                </span>
                                                {removedIngredients.includes(ing.nom) ? (
                                                    <FaTimes className="text-[10px]" />
                                                ) : (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 group-hover:scale-125 transition-transform" />
                                                )}

                                                {removedIngredients.includes(ing.nom) && (
                                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full shadow-sm animate-bounce-subtle">
                                                        Retiré
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Extra Ingredients (Addable) */}
                            {extraIngredients.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaPlusCircle className="text-primary text-sm" />
                                        Suppléments
                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black ml-2 uppercase tracking-widest">En option</span>
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {extraIngredients.map((ing) => {
                                            const isAdded = addedExtras.find(e => e.id === ing.id);
                                            return (
                                                <button
                                                    key={ing.id}
                                                    onClick={() => toggleExtra(ing)}
                                                    className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 font-bold text-sm ${isAdded
                                                        ? 'bg-primary border-primary text-white shadow-lg scale-105'
                                                        : 'bg-white border-gray-100 text-gray-700 hover:border-primary/30 hover:shadow-md'
                                                        }`}
                                                >
                                                    <div className={`p-1 rounded-lg transition-colors ${isAdded ? 'bg-white/20' : 'bg-primary/5'}`}>
                                                        <FaPlus className={isAdded ? 'text-white' : 'text-primary'} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="leading-tight">{ing.nom}</p>
                                                        <p className={`text-[10px] font-black ${isAdded ? 'text-white/80' : 'text-primary'}`}>
                                                            +{ing.prix} DA
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center bg-gray-900 rounded-[2rem] p-2 shadow-2xl">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-14 h-14 flex items-center justify-center text-white hover:text-primary transition-colors text-2xl font-black rounded-full hover:bg-white/10"
                            >
                                -
                            </button>
                            <span className="w-12 text-center font-black text-2xl text-white">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="w-14 h-14 flex items-center justify-center text-white hover:text-primary transition-colors text-2xl font-black rounded-full hover:bg-white/10"
                            >
                                +
                            </button>
                        </div>
                        <button
                            onClick={addToCart}
                            className="bg-primary text-white w-full sm:flex-1 h-20 rounded-[2rem] text-xl font-black shadow-[0_20px_50px_rgba(255,107,0,0.3)] hover:shadow-[0_25px_60px_rgba(255,107,0,0.5)] transform hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-4"
                        >
                            <FaShoppingCart className="text-2xl" />
                            Ajouter au panier
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">Avis des clients</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stats Column */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center sticky top-24">
                            <div className="text-5xl font-bold text-gray-800 mb-2">
                                {dish.average_rating || 0}
                            </div>
                            <div className="flex justify-center text-yellow-400 mb-4 text-xl">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className={i < Math.round(dish.average_rating || 0) ? "" : "text-gray-200"} />
                                ))}
                            </div>
                            <p className="text-gray-500 font-medium">
                                Basé sur {dish.review_count} avis
                            </p>
                        </div>
                    </div>

                    {/* Reviews Column */}
                    <div className="md:col-span-2">
                        {isAuthenticated ? (
                            <ReviewForm
                                dishId={dish.id}
                                onReviewAdded={fetchData}
                            />
                        ) : (
                            <div className="bg-blue-50 p-6 rounded-xl text-center mb-8 border border-blue-100">
                                <p className="text-blue-800 font-medium mb-3">Vous avez commandé ce plat ?</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-primary font-bold hover:underline"
                                >
                                    Connectez-vous pour laisser un avis
                                </button>
                            </div>
                        )}

                        <ReviewList reviews={reviews} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DishDetails;
