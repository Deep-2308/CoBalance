import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import BottomNav from '../components/BottomNav';
import BalanceCard from '../components/BalanceCard';
import MonthSelector from '../components/MonthSelector';
import MonthlyChart from '../components/MonthlyChart';
import MonthlySummaryCards from '../components/MonthlySummaryCards';
import DailyTotalCard from '../components/DailyTotalCard';
import api from '../services/api';
import { getMonthlyReport } from '../services/reportsApi';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    // Monthly report state
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [monthlyData, setMonthlyData] = useState(null);
    const [monthLoading, setMonthLoading] = useState(true);

    // Check if selected month is current month
    const isCurrentMonth = selectedMonth === (now.getMonth() + 1) && selectedYear === now.getFullYear();

    useEffect(() => {
        fetchSummary();
    }, []);

    // Fetch monthly report when month/year changes
    const fetchMonthlyData = useCallback(async () => {
        try {
            setMonthLoading(true);
            const data = await getMonthlyReport(selectedMonth, selectedYear);
            setMonthlyData(data);
        } catch (err) {
            console.error('Failed to fetch monthly report:', err);
            setMonthlyData(null);
        } finally {
            setMonthLoading(false);
        }
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        fetchMonthlyData();
    }, [fetchMonthlyData]);

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

    const handleMonthChange = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);
    };

    // Filter activity by selected month
    const filteredActivity = summary?.activity?.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() + 1 === selectedMonth && itemDate.getFullYear() === selectedYear;
    }) || [];

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
        <div className="min-h-screen bg-surface-50">
            {/* Header - Warm gradient */}
            <div className="bg-gradient-warm text-white px-6 pt-8 pb-10 rounded-b-3xl shadow-soft-lg relative overflow-hidden">
                {/* Subtle texture overlay */}
                <div className="absolute inset-0 opacity-5 bg-noise pointer-events-none" />
                
                <div className="relative z-10">
                    <p className="text-primary-300 text-sm font-medium mb-1">Welcome back,</p>
                    <h1 className="text-2xl font-display font-bold tracking-tight">
                        {user?.name || 'User'}
                    </h1>
                </div>
            </div>

            <div className="page-container -mt-4">
                {/* Month Selector */}
                <div className="mb-4">
                    <MonthSelector
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                        onChange={handleMonthChange}
                    />
                </div>

                {/* Today's Spending (only for current month) */}
                {isCurrentMonth && monthlyData?.todaySpending && (
                    <div className="mb-4 animate-fade-in">
                        <DailyTotalCard
                            amount={monthlyData.todaySpending}
                            visible={true}
                        />
                    </div>
                )}

                {/* Monthly Summary Cards */}
                <div className="mb-4">
                    <MonthlySummaryCards
                        totals={monthlyData?.monthlyTotals}
                        loading={monthLoading}
                    />
                </div>

                {/* Monthly Chart */}
                <div className="mb-4">
                    <MonthlyChart
                        dailyTotals={monthlyData?.dailyTotals}
                        loading={monthLoading}
                    />
                </div>

                {/* Balance Cards */}
                <div className="space-y-3 mb-6">
                    <BalanceCard
                        title="Net Balance"
                        amount={summary?.netBalance || 0}
                        type={parseFloat(summary?.netBalance || 0) > 0 ? 'positive' : parseFloat(summary?.netBalance || 0) < 0 ? 'negative' : 'neutral'}
                        icon={Wallet}
                    />

                    <div className="grid grid-cols-2 gap-3">
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
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            to="/ledger/add-transaction"
                            className="card card-interactive group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-accent-100 rounded-xl group-hover:bg-accent-200 transition-colors">
                                    <Plus className="w-5 h-5 text-accent-600" />
                                </div>
                                <span className="font-display font-semibold text-primary-900">Add Transaction</span>
                            </div>
                        </Link>
                        <Link
                            to="/groups"
                            className="card card-interactive group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
                                    <Plus className="w-5 h-5 text-primary-700" />
                                </div>
                                <span className="font-display font-semibold text-primary-900">Add Expense</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity (filtered by month) */}
                <div className="mb-6">
                    <h2 className="section-title">
                        Activity ({new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'short' })} {selectedYear})
                    </h2>
                    {filteredActivity.length > 0 ? (
                        <div className="space-y-2">
                            {filteredActivity.slice(0, 10).map((item, index) => (
                                <div 
                                    key={index} 
                                    className="card card-interactive"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                item.type === 'transaction' 
                                                    ? 'bg-accent-100' 
                                                    : 'bg-primary-100'
                                            }`}>
                                                {item.type === 'transaction' ? (
                                                    <ArrowUpRight className="w-5 h-5 text-accent-600" />
                                                ) : (
                                                    <ArrowDownRight className="w-5 h-5 text-primary-600" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-primary-900 text-sm truncate">
                                                    {item.description}
                                                </p>
                                                <p className="text-xs text-surface-400">
                                                    {format(new Date(item.date), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-display font-bold text-primary-900 flex-shrink-0">
                                            ₹{parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card empty-state">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-100 flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-surface-400" />
                            </div>
                            <p className="empty-state-title">No activity this month</p>
                            <p className="empty-state-text">Start by adding a transaction or expense</p>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default DashboardPage;
