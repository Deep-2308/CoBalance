import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Send, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';
import ReminderConfirmModal from '../components/ReminderConfirmModal';
import CategoryBadge from '../components/CategoryBadge';
import { getTransactionUIMeta, getBalanceUIMeta } from '../utils/transactionSemantics';

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
        fetchLastReminder();
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
        const meta = getBalanceUIMeta(balance);
        return meta.colorClasses.text;
    };

    const getBalanceText = (balance) => {
        const meta = getBalanceUIMeta(balance);
        return meta.label;
    };

    const canSendReminder = () => {
        const bal = parseFloat(currentBalance);
        return bal > 0;
    };

    // Get initials from name
    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || '?';
    };

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
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="p-2 -ml-2 hover:bg-surface-100 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-surface-600" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="avatar avatar-md">
                                {getInitials(contact?.name)}
                            </div>
                            <div>
                                <h1 className="text-lg font-display font-bold text-primary-900">
                                    {contact?.name}
                                </h1>
                                <p className="text-xs text-surface-400 capitalize">{contact?.type}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-danger-500 hover:bg-danger-50 rounded-xl transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="page-container">
                {/* Balance Card */}
                <div className={`card mb-4 ${
                    parseFloat(currentBalance) > 0 
                        ? 'balance-card-positive' 
                        : parseFloat(currentBalance) < 0 
                            ? 'balance-card-negative' 
                            : 'balance-card-neutral'
                }`}>
                    <div className="text-center py-2">
                        <p className="text-sm text-surface-500 font-medium mb-1">
                            {getBalanceText(currentBalance)}
                        </p>
                        <p className={`text-4xl font-display font-bold ${getBalanceColor(currentBalance)}`}>
                            ₹{Math.abs(parseFloat(currentBalance)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                    <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 text-accent-700 text-sm">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>
                                Last reminder sent on {format(new Date(lastReminder.sent_at), 'MMM d, yyyy')} for ₹{parseFloat(lastReminder.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                )}

                {/* No Mobile Warning */}
                {canSendReminder() && !contact?.mobile && (
                    <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-4">
                        <p className="text-warning-700 text-sm">
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
                            <span className="text-sm font-display font-semibold text-surface-600">
                                Reminder History
                            </span>
                            {showHistory ? (
                                <ChevronUp className="w-4 h-4 text-surface-400" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-surface-400" />
                            )}
                        </button>
                        
                        {showHistory && (
                            <div className="space-y-2 mt-2">
                                {reminderHistory.length > 0 ? (
                                    reminderHistory.map((reminder) => (
                                        <div key={reminder.id} className="bg-surface-50 rounded-xl p-3 text-sm border border-surface-100">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-display font-semibold text-primary-900">
                                                    ₹{parseFloat(reminder.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-surface-400 text-xs">
                                                    {format(new Date(reminder.sent_at), 'MMM d, yyyy h:mm a')}
                                                </span>
                                            </div>
                                            <p className="text-surface-500 text-xs line-clamp-2">{reminder.message}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-surface-400 text-sm">Loading...</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Transactions */}
                <div>
                    <h2 className="section-title">Transaction History</h2>
                    {transactions.length > 0 ? (
                        <div className="space-y-2">
                            {transactions.map((txn, index) => {
                                const txnMeta = getTransactionUIMeta(txn.transaction_type);
                                return (
                                    <div 
                                        key={txn.id} 
                                        className="card"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className={`badge ${
                                                    txn.transaction_type === 'credit' 
                                                        ? 'badge-success' 
                                                        : 'badge-danger'
                                                }`}>
                                                    {txnMeta.label}
                                                </span>
                                                {txn.note && (
                                                    <p className="text-sm text-surface-600 mt-2">{txn.note}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-display font-bold ${
                                                    txn.transaction_type === 'credit' 
                                                        ? 'text-success-600' 
                                                        : 'text-danger-600'
                                                }`}>
                                                    {txnMeta.balanceEffect}₹{parseFloat(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-xs text-surface-400">
                                                    Balance: ₹{parseFloat(txn.running_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-surface-400">
                                                {format(new Date(txn.date), 'MMM d, yyyy')}
                                            </p>
                                            {txn.category && txn.category !== 'other' && (
                                                <CategoryBadge category={txn.category} size="sm" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="card empty-state">
                            <p className="empty-state-title">No transactions yet</p>
                            <p className="empty-state-text">Add your first transaction above</p>
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
