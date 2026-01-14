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
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
                >
                    {months.map((month, index) => (
                        <option key={month} value={index + 1}>
                            {month}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Year Select */}
            <div className="relative">
                <select
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
                >
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
        </div>
    );
};

export default MonthSelector;
