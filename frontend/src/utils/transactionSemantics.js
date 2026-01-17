/**
 * Transaction Semantics Helper
 * 
 * Single source of truth for transaction UI labels and colors.
 * Aligns with Khatabook mental model:
 * - CREDIT (You paid someone) → GREEN "You will get" → Contact owes YOU
 * - DEBIT (You received money) → RED "You gave" → YOU owe contact
 */

/**
 * Returns UI metadata for a transaction type.
 * @param {'credit' | 'debit'} type - The raw transaction type from DB
 * @returns {{ label: string, color: 'green' | 'red', action: string, balanceEffect: string, colorClasses: { bg: string, text: string, border: string } }}
 */
export const getTransactionUIMeta = (type) => {
  if (type === 'credit') {
    return {
      label: 'You will get',          // User-facing row label
      color: 'green',                 // Semantic color name
      action: 'You Paid',             // Button/form label
      description: 'Money you paid to contact',
      balanceEffect: '+',
      colorClasses: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-600',
        bgLight: 'bg-green-50',
        textBold: 'text-green-600',
      },
    };
  }
  // debit
  return {
    label: 'You gave',                // User-facing row label
    color: 'red',                     // Semantic color name
    action: 'You Received',           // Button/form label
    description: 'Money you received from contact',
    balanceEffect: '-',
    colorClasses: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-600',
      bgLight: 'bg-red-50',
      textBold: 'text-red-600',
    },
  };
};

/**
 * Returns UI metadata for a balance value.
 * @param {number | string} balance - The balance amount
 * @returns {{ label: string, color: 'green' | 'red' | 'gray', colorClasses: { text: string } }}
 */
export const getBalanceUIMeta = (balance) => {
  const bal = parseFloat(balance);
  if (bal > 0) {
    return {
      label: "You'll get",
      color: 'green',
      colorClasses: { text: 'text-green-600' },
    };
  }
  if (bal < 0) {
    return {
      label: 'You owe',
      color: 'red',
      colorClasses: { text: 'text-red-600' },
    };
  }
  return {
    label: 'Settled',
    color: 'gray',
    colorClasses: { text: 'text-gray-500' },
  };
};

// Transaction type constants (matching backend)
export const TRANSACTION_TYPES = {
  CREDIT: 'credit',   // You paid → You will get
  DEBIT: 'debit',     // You received → You gave
};
