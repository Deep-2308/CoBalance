import { useState, useEffect } from 'react';
import { X, MessageCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

/**
 * ReminderConfirmModal - Confirmation modal before sending WhatsApp reminder
 * 
 * Props:
 *   isOpen: boolean - Modal visibility
 *   onClose: () => void - Close callback
 *   recipientName: string - Name of the person receiving reminder
 *   recipientMobile: string | null - Pre-filled mobile number (optional)
 *   amount: number - Pending amount
 *   contactId: string | null - For ledger contact reminders
 *   groupId: string | null - For group member reminders
 *   targetUserId: string | null - For group member reminders
 *   onReminderSent: () => void - Callback after reminder is logged
 */
const ReminderConfirmModal = ({
    isOpen,
    onClose,
    recipientName,
    recipientMobile,
    amount,
    contactId = null,
    groupId = null,
    targetUserId = null,
    onReminderSent
}) => {
    const [mobile, setMobile] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setMobile(recipientMobile || '');
            setMessage(
                `Hi ${recipientName}, this is a friendly reminder about the pending balance of ₹${Math.abs(amount).toFixed(2)}. Please settle when convenient. Thank you!`
            );
            setError('');
        }
    }, [isOpen, recipientName, recipientMobile, amount]);

    const handleOpenWhatsApp = async () => {
        // Validate mobile number
        const cleanedMobile = mobile.replace(/[^0-9+]/g, '');
        if (!cleanedMobile || cleanedMobile.length < 10) {
            setError('Please enter a valid mobile number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Log the reminder first
            await api.post('/reminders/log', {
                contactId,
                groupId,
                targetUserId,
                recipientName,
                recipientMobile: cleanedMobile,
                amount: Math.abs(amount),
                message
            });

            // Generate WhatsApp link
            const encodedMessage = encodeURIComponent(message);
            const whatsappNumber = cleanedMobile.replace(/[^0-9]/g, '');
            const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

            // Open WhatsApp in new tab
            window.open(whatsappLink, '_blank');

            // Notify parent and close
            if (onReminderSent) {
                onReminderSent();
            }
            onClose();
        } catch (err) {
            console.error('Failed to log reminder:', err);
            setError('Failed to send reminder. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Send Reminder</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Recipient Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Sending to</p>
                        <p className="font-semibold text-gray-900">{recipientName}</p>
                        <p className="text-lg font-bold text-green-600">
                            ₹{Math.abs(amount).toFixed(2)}
                        </p>
                    </div>

                    {/* Mobile Number Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            WhatsApp Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="input"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Include country code (e.g., +91 for India)
                        </p>
                    </div>

                    {/* Message Preview */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="input resize-none"
                        />
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
                        onClick={handleOpenWhatsApp}
                        disabled={loading}
                        className="btn btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span>{loading ? 'Opening...' : 'Open WhatsApp'}</span>
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

export default ReminderConfirmModal;
