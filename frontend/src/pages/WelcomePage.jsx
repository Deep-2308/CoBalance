import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Wallet, Users, ArrowRight } from 'lucide-react';

const WelcomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-warm flex flex-col relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-600/5 rounded-full blur-3xl" />
                {/* Subtle grain texture */}
                <div className="absolute inset-0 opacity-[0.03] bg-noise" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
                {/* Logo & Branding */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl shadow-2xl shadow-accent-500/30 mb-6 animate-fade-in">
                        <Wallet className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 tracking-tight animate-fade-in">
                        CoBalance
                    </h1>
                    <p className="text-lg text-primary-300 max-w-xs mx-auto animate-fade-in">
                        Smart ledger & expense sharing for everyone
                    </p>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-in">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
                        <Wallet className="w-4 h-4 text-accent-400" />
                        <span className="text-sm text-primary-200 font-medium">Digital Ledger</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
                        <Users className="w-4 h-4 text-accent-400" />
                        <span className="text-sm text-primary-200 font-medium">Group Expenses</span>
                    </div>
                </div>

                {/* Auth Buttons */}
                <div className="w-full max-w-sm space-y-4 animate-slide-up">
                    {/* Login Button */}
                    <button
                        onClick={() => navigate('/auth/login')}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-primary-900 font-display font-semibold rounded-xl shadow-xl shadow-white/10 hover:shadow-2xl hover:shadow-white/20 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <LogIn className="w-5 h-5" />
                        <span>Login</span>
                        <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
                    </button>

                    {/* Create Account Button */}
                    <button
                        onClick={() => navigate('/auth/register')}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-display font-semibold rounded-xl shadow-xl shadow-accent-500/30 hover:shadow-2xl hover:shadow-accent-500/40 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center pb-8 px-6 relative z-10">
                <p className="text-sm text-primary-400">
                    By continuing, you agree to our{' '}
                    <a href="#" className="text-accent-400 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-accent-400 hover:underline">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
};

export default WelcomePage;
