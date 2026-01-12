import { ChevronDown } from 'lucide-react';
import { EXPENSE_CATEGORIES, getCategoryById, DEFAULT_CATEGORY } from '../data/categories';

/**
 * CategorySelector - Dropdown for selecting expense categories
 * @param {string} value - Selected category ID
 * @param {function} onChange - Callback when category changes
 * @param {string} className - Additional CSS classes
 */
const CategorySelector = ({ value = DEFAULT_CATEGORY, onChange, className = '' }) => {
    const selectedCategory = getCategoryById(value);

    return (
        <div className={`relative ${className}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="input appearance-none pr-10 cursor-pointer"
                >
                    {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
                Optional - helps organize your finances
            </p>
        </div>
    );
};

export default CategorySelector;
