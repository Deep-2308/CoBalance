import { useState, useEffect } from 'react';
import { PieChart } from 'lucide-react';
import api from '../services/api';

/**
 * CategorySummary - Shows category-wise totals for current month
 */
const CategorySummary = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const response = await api.get('/categories/summary');
            setSummary(response.data);
        } catch (err) {
            console.error('Failed to fetch category summary:', err);
            setError('Failed to load summary');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !summary) {
        return null; // Silently fail if no data
    }

    // Only show if there's data
    if (!summary.categories || summary.categories.length === 0) {
        return null;
    }

    // Sort by combined total (descending)
    const sortedCategories = [...summary.categories]
        .sort((a, b) => parseFloat(b.combinedTotal) - parseFloat(a.combinedTotal))
        .slice(0, 5); // Show top 5

    const grandTotal = summary.categories.reduce(
        (acc, cat) => acc + parseFloat(cat.combinedTotal), 0
    );

    return (
        <div className="card mb-4">
            <div className="flex items-center gap-2 mb-3">
                <PieChart className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-gray-900">
                    {summary.monthName} Spending
                </h3>
            </div>

            <div className="space-y-2">
                {sortedCategories.map((cat) => {
                    const percentage = grandTotal > 0 
                        ? (parseFloat(cat.combinedTotal) / grandTotal * 100).toFixed(0) 
                        : 0;

                    return (
                        <div key={cat.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{cat.icon}</span>
                                <span className="text-sm text-gray-700">{cat.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary-500 rounded-full transition-all"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-20 text-right">
                                    ₹{parseFloat(cat.combinedTotal).toFixed(0)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {summary.categories.length > 5 && (
                <p className="text-xs text-gray-500 mt-2 text-right">
                    +{summary.categories.length - 5} more categories
                </p>
            )}
        </div>
    );
};

export default CategorySummary;
