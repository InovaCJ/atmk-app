-- Disable email confirmation requirement for new users
-- This allows users to sign up and be logged in immediately without email confirmation
UPDATE auth.config 
SET email_confirm = false;