/**
 * parserService.js - Natural Language Transaction Parser
 * 
 * Deterministic parser that converts text like "500 to Deep for Pizza"
 * into structured transaction objects. No external dependencies.
 */

/**
 * Direction keywords mapping
 */
const PAID_KEYWORDS = ['to', 'gave', 'paid', 'lent'];
const RECEIVED_KEYWORDS = ['from', 'got', 'received', 'borrowed'];

/**
 * Parse amount from input text
 * Supports: 500, 500.50, 1k, 1.5k, 2.5K
 * 
 * @param {string} text - Input text
 * @returns {{ amount: number | null, amountMatch: string | null }}
 */
const extractAmount = (text) => {
  // Match number with optional decimal, optionally followed by 'k' or 'K'
  const amountRegex = /(\d+(?:\.\d+)?)\s*([kK])?/;
  const match = text.match(amountRegex);
  
  if (!match) {
    return { amount: null, amountMatch: null };
  }
  
  let amount = parseFloat(match[1]);
  
  // Handle 'k' suffix (1k = 1000, 1.5k = 1500)
  if (match[2] && match[2].toLowerCase() === 'k') {
    amount *= 1000;
  }
  
  return { 
    amount, 
    amountMatch: match[0] 
  };
};

/**
 * Find best matching contact from input text
 * Uses case-insensitive matching with exact match preference
 * 
 * @param {string} text - Input text
 * @param {Array<{id: string, name: string}>} contacts - List of contacts
 * @returns {{ contactId: string | null, contactName: string, matchedName: string | null }}
 */
const matchContact = (text, contacts) => {
  if (!contacts || contacts.length === 0) {
    return { contactId: null, contactName: 'Unknown', matchedName: null };
  }
  
  const lowerText = text.toLowerCase();
  const tokens = lowerText.split(/\s+/);
  
  let bestMatch = null;
  let bestMatchLength = 0;
  
  for (const contact of contacts) {
    const contactNameLower = contact.name.toLowerCase();
    const contactTokens = contactNameLower.split(/\s+/);
    
    // Check for exact match (full name)
    if (lowerText.includes(contactNameLower)) {
      if (contactNameLower.length > bestMatchLength) {
        bestMatch = contact;
        bestMatchLength = contactNameLower.length;
      }
      continue;
    }
    
    // Check for partial match (first name / any token)
    for (const token of tokens) {
      for (const contactToken of contactTokens) {
        // Only match if token is meaningful (length > 1)
        if (token.length > 1 && contactToken === token) {
          if (contactToken.length > bestMatchLength) {
            bestMatch = contact;
            bestMatchLength = contactToken.length;
          }
        }
      }
    }
  }
  
  if (bestMatch) {
    return {
      contactId: bestMatch.id,
      contactName: bestMatch.name,
      matchedName: bestMatch.name
    };
  }
  
  return { contactId: null, contactName: 'Unknown', matchedName: null };
};

/**
 * Detect transaction direction from keywords
 * 
 * @param {string} text - Input text
 * @returns {'paid' | 'received'}
 */
const detectDirection = (text) => {
  const lowerText = text.toLowerCase();
  const tokens = lowerText.split(/\s+/);
  
  // Check received keywords first (higher priority)
  for (const keyword of RECEIVED_KEYWORDS) {
    if (tokens.includes(keyword)) {
      return 'received';
    }
  }
  
  // Check paid keywords
  for (const keyword of PAID_KEYWORDS) {
    if (tokens.includes(keyword)) {
      return 'paid';
    }
  }
  
  // Default to paid
  return 'paid';
};

/**
 * Extract note from input text by removing amount, contact name, and direction keywords
 * 
 * @param {string} text - Input text
 * @param {string | null} amountMatch - Matched amount string
 * @param {string | null} contactName - Matched contact name
 * @returns {string}
 */
const extractNote = (text, amountMatch, contactName) => {
  let result = text;
  
  // Remove amount
  if (amountMatch) {
    result = result.replace(amountMatch, '');
  }
  
  // Remove contact name (case-insensitive)
  if (contactName) {
    const nameRegex = new RegExp(contactName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = nameRegex.test(result) ? result.replace(nameRegex, '') : result;
  }
  
  // Remove direction keywords
  const allKeywords = [...PAID_KEYWORDS, ...RECEIVED_KEYWORDS];
  const tokens = result.split(/\s+/);
  const filteredTokens = tokens.filter(token => 
    !allKeywords.includes(token.toLowerCase())
  );
  result = filteredTokens.join(' ');
  
  // Clean leading 'for', 'on', etc.
  result = result.replace(/^\s*(for|on)\s+/i, '');
  
  // Clean extra whitespace
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
};

/**
 * Parse a natural language transaction string into a structured object
 * 
 * @param {string} inputText - Raw user input (e.g., "500 to Deep for Pizza")
 * @param {Array<{id: string, name: string}>} contacts - List of available contacts
 * @returns {{
 *   amount: number | null,
 *   contactId: string | null,
 *   contactName: string,
 *   direction: 'paid' | 'received',
 *   note: string
 * }}
 */
export const parseTransactionString = (inputText, contacts = []) => {
  if (!inputText || typeof inputText !== 'string') {
    return {
      amount: null,
      contactId: null,
      contactName: 'Unknown',
      direction: 'paid',
      note: ''
    };
  }
  
  const trimmedInput = inputText.trim();
  
  // Extract amount
  const { amount, amountMatch } = extractAmount(trimmedInput);
  
  // Match contact
  const { contactId, contactName, matchedName } = matchContact(trimmedInput, contacts);
  
  // Detect direction
  const direction = detectDirection(trimmedInput);
  
  // Extract note
  const note = extractNote(trimmedInput, amountMatch, matchedName);
  
  return {
    amount,
    contactId,
    contactName,
    direction,
    note
  };
};

export default parseTransactionString;
