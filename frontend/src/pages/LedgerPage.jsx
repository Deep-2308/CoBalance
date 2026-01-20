import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, User } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import SortDropdown from '../components/SortDropdown';
import CategorySummary from '../components/CategorySummary';
import MonthSelector from '../components/MonthSelector';
import MonthlyChart from '../components/MonthlyChart';
import MonthlySummaryCards from '../components/MonthlySummaryCards';
import api from '../services/api';
import { getMonthlyReport } from '../services/reportsApi';
import { getBalanceUIMeta } from '../utils/transactionSemantics';

const LedgerPage = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        minAmount: '',
        maxAmount: '',
        balanceType: ''
    });
    const [sortBy, setSortBy] = useState('newest');

    // Monthly report state
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [monthlyData, setMonthlyData] = useState(null);
    const [monthLoading, setMonthLoading] = useState(true);

    // Debounce search for better performance
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Update date filters when month changes
    useEffect(() => {
        const startDate = new Date(selectedYear, selectedMonth - 1, 1);
        const endDate = new Date(selectedYear, selectedMonth, 0);
        
        setFilters(prev => ({
            ...prev,
            dateFrom: startDate.toISOString().split('T')[0],
            dateTo: endDate.toISOString().split('T')[0]
        }));
    }, [selectedMonth, selectedYear]);

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

    const fetchContacts = useCallback(async () => {
        try {
            setLoading(true);
            
            // Build query params
            const params = new URLSearchParams();
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.append('dateTo', filters.dateTo);
            if (filters.minAmount) params.append('minAmount', filters.minAmount);
            if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
            if (filters.balanceType) params.append('balanceType', filters.balanceType);
            if (sortBy) params.append('sortBy', sortBy);

            const url = `/ledger/contacts${params.toString() ? '?' + params.toString() : ''}`;
            const response = await api.get(url);
            
            if (response.data.mock || !response.data.contacts) {
                setContacts([]);
            } else {
                setContacts(response.data.contacts || []);
            }
        } catch (err) {
            console.error('Failed to fetch contacts:', err);
            setContacts([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, filters, sortBy]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const handleMonthChange = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);
    };

    const getBalanceColor = (balance) => {
        return getBalanceUIMeta(balance).colorClasses.text;
    };

    const getBalanceText = (balance) => {
        return getBalanceUIMeta(balance).label;
    };

    // Get initials from name
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-display font-bold text-primary-900">Ledger</h1>
                    <SortDropdown value={sortBy} onChange={setSortBy} />
                </div>

                {/* Month Selector */}
                <div className="mb-3">
                    <MonthSelector
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                        onChange={handleMonthChange}
                    />
                </div>

                {/* Search */}
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search contacts..."
                />
            </div>

            <div className="page-container">
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

                {/* Filter Panel */}
                <FilterPanel
                    filters={filters}
                    onFilterChange={setFilters}
                    showBalanceType={true}
                    className="mb-4"
                />

                {/* Category Summary */}
                <CategorySummary />

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
                            <p className="text-sm text-surface-500 font-medium">Loading contacts...</p>
                        </div>
                    </div>
                ) : contacts.length > 0 ? (
                    <div className="space-y-2 mt-4">
                        {contacts.map((contact, index) => (
                            <Link
                                key={contact.id}
                                to={`/ledger/contact/${contact.id}`}
                                className="card card-interactive block"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Avatar with initials */}
                                        <div className="avatar avatar-md flex-shrink-0">
                                            {getInitials(contact.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-display font-semibold text-primary-900 truncate">
                                                {contact.name}
                                            </p>
                                            <p className="text-xs text-surface-400 capitalize">
                                                {contact.type}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className={`font-display font-bold ${getBalanceColor(contact.balance)}`}>
                                            ₹{Math.abs(parseFloat(contact.balance)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-2xs text-surface-400">{getBalanceText(contact.balance)}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="card empty-state mt-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 flex items-center justify-center">
                            <User className="w-8 h-8 text-surface-300" />
                        </div>
                        <p className="empty-state-title">
                            {debouncedSearch || Object.values(filters).some(v => v) 
                                ? 'No contacts match your filters' 
                                : 'No contacts yet'}
                        </p>
                        <p className="empty-state-text">
                            {debouncedSearch || Object.values(filters).some(v => v)
                                ? 'Try adjusting your search or filters'
                                : 'Add a contact to start tracking'}
                        </p>
                    </div>
                )}
            </div>

            {/* Floating Add Button */}
            <Link
                to="/ledger/add-contact"
                className="fab"
                aria-label="Add contact"
            >
                <Plus className="w-6 h-6" />
            </Link>

            <BottomNav />
        </div>
    );
};

export default LedgerPage;
