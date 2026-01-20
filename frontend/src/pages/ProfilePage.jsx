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

    // Get initials from name
    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || '?';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
                    <p className="text-sm text-surface-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-warm text-white px-6 pt-8 pb-10 rounded-b-3xl shadow-soft-lg relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-noise pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-2xl font-display font-bold mb-1">Profile</h1>
                    <p className="text-primary-300 text-sm">Manage your account</p>
                </div>
            </div>

            <div className="px-4 py-6 -mt-4 space-y-4">
                {error && (
                    <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl">
                        <p className="text-sm text-danger-600">{error}</p>
                    </div>
                )}

                {/* Profile Card */}
                <div className="card">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="avatar avatar-lg">
                            {getInitials(profile?.name || user?.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-display font-bold text-primary-900 truncate">
                                {profile?.name || user?.name || 'User'}
                            </h2>
                            <p className="text-sm text-surface-500 capitalize">
                                {profile?.userType || 'Individual'} Account
                            </p>
                        </div>
                        <Link 
                            to="/profile/edit"
                            className="p-2.5 bg-surface-100 rounded-xl hover:bg-surface-200 transition-colors"
                        >
                            <Edit3 className="w-5 h-5 text-surface-600" />
                        </Link>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 py-3 border-b border-surface-100">
                            <Phone className="w-5 h-5 text-surface-400" />
                            <div className="flex-1 min-w-0">
                                <p className="text-2xs text-surface-400 uppercase tracking-wide">Phone</p>
                                <p className="text-primary-900 font-medium truncate">{profile?.mobile || '—'}</p>
                            </div>
                            <span className="badge badge-success">Verified</span>
                        </div>

                        <div className="flex items-center gap-3 py-3 border-b border-surface-100">
                            <Mail className="w-5 h-5 text-surface-400" />
                            <div className="flex-1 min-w-0">
                                <p className="text-2xs text-surface-400 uppercase tracking-wide">Email</p>
                                <p className="text-primary-900 truncate">{profile?.email || 'Not added'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-3">
                            <Globe className="w-5 h-5 text-surface-400" />
                            <div className="flex-1 min-w-0">
                                <p className="text-2xs text-surface-400 uppercase tracking-wide">Language</p>
                                <p className="text-primary-900">{languages[profile?.language] || 'English'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Info (Conditional) */}
                {profile?.userType === 'business' && (
                    <div className="card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-accent-100 rounded-lg">
                                <Building2 className="w-5 h-5 text-accent-600" />
                            </div>
                            <h3 className="font-display font-bold text-primary-900">Business Information</h3>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between py-2.5 border-b border-surface-100">
                                <span className="text-surface-500 text-sm">Business Name</span>
                                <span className="text-primary-900 font-medium">{profile?.businessName || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2.5 border-b border-surface-100">
                                <span className="text-surface-500 text-sm">Category</span>
                                <span className="text-primary-900">
                                    {businessCategories[profile?.businessCategory] || '—'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2.5">
                                <span className="text-surface-500 text-sm">Business Phone</span>
                                <span className="text-primary-900">{profile?.businessPhone || '—'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* App Preferences */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <Bell className="w-5 h-5 text-primary-700" />
                        </div>
                        <h3 className="font-display font-bold text-primary-900">App Preferences</h3>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-4 h-4 text-surface-400" />
                            <span className="text-surface-700">WhatsApp Reminders</span>
                        </div>
                        <span className={`badge ${
                            profile?.whatsappReminderEnabled 
                                ? 'badge-success' 
                                : 'badge-neutral'
                        }`}>
                            {profile?.whatsappReminderEnabled ? 'ON' : 'OFF'}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <Link 
                        to="/profile/edit"
                        className="card card-interactive flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <Edit3 className="w-5 h-5 text-surface-500" />
                            <span className="font-medium text-primary-900">Edit Profile</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-surface-400" />
                    </Link>

                    <Link 
                        to="/profile/security"
                        className="card card-interactive flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-surface-500" />
                            <span className="font-medium text-primary-900">Security & Account</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-surface-400" />
                    </Link>

                    <button 
                        onClick={handleLogout}
                        className="card card-interactive w-full flex items-center justify-between text-left hover:bg-danger-50 hover:border-danger-200"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5 text-danger-500" />
                            <span className="font-medium text-danger-600">Logout</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-surface-400" />
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default ProfilePage;
