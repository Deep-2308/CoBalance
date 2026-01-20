const BalanceCard = ({ title, amount, type = 'neutral', icon: Icon, onClick }) => {
    const getCardClass = () => {
        if (type === 'positive') return 'balance-card balance-card-positive';
        if (type === 'negative') return 'balance-card balance-card-negative';
        return 'balance-card balance-card-neutral';
    };

    const getTextClass = () => {
        if (type === 'positive') return 'text-success-600';
        if (type === 'negative') return 'text-danger-600';
        return 'text-surface-600';
    };

    const getIconBgClass = () => {
        if (type === 'positive') return 'bg-success-100/80';
        if (type === 'negative') return 'bg-danger-100/80';
        return 'bg-surface-100';
    };

    return (
        <div
            className={`${getCardClass()} ${onClick ? 'cursor-pointer hover:shadow-soft-md active:scale-[0.99]' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-500 font-medium mb-1 truncate">{title}</p>
                    <p className={`text-2xl font-display font-bold ${getTextClass()} truncate`}>
                        ₹{parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                {Icon && (
                    <div className={`p-3 rounded-xl ${getIconBgClass()} flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${getTextClass()}`} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default BalanceCard;
