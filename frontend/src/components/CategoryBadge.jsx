import { getCategoryById } from '../data/categories';

/**
 * CategoryBadge - Small badge showing category icon and label
 * @param {string} category - Category ID
 * @param {string} size - 'sm' | 'md' (default: 'sm')
 */
const CategoryBadge = ({ category, size = 'sm' }) => {
    const cat = getCategoryById(category);
    
    if (!cat) return null;

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1'
    };

    return (
        <span 
            className={`inline-flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full ${sizeClasses[size]}`}
            title={cat.label}
        >
            <span>{cat.icon}</span>
            <span className="font-medium">{cat.label}</span>
        </span>
    );
};

export default CategoryBadge;
