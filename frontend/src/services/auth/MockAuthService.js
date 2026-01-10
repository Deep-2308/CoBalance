/**
 * MockAuthService - Development Only
 * Simulates authentication without backend calls
 * This code is tree-shaken in production builds
 */

class MockAuthService {
  /**
   * Simulate OTP send (always succeeds)
   */
  async sendOTP(mobile) {
    console.log('🔧 [MOCK] Sending OTP to:', mobile);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockOTP = '123456';
    console.log('🔧 [MOCK] Generated OTP:', mockOTP);
    
    return {
      success: true,
      message: 'Mock OTP sent successfully',
      _dev_otp: mockOTP
    };
  }

  /**
   * Simulate OTP verification (accepts any OTP)
   */
  async verifyOTP(mobile, otp) {
    console.log('🔧 [MOCK] Verifying OTP for:', mobile);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate mock user data
    const mockUser = {
      id: `mock_user_${Date.now()}`,
      mobile: mobile,
      name: null,
      language: 'en',
      isNewUser: true
    };
    
    const mockToken = `mock_jwt_token_${Date.now()}`;
    
    console.log('🔧 [MOCK] Login successful:', mockUser);
    
    return {
      success: true,
      token: mockToken,
      user: mockUser
    };
  }

  /**
   * Simulate profile update (always succeeds)
   */
  async updateProfile(token, userData) {
    console.log('🔧 [MOCK] Updating profile:', userData);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedUser = {
      id: 'mock_user_id',
      mobile: '+911234567890',
      name: userData.name,
      language: userData.language || 'en',
      isNewUser: false
    };
    
    console.log('🔧 [MOCK] Profile updated:', updatedUser);
    
    return {
      success: true,
      user: updatedUser
    };
  }

  /**
   * Simulate getting current user (always succeeds)
   */
  async getCurrentUser(token) {
    console.log('🔧 [MOCK] Fetching current user');
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const mockUser = {
      id: 'mock_user_id',
      mobile: '+911234567890',
      name: 'Mock User',
      language: 'en'
    };
    
    return {
      success: true,
      user: mockUser
    };
  }
}

export default MockAuthService;
