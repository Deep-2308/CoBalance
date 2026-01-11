import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, User, Briefcase, Globe, CheckSquare, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const RegistrationFormPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        userType: 'individual',
        language: 'en',
        termsAccepted: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const { tempToken, identifier, identifierType } = location.state || {};

    useEffect(() => {
        if (!tempToken) {
            navigate('/auth/register');
        }
    }, [tempToken, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim() || formData.name.trim().length < 2) {
            setError('Please enter your full name (minimum 2 characters)');
            return;
        }

        if (!formData.termsAccepted) {
            setError('You must accept the Terms & Privacy Policy to continue');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/register/complete', {
                tempToken,
                name: formData.name.trim(),
                userType: formData.userType,
                language: formData.language,
                termsAccepted: formData.termsAccepted
            });

            const { token, user } = response.data;
            login(token, user);
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration error:', err);
            const errorData = err.response?.data;
            
            if (errorData?.code === 'TOKEN_EXPIRED') {
                setError('Registration session expired. Please start over.');
            } else if (errorData?.code === 'USER_EXISTS') {
                setError('An account with this email/mobile already exists.');
            } else {
                setError(errorData?.error || 'Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिंदी (Hindi)' },
        { code: 'ta', name: 'தமிழ் (Tamil)' },
        { code: 'te', name: 'తెలుగు (Telugu)' },
        { code: 'mr', name: 'मराठी (Marathi)' },
        { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
        { code: 'bn', name: 'বাংলা (Bengali)' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex flex-col">
            {/* Decorative Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <div className="relative z-10 p-4">
                <button
                    onClick={() => navigate('/auth/register')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
                <div className="w-full max-w-md">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4">
                                <UserPlus className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">Complete Profile</h1>
                            <p className="text-slate-400">Just a few more details to get started</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Full Name <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* User Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Account Type
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, userType: 'individual' }))}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                                            formData.userType === 'individual'
                                                ? 'bg-primary-500/20 border-primary-500 text-white'
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                        }`}
                                    >
                                        <User className="w-6 h-6" />
                                        <span className="text-sm font-medium">Individual</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, userType: 'business' }))}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                                            formData.userType === 'business'
                                                ? 'bg-primary-500/20 border-primary-500 text-white'
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                        }`}
                                    >
                                        <Briefcase className="w-6 h-6" />
                                        <span className="text-sm font-medium">Business</span>
                                    </button>
                                </div>
                            </div>

                            {/* Language */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Preferred Language
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <select
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    >
                                        {languages.map(lang => (
                                            <option key={lang.code} value={lang.code} className="bg-slate-800">
                                                {lang.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-3">
                                <div className="relative mt-1">
                                    <input
                                        type="checkbox"
                                        name="termsAccepted"
                                        id="termsAccepted"
                                        checked={formData.termsAccepted}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <label
                                        htmlFor="termsAccepted"
                                        className={`flex items-center justify-center w-5 h-5 rounded border cursor-pointer transition-all ${
                                            formData.termsAccepted
                                                ? 'bg-primary-500 border-primary-500'
                                                : 'bg-white/5 border-white/20 hover:border-white/40'
                                        }`}
                                    >
                                        {formData.termsAccepted && (
                                            <CheckSquare className="w-4 h-4 text-white" />
                                        )}
                                    </label>
                                </div>
                                <label htmlFor="termsAccepted" className="text-sm text-slate-400 cursor-pointer">
                                    I agree to the{' '}
                                    <a href="#" className="text-primary-400 hover:underline">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="#" className="text-primary-400 hover:underline">Privacy Policy</a>
                                    {' '}<span className="text-red-400">*</span>
                                </label>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-sm text-red-400">{error}</p>
                                    {error.includes('expired') && (
                                        <Link 
                                            to="/auth/register"
                                            className="inline-block mt-2 text-sm text-primary-400 hover:text-primary-300 underline"
                                        >
                                            Start over →
                                        </Link>
                                    )}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !formData.termsAccepted}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationFormPage;
