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
        <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <Banknote className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Today's Spending</span>
                </div>
                <p className="text-lg font-bold text-amber-700">
                    ₹{spendAmount.toFixed(0)}
                </p>
            </div>
        </div>
    );
};

export default DailyTotalCard;
