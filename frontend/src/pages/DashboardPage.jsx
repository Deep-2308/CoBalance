import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import BottomNav from '../components/BottomNav';
import BalanceCard from '../components/BalanceCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const response = await api.get('/dashboard/summary');
            setSummary(response.data);
        } catch (err) {
            console.error('Failed to fetch summary:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-b-3xl shadow-lg">
                <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name || 'User'}!</h1>
                <p className="text-primary-100 text-sm">Here's your financial overview</p>
            </div>

            <div className="page-container">
                {/* Balance Cards */}
                <div className="grid gap-4 mt-6 mb-6">
                    <BalanceCard
                        title="Net Balance"
                        amount={summary?.netBalance || 0}
                        type={parseFloat(summary?.netBalance || 0) > 0 ? 'positive' : parseFloat(summary?.netBalance || 0) < 0 ? 'negative' : 'neutral'}
                        icon={Wallet}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <BalanceCard
                            title="You'll Get"
                            amount={summary?.totalYouGet || 0}
                            type="positive"
                            icon={TrendingUp}
                        />
                        <BalanceCard
                            title="You Owe"
                            amount={summary?.totalYouOwe || 0}
                            type="negative"
                            icon={TrendingDown}
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            to="/ledger/add-transaction"
                            className="card hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-100 rounded-lg">
                                    <Plus className="w-5 h-5 text-primary-600" />
                                </div>
                                <span className="font-medium text-gray-900">Add Transaction</span>
                            </div>
                        </Link>
                        <Link
                            to="/groups"
                            className="card hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-100 rounded-lg">
                                    <Plus className="w-5 h-5 text-primary-600" />
                                </div>
                                <span className="font-medium text-gray-900">Add Expense</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Activity</h2>
                    {summary?.activity && summary.activity.length > 0 ? (
                        <div className="space-y-2">
                            {summary.activity.slice(0, 10).map((item, index) => (
                                <div key={index} className="card hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'transaction' ? 'bg-blue-100' : 'bg-purple-100'
                                                }`}>
                                                {item.type === 'transaction' ? (
                                                    <ArrowUpRight className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <ArrowDownRight className="w-5 h-5 text-purple-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{item.description}</p>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(item.date), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">₹{parseFloat(item.amount).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center py-8">
                            <p className="text-gray-500">No recent activity</p>
                            <p className="text-sm text-gray-400 mt-1">Start by adding a transaction or expense</p>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default DashboardPage;
