/**
 * Split Logic Utility
 * 
 * Pure functions for split bill calculations.
 * No React imports. No side effects. Deterministic output.
 * All amounts are in the same currency unit (e.g., INR).
 */

/**
 * Rounds a number to 2 decimal places
 * @param {number} value 
 * @returns {number}
 */
const roundTo2 = (value) => Math.round(value * 100) / 100;

/**
 * Splits totalAmount equally among participants.
 * Any rounding remainder is added to the FIRST participant.
 * 
 * @param {number} totalAmount - Total amount to split
 * @param {Array<{id: string, name: string}>} participants - List of participants
 * @returns {Array<{userId: string, name: string, amount: number}>}
 */
export const splitEqually = (totalAmount, participants) => {
  if (!participants || participants.length === 0) {
    return [];
  }

  const count = participants.length;
  const baseAmount = roundTo2(totalAmount / count);
  
  // Calculate initial splits
  const splits = participants.map((p, index) => ({
    userId: p.id,
    name: p.name,
    amount: baseAmount,
  }));

  // Calculate remainder and add to first participant
  const currentSum = baseAmount * count;
  const remainder = roundTo2(totalAmount - currentSum);
  
  if (remainder !== 0 && splits.length > 0) {
    splits[0].amount = roundTo2(splits[0].amount + remainder);
  }

  return splits;
};

/**
 * Validates and processes manual amount entries.
 * Returns the entries with validation status.
 * 
 * @param {number} totalAmount - Total amount to split
 * @param {Array<{userId: string, name: string, amount: number}>} entries - Manual amount entries
 * @returns {{splits: Array, isValid: boolean, remaining: number}}
 */
export const splitByAmount = (totalAmount, entries) => {
  if (!entries || entries.length === 0) {
    return { splits: [], isValid: false, remaining: totalAmount };
  }

  const sum = entries.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  const remaining = roundTo2(totalAmount - sum);

  const splits = entries.map(e => ({
    userId: e.userId,
    name: e.name,
    amount: roundTo2(parseFloat(e.amount) || 0),
  }));

  return {
    splits,
    isValid: remaining === 0,
    remaining,
  };
};

/**
 * Converts percentage-based splits to amounts.
 * Applies rounding normalization to ensure exact total.
 * 
 * @param {number} totalAmount - Total amount to split
 * @param {Array<{userId: string, name: string, percentage: number}>} percentages - Percentage entries
 * @returns {{splits: Array, isValid: boolean, percentageTotal: number}}
 */
export const splitByPercentage = (totalAmount, percentages) => {
  if (!percentages || percentages.length === 0) {
    return { splits: [], isValid: false, percentageTotal: 0 };
  }

  const percentageTotal = percentages.reduce((acc, p) => acc + (parseFloat(p.percentage) || 0), 0);
  const isValid = percentageTotal === 100;

  // Convert percentages to amounts
  const rawSplits = percentages.map(p => ({
    userId: p.userId,
    name: p.name,
    percentage: parseFloat(p.percentage) || 0,
    amount: roundTo2((totalAmount * (parseFloat(p.percentage) || 0)) / 100),
  }));

  // Normalize rounding if percentages are valid
  const splits = isValid ? normalizeRounding(totalAmount, rawSplits) : rawSplits;

  return {
    splits,
    isValid,
    percentageTotal,
  };
};

/**
 * Adjusts splits so the sum equals totalAmount exactly.
 * Adds/subtracts remainder from the first participant.
 * 
 * @param {number} totalAmount - Target total
 * @param {Array<{userId: string, name: string, amount: number}>} splits - Current splits
 * @returns {Array<{userId: string, name: string, amount: number}>}
 */
export const normalizeRounding = (totalAmount, splits) => {
  if (!splits || splits.length === 0) {
    return [];
  }

  const currentSum = splits.reduce((acc, s) => acc + s.amount, 0);
  const remainder = roundTo2(totalAmount - currentSum);

  if (remainder === 0) {
    return splits;
  }

  // Clone splits and adjust the first participant
  const normalizedSplits = splits.map((s, index) => ({
    ...s,
    amount: index === 0 ? roundTo2(s.amount + remainder) : s.amount,
  }));

  return normalizedSplits;
};

/**
 * Validates that splits sum to totalAmount.
 * 
 * @param {number} totalAmount - Expected total
 * @param {Array<{amount: number}>} splits - Split entries
 * @returns {{isValid: boolean, remaining: number, error: string|null}}
 */
export const validateSplit = (totalAmount, splits) => {
  if (!splits || splits.length === 0) {
    return { isValid: false, remaining: totalAmount, error: 'No participants selected' };
  }

  const sum = splits.reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0);
  const remaining = roundTo2(totalAmount - sum);

  if (remaining > 0) {
    return { isValid: false, remaining, error: `₹${remaining.toFixed(2)} remaining` };
  }

  if (remaining < 0) {
    return { isValid: false, remaining, error: `₹${Math.abs(remaining).toFixed(2)} excess` };
  }

  return { isValid: true, remaining: 0, error: null };
};

/**
 * Formats a split result for API submission.
 * 
 * @param {'equal'|'amount'|'percentage'} type - Split type
 * @param {Array<{userId: string, name: string, amount: number, percentage?: number}>} participants - Split details
 * @returns {Object} - split_details JSON object
 */
export const formatSplitDetails = (type, participants) => {
  return {
    type,
    participants: participants.map(p => ({
      userId: p.userId,
      name: p.name,
      amount: p.amount,
      ...(p.percentage !== undefined && { percentage: p.percentage }),
    })),
  };
};
