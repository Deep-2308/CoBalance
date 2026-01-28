/**
 * WhatsApp Helper Utilities
 * 
 * Utility functions for generating WhatsApp deep links for payment reminders.
 * This is a frontend-only solution that opens WhatsApp with a pre-filled message.
 */

/**
 * Sanitizes a phone number for WhatsApp API.
 * - Removes spaces, dashes, parentheses
 * - Ensures country code (defaults to India +91 if not provided)
 * 
 * @param {string} phone - Raw phone number
 * @param {string} defaultCountryCode - Default country code (default: '91')
 * @returns {string} Sanitized phone number for wa.me
 */
export const sanitizePhoneNumber = (phone, defaultCountryCode = '91') => {
    if (!phone) return '';
    
    // Remove all non-numeric characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Handle different formats:
    // +919876543210 → 919876543210
    // 9876543210 → 919876543210
    // 09876543210 → 919876543210
    
    // Remove leading +
    if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
    }
    
    // Remove leading 0 (local format)
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    
    // If no country code (less than 11 digits for India), add default
    if (cleaned.length <= 10) {
        cleaned = defaultCountryCode + cleaned;
    }
    
    return cleaned;
};

/**
 * Generates a WhatsApp deep link with a pre-filled reminder message.
 * 
 * @param {string} phone - Contact's phone number
 * @param {string} name - Contact's name
 * @param {number} amount - Pending balance amount (should be positive)
 * @param {string} currencySymbol - Currency symbol (default: '₹')
 * @returns {string | null} WhatsApp URL or null if phone is invalid
 */
export const generateWhatsAppLink = (phone, name, amount, currencySymbol = '₹') => {
    const sanitizedPhone = sanitizePhoneNumber(phone);
    
    if (!sanitizedPhone || sanitizedPhone.length < 10) {
        return null;
    }
    
    // Format the amount nicely
    const formattedAmount = Math.abs(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Construct the reminder message
    const message = `Hello ${name}, your pending balance is ${currencySymbol}${formattedAmount}. Please pay at your earliest convenience. - Sent via CoBalance`;
    
    // URL encode the message
    const encodedMessage = encodeURIComponent(message);
    
    // Construct the WhatsApp deep link
    return `https://wa.me/${sanitizedPhone}?text=${encodedMessage}`;
};

/**
 * Opens WhatsApp with the reminder message.
 * 
 * @param {string} phone - Contact's phone number
 * @param {string} name - Contact's name
 * @param {number} amount - Pending balance amount
 * @returns {boolean} True if link was opened, false if phone was invalid
 */
export const openWhatsAppReminder = (phone, name, amount) => {
    const link = generateWhatsAppLink(phone, name, amount);
    
    if (!link) {
        return false;
    }
    
    window.open(link, '_blank');
    return true;
};
