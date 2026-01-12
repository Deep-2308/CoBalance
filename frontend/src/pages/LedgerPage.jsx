import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, User } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import SortDropdown from '../components/SortDropdown';
import CategorySummary from '../components/CategorySummary';
import api from '../services/api';

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

    // Debounce search for better performance
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

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

    const getBalanceColor = (balance) => {
        const bal = parseFloat(balance);
        if (bal > 0) return 'text-green-600';
        if (bal < 0) return 'text-red-600';
        return 'text-gray-500';
    };

    const getBalanceText = (balance) => {
        const bal = parseFloat(balance);
        if (bal > 0) return "You'll get";
        if (bal < 0) return 'You owe';
        return 'Settled';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-2xl font-bold text-gray-900">Ledger</h1>
                    <SortDropdown value={sortBy} onChange={setSortBy} />
                </div>

                {/* Search */}
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search contacts..."
                />
            </div>

            <div className="page-container">
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
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : contacts.length > 0 ? (
                    <div className="space-y-3">
                        {contacts.map((contact) => (
                            <Link
                                key={contact.id}
                                to={`/ledger/contact/${contact.id}`}
                                className="card hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                                            <User className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{contact.name}</p>
                                            <p className="text-sm text-gray-500 capitalize">{contact.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${getBalanceColor(contact.balance)}`}>
                                            ₹{Math.abs(parseFloat(contact.balance)).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-500">{getBalanceText(contact.balance)}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12 mt-6">
                        <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">
                            {debouncedSearch || Object.values(filters).some(v => v) 
                                ? 'No contacts match your filters' 
                                : 'No contacts yet'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
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
                className="fixed bottom-24 right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg active:scale-95 transition-transform z-20"
            >
                <Plus className="w-6 h-6" />
            </Link>

            <BottomNav />
        </div>
    );
};

export default LedgerPage;
