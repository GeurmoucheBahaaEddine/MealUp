import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserPlus, FaUser, FaEnvelope, FaMapMarkerAlt, FaLock } from 'react-icons/fa';

const Register = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        adresse: '',
        password: '',
        confirm_password: '',
    });

    if (isAuthenticated) {
        navigate('/');
        return null;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [errorMsg, setErrorMsg] = useState('');
    const [loadingField, setLoadingField] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (formData.password !== formData.confirm_password) {
            setErrorMsg('Les mots de passe ne correspondent pas');
            return;
        }

        setLoadingField(true);
        const success = await register(formData);
        if (success) {
            navigate('/login');
        } else {
            setErrorMsg('Une erreur est survenue lors de l\'inscription');
        }
        setLoadingField(false);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
            <div className="card max-w-md w-full p-8 fade-in-up">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-primary mb-2">Inscription</h2>
                    <p className="text-gray-600">Créez votre compte</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaUser className="inline mr-2" />
                            Nom complet
                        </label>
                        <input
                            type="text"
                            id="nom"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Votre nom"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaEnvelope className="inline mr-2" />
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="votre@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaMapMarkerAlt className="inline mr-2" />
                            Adresse
                        </label>
                        <input
                            type="text"
                            id="adresse"
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Votre adresse"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaLock className="inline mr-2" />
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaLock className="inline mr-2" />
                            Confirmer le mot de passe
                        </label>
                        <input
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loadingField}
                        className={`btn-primary w-full text-lg ${loadingField ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loadingField ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Inscription...
                            </div>
                        ) : (
                            <>
                                <FaUserPlus className="inline mr-2" />
                                S'inscrire
                            </>
                        )}
                    </button>
                </form>

                {errorMsg && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
                        {errorMsg}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Déjà un compte ?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
