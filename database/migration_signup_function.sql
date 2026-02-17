-- Migration: Create RPC function for user signup
-- This bypasses PostgREST schema cache issues entirely
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION create_user_with_password(
    p_email TEXT,
    p_name TEXT,
    p_password_hash TEXT
)
RETURNS JSON AS $$
DECLARE
    new_user RECORD;
BEGIN
    INSERT INTO users (email, name, password_hash)
    VALUES (p_email, p_name, p_password_hash)
    RETURNING * INTO new_user;

    RETURN row_to_json(new_user);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create a function to check if user exists by email
CREATE OR REPLACE FUNCTION find_user_by_email(p_email TEXT)
RETURNS JSON AS $$
DECLARE
    found_user RECORD;
BEGIN
    SELECT * INTO found_user FROM users WHERE email = p_email LIMIT 1;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    RETURN row_to_json(found_user);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
