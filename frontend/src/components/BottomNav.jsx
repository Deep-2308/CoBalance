import { NavLink } from 'react-router-dom';
import { Home, Book, Users, TrendingUp, User } from 'lucide-react';

const BottomNav = () => {
    const navItems = [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/ledger', label: 'Ledger', icon: Book },
        { path: '/groups', label: 'Groups', icon: Users },
        { path: '/settlements', label: 'Settle', icon: TrendingUp },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <nav className="bottom-nav">
            <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                                isActive
                                    ? 'text-primary-900'
                                    : 'text-surface-400 hover:text-surface-600'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Active indicator pill */}
                                {isActive && (
                                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-500" />
                                )}
                                <item.icon 
                                    className={`w-5 h-5 mb-0.5 transition-transform duration-200 ${
                                        isActive ? 'scale-110' : ''
                                    }`} 
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className={`text-2xs font-medium transition-colors ${
                                    isActive ? 'font-semibold' : ''
                                }`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
