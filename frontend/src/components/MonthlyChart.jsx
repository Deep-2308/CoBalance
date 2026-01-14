/**
 * MonthlyChart - Bar chart showing daily totals for a month
 * 
 * Uses simple SVG bars, no external chart library.
 * 
 * @param {Array} dailyTotals - [{ day, spent, received }]
 * @param {boolean} loading - Show skeleton loader
 */
const MonthlyChart = ({ dailyTotals = [], loading = false }) => {
    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (!dailyTotals || dailyTotals.length === 0) {
        return (
            <div className="card">
                <h3 className="font-bold text-gray-900 mb-3">Daily Activity</h3>
                <div className="h-40 flex items-center justify-center text-gray-500">
                    No data for this month
                </div>
            </div>
        );
    }

    // Calculate max value for scaling
    const maxValue = Math.max(
        ...dailyTotals.map(d => Math.max(parseFloat(d.spent), parseFloat(d.received))),
        1 // Minimum to avoid division by zero
    );

    const chartHeight = 140;
    const barWidth = 100 / dailyTotals.length; // Percentage width

    return (
        <div className="card">
            <h3 className="font-bold text-gray-900 mb-3">Daily Activity</h3>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mb-3 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-400 rounded"></div>
                    <span className="text-gray-600">Spent</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-400 rounded"></div>
                    <span className="text-gray-600">Received</span>
                </div>
            </div>

            {/* Chart Container */}
            <div className="relative overflow-x-auto">
                <svg 
                    viewBox={`0 0 ${dailyTotals.length * 20} ${chartHeight + 20}`}
                    className="w-full min-w-[400px]"
                    preserveAspectRatio="xMidYMid meet"
                >
                    {/* Bars */}
                    {dailyTotals.map((day, index) => {
                        const spent = parseFloat(day.spent);
                        const received = parseFloat(day.received);
                        const spentHeight = (spent / maxValue) * chartHeight;
                        const receivedHeight = (received / maxValue) * chartHeight;
                        const x = index * 20;
                        const barGap = 2;
                        
                        return (
                            <g key={day.day}>
                                {/* Spent bar (red) */}
                                {spent > 0 && (
                                    <rect
                                        x={x + barGap}
                                        y={chartHeight - spentHeight}
                                        width={7}
                                        height={spentHeight || 1}
                                        fill="#f87171"
                                        rx="1"
                                    >
                                        <title>Day {day.day}: Spent ₹{spent.toFixed(0)}</title>
                                    </rect>
                                )}
                                
                                {/* Received bar (green) */}
                                {received > 0 && (
                                    <rect
                                        x={x + 10}
                                        y={chartHeight - receivedHeight}
                                        width={7}
                                        height={receivedHeight || 1}
                                        fill="#4ade80"
                                        rx="1"
                                    >
                                        <title>Day {day.day}: Received ₹{received.toFixed(0)}</title>
                                    </rect>
                                )}
                                
                                {/* Day label (show every 5th day on mobile) */}
                                {(day.day === 1 || day.day % 5 === 0 || day.day === dailyTotals.length) && (
                                    <text
                                        x={x + 9}
                                        y={chartHeight + 14}
                                        textAnchor="middle"
                                        className="text-[8px] fill-gray-500"
                                    >
                                        {day.day}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                    
                    {/* X-axis line */}
                    <line
                        x1="0"
                        y1={chartHeight}
                        x2={dailyTotals.length * 20}
                        y2={chartHeight}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                    />
                </svg>
            </div>
        </div>
    );
};

export default MonthlyChart;
