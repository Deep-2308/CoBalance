/**
 * SupabaseAuthService - Production
 * Real authentication using backend API
 */

import api from '../api';

class SupabaseAuthService {
  /**
   * Send OTP to mobile number via backend
   */
  async sendOTP(mobile) {
    console.log('📡 [REAL] Sending OTP to:', mobile);
    
    const response = await api.post('/auth/send-otp', { mobile });
    
    // Log dev OTP if provided (backend in development mode)
    if (response.data._dev_otp) {
      console.log('🔐 [DEV] Your OTP:', response.data._dev_otp);
    }
    
    return response.data;
  }

  /**
   * Verify OTP and authenticate user
   */
  async verifyOTP(mobile, otp) {
    console.log('📡 [REAL] Verifying OTP for:', mobile);
    
    const response = await api.post('/auth/verify-otp', { mobile, otp });
    
    console.log('✅ [REAL] Authentication successful');
    
    return response.data;
  }

  /**
   * Update user profile via backend
   */
  async updateProfile(token, userData) {
    console.log('📡 [REAL] Updating profile:', userData);
    
    // Token is already attached by API interceptor
    const response = await api.put('/auth/profile', userData);
    
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
