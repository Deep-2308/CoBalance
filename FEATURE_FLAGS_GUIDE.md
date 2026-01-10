# Feature Flags System - CoBalance

## Overview

CoBalance uses environment-based feature flags to control authentication behavior across different environments.

## Folder Structure

```
frontend/src/services/auth/
├── index.js                 # Factory/Switcher (main export)
├── MockAuthService.js       # Development mock (tree-shaken in prod)
└── SupabaseAuthService.js   # Production real auth
```

## Environment Variables

### `VITE_USE_MOCK_AUTH`

Controls which authentication service is loaded:

- **`true`**: Uses `MockAuthService` (development only)

  - No backend required
  - Instant login with dummy data
  - All OTPs work (accepts any code)
  - Perfect for UI development

- **`false`**: Uses `SupabaseAuthService` (production)
  - Requires backend running
  - Real OTP verification
  - Actual database operations
  - Production-ready

## Configuration Files

### `.env.development`

```env
VITE_USE_MOCK_AUTH=false  # Change to 'true' for mock mode
```

### `.env.production`

```env
VITE_USE_MOCK_AUTH=false  # MUST be false
```

## Usage in Components

### Before (Hardcoded)

```javascript
// ❌ Old way - hardcoded in component
const mockUser = { id: "mock", name: "Demo" };
login(mockToken, mockUser);
```

### After (Feature Flag)

```javascript
// ✅ New way - uses service
import AuthService from "@/services/auth";

const handleLogin = async () => {
  const result = await AuthService.sendOTP(mobile);
  // Works with both mock and real backend!
};
```

## Example: LoginPage

```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService, { IS_MOCK_AUTH } from "@/services/auth";

const LoginPage = () => {
  const [mobile, setMobile] = useState("");
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();

    try {
      const formattedMobile = mobile.startsWith("+") ? mobile : `+91${mobile}`;

      const result = await AuthService.sendOTP(formattedMobile);

      // In mock mode, show OTP in alert
      if (IS_MOCK_AUTH && result._dev_otp) {
        alert(`Mock OTP: ${result._dev_otp}`);
      }

      navigate("/verify-otp", { state: { mobile: formattedMobile } });
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div>
      {IS_MOCK_AUTH && (
        <div className="dev-banner">🔧 Development Mode - Mock Auth Active</div>
      )}
      {/* rest of component */}
    </div>
  );
};
```

## Tree-Shaking in Production

When you build for production:

```bash
npm run build
```

Vite automatically:

1. ✅ Removes `MockAuthService.js` from bundle
2. ✅ Removes all mock-related code
3. ✅ Only includes `SupabaseAuthService.js`
4. ✅ Reduces bundle size

**Verification:**

```bash
# Build and check bundle
npm run build
# Check dist/assets/index-*.js
# MockAuthService code will NOT be present
```

## Switching Modes

### Enable Mock Auth (Development)

```bash
# Update .env.development
VITE_USE_MOCK_AUTH=true

# Restart dev server
npm run dev
```

### Disable Mock Auth (Test Real Backend)

```bash
# Update .env.development
VITE_USE_MOCK_AUTH=false

# Make sure backend is running!
cd ../backend
npm run dev

# Restart frontend
npm run dev
```

## Security Notes

1. ✅ Mock auth cannot be triggered in production builds
2. ✅ Environment variables are checked at build time
3. ✅ Unused code is tree-shaken automatically
4. ✅ `.env.production` should ALWAYS have `VITE_USE_MOCK_AUTH=false`

## Benefits

✨ **No Code Changes**: Switch modes via environment variable
✨ **Type Safe**: Same interface for both services  
✨ **Production Safe**: Mock code removed in builds
✨ **Developer Friendly**: Fast iteration without backend
✨ **Maintainable**: Clear separation of concerns

## Adding More Feature Flags

Want to add more flags? Follow this pattern:

```javascript
// 1. Create environment variable
VITE_ENABLE_ANALYTICS = true;

// 2. Create services
// services/analytics/MockAnalytics.js
// services/analytics/RealAnalytics.js

// 3. Create factory
// services/analytics/index.js
const USE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === "true";
// ... similar pattern
```

## Troubleshooting

**Q: Mock auth still running in production?**

- A: Check `.env.production` has `VITE_USE_MOCK_AUTH=false`
- A: Rebuild: `npm run build`

**Q: Changes not reflecting?**

- A: Restart dev server after changing `.env` files
- A: Clear browser cache

**Q: Want to test both modes?**

- A: Use two terminals with different env vars
- A: Or manually switch `.env.development` and restart

---

Happy coding! 🚀
