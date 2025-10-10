-- Migration: Create Client Invites System
-- Description: Implements invitation system for client members

-- Create invite status enum
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- Client invites table
CREATE TABLE client_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role client_role NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status invite_status DEFAULT 'pending',
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, email)
);

-- Create indexes for performance
CREATE INDEX idx_client_invites_client_id ON client_invites(client_id);
CREATE INDEX idx_client_invites_email ON client_invites(email);
CREATE INDEX idx_client_invites_token ON client_invites(token);
CREATE INDEX idx_client_invites_status ON client_invites(status);

-- Add RLS policies for client_invites
ALTER TABLE client_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invites for clients they are members of
CREATE POLICY "Users can view invites for their clients" ON client_invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_members 
      WHERE client_members.client_id = client_invites.client_id 
      AND client_members.user_id = auth.uid()
    )
  );

-- Policy: Only client admins can create invites
CREATE POLICY "Only client admins can create invites" ON client_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_members 
      WHERE client_members.client_id = client_invites.client_id 
      AND client_members.user_id = auth.uid()
      AND client_members.role = 'client_admin'
    )
  );

-- Policy: Only client admins can update invites
CREATE POLICY "Only client admins can update invites" ON client_invites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM client_members 
      WHERE client_members.client_id = client_invites.client_id 
      AND client_members.user_id = auth.uid()
      AND client_members.role = 'client_admin'
    )
  );

-- Policy: Only client admins can delete invites
CREATE POLICY "Only client admins can delete invites" ON client_invites
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM client_members 
      WHERE client_members.client_id = client_invites.client_id 
      AND client_members.user_id = auth.uid()
      AND client_members.role = 'client_admin'
    )
  );

-- Function to automatically expire invites
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS void AS $$
BEGIN
  UPDATE client_invites 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' 
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_invites_updated_at
  BEFORE UPDATE ON client_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
