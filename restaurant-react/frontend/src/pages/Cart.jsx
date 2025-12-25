import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, ordersAPI, promoCodesAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaCreditCard, FaCheckCircle, FaTag } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const navigate = useNavigate();
    const { success, error } = useNotification();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await cartAPI.getCart();
            setCart(response.data);
        } catch (err) {
            // Silently fail if cart is empty or error
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await cartAPI.updateQuantity(itemId, newQuantity);
            fetchCart();
        } catch (err) {
            error('Erreur lors de la mise à jour');
        }
    };

    const removeItem = async (itemId) => {
        try {
            await cartAPI.removeFromCart(itemId);
            success('Article supprimé du panier');
            fetchCart();
        } catch (err) {
            error('Erreur lors de la suppression');
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCodeInput.trim()) return;

        try {
            const total = cart?.total || 0;
            const response = await promoCodesAPI.validate(promoCodeInput, total);
            setAppliedPromo(response.data);
            success('Code promo appliqué avec succès !');
            setPromoCodeInput('');
        } catch (err) {
            error(err.response?.data?.message || 'Code promo invalide');
            setAppliedPromo(null);
        }
    };

    const confirmOrder = async () => {
        setProcessing(true);
        try {
            const response = await ordersAPI.confirmOrder({ promoCode: appliedPromo?.code });
            success(response.data.message);
            setCart(null);
            navigate('/orders');
        } catch (err) {
            error(err.response?.data?.message || 'Erreur lors de la confirmation');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    const cartItems = cart?.items || [];
    const total = cart?.total || 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8">
                <FaShoppingCart className="inline mr-3" />
                Mon Panier
            </h1>

            {cartItems.length === 0 ? (
                <div className="card p-12 text-center">
                    <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-600 mb-4">Votre panier est vide</h2>
                    <p className="text-gray-500 mb-6">Ajoutez des plats depuis notre menu</p>
                    <a href="/menu" className="btn-primary inline-block">
                        Voir le Menu
                    </a>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="card p-6 flex items-center gap-6 hover:shadow-lg transition-all">
                                <img
                                    src={item.dish.image_url}
                                    alt={item.dish.nom}
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                                <div className="flex-grow">
                                    <h3 className="text-xl font-bold mb-1">{item.dish.nom}</h3>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="text-secondary font-bold text-xs bg-secondary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            {item.dish.categorie}
                                        </span>
                                        {/* Display removals */}
                                        {item.customization && item.customization.removed && item.customization.removed.length > 0 && (
                                            <span className="text-red-500 font-bold text-xs bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-red-100 italic">
                                                Sans: {item.customization.removed.join(', ')}
                                            </span>
                                        )}
                                        {/* Display extras */}
                                        {item.customization && item.customization.added && item.customization.added.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {item.customization.added.map((extra, idx) => (
                                                    <span key={idx} className="text-green-600 font-bold text-[10px] bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tight border border-green-100">
                                                        +{extra.nom} ({extra.prix} DA)
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-lg font-semibold text-primary">
                                        {(() => {
                                            const basePrice = item.dish.prix || 0;
                                            const extrasPrice = (item.customization && item.customization.added)
                                                ? item.customization.added.reduce((sum, e) => sum + (e.prix || 0), 0)
                                                : 0;
                                            return (basePrice + extrasPrice).toLocaleString();
                                        })()} DA × {item.quantite}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary mb-3">
                                        {(() => {
                                            const basePrice = item.dish.prix || 0;
                                            const extrasPrice = (item.customization && item.customization.added)
                                                ? item.customization.added.reduce((sum, e) => sum + (e.prix || 0), 0)
                                                : 0;
                                            return ((basePrice + extrasPrice) * item.quantite).toLocaleString();
                                        })()} DA
                                    </p>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <FaTrash className="text-xl" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="card p-6 sticky top-20">
                            <h3 className="text-2xl font-bold mb-6">Résumé</h3>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-lg">
                                    <span>Sous-total</span>
                                    <span className="font-semibold">{(total || 0).toLocaleString()} DA</span>
                                </div>

                                {/* Promo Code Section */}
                                <div className="py-2">
                                    {!appliedPromo ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                id="promoCode"
                                                name="promoCode"
                                                placeholder="Code Promo"
                                                value={promoCodeInput}
                                                onChange={(e) => setPromoCodeInput(e.target.value)}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none uppercase"
                                            />
                                            <button
                                                onClick={handleApplyPromo}
                                                disabled={!promoCodeInput}
                                                className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Appliquer
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 p-3 rounded-lg flex justify-between items-center border border-green-200">
                                            <div>
                                                <span className="font-bold text-green-700 block">{appliedPromo.code}</span>
                                                <span className="text-xs text-green-600">
                                                    -{appliedPromo.discount_value}{appliedPromo.discount_type === 'percentage' ? '%' : ' DA'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setAppliedPromo(null)}
                                                className="text-red-500 hover:text-red-700 text-sm font-semibold"
                                            >
                                                Retirer
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {appliedPromo && (
                                    <div className="flex justify-between text-lg text-green-600">
                                        <span>Réduction</span>
                                        <span className="font-semibold">
                                            -{(appliedPromo.calculated_discount || 0).toLocaleString()} DA
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between text-lg">
                                    <span>Livraison</span>
                                    <span className="font-semibold text-green-600">Gratuite</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between text-2xl font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">
                                        {((total || 0) - (appliedPromo?.calculated_discount || 0)).toLocaleString()} DA
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={confirmOrder}
                                className="btn-primary w-full text-lg"
                            >
                                <FaCheckCircle className="inline mr-2" />
                                Confirmer la commande
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
