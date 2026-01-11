/**
 * SupabaseAuthService - Production
 * Real authentication using backend API
 * 
 * Updated for explicit Login/Register flows
 */

import api from '../api';

class SupabaseAuthService {
  // ============================================
  // LOGIN FLOW
  // ============================================

  /**
   * Send OTP for login (user must exist)
   */
  async sendLoginOTP(identifier) {
    console.log('📡 [REAL] Sending login OTP to:', identifier);
    
    const response = await api.post('/auth/login/send-otp', { identifier });
    
    if (response.data._dev_otp) {
      console.log('🔐 [DEV] Your OTP:', response.data._dev_otp);
    }
    
    return response.data;
  }

  /**
   * Verify OTP and login user
   */
  async verifyLoginOTP(identifier, otp) {
    console.log('📡 [REAL] Verifying login OTP for:', identifier);
    
    const response = await api.post('/auth/login/verify-otp', { identifier, otp });
    
    console.log('✅ [REAL] Login successful');
    
    return response.data;
  }

  // ============================================
  // REGISTER FLOW
  // ============================================

  /**
   * Send OTP for registration (user must NOT exist)
   */
  async sendRegisterOTP(identifier) {
    console.log('📡 [REAL] Sending register OTP to:', identifier);
    
    const response = await api.post('/auth/register/send-otp', { identifier });
    
    if (response.data._dev_otp) {
      console.log('🔐 [DEV] Your OTP:', response.data._dev_otp);
    }
    
    return response.data;
  }

  /**
   * Verify OTP for registration (returns temp token)
   */
  async verifyRegisterOTP(identifier, otp) {
    console.log('📡 [REAL] Verifying register OTP for:', identifier);
    
    const response = await api.post('/auth/register/verify-otp', { identifier, otp });
    
    console.log('✅ [REAL] Register OTP verified');
    
    return response.data;
  }

  /**
   * Complete registration with user details
   */
  async completeRegistration(tempToken, userData) {
    console.log('📡 [REAL] Completing registration:', userData);
    
    const response = await api.post('/auth/register/complete', {
      tempToken,
      ...userData
    });
    
    console.log('✅ [REAL] Registration complete');
    
    return response.data;
  }

  // ============================================
  // PROFILE MANAGEMENT
  // ============================================

  /**
   * Update user profile
   */
  async updateProfile(token, userData) {
    console.log('📡 [REAL] Updating profile:', userData);
    
    const response = await api.post('/auth/update-profile', userData);
    
    console.log('✅ [REAL] Profile updated');
    
    return response.data;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(token) {
    console.log('📡 [REAL] Fetching current user');
    
    const response = await api.get('/auth/me');
    
    return response.data;
  }
}

export default SupabaseAuthService;
