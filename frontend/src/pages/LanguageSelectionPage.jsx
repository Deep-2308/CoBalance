import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const LanguageSelectionPage = () => {
    const [name, setName] = useState('');
    const [language, setLanguage] = useState('en');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    const languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    ];

    const handleComplete = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/update-profile', { name, language });
            updateUser(response.data.user);
            navigate('/dashboard');
        } catch (err) {
            console.error('Profile update error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-6">
                        <Globe className="w-16 h-16 mx-auto text-primary-600 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to CoBalance</h2>
                        <p className="text-gray-600">Let's set up your profile</p>
                    </div>

                    <form onSubmit={handleComplete}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input"
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preferred Language
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => setLanguage(lang.code)}
                                        className={`p-4 rounded-lg border-2 transition-all ${language === lang.code
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <p className="font-medium text-gray-900">{lang.nativeName}</p>
                                            <p className="text-xs text-gray-500">{lang.name}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !name}
                            className="btn btn-primary w-full"
                        >
                            {loading ? 'Setting up...' : 'Continue'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LanguageSelectionPage;
