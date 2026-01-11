import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    User, 
    Mail, 
    Globe, 
    Building2, 
    Phone,
    Briefcase,
    MessageSquare,
    Save,
    Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const EditProfilePage = () => {
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        language: 'en',
        userType: 'individual',
        businessName: '',
        businessCategory: '',
        businessPhone: '',
        whatsappReminderEnabled: true,
        defaultReminderMessage: ''
    });

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिंदी (Hindi)' },
        { code: 'ta', name: 'தமிழ் (Tamil)' },
        { code: 'te', name: 'తెలుగు (Telugu)' },
        { code: 'mr', name: 'मराठी (Marathi)' },
        { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
        { code: 'bn', name: 'বাংলা (Bengali)' }
    ];

    const businessCategories = [
        { value: 'shop', label: 'Shop / Retail' },
        { value: 'freelancer', label: 'Freelancer' },
        { value: 'service', label: 'Service Provider' }
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            const profile = response.data.profile;
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                language: profile.language || 'en',
                userType: profile.userType || 'individual',
                businessName: profile.businessName || '',
                businessCategory: profile.businessCategory || '',
                businessPhone: profile.businessPhone || '',
                whatsappReminderEnabled: profile.whatsappReminderEnabled ?? true,
                defaultReminderMessage: profile.defaultReminderMessage || ''
            });
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.name.trim() || formData.name.trim().length < 2) {
            setError('Name is required (minimum 2 characters)');
            return;
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        setSaving(true);

        try {
            const response = await api.put('/profile', formData);
            const updatedProfile = response.data.profile;
            
            // Update auth context
            updateUser({
                ...updatedProfile,
                name: updatedProfile.name
            });

            setSuccess('Profile updated successfully!');
            
            // Navigate back after short delay
            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6 pb-24">
                {/* Error/Success Messages */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-green-600">{success}</p>
                    </div>
                )}

                {/* Basic Info */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-600" />
                        Basic Information
                    </h3>

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input pl-10"
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Preferred Language
                            </label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    className="input pl-10 appearance-none"
                                >
                                    {languages.map(lang => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* User Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, userType: 'individual' }))}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                                        formData.userType === 'individual'
                                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
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
                                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <Briefcase className="w-6 h-6" />
                                    <span className="text-sm font-medium">Business</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Info (Conditional) */}
                {formData.userType === 'business' && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary-600" />
                            Business Information
                        </h3>

                        <div className="space-y-4">
                            {/* Business Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Name
                                </label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Your Business Name"
                                />
                            </div>

                            {/* Business Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Category
                                </label>
                                <select
                                    name="businessCategory"
                                    value={formData.businessCategory}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="">Select category</option>
                                    {businessCategories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Business Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Phone (optional)
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="businessPhone"
                                        value={formData.businessPhone}
                                        onChange={handleChange}
                                        className="input pl-10"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* App Preferences */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary-600" />
                        App Preferences
                    </h3>

                    <div className="space-y-4">
                        {/* WhatsApp Reminder Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">WhatsApp Reminders</p>
                                <p className="text-sm text-gray-500">Send payment reminders via WhatsApp</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="whatsappReminderEnabled"
                                    checked={formData.whatsappReminderEnabled}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        {/* Default Reminder Message */}
                        {formData.whatsappReminderEnabled && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Default Reminder Message
                                </label>
                                <textarea
                                    name="defaultReminderMessage"
                                    value={formData.defaultReminderMessage}
                                    onChange={handleChange}
                                    className="input min-h-[100px] resize-none"
                                    placeholder="Hi, this is a friendly reminder about your pending balance..."
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {saving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            <span>Save Changes</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default EditProfilePage;
