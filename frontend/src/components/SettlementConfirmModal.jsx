import { useState } from 'react';
import { X, CheckCircle, AlertCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useLedger } from '../context/LedgerContext';

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
    const [error, setError] = useState('');
    const { settleContactOptimistic } = useLedger();

    const handleSettle = () => {
        setError('');
        
        // Use optimistic settlement - closes immediately
        settleContactOptimistic(
            contactId,
            balance,
            contactName,
            () => {
                // Success callback - trigger parent refresh and close
                if (onSettled) {
                    onSettled();
                }
            },
            (errorMsg) => {
                // Error callback - show error (rollback already handled)
                setError(errorMsg);
            }
        );
        
        // Close modal immediately (optimistic)
        onClose();
    };

    if (!isOpen) return null;

    const absBalance = Math.abs(balance);
    const isPositive = balance > 0;
    
    // Direction-based styling
    const colorClasses = isPositive 
        ? { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-100', amount: 'text-emerald-600' }
        : { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', iconBg: 'bg-rose-100', amount: 'text-rose-600' };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-surface-100">
                    <h2 className="text-lg font-display font-bold text-primary-900">Settle Up</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
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
                        className={`w-full py-3.5 rounded-xl font-display font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                            isPositive 
                                ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-soft'
                                : 'bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-soft'
                        }`}
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span>Settle Now</span>
                    </button>
                    <button
                        onClick={onClose}
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
