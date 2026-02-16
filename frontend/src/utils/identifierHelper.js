/**
 * Identifier Helper — Phone/Email detection and transform utilities
 * 
 * Phone users are stored with internal email format: +919876543210@cobalance.app
 * This helper converts between display format and internal format.
 */

const INTERNAL_DOMAIN = '@cobalance.app';

/**
 * Check if input looks like a phone number (digits, optional + prefix)
 */
export const isPhone = (input) => {
    if (!input) return false;
    const cleaned = input.replace(/[\s\-()]/g, '');
    return /^\+?[0-9]{10,15}$/.test(cleaned);
};

/**
 * Check if input is a real email (not an internal phone-email)
 */
export const isEmail = (input) => {
    if (!input) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) && !isInternalEmail(input);
};

/**
 * Check if email is an internal phone-based email (phone@cobalance.app)
 */
export const isInternalEmail = (email) => {
    if (!email) return false;
    return email.endsWith(INTERNAL_DOMAIN);
};

/**
 * Convert a phone number to internal email format
 * e.g. "9876543210" → "+919876543210@cobalance.app"
 */
export const phoneToInternalEmail = (phone) => {
    let cleaned = phone.replace(/[\s\-()]/g, '');
    // Add +91 prefix if no country code
    if (!cleaned.startsWith('+')) {
        cleaned = `+91${cleaned}`;
    }
    return `${cleaned}${INTERNAL_DOMAIN}`;
};

/**
 * Extract phone number from internal email
 * e.g. "+919876543210@cobalance.app" → "+919876543210"
 */
export const extractPhoneFromEmail = (email) => {
    if (!isInternalEmail(email)) return null;
    return email.replace(INTERNAL_DOMAIN, '');
};

/**
 * Detect input type: 'email', 'phone', or null
 */
export const detectIdentifierType = (input) => {
    if (!input || !input.trim()) return null;
    const trimmed = input.trim();
    if (trimmed.includes('@')) return 'email';
    if (isPhone(trimmed)) return 'phone';
    return null;
};

/**
 * Transform identifier for backend API — phones become internal emails
 */
export const transformForApi = (identifier) => {
    const type = detectIdentifierType(identifier);
    if (type === 'phone') {
        return phoneToInternalEmail(identifier.trim());
    }
    return identifier.trim();
};

/**
 * Get display-friendly identifier for a user object.
 * If email is internal (phone@cobalance.app), shows the phone number.
 * Otherwise shows the real email.
 */
export const getDisplayIdentifier = (user) => {
    if (!user) return '';
    
    const email = user.email;
    
    // If it's an internal phone-email, extract and show the phone
    if (isInternalEmail(email)) {
        return extractPhoneFromEmail(email);
    }
    
    // Otherwise show the real email
    return email || user.mobile || '';
};

/**
 * Get display-friendly email — returns null if it's an internal email
 */
export const getDisplayEmail = (email) => {
    if (!email || isInternalEmail(email)) return null;
    return email;
};

/**
 * Get display-friendly phone — from internal email or mobile field
 */
export const getDisplayPhone = (user) => {
    if (!user) return null;
    
    // Extract from internal email first
    if (isInternalEmail(user.email)) {
        return extractPhoneFromEmail(user.email);
    }
    
    // Fall back to mobile field
    return user.mobile || null;
};
