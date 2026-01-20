import { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

/**
 * SettlementConfirmModal - Confirmation modal for settling contact balance
 * 
 * Props:
 *   isOpen: boolean - Modal visibility
 *   onClose: () => void - Close callback
 *   contactName: string - Name of the contact
 *   balance: number - Current balance (positive = you'll get, negative = you owe)
 *   contactId: string - Contact ID for API call
 *   onSettled: () => void - Callback after successful settlement
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

    const handleSettle = async () => {
        setLoading(true);
        setError('');

        try {
            await api.post('/ledger/settle', { contactId });
            
            if (onSettled) {
                onSettled();
            }
            onClose();
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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Settle Up</h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Settlement Info */}
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">Settling with</p>
                        <p className="font-semibold text-gray-900 text-lg">{contactName}</p>
                        <p className={`text-3xl font-bold mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{absBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* Context Message */}
                    <div className={`rounded-lg p-3 ${isPositive ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-start gap-2">
                            <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                            <p className={`text-sm ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                                {isPositive 
                                    ? `Mark ₹${absBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} as settled? You've received the full amount.`
                                    : `Mark ₹${absBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} as settled? You've paid the full amount.`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 space-y-2">
                    <button
                        onClick={handleSettle}
                        disabled={loading}
                        className="btn btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span>{loading ? 'Settling...' : 'Confirm Settlement'}</span>
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
