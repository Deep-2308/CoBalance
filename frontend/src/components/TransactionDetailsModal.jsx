import { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertCircle, Calendar, FileText, DollarSign } from 'lucide-react';
import api from '../services/api';
import CategorySelector from './CategorySelector';
import { getTransactionUIMeta } from '../utils/transactionSemantics';

/**
 * TransactionDetailsModal - View, Edit, and Delete a transaction
 * 
 * Props:
 *   isOpen: boolean - Modal visibility
 *   onClose: () => void - Close callback
 *   transaction: object - The transaction to view/edit
 *   onUpdated: () => void - Callback after successful update
 *   onDeleted: () => void - Callback after successful delete
 */
const TransactionDetailsModal = ({
    isOpen,
    onClose,
    transaction,
    onUpdated,
    onDeleted
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Form state
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [note, setNote] = useState('');
    const [category, setCategory] = useState('other');

    // Reset form when modal opens or transaction changes
    useEffect(() => {
        if (isOpen && transaction) {
            setAmount(parseFloat(transaction.amount).toString());
            setDate(transaction.date?.split('T')[0] || new Date().toISOString().split('T')[0]);
            setNote(transaction.note || '');
            setCategory(transaction.category || 'other');
            setIsEditing(false);
            setError('');
        }
    }, [isOpen, transaction]);

    const handleUpdate = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.put(`/ledger/transactions/${transaction.id}`, {
                amount: parseFloat(amount),
                date,
                note,
                category
            });

            setSuccessMessage('Transaction updated');
            setShowSuccess(true);

            if (onUpdated) {
                onUpdated();
            }

            setTimeout(() => {
                setShowSuccess(false);
                onClose();
            }, 1200);
        } catch (err) {
            console.error('Failed to update transaction:', err);
            setError(err.response?.data?.error || 'Failed to update. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.delete(`/ledger/transactions/${transaction.id}`);

            setSuccessMessage('Transaction deleted');
            setShowSuccess(true);

            if (onDeleted) {
                onDeleted();
            }

            setTimeout(() => {
                setShowSuccess(false);
                onClose();
            }, 1200);
        } catch (err) {
            console.error('Failed to delete transaction:', err);
            setError(err.response?.data?.error || 'Failed to delete. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !transaction) return null;

    const txnMeta = getTransactionUIMeta(transaction.transaction_type);
    const isCredit = transaction.transaction_type === 'credit';

    // Success state UI
    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm animate-slide-up p-8 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        successMessage.includes('deleted') ? 'bg-danger-100' : 'bg-emerald-100'
                    }`}>
                        {successMessage.includes('deleted') ? (
                            <Trash2 className="w-8 h-8 text-danger-600" />
                        ) : (
                            <Save className="w-8 h-8 text-emerald-600" />
                        )}
                    </div>
                    <h2 className="text-xl font-display font-bold text-primary-900">
                        {successMessage}
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-surface-100 sticky top-0 bg-white rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-display font-bold text-primary-900">
                            {isEditing ? 'Edit Transaction' : 'Transaction Details'}
                        </h2>
                        <span className={`badge ${isCredit ? 'badge-success' : 'badge-danger'}`}>
                            {txnMeta.label}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 hover:bg-surface-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-surface-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    {/* Amount */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-surface-600 mb-2">
                            <DollarSign className="w-4 h-4" />
                            Amount
                        </label>
                        {isEditing ? (
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-display font-bold text-primary-900">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="input pl-10 text-xl font-display font-bold"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        ) : (
                            <p className={`text-3xl font-display font-bold ${isCredit ? 'text-success-600' : 'text-danger-600'}`}>
                                {txnMeta.balanceEffect}₹{parseFloat(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        )}
                    </div>

                    {/* Date */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-surface-600 mb-2">
                            <Calendar className="w-4 h-4" />
                            Date
                        </label>
                        {isEditing ? (
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input"
                            />
                        ) : (
                            <p className="text-primary-900 font-medium">
                                {new Date(transaction.date).toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        )}
                    </div>

                    {/* Note */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-surface-600 mb-2">
                            <FileText className="w-4 h-4" />
                            Note
                        </label>
                        {isEditing ? (
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="input resize-none"
                                placeholder="Add a note..."
                                rows="2"
                            />
                        ) : (
                            <p className="text-primary-900">
                                {transaction.note || <span className="text-surface-400 italic">No note</span>}
                            </p>
                        )}
                    </div>

                    {/* Category (Edit mode only) */}
                    {isEditing && (
                        <CategorySelector
                            value={category}
                            onChange={setCategory}
                        />
                    )}

                    {/* Category Display (View mode) */}
                    {!isEditing && transaction.category && transaction.category !== 'other' && (
                        <div>
                            <label className="text-sm font-medium text-surface-600 mb-2 block">Category</label>
                            <span className="badge badge-neutral capitalize">{transaction.category}</span>
                        </div>
                    )}

                    {/* Running Balance Info */}
                    {!isEditing && transaction.running_balance !== undefined && (
                        <div className="bg-surface-50 rounded-xl p-3 border border-surface-100">
                            <p className="text-xs text-surface-500">Balance after this transaction</p>
                            <p className="font-display font-semibold text-primary-900">
                                ₹{parseFloat(transaction.running_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 text-danger-600 text-sm bg-danger-50 p-3 rounded-xl">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-surface-100 space-y-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleUpdate}
                                disabled={loading}
                                className="btn btn-primary w-full flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setError('');
                                    // Reset to original values
                                    setAmount(parseFloat(transaction.amount).toString());
                                    setDate(transaction.date?.split('T')[0] || '');
                                    setNote(transaction.note || '');
                                    setCategory(transaction.category || 'other');
                                }}
                                disabled={loading}
                                className="btn btn-secondary w-full"
                            >
                                Cancel Edit
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                disabled={loading}
                                className="btn btn-primary w-full"
                            >
                                Edit Transaction
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="w-full py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 text-danger-600 hover:bg-danger-50 border border-danger-200"
                            >
                                <Trash2 className="w-5 h-5" />
                                <span>{loading ? 'Deleting...' : 'Delete Transaction'}</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailsModal;
