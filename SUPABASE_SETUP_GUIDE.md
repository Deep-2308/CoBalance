# Getting Supabase Credentials

Your database is set up! Now get your API credentials:

## Steps:

1. **In Supabase Dashboard**, click on your project
2. Go to **Settings** (gear icon on left sidebar)
3. Click **API** in the settings menu
4. You'll see these values:

### Copy These 3 Values:

**1. Project URL**

```
Example: https://abcdefghijklmno.supabase.co
```

**2. `anon` `public` key** (under "Project API keys")

```
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(very long string)
```

**3. `service_role` `secret` key** (under "Project API keys")

```
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(very long string - different from anon key)
⚠️ Keep this secret!
```

## Next Step:

Once you have these 3 values, update your `backend\.env` file:

```env
SUPABASE_URL=https://your-actual-url.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

JWT_SECRET=cobalance_jwt_secret_change_in_production

PORT=5000
NODE_ENV=development

OTP_PROVIDER=mock

FRONTEND_URL=http://localhost:5173
```

Then we'll start the backend server! 🚀
