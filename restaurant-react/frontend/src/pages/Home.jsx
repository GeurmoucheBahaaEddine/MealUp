import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dishesAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { FaUtensils, FaShippingFast, FaMedal, FaStar, FaCartPlus, FaSignInAlt } from 'react-icons/fa';
import { CardSkeleton } from '../components/Skeleton';

const Home = () => {
    const { isAuthenticated } = useAuth();
    const [popularDishes, setPopularDishes] = useState([]);
    const [newDishes, setNewDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useNotification();

    useEffect(() => {
        const fetchDishes = async () => {
            console.log('Home: Fetching dishes...');
            try {
                const [popularRes, newRes] = await Promise.all([
                    dishesAPI.getPopular(),
                    dishesAPI.getNew(),
                ]);
                console.log('Home: Data fetched', { popular: popularRes.data, new: newRes.data });
                setPopularDishes(Array.isArray(popularRes.data) ? popularRes.data : []);
                setNewDishes(Array.isArray(newRes.data) ? newRes.data : []);
            } catch (err) {
                console.error('Home: Fetch error', err);
                error('Erreur lors du chargement des plats');
            } finally {
                setLoading(false);
            }
        };

        fetchDishes();
    }, [error]);

    const addToCart = async (dishId, dishName) => {
        try {
            await cartAPI.addToCart(dishId, 1);
            success(`${dishName} ajouté au panier!`);
        } catch (err) {
            error('Erreur lors de l\'ajout au panier');
        }
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-primary text-white py-20 relative overflow-hidden">
                <div className="hero-pattern absolute inset-0"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="fade-in-up">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6">
                                Découvrez l'Excellence <span className="text-yellow-300">Culinaire</span>
                            </h1>
                            <p className="text-xl mb-8 text-gray-100">
                                Des saveurs authentiques, des ingrédients frais et une passion pour la gastronomie. Commandez maintenant et vivez une expérience inoubliable.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/menu" className="btn-warning text-lg px-8 py-4">
                                    <FaUtensils className="inline mr-2" />
                                    Voir le Menu
                                </Link>
                                {!isAuthenticated && (
                                    <Link to="/register" className="bg-white text-primary font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all">
                                        Créer un Compte
                                    </Link>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 mt-12">
                                <div className="text-center">
                                    <h3 className="text-3xl font-bold text-yellow-300">50+</h3>
                                    <p className="text-sm">Plats Délicieux</p>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-3xl font-bold text-yellow-300">1000+</h3>
                                    <p className="text-sm">Clients Satisfaits</p>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-3xl font-bold text-yellow-300">30min</h3>
                                    <p className="text-sm">Livraison Moyenne</p>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <img
                                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80"
                                alt="Restaurant Food"
                                className="rounded-3xl shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Pourquoi Nous Choisir ?</h2>
                        <p className="text-xl text-gray-600">Une expérience de commande exceptionnelle</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="card card-hover p-8 text-center">
                            <FaShippingFast className="text-5xl text-primary mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-3">Livraison Rapide</h3>
                            <p className="text-gray-600">Livraison en moins de 45 minutes dans toute la ville</p>
                        </div>
                        <div className="card card-hover p-8 text-center">
                            <FaUtensils className="text-5xl text-green-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-3">Plats Frais</h3>
                            <p className="text-gray-600">Ingrédients frais préparés quotidiennement par nos chefs</p>
                        </div>
                        <div className="card card-hover p-8 text-center">
                            <FaMedal className="text-5xl text-yellow-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-3">Qualité Garantie</h3>
                            <p className="text-gray-600">Satisfaction garantie ou remboursé sous 24h</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Dishes */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">
                            <FaStar className="inline text-yellow-500 mr-2" />
                            Plats Populaires
                        </h2>
                        <p className="text-xl text-gray-600">Découvrez nos plats les plus appréciés</p>
                    </div>

                    {loading ? (
                        <div className="container mx-auto px-4 py-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 pt-64">
                                {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {popularDishes.map((dish) => (
                                <div key={dish.id} className="card card-hover overflow-hidden fade-in-up">
                                    <Link to={`/dish/${dish.id}`} className="block h-64 overflow-hidden relative group">
                                        <img
                                            src={dish.image_url}
                                            alt={dish.nom}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80'; }}
                                        />
                                        <span className="absolute top-4 right-4 badge badge-warning">
                                            <FaStar className="inline mr-1" />
                                            Populaire
                                        </span>
                                    </Link>
                                    <div className="p-6">
                                        <Link to={`/dish/${dish.id}`} className="block">
                                            <h3 className="text-2xl font-bold mb-2 hover:text-primary transition-colors">{dish.nom}</h3>
                                        </Link>
                                        <p className="text-gray-600 mb-4">
                                            <FaUtensils className="inline mr-2" />
                                            {dish.categorie}
                                        </p>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-3xl font-bold text-primary">
                                                {(dish.prix || 0).toLocaleString()} DA
                                            </span>
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar key={i} />
                                                ))}
                                            </div>
                                        </div>
                                        {isAuthenticated ? (
                                            <button
                                                onClick={() => addToCart(dish.id, dish.nom)}
                                                className="btn-primary w-full"
                                            >
                                                <FaCartPlus className="inline mr-2" />
                                                Ajouter au panier
                                            </button>
                                        ) : (
                                            <Link to="/login" className="btn-outline-primary w-full block text-center">
                                                <FaSignInAlt className="inline mr-2" />
                                                Connectez-vous
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link to="/menu" className="btn-outline-primary text-lg px-8 py-4">
                            Voir Tout le Menu →
                        </Link>
                    </div>
                </div>
            </section>

            {/* New Dishes */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">
                            🔔 Nouveautés
                        </h2>
                        <p className="text-xl text-gray-600">Découvrez nos dernières créations</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {newDishes.map((dish) => (
                            <div key={dish.id} className="card card-hover overflow-hidden group">
                                <Link to={`/dish/${dish.id}`} className="block h-48 overflow-hidden relative">
                                    <img
                                        src={dish.image_url}
                                        alt={dish.nom}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80'; }}
                                    />
                                    <span className="absolute top-4 left-4 badge badge-success">
                                        Nouveau
                                    </span>
                                </Link>
                                <div className="p-6 text-center">
                                    <Link to={`/dish/${dish.id}`} className="block">
                                        <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">{dish.nom}</h3>
                                    </Link>
                                    <p className="text-gray-600 mb-3">{dish.categorie}</p>
                                    <span className="text-2xl font-bold text-primary">
                                        {(dish.prix || 0).toLocaleString()} DA
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-primary text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-6 md:mb-0">
                            <h2 className="text-4xl font-bold mb-3">Prêt à commander ?</h2>
                            <p className="text-xl">Rejoignez des milliers de clients satisfaits et commandez dès maintenant !</p>
                        </div>
                        <Link to="/menu" className="btn-warning text-lg px-8 py-4">
                            <FaCartPlus className="inline mr-2" />
                            Commander Maintenant
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
