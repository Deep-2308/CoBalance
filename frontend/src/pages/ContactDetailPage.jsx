import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Send, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';
import ReminderConfirmModal from '../components/ReminderConfirmModal';

const ContactDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [currentBalance, setCurrentBalance] = useState('0.00');
    const [loading, setLoading] = useState(true);
    
    // Reminder state
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [lastReminder, setLastReminder] = useState(null);
    const [reminderHistory, setReminderHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        fetchContactDetail();
        fetchLastReminder();
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

    const fetchLastReminder = async () => {
        try {
            const response = await api.get(`/reminders/contact/${id}/last`);
            setLastReminder(response.data.lastReminder);
        } catch (err) {
            console.error('Failed to fetch last reminder:', err);
        }
    };

    const fetchReminderHistory = async () => {
        try {
            const response = await api.get(`/reminders/contact/${id}`);
            setReminderHistory(response.data.reminders);
        } catch (err) {
            console.error('Failed to fetch reminder history:', err);
        }
    };

    const handleReminderSent = () => {
        // Refresh last reminder info
        fetchLastReminder();
        // Refresh history if it's open
        if (showHistory) {
            fetchReminderHistory();
        }
    };

    const toggleHistory = () => {
        if (!showHistory && reminderHistory.length === 0) {
            fetchReminderHistory();
        }
        setShowHistory(!showHistory);
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

    // Check if reminder can be sent
    const canSendReminder = () => {
        const bal = parseFloat(currentBalance);
        // Can send reminder if there's a positive balance (they owe you)
        return bal > 0;
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
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <Link
                        to={`/ledger/add-transaction?contactId=${id}`}
                        className="btn btn-primary text-center flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Transaction</span>
                    </Link>
                    
                    {canSendReminder() ? (
                        <button
                            onClick={() => setShowReminderModal(true)}
                            className="btn btn-secondary flex items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            <span>Send Reminder</span>
                        </button>
                    ) : (
                        <button
                            disabled
                            className="btn btn-secondary flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                            title={parseFloat(currentBalance) === 0 ? "Balance is settled" : "You owe them money"}
                        >
                            <Send className="w-4 h-4" />
                            <span>Send Reminder</span>
                        </button>
                    )}
                </div>

                {/* Last Reminder Info */}
                {lastReminder && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-blue-700 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>
                                Last reminder sent on {format(new Date(lastReminder.sent_at), 'MMM d, yyyy')} for ₹{parseFloat(lastReminder.amount).toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}

                {/* No Mobile Warning */}
                {canSendReminder() && !contact?.mobile && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <p className="text-amber-700 text-sm">
                            No mobile number saved. You'll need to enter it when sending a reminder.
                        </p>
                    </div>
                )}

                {/* Reminder History (Collapsible) */}
                {lastReminder && (
                    <div className="mb-6">
                        <button
                            onClick={toggleHistory}
                            className="flex items-center justify-between w-full text-left py-2"
                        >
                            <span className="text-sm font-medium text-gray-700">Reminder History</span>
                            {showHistory ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                        </button>
                        
                        {showHistory && (
                            <div className="space-y-2 mt-2">
                                {reminderHistory.length > 0 ? (
                                    reminderHistory.map((reminder) => (
                                        <div key={reminder.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-gray-900">
                                                    ₹{parseFloat(reminder.amount).toFixed(2)}
                                                </span>
                                                <span className="text-gray-500 text-xs">
                                                    {format(new Date(reminder.sent_at), 'MMM d, yyyy h:mm a')}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-xs line-clamp-2">{reminder.message}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">Loading...</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

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

            {/* Reminder Modal */}
            <ReminderConfirmModal
                isOpen={showReminderModal}
                onClose={() => setShowReminderModal(false)}
                recipientName={contact?.name || ''}
                recipientMobile={contact?.mobile || ''}
                amount={parseFloat(currentBalance)}
                contactId={id}
                onReminderSent={handleReminderSent}
            />
        </div>
    );
};

export default ContactDetailPage;
