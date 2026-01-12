// Predefined expense categories for CoBalance (frontend)
// Matches backend/src/utils/categories.js

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

/**
 * Get category object by ID
 * @param {string} categoryId - Category ID
 * @returns {object} - Category object or default
 */
export const getCategoryById = (categoryId) => {
    return EXPENSE_CATEGORIES.find(c => c.id === categoryId) || 
           EXPENSE_CATEGORIES.find(c => c.id === DEFAULT_CATEGORY);
};
