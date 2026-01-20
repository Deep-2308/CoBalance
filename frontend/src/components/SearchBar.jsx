import { Search, X } from 'lucide-react';

const SearchBar = ({ 
    value = '', 
    onChange, 
    placeholder = 'Search...', 
    className = '' 
}) => {
    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="input pl-11 pr-11"
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-surface-100 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4 text-surface-400" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
