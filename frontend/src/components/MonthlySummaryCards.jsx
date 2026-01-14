import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';

/**
 * MonthlySummaryCards - Display Total Spent, Total Received, Net Balance
 * 
 * @param {object} totals - { spent, received, net }
 * @param {boolean} loading - Show skeleton loader
 */
const MonthlySummaryCards = ({ totals, loading = false }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="card animate-pulse">
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!totals) {
        return null;
    }

    const spent = parseFloat(totals.spent || 0);
    const received = parseFloat(totals.received || 0);
    const net = parseFloat(totals.net || 0);

    return (
        <div className="grid grid-cols-3 gap-3">
            {/* Total Spent */}
            <div className="card p-3">
                <div className="flex items-center gap-1 mb-1">
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs text-gray-500">Spent</span>
                </div>
                <p className="text-lg font-bold text-red-600">
                    ₹{spent.toFixed(0)}
                </p>
            </div>

            {/* Total Received */}
            <div className="card p-3">
                <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-gray-500">Received</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                    ₹{received.toFixed(0)}
                </p>
            </div>

            {/* Net Balance */}
            <div className="card p-3">
                <div className="flex items-center gap-1 mb-1">
                    <Wallet className="w-3.5 h-3.5 text-primary-500" />
                    <span className="text-xs text-gray-500">Net</span>
                </div>
                <p className={`text-lg font-bold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{Math.abs(net).toFixed(0)}
                </p>
            </div>
        </div>
    );
};

export default MonthlySummaryCards;
