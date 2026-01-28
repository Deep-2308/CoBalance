import { useState } from 'react';
import { X, CheckCircle, AlertCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import api from '../services/api';

/**
 * SettlementModal - Modal for settling contact balance to zero
 * 
 * This component uses the existing /ledger/transactions endpoint to create
 * a settlement transaction that zeroes out the balance.
 * 
 * Settlement Algorithm:
 * - If balance > 0 (They owe you): Create a "debit" transaction (You Received)
 * - If balance < 0 (You owe them): Create a "credit" transaction (You Paid)
 * 
 * Props:
 *   isOpen: boolean - Modal visibility
 *   onClose: () => void - Close callback
 *   contactName: string - Name of the contact
 *   balance: number - Current balance (positive = you'll get, negative = you owe)
 *   contactId: string - Contact ID for API call
 *   onSettled: () => void - Callback after successful settlement (triggers data refetch)
 */
const SettlementConfirmModal = ({
    isOpen,
    onClose,
    contactName,
    balance,
    contactId,
    onSettled
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSettle = async () => {
        setLoading(true);
        setError('');

        try {
            // Settlement Algorithm:
            // Positive balance (they owe you) → Create "debit" tx (You Received money)
            // Negative balance (you owe them) → Create "credit" tx (You Paid money)
            const transactionType = balance > 0 ? 'debit' : 'credit';
            
            const payload = {
                contact_id: contactId,
                amount: Math.abs(balance),
                transaction_type: transactionType,
                category: 'other', // "Settlement" is not in the category enum
                note: 'Settlement via CoBalance',
                date: new Date().toISOString().split('T')[0]
            };

            await api.post('/ledger/transactions', payload);
            
            // Show success state briefly
            setShowSuccess(true);
            
            // Trigger re-fetch of contact data to show updated balance
            if (onSettled) {
                onSettled();
            }
            
            // Close modal after brief success display
            setTimeout(() => {
                setShowSuccess(false);
                onClose();
            }, 1500);
            
        } catch (err) {
            console.error('Settlement failed:', err);
            setError(err.response?.data?.error || 'Failed to settle. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const absBalance = Math.abs(balance);
    const isPositive = balance > 0;
    
    // Direction-based styling
    const colorClasses = isPositive 
        ? { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-100', amount: 'text-emerald-600' }
        : { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', iconBg: 'bg-rose-100', amount: 'text-rose-600' };

    // Success state UI
    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm animate-slide-up p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-primary-900 mb-2">
                        Settled successfully!
                    </h2>
                    <p className="text-surface-500">
                        Balance with {contactName} is now ₹0
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-surface-100">
                    <h2 className="text-lg font-display font-bold text-primary-900">Settle Up</h2>
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
                    {/* Amount Display - Big & Bold */}
                    <div className="text-center py-4">
                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${colorClasses.iconBg} mb-4`}>
                            {isPositive 
                                ? <ArrowDownLeft className={`w-7 h-7 ${colorClasses.text}`} />
                                : <ArrowUpRight className={`w-7 h-7 ${colorClasses.text}`} />
                            }
                        </div>
                        <p className={`text-5xl font-display font-bold ${colorClasses.amount}`}>
                            ₹{absBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* Direction Message */}
                    <div className={`rounded-xl p-4 ${colorClasses.bg} ${colorClasses.border} border`}>
                        <p className={`text-center font-medium ${colorClasses.text}`}>
                            {isPositive 
                                ? `Receive full payment from ${contactName}`
                                : `Pay full amount to ${contactName}`
                            }
                        </p>
                    </div>

                    {/* Info note */}
                    <p className="text-xs text-surface-400 text-center">
                        This will record a settlement transaction and set the balance to ₹0
                    </p>

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
                    <button
                        onClick={handleSettle}
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl font-display font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                            isPositive 
                                ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-soft'
                                : 'bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-soft'
                        } disabled:opacity-50`}
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span>{loading ? 'Settling...' : 'Settle Now'}</span>
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="btn btn-secondary w-full"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettlementConfirmModal;
