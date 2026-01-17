import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import api from '../services/api';
import QuickAddContactModal from '../components/QuickAddContactModal';
import CategorySelector from '../components/CategorySelector';
import { getTransactionUIMeta, TRANSACTION_TYPES } from '../utils/transactionSemantics';

const AddTransactionPage = () => {
    const [searchParams] = useSearchParams();
    const [contacts, setContacts] = useState([]);
    const [contactId, setContactId] = useState(searchParams.get('contactId') || '');
    const [amount, setAmount] = useState('');
    const [transactionType, setTransactionType] = useState('credit');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('other');
    const [loading, setLoading] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!contactId) {
            fetchContacts();
        }
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await api.get('/ledger/contacts');
            setContacts(response.data.contacts || []);
        } catch (err) {
            console.error('Failed to fetch contacts:', err);
        }
    };

    const handleQuickAddContact = async (contactData) => {
        try {
            // Create new contact
            const response = await api.post('/ledger/contacts', contactData);
            const newContact = response.data.contact;

            // Re-fetch contacts to update the list
            await fetchContacts();

            // Auto-select the newly created contact
            setContactId(newContact.id);

            return newContact;
        } catch (err) {
            console.error('Failed to create contact:', err);
            throw new Error(err.response?.data?.error || 'Failed to add contact');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/ledger/transactions', {
                contact_id: contactId,
                amount: parseFloat(amount),
                transaction_type: transactionType,
                note,
                date,
                category,
            });

            if (searchParams.get('contactId')) {
                navigate(`/ledger/contact/${contactId}`);
            } else {
                navigate('/ledger');
            }
        } catch (err) {
            console.error('Failed to add transaction:', err);
            alert('Failed to add transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Add Transaction</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="page-container">
                {!searchParams.get('contactId') && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Contact *
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={contactId}
                                onChange={(e) => setContactId(e.target.value)}
                                className="input flex-1"
                                required
                            >
                                <option value="">Choose a contact</option>
                                {contacts.map((contact) => (
                                    <option key={contact.id} value={contact.id}>
                                        {contact.name}
                                    </option>
                                ))}
                            </select>
                            
                            {/* Quick Add Button */}
                            <button
                                type="button"
                                onClick={() => setShowQuickAdd(true)}
                                className="btn bg-green-600 hover:bg-green-700 text-white px-4 flex items-center gap-2 shadow-md"
                                title="Quick Add Contact"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden sm:inline">Add</span>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Can't find your contact? Click the + button to add quickly
                        </p>
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount *
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-900">
                            ₹
                        </span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input pl-10 text-2xl font-bold"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction Type *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setTransactionType(TRANSACTION_TYPES.CREDIT)}
                            className={`p-4 rounded-lg border-2 transition-all ${transactionType === 'credit'
                                    ? `${getTransactionUIMeta('credit').colorClasses.border} ${getTransactionUIMeta('credit').colorClasses.bgLight}`
                                    : 'border-gray-200'
                                }`}
                        >
                            <p className="font-medium text-gray-900">{getTransactionUIMeta('credit').action}</p>
                            <p className="text-xs text-gray-500 mt-1">{getTransactionUIMeta('credit').description}</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setTransactionType(TRANSACTION_TYPES.DEBIT)}
                            className={`p-4 rounded-lg border-2 transition-all ${transactionType === 'debit'
                                    ? `${getTransactionUIMeta('debit').colorClasses.border} ${getTransactionUIMeta('debit').colorClasses.bgLight}`
                                    : 'border-gray-200'
                                }`}
                        >
                            <p className="font-medium text-gray-900">{getTransactionUIMeta('debit').action}</p>
                            <p className="text-xs text-gray-500 mt-1">{getTransactionUIMeta('debit').description}</p>
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note (Optional)
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="input"
                        placeholder="Add a note..."
                        rows="2"
                    />
                </div>

                <CategorySelector
                    value={category}
                    onChange={setCategory}
                    className="mb-4"
                />

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="input"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !contactId || !amount}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Transaction'}</span>
                </button>
            </form>

            {/* Quick Add Contact Modal */}
            <QuickAddContactModal
                isOpen={showQuickAdd}
                onClose={() => setShowQuickAdd(false)}
                onContactAdded={handleQuickAddContact}
            />
        </div>
    );
};

export default AddTransactionPage;
