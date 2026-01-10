/**
 * Supabase Client Configuration (Singleton)
 * 
 * This module initializes and exports the Supabase client for backend use.
 * Uses the service_role key which BYPASSES Row Level Security (RLS).
 * 
 * SECURITY NOTE:
 * - service_role key should NEVER be exposed to frontend
 * - It has full database access (admin privileges)
 * - Keep this key in .env and never commit it
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
  );
}

/**
 * Admin Supabase Client (Singleton)
 * 
 * Uses service_role key which:
 * - Bypasses Row Level Security (RLS)
 * - Has full admin access to database
 * - Should only be used in trusted backend code
 * 
 * Use this for:
 * - Admin operations (user management, bulk operations)
 * - Background jobs and cron tasks
 * - Data migrations
 * - Any operation that needs to bypass RLS
 */
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
});

/**
 * User-scoped Supabase Client Factory (Optional)
 * 
 * Creates a client scoped to a specific user's JWT token.
 * This respects Row Level Security (RLS) policies.
 * 
 * Use this when you want to:
 * - Enforce RLS even in backend
 * - Test RLS policies
 * - Maintain user context in backend operations
 * 
 * @param {string} userJWT - User's JWT token from authentication
 * @returns {SupabaseClient} User-scoped client
 */
export function createUserClient(userJWT) {
  if (!userJWT) {
    throw new Error('User JWT required for user-scoped client');
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${userJWT}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get Supabase Admin Client
 * 
 * This is the primary export for most backend operations.
 * 
 * @returns {SupabaseClient} Admin client instance
 */
export function getSupabaseAdmin() {
  return supabaseAdmin;
}

/**
 * Execute Raw SQL Query (Parameterized)
 * 
 * Safely executes SQL queries with parameter binding to prevent SQL injection.
 * 
 * @param {string} query - SQL query with $1, $2 placeholders
 * @param {Array} params - Array of parameter values
 * @returns {Promise<{data: any, error: any}>}
 * 
 * @example
 * const result = await executeSql(
 *   'SELECT * FROM users WHERE id = $1',
 *   ['user-123']
 * );
 */
export async function executeSql(query, params = []) {
  try {
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      query,
      params,
    });

    if (error) {
      console.error('SQL execution error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('SQL execution exception:', err);
    return { data: null, error: err };
  }
}

/**
 * Health Check
 * 
 * Verifies Supabase connection is working
 * 
 * @returns {Promise<boolean>}
 */
export async function healthCheck() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    return !error;
  } catch (err) {
    console.error('Supabase health check failed:', err);
    return false;
  }
}

// Default export (admin client)
export default supabaseAdmin;

// Named exports for flexibility
export { supabaseAdmin };
