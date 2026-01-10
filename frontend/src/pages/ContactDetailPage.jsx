import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Send, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';

const ContactDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [currentBalance, setCurrentBalance] = useState('0.00');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContactDetail();
    }, [id]);

    const fetchContactDetail = async () => {
        try {
            const response = await api.get(`/ledger/contacts/${id}`);
            setContact(response.data.contact);
            setTransactions(response.data.transactions);
            setCurrentBalance(response.data.currentBalance);
        } catch (err) {
            console.error('Failed to fetch contact:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendReminder = async () => {
        const balance = parseFloat(currentBalance);
        if (balance === 0) {
            alert('Balance is already settled');
            return;
        }

        try {
            const response = await api.post('/reminders/generate', {
                name: contact.name,
                mobile: '+911234567890', // TODO: Add mobile field to contacts
                amount: Math.abs(balance).toFixed(2),
            });

            window.open(response.data.whatsappLink, '_blank');
        } catch (err) {
            console.error('Failed to generate reminder:', err);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this contact? All transactions will be removed.')) return;

        try {
            await api.delete(`/ledger/contacts/${id}`);
            navigate('/ledger');
        } catch (err) {
            console.error('Failed to delete contact:', err);
            alert('Failed to delete contact');
        }
    };

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
        return 'Settled up';
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
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{contact?.name}</h1>
                            <p className="text-sm text-gray-500 capitalize">{contact?.type}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="page-container">
                {/* Balance Card */}
                <div className="card mb-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">{getBalanceText(currentBalance)}</p>
                        <p className={`text-4xl font-bold ${getBalanceColor(currentBalance)}`}>
                            ₹{Math.abs(parseFloat(currentBalance)).toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <Link
                        to={`/ledger/add-transaction?contactId=${id}`}
                        className="btn btn-primary text-center flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Transaction</span>
                    </Link>
                    <button
                        onClick={handleSendReminder}
                        className="btn btn-secondary flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        <span>Send Reminder</span>
                    </button>
                </div>

                {/* Transactions */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Transaction History</h2>
                    {transactions.length > 0 ? (
                        <div className="space-y-2">
                            {transactions.map((txn) => (
                                <div key={txn.id} className="card">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${txn.transaction_type === 'credit'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {txn.transaction_type === 'credit' ? 'You gave' : 'You got'}
                                            </span>
                                            {txn.note && (
                                                <p className="text-sm text-gray-600 mt-1">{txn.note}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${txn.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {txn.transaction_type === 'credit' ? '+' : '-'}₹{parseFloat(txn.amount).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Balance: ₹{parseFloat(txn.running_balance).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {format(new Date(txn.date), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center py-8">
                            <p className="text-gray-500">No transactions yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactDetailPage;
