import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, User } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import api from '../services/api';

const LedgerPage = () => {
    const [contacts, setContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await api.get('/ledger/contacts');
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
    };

    const filteredContacts = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Ledger</h1>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search contacts..."
                        className="input pl-10"
                    />
                </div>
            </div>

            <div className="page-container">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredContacts.length > 0 ? (
                    <div className="space-y-3">
                        {filteredContacts.map((contact) => (
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
                        <p className="text-gray-500 font-medium">No contacts yet</p>
                        <p className="text-sm text-gray-400 mt-1">Add a contact to start tracking</p>
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
