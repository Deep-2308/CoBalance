import { useMemo } from 'react';
import { getCategoryById } from '../data/categories';

/**
 * CategoryPieChart - Pie chart showing spending by category
 * Pure SVG, no external chart library
 * 
 * @param {Array} transactions - Array of transaction objects with category and type fields
 * @param {boolean} loading - Show skeleton loader
 */

// Category colors - distinct, non-gradient, clear separation
const CATEGORY_COLORS = {
    food: '#f97316',      // Orange
    travel: '#3b82f6',    // Blue
    rent: '#8b5cf6',      // Purple
    utilities: '#eab308', // Yellow
    shopping: '#ec4899',  // Pink
    salary: '#22c55e',    // Green
    business_expense: '#6366f1', // Indigo
    other: '#94a3b8'      // Gray
};

const CategoryPieChart = ({ transactions = [], loading = false }) => {
    // Aggregate transactions by category - memoized
    const categoryData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        // Only include EXPENSE transactions (debit = money going out)
        const expenseTransactions = transactions.filter(
            txn => txn.type === 'debit' || txn.transaction_type === 'debit'
        );

        if (expenseTransactions.length === 0) return [];

        // Group by category
        const categoryTotals = {};
        expenseTransactions.forEach(txn => {
            const category = txn.category || 'other';
            const amount = parseFloat(txn.amount) || 0;
            
            if (amount > 0) {
                categoryTotals[category] = (categoryTotals[category] || 0) + amount;
            }
        });

        // Convert to array and filter out zero totals
        const result = Object.entries(categoryTotals)
            .filter(([_, total]) => total > 0)
            .map(([category, total]) => {
                const categoryInfo = getCategoryById(category);
                return {
                    category,
                    label: categoryInfo?.label || 'Other',
                    icon: categoryInfo?.icon || '📝',
                    total,
                    color: CATEGORY_COLORS[category] || CATEGORY_COLORS.other
                };
            })
            .sort((a, b) => b.total - a.total); // Sort by total descending

        return result;
    }, [transactions]);

    // Calculate pie chart slices
    const slices = useMemo(() => {
        if (categoryData.length === 0) return [];

        const total = categoryData.reduce((sum, cat) => sum + cat.total, 0);
        let cumulativeAngle = 0;

        return categoryData.map(cat => {
            const percentage = cat.total / total;
            const angle = percentage * 360;
            const startAngle = cumulativeAngle;
            const endAngle = cumulativeAngle + angle;
            cumulativeAngle = endAngle;

            return {
                ...cat,
                percentage: (percentage * 100).toFixed(1),
                startAngle,
                endAngle
            };
        });
    }, [categoryData]);

    // Convert polar to cartesian coordinates
    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians)
        };
    };

    // Generate SVG arc path
    const describeArc = (x, y, radius, startAngle, endAngle) => {
        // Handle full circle case
        if (endAngle - startAngle >= 359.99) {
            const midAngle = startAngle + 180;
            const start1 = polarToCartesian(x, y, radius, startAngle);
            const mid = polarToCartesian(x, y, radius, midAngle);
            const end1 = polarToCartesian(x, y, radius, endAngle);
            
            return [
                'M', start1.x, start1.y,
                'A', radius, radius, 0, 0, 1, mid.x, mid.y,
                'A', radius, radius, 0, 0, 1, end1.x, end1.y
            ].join(' ');
        }

        const start = polarToCartesian(x, y, radius, startAngle);
        const end = polarToCartesian(x, y, radius, endAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

        return [
            'M', x, y,
            'L', start.x, start.y,
            'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y,
            'Z'
        ].join(' ');
    };

    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="w-40 h-40 mx-auto bg-gray-200 rounded-full"></div>
                <div className="mt-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (categoryData.length === 0) {
        return (
            <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">Spending by Category</h3>
                <div className="py-8 text-center">
                    <p className="text-gray-500 text-sm">No spending data yet</p>
                </div>
            </div>
        );
    }

    const size = 160;
    const center = size / 2;
    const radius = 70;

    return (
        <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Spending by Category</h3>
            
            {/* Pie Chart */}
            <div className="flex justify-center mb-4">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {slices.map((slice, index) => (
                        <path
                            key={slice.category}
                            d={describeArc(center, center, radius, slice.startAngle, slice.endAngle)}
                            fill={slice.color}
                            stroke="white"
                            strokeWidth="2"
                        >
                            <title>{slice.label}: ₹{slice.total.toLocaleString('en-IN')}</title>
                        </path>
                    ))}
                </svg>
            </div>

            {/* Legend */}
            <div className="space-y-2">
                {slices.map(slice => (
                    <div key={slice.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-sm flex-shrink-0"
                                style={{ backgroundColor: slice.color }}
                            />
                            <span className="text-sm text-gray-700">{slice.icon} {slice.label}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                            ₹{slice.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryPieChart;
