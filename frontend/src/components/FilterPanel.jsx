import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

const FilterPanel = ({ 
    onFilterChange, 
    filters = {},
    showBalanceType = false,
    className = '' 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const handleChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const handleReset = () => {
        onFilterChange({
            dateFrom: '',
            dateTo: '',
            minAmount: '',
            maxAmount: '',
            balanceType: ''
        });
    };

    const hasActiveFilters = filters.dateFrom || filters.dateTo || 
        filters.minAmount || filters.maxAmount || filters.balanceType;

    return (
        <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
            {/* Toggle Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Filters</span>
                    {hasActiveFilters && (
                        <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                            Active
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
            </button>

            {/* Filter Controls */}
            {isExpanded && (
                <div className="p-4 pt-2 border-t border-gray-100 space-y-4">
                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                value={filters.dateFrom || ''}
                                onChange={(e) => handleChange('dateFrom', e.target.value)}
                                className="input text-sm"
                                placeholder="From"
                            />
                            <input
                                type="date"
                                value={filters.dateTo || ''}
                                onChange={(e) => handleChange('dateTo', e.target.value)}
                                className="input text-sm"
                                placeholder="To"
                            />
                        </div>
                    </div>

                    {/* Amount Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Amount Range
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                <input
                                    type="number"
                                    value={filters.minAmount || ''}
                                    onChange={(e) => handleChange('minAmount', e.target.value)}
                                    className="input text-sm pl-7"
                                    placeholder="Min"
                                    min="0"
                                />
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                <input
                                    type="number"
                                    value={filters.maxAmount || ''}
                                    onChange={(e) => handleChange('maxAmount', e.target.value)}
                                    className="input text-sm pl-7"
                                    placeholder="Max"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Balance Type (for Ledger) */}
                    {showBalanceType && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Balance Type
                            </label>
                            <select
                                value={filters.balanceType || ''}
                                onChange={(e) => handleChange('balanceType', e.target.value)}
                                className="input text-sm"
                            >
                                <option value="">All</option>
                                <option value="get">You'll Get</option>
                                <option value="owe">You Owe</option>
                            </select>
                        </div>
                    )}

                    {/* Reset Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                            <X className="w-4 h-4" />
                            Reset Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilterPanel;
