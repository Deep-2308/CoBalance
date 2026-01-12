// Predefined expense categories for CoBalance
// Version 1: Simple, manual categorization

export const EXPENSE_CATEGORIES = [
    { id: 'food', label: 'Food', icon: '🍔' },
    { id: 'travel', label: 'Travel', icon: '✈️' },
    { id: 'rent', label: 'Rent', icon: '🏠' },
    { id: 'utilities', label: 'Utilities', icon: '💡' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'salary', label: 'Salary', icon: '💰' },
    { id: 'business_expense', label: 'Business Expense', icon: '💼' },
    { id: 'other', label: 'Other', icon: '📝' }
];

export const DEFAULT_CATEGORY = 'other';

// Get list of valid category IDs
export const VALID_CATEGORY_IDS = EXPENSE_CATEGORIES.map(c => c.id);

/**
 * Validate if a category ID is valid
 * @param {string} category - Category ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidCategory = (category) => {
    return VALID_CATEGORY_IDS.includes(category);
};

/**
 * Get category object by ID
 * @param {string} categoryId - Category ID
 * @returns {object|null} - Category object or null if not found
 */
export const getCategoryById = (categoryId) => {
    return EXPENSE_CATEGORIES.find(c => c.id === categoryId) || null;
};

/**
 * Sanitize and validate category, returning default if invalid
 * @param {string} category - Category to sanitize
 * @returns {string} - Valid category ID
 */
export const sanitizeCategory = (category) => {
    if (!category || !isValidCategory(category)) {
        return DEFAULT_CATEGORY;
    }
    return category;
};
