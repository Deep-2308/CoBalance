import { ChevronDown } from 'lucide-react';

/**
 * MonthSelector - Month and year picker dropdown
 * 
 * @param {number} selectedMonth - 1-12
 * @param {number} selectedYear - e.g., 2026
 * @param {function} onChange - (month, year) => void
 */
const MonthSelector = ({ selectedMonth, selectedYear, onChange }) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear - 2; y <= currentYear + 1; y++) {
        years.push(y);
    }

    const handleMonthChange = (e) => {
        onChange(parseInt(e.target.value, 10), selectedYear);
    };

    const handleYearChange = (e) => {
        onChange(selectedMonth, parseInt(e.target.value, 10));
    };

    return (
        <div className="flex items-center gap-2">
            {/* Month Select */}
            <div className="relative">
                <select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="appearance-none bg-white border border-surface-200 rounded-xl px-4 py-2.5 pr-9 text-sm font-display font-semibold text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-500 cursor-pointer shadow-soft transition-all"
                >
                    {months.map((month, index) => (
                        <option key={month} value={index + 1}>
                            {month}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            </div>

            {/* Year Select */}
            <div className="relative">
                <select
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="appearance-none bg-white border border-surface-200 rounded-xl px-4 py-2.5 pr-9 text-sm font-display font-semibold text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-500 cursor-pointer shadow-soft transition-all"
                >
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            </div>
        </div>
    );
};

export default MonthSelector;
