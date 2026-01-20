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
                    <div key={i} className="card p-4 animate-pulse">
                        <div className="h-3 bg-surface-200 rounded w-1/2 mb-2"></div>
                        <div className="h-5 bg-surface-200 rounded w-3/4"></div>
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
            <div className="card p-4">
                <div className="flex items-center gap-1.5 mb-2">
                    <TrendingDown className="w-3.5 h-3.5 text-danger-500" />
                    <span className="text-2xs text-surface-500 uppercase tracking-wide">Spent</span>
                </div>
                <p className="text-lg font-display font-bold text-danger-600">
                    ₹{spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
            </div>

            {/* Total Received */}
            <div className="card p-4">
                <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-success-500" />
                    <span className="text-2xs text-surface-500 uppercase tracking-wide">Received</span>
                </div>
                <p className="text-lg font-display font-bold text-success-600">
                    ₹{received.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
            </div>

            {/* Net Balance */}
            <div className="card p-4">
                <div className="flex items-center gap-1.5 mb-2">
                    <Wallet className="w-3.5 h-3.5 text-primary-600" />
                    <span className="text-2xs text-surface-500 uppercase tracking-wide">Net</span>
                </div>
                <p className={`text-lg font-display font-bold ${net >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    ₹{Math.abs(net).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
            </div>
        </div>
    );
};

export default MonthlySummaryCards;
