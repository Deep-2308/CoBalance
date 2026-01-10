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
  /**
   * Send OTP to mobile number
   * @param {string} mobile - Mobile number with country code (e.g., +911234567890)
   * @returns {Promise<{success: boolean, message: string, _dev_otp?: string}>}
   */
  sendOTP: (mobile) => authService.sendOTP(mobile),

  /**
   * Verify OTP and authenticate user
   * @param {string} mobile - Mobile number
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise<{success: boolean, token: string, user: Object}>}
   */
  verifyOTP: (mobile, otp) => authService.verifyOTP(mobile, otp),

  /**
   * Update user profile
   * @param {string} token - JWT token
   * @param {Object} userData - User data to update {name, language}
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
