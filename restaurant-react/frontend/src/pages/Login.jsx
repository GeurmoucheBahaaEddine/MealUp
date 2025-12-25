import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignInAlt, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    if (isAuthenticated) {
        navigate('/profile');
        return null;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [error, setError] = useState('');
    const [loadingField, setLoadingField] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoadingField(true);
        const success = await login(formData);
        if (success) {
            navigate('/profile');
        } else {
            setError('Email ou mot de passe incorrect');
        }
        setLoadingField(false);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
            <div className="card max-w-md w-full p-8 fade-in-up">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-primary mb-2">Connexion</h2>
                    <p className="text-gray-600">Connectez-vous à votre compte</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                            className={`input-field ${error ? 'border-red-500 bg-red-50' : ''}`}
                            placeholder="votre@email.com"
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

                    <button
                        type="submit"
                        disabled={loadingField}
                        className={`btn-primary w-full text-lg ${loadingField ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loadingField ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Connexion...
                            </div>
                        ) : (
                            <>
                                <FaSignInAlt className="inline mr-2" />
                                Se connecter
                            </>
                        )}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
                        {error}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Pas encore de compte ?{' '}
                        <Link to="/register" className="text-primary font-semibold hover:underline">
                            S'inscrire
                        </Link>
                    </p>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm">
                    <p className="font-semibold text-blue-800 mb-1">Compte de test :</p>
                    <p className="text-blue-700">Email: admin@example.com</p>
                    <p className="text-blue-700">Mot de passe: admin123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
