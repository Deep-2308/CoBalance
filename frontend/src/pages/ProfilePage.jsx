import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    User, 
    Mail, 
    Phone, 
    Globe, 
    Building2, 
    ChevronRight, 
    LogOut, 
    Edit3,
    Bell,
    MessageSquare,
    Shield
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setProfile(response.data.profile);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/auth');
        }
    };

    const languages = {
        en: 'English',
        hi: 'हिंदी (Hindi)',
        ta: 'தமிழ் (Tamil)',
        te: 'తెలుగు (Telugu)',
        mr: 'मराठी (Marathi)',
        gu: 'ગુજરાતી (Gujarati)',
        bn: 'বাংলা (Bengali)'
    };

    const businessCategories = {
        shop: 'Shop / Retail',
        freelancer: 'Freelancer',
        service: 'Service Provider'
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-b-3xl">
                <h1 className="text-2xl font-bold mb-1">Profile</h1>
                <p className="text-primary-100 text-sm">Manage your account</p>
            </div>

            <div className="px-4 py-6 space-y-4">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="w-8 h-8 text-primary-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900">
                                {profile?.name || user?.name || 'User'}
                            </h2>
                            <p className="text-sm text-gray-500 capitalize">
                                {profile?.userType || 'Individual'} Account
                            </p>
                        </div>
                        <Link 
                            to="/profile/edit"
                            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <Edit3 className="w-5 h-5 text-gray-600" />
                        </Link>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                                <p className="text-xs text-gray-500">Phone (Verified)</p>
                                <p className="text-gray-900 font-medium">{profile?.mobile || '—'}</p>
                            </div>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                Verified
                            </span>
                        </div>

                        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-gray-900">{profile?.email || 'Not added'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-3">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                                <p className="text-xs text-gray-500">Preferred Language</p>
                                <p className="text-gray-900">{languages[profile?.language] || 'English'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Info (Conditional) */}
                {profile?.userType === 'business' && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Building2 className="w-5 h-5 text-primary-600" />
                            <h3 className="font-bold text-gray-900">Business Information</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500 text-sm">Business Name</span>
                                <span className="text-gray-900">{profile?.businessName || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500 text-sm">Category</span>
                                <span className="text-gray-900">
                                    {businessCategories[profile?.businessCategory] || '—'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-500 text-sm">Business Phone</span>
                                <span className="text-gray-900">{profile?.businessPhone || '—'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* App Preferences */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="w-5 h-5 text-primary-600" />
                        <h3 className="font-bold text-gray-900">App Preferences</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">WhatsApp Reminders</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                profile?.whatsappReminderEnabled 
                                    ? 'bg-green-50 text-green-600' 
                                    : 'bg-gray-100 text-gray-500'
                            }`}>
                                {profile?.whatsappReminderEnabled ? 'ON' : 'OFF'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link 
                        to="/profile/edit"
                        className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Edit3 className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">Edit Profile</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>

                    <Link 
                        to="/profile/security"
                        className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">Security & Account</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>

                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-red-50 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5 text-red-500" />
                            <span className="font-medium text-red-600">Logout</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default ProfilePage;
