/**
 * Authentication Service Factory
 * 
 * Uses environment variable VITE_USE_MOCK_AUTH to determine which service to use:
 * - Development: MockAuthService (no backend required)
 * - Production: SupabaseAuthService (real backend API)
 * 
 * Vite's tree-shaking will remove unused code in production builds
 */

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

// Dynamic imports for better code splitting and tree-shaking
let authService;

if (USE_MOCK_AUTH) {
  // Development: Use mock service
  console.log('🔧 Auth Mode: MOCK (Development)');
  const { default: MockAuthService } = await import('./MockAuthService.js');
  authService = new MockAuthService();
} else {
  // Production: Use real service
  console.log('📡 Auth Mode: REAL (Production)');
  const { default: SupabaseAuthService } = await import('./SupabaseAuthService.js');
  authService = new SupabaseAuthService();
}

/**
 * Unified Authentication Service Interface
 * 
 * All auth operations should go through this service.
 * The implementation is swapped based on VITE_USE_MOCK_AUTH.
 */
export const AuthService = {
  // ============================================
  // LOGIN FLOW
  // ============================================
  
  /**
   * Send OTP for login (user must exist)
   * @param {string} identifier - Email or mobile number
   * @returns {Promise<{success: boolean, message: string, identifierType: string, _dev_otp?: string}>}
   */
  sendLoginOTP: (identifier) => authService.sendLoginOTP(identifier),

  /**
   * Verify OTP and login user
   * @param {string} identifier - Email or mobile number
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise<{success: boolean, token: string, user: Object}>}
   */
  verifyLoginOTP: (identifier, otp) => authService.verifyLoginOTP(identifier, otp),

  // ============================================
  // REGISTER FLOW
  // ============================================
  
  /**
   * Send OTP for registration (user must NOT exist)
   * @param {string} identifier - Email or mobile number
   * @returns {Promise<{success: boolean, message: string, identifierType: string, _dev_otp?: string}>}
   */
  sendRegisterOTP: (identifier) => authService.sendRegisterOTP(identifier),

  /**
   * Verify OTP for registration (returns temp token)
   * @param {string} identifier - Email or mobile number
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise<{success: boolean, tempToken: string, identifier: string, identifierType: string}>}
   */
  verifyRegisterOTP: (identifier, otp) => authService.verifyRegisterOTP(identifier, otp),

  /**
   * Complete registration with user details
   * @param {string} tempToken - Temporary registration token
   * @param {Object} userData - User data {name, userType, language, termsAccepted}
   * @returns {Promise<{success: boolean, token: string, user: Object}>}
   */
  completeRegistration: (tempToken, userData) => authService.completeRegistration(tempToken, userData),

  // ============================================
  // PROFILE MANAGEMENT
  // ============================================
  
  /**
   * Update user profile
   * @param {string} token - JWT token
   * @param {Object} userData - User data to update {name, language, userType}
   * @returns {Promise<{success: boolean, user: Object}>}
   */
  updateProfile: (token, userData) => authService.updateProfile(token, userData),

  /**
   * Get current authenticated user
   * @param {string} token - JWT token
   * @returns {Promise<{success: boolean, user: Object}>}
   */
  getCurrentUser: (token) => authService.getCurrentUser(token),
};

export default AuthService;

// Export flag for debugging/logging purposes
export const IS_MOCK_AUTH = USE_MOCK_AUTH;
