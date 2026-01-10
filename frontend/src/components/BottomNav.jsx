import { NavLink } from 'react-router-dom';
import { Home, Book, Users, TrendingUp } from 'lucide-react';

const BottomNav = () => {
    const navItems = [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/ledger', label: 'Ledger', icon: Book },
        { path: '/groups', label: 'Groups', icon: Users },
        { path: '/settlements', label: 'Settle', icon: TrendingUp },
    ];

    return (
        <nav className="bottom-nav">
            <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-colors ${isActive
                                ? 'text-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-2' : ''}`} />
                                <span className="text-xs font-medium">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
