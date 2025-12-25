import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dishesAPI, cartAPI, favoritesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { FaSearch, FaFilter, FaHeart, FaRegHeart, FaShoppingCart, FaUtensils, FaCartPlus, FaSignInAlt, FaSortAmountDown, FaSortAmountUp, FaStar, FaSortAlphaDown, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import { CardSkeleton } from '../components/Skeleton';

const Menu = () => {
    const { isAuthenticated } = useAuth();
    const { success, error, info } = useNotification();

    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tous');
    const [favorites, setFavorites] = useState([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [sortBy, setSortBy] = useState('name');

    // UI State
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        sort: true,
        categories: true
    });

    const categories = ['Tous', 'Entrées', 'Plats principaux', 'Desserts', 'Boissons'];
    const sortOptions = [
        { id: 'name', label: 'Alphabétique', icon: FaSortAlphaDown },
        { id: 'priceAsc', label: 'Prix croissant', icon: FaSortAmountUp },
        { id: 'priceDesc', label: 'Prix décroissant', icon: FaSortAmountDown },
        { id: 'rating', label: 'Mieux notés', icon: FaStar },
    ];

    useEffect(() => {
        fetchData();
    }, [isAuthenticated]);

    const fetchData = async () => {
        try {
            const dishesRes = await dishesAPI.getAll({ includeUnavailable: true });
            const dishesData = Array.isArray(dishesRes.data) ? dishesRes.data : [];
            setDishes(dishesData);

            if (isAuthenticated) {
                const favRes = await favoritesAPI.getFavorites();
                setFavorites(Array.isArray(favRes.data) ? favRes.data.map(fav => fav.id) : []);
            } else {
                setFavorites([]);
            }
        } catch (err) {
            error('Erreur lors du chargement des plats');
            setDishes([]);
        } finally {
            setLoading(false);
        }
    };

    const getSortedAndFilteredDishes = () => {
        let filtered = dishes.filter(dish => {
            if (!dish) return false;
            const matchesCategory = activeCategory === 'Tous' || dish.categorie === activeCategory;
            const matchesSearch = (dish.nom || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFavorite = !showFavoritesOnly || favorites.includes(dish.id);
            return matchesCategory && matchesSearch && matchesFavorite;
        });

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'priceAsc': return a.prix - b.prix;
                case 'priceDesc': return b.prix - a.prix;
                case 'rating': return b.average_rating - a.average_rating;
                case 'name': return a.nom.localeCompare(b.nom);
                default: return 0;
            }
        });
    };

    const filteredDishes = getSortedAndFilteredDishes();

    const addToCart = async (e, dish) => {
        e.stopPropagation();
        if (!dish.is_available) {
            error('Ce plat n\'est plus disponible actuellement.');
            return;
        }
        if (!isAuthenticated) {
            error('Veuillez vous connecter pour ajouter des articles au panier.');
            return;
        }

        try {
            await cartAPI.addToCart(dish.id, 1);
            success(`${dish.nom} ajouté au panier!`);
        } catch (err) {
            error('Erreur lors de l\'ajout au panier');
        }
    };

    const toggleFavorite = async (e, dish) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            error('Veuillez vous connecter pour gérer vos favoris.');
            return;
        }

        try {
            if (favorites.includes(dish.id)) {
                await favoritesAPI.removeFavorite(dish.id);
                setFavorites(favorites.filter(id => id !== dish.id));
                info('Retiré des favoris');
            } else {
                await favoritesAPI.addFavorite(dish.id);
                setFavorites([...favorites, dish.id]);
                success('Ajouté aux favoris');
            }
        } catch (err) {
            error('Erreur');
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const SidebarContent = () => (
        <div className="space-y-8 p-1">
            {/* Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-sm font-black uppercase tracking-wider flex items-center text-gray-400">
                        <FaSearch className="mr-2 text-primary" />
                        Recherche
                    </h3>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        id="menuSearch"
                        name="menuSearch"
                        placeholder="Ex: Couscous, Pizza..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 ring-primary/20 transition-all font-medium"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                        >
                            <FaTimes size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* Sorting Accordion */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                <button
                    onClick={() => toggleSection('sort')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                    <h3 className="text-sm font-black uppercase tracking-wider flex items-center text-gray-800">
                        <FaFilter className="mr-2 text-primary" />
                        Trier par
                    </h3>
                    {expandedSections.sort ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
                </button>
                <div className={`transition-all duration-300 ease-in-out ${expandedSections.sort ? 'max-h-64 opacity-100 p-4' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-1 gap-2">
                        {sortOptions.map((opt) => {
                            const Icon = opt.icon;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setSortBy(opt.id)}
                                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${sortBy === opt.id
                                        ? 'bg-primary text-white shadow-lg scale-[1.02]'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="mr-3" />
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Favorites Filter */}
            {isAuthenticated && (
                <button
                    onClick={() => {
                        setShowFavoritesOnly(!showFavoritesOnly);
                        if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full py-4 px-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center space-x-3 shadow-sm ${showFavoritesOnly
                        ? 'bg-red-500 text-white shadow-lg scale-105'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                >
                    <FaHeart className={showFavoritesOnly ? 'animate-pulse' : ''} />
                    <span>{showFavoritesOnly ? 'Tous les plats' : 'Mes Favoris'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${showFavoritesOnly ? 'bg-white text-red-500' : 'bg-red-500 text-white'}`}>
                        {favorites.length}
                    </span>
                </button>
            )}

            {/* Categories Accordion */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                <button
                    onClick={() => toggleSection('categories')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                    <h3 className="text-sm font-black uppercase tracking-wider flex items-center text-gray-800">
                        <FaUtensils className="mr-2 text-primary" />
                        Catégories
                    </h3>
                    {expandedSections.categories ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
                </button>
                <div className={`transition-all duration-300 ease-in-out ${expandedSections.categories ? 'max-h-96 opacity-100 p-4' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setActiveCategory(cat);
                                    if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
                                }}
                                className={`w-full text-left py-3 px-4 rounded-xl font-semibold text-sm transition-all ${activeCategory === cat
                                    ? 'bg-primary text-white shadow-lg scale-[1.02]'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen bg-gray-50/50">
            {/* Header Hero Area */}
            <div className="max-w-[1400px] mx-auto px-4 py-8">
                <div className="text-center mb-12 relative overflow-hidden bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>

                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
                        <span className="text-primary">🍽️</span> Notre Menu
                    </h1>
                    <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto mb-8">
                        Découvrez nos délicieux plats préparés avec passion par nos chefs experts
                    </p>

                    {/* Mobile Toggle Button */}
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="lg:hidden flex items-center mx-auto space-x-2 bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <FaFilter />
                        <span>Filtres et Tris</span>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 relative">
                    {/* Desktop Sidebar (Sticky and Independent Scroll) */}
                    <aside className="hidden lg:block w-80 sticky top-24 self-start h-[calc(100vh-120px)] overflow-y-auto no-scrollbar pb-8">
                        <SidebarContent />
                    </aside>

                    {/* Mobile Drawer */}
                    {isMobileSidebarOpen && (
                        <>
                            <div
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                                onClick={() => setIsMobileSidebarOpen(false)}
                            ></div>
                            <div className="fixed left-0 top-0 h-full w-[300px] bg-white z-50 lg:hidden shadow-2xl animate-slideRight flex flex-col">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Filtres</h2>
                                    <button
                                        onClick={() => setIsMobileSidebarOpen(false)}
                                        className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                    <SidebarContent />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Main Content (Dishes Grid) */}
                    <main className="flex-1">
                        {loading ? (
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
                            </div>
                        ) : filteredDishes.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 shadow-sm">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaSearch className="text-4xl text-gray-200" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Aucun plat trouvé</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">Nous n'avons trouvé aucun plat correspondant à vos critères de recherche.</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setActiveCategory('Tous');
                                        setShowFavoritesOnly(false);
                                    }}
                                    className="bg-primary text-white py-3 px-8 rounded-xl font-bold mt-8 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                >
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredDishes.map((dish) => (
                                    <div key={dish.id} className={`bg-white rounded-3xl overflow-hidden relative fade-in-up transition-all group border border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-1 ${!dish.is_available ? 'grayscale-[0.5] opacity-75' : ''}`}>
                                        {/* Availability Badge */}
                                        {!dish.is_available && (
                                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                                                <span className="bg-red-500 text-white px-6 py-2 rounded-full font-black text-xs shadow-2xl transform rotate-[-5deg] tracking-widest uppercase">
                                                    ÉPUISÉ
                                                </span>
                                            </div>
                                        )}

                                        {/* Favorite Button */}
                                        {isAuthenticated && (
                                            <button
                                                onClick={(e) => toggleFavorite(e, dish)}
                                                className={`absolute top-4 right-4 z-30 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all transform active:scale-90 ${favorites.includes(dish.id)
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-white/90 text-red-500 hover:bg-white'
                                                    }`}
                                            >
                                                {favorites.includes(dish.id) ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                                            </button>
                                        )}

                                        <Link to={`/dish/${dish.id}`} className="block h-56 overflow-hidden relative group-hover:opacity-90 transition-opacity">
                                            <img
                                                src={dish.image_url}
                                                alt={dish.nom}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80'; }}
                                            />
                                            {/* Category Tag Overlay */}
                                            <div className="absolute bottom-4 left-4">
                                                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                                                    {dish.categorie}
                                                </span>
                                            </div>
                                        </Link>

                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <Link to={`/dish/${dish.id}`} className="block">
                                                    <h3 className="text-xl font-bold text-gray-800 leading-tight hover:text-primary transition-colors">{dish.nom}</h3>
                                                </Link>
                                                <div className="flex items-center text-primary bg-primary/5 px-2 py-1 rounded-lg text-xs font-black">
                                                    <FaStar className="mr-1 text-yellow-400" /> {dish.average_rating || '5.0'}
                                                </div>
                                            </div>

                                            <p className="text-gray-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                                                {dish.description || "Une explosion de saveurs préparée avec des ingrédients soigneusement sélectionnés."}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Prix</span>
                                                    <span className="text-2xl font-black text-gray-900">
                                                        {(dish.prix || 0).toLocaleString()} <span className="text-xs font-medium">DA</span>
                                                    </span>
                                                </div>

                                                {isAuthenticated ? (
                                                    <button
                                                        onClick={(e) => addToCart(e, dish)}
                                                        disabled={!dish.is_available}
                                                        className={`p-4 rounded-2xl transition-all shadow-lg active:scale-95 ${dish.is_available
                                                            ? 'bg-primary text-white hover:bg-primary-dark hover:shadow-primary/20'
                                                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                                                    >
                                                        <FaCartPlus size={22} />
                                                    </button>
                                                ) : (
                                                    <Link to="/login" className="px-6 py-2 px-6 py-3 bg-primary/5 text-primary font-black uppercase tracking-widest rounded-xl text-[10px] hover:bg-primary hover:text-white transition-all shadow-sm">
                                                        Commander
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes slideRight {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slideRight {
                    animation: slideRight 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Menu;
