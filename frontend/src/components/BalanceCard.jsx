const BalanceCard = ({ title, amount, type = 'neutral', icon: Icon, onClick }) => {
    const getColorClass = () => {
        if (type === 'positive') return 'balance-positive';
        if (type === 'negative') return 'balance-negative';
        return 'balance-zero';
    };

    const getBgClass = () => {
        if (type === 'positive') return 'bg-green-50 border-green-200';
        if (type === 'negative') return 'bg-red-50 border-red-200';
        return 'bg-gray-50 border-gray-200';
    };

    return (
        <div
            className={`card ${getBgClass()} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className={`text-2xl font-bold ${getColorClass()}`}>
                        ₹{parseFloat(amount || 0).toFixed(2)}
                    </p>
                </div>
                {Icon && (
                    <div className={`p-3 rounded-full ${type === 'positive' ? 'bg-green-100' : type === 'negative' ? 'bg-red-100' : 'bg-gray-100'}`}>
                        <Icon className={`w-6 h-6 ${getColorClass()}`} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default BalanceCard;
