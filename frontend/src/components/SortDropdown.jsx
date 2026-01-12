import { ArrowUpDown } from 'lucide-react';

const SortDropdown = ({ value = 'newest', onChange, className = '' }) => {
    const options = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'amount_high', label: 'Amount: High to Low' },
        { value: 'amount_low', label: 'Amount: Low to High' }
    ];

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SortDropdown;
