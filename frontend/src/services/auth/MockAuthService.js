/**
 * MockAuthService - Development Only
 * Simulates authentication without backend calls
 * This code is tree-shaken in production builds
 * 
 * Updated for explicit Login/Register flows
 */

// Mock user database for consistent behavior
const mockUsers = new Map();

class MockAuthService {
  // ============================================
  // LOGIN FLOW
  // ============================================

  /**
   * Send OTP for login (simulates user existence check)
   */
  async sendLoginOTP(identifier) {
    console.log('🔧 [MOCK] Login OTP request for:', identifier);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user exists in mock database
    if (!mockUsers.has(identifier)) {
      // In mock mode, allow any login for testing
      console.log('🔧 [MOCK] User not found, but allowing for testing');
    }
    
    const mockOTP = '123456';
    console.log('🔧 [MOCK] Login OTP:', mockOTP);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      identifierType: identifier.includes('@') ? 'email' : 'mobile',
      _dev_otp: mockOTP
    };
  }

  /**
   * Verify OTP for login (issues full JWT)
   */
  async verifyLoginOTP(identifier, otp) {
    console.log('🔧 [MOCK] Verifying login OTP for:', identifier);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock: accept any 6-digit OTP
    if (otp.length !== 6) {
      throw new Error('Invalid OTP');
    }
    
    const isEmail = identifier.includes('@');
    const mockUser = {
      id: `mock_user_${Date.now()}`,
      email: isEmail ? identifier : null,
      mobile: isEmail ? null : identifier,
      name: 'Test User',
      userType: 'individual',
      language: 'en'
    };
    
    // Add to mock database
    mockUsers.set(identifier, mockUser);
    
    const mockToken = `mock_jwt_token_${Date.now()}`;
    
    console.log('🔧 [MOCK] Login successful:', mockUser);
    
    return {
      success: true,
      token: mockToken,
      user: mockUser
    };
  }

  // ============================================
  // REGISTER FLOW
  // ============================================

  /**
   * Send OTP for registration (simulates user non-existence check)
   */
  async sendRegisterOTP(identifier) {
    console.log('🔧 [MOCK] Register OTP request for:', identifier);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In mock mode, always allow registration
    const mockOTP = '123456';
    console.log('🔧 [MOCK] Register OTP:', mockOTP);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      identifierType: identifier.includes('@') ? 'email' : 'mobile',
      _dev_otp: mockOTP
    };
  }

  /**
   * Verify OTP for registration (returns temp token)
   */
  async verifyRegisterOTP(identifier, otp) {
    console.log('🔧 [MOCK] Verifying register OTP for:', identifier);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock: accept any 6-digit OTP
    if (otp.length !== 6) {
      throw new Error('Invalid OTP');
    }
    
    const identifierType = identifier.includes('@') ? 'email' : 'mobile';
    const tempToken = `mock_temp_token_${Date.now()}`;
    
    console.log('🔧 [MOCK] Register OTP verified, temp token issued');
    
    return {
      success: true,
      message: 'OTP verified. Please complete registration.',
      tempToken,
      identifier,
      identifierType
    };
  }

  /**
   * Complete registration with user details
   */
  async completeRegistration(tempToken, userData) {
    console.log('🔧 [MOCK] Completing registration:', userData);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Extract identifier from temp token (in real app, this comes from JWT)
    // For mock, we just create a new user
    const mockUser = {
      id: `mock_user_${Date.now()}`,
      email: null,
      mobile: null,
      name: userData.name,
      userType: userData.userType || 'individual',
      language: userData.language || 'en'
    };
    
    const token = `mock_jwt_token_${Date.now()}`;
    
    console.log('🔧 [MOCK] Registration complete:', mockUser);
    
    return {
      success: true,
      message: 'Account created successfully',
      token,
      user: mockUser
    };
  }

  // ============================================
  // PROFILE MANAGEMENT
  // ============================================

  /**
   * Update user profile
   */
  async updateProfile(token, userData) {
    console.log('🔧 [MOCK] Updating profile:', userData);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedUser = {
      id: 'mock_user_id',
      email: 'test@example.com',
      mobile: '+911234567890',
      name: userData.name,
      userType: userData.userType || 'individual',
      language: userData.language || 'en'
    };
    
    console.log('🔧 [MOCK] Profile updated:', updatedUser);
    
    return {
      success: true,
      user: updatedUser
    };
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(token) {
    console.log('🔧 [MOCK] Fetching current user');
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const mockUser = {
      id: 'mock_user_id',
      email: 'test@example.com',
      mobile: '+911234567890',
      name: 'Mock User',
      userType: 'individual',
      language: 'en'
    };
    
    return {
      success: true,
      user: mockUser
    };
  }
}

export default MockAuthService;
