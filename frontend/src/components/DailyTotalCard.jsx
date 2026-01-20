import { Banknote } from 'lucide-react';

/**
 * DailyTotalCard - Shows today's spending
 * Only visible when selected month is current month.
 * 
 * @param {string} amount - Today's spending amount
 * @param {boolean} visible - Whether to show the card
 */
const DailyTotalCard = ({ amount, visible = true }) => {
    if (!visible) {
        return null;
    }

    const spendAmount = parseFloat(amount || 0);

    return (
        <div className="card bg-gradient-to-r from-accent-50 to-accent-100/50 border-accent-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-accent-600" />
                    </div>
                    <span className="text-sm font-medium text-surface-600">Today's Spending</span>
                </div>
                <p className="text-xl font-display font-bold text-accent-700">
                    ₹{spendAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
            </div>
        </div>
    );
};

export default DailyTotalCard;
