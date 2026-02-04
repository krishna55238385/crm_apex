-- Performance Optimization: Add indexes for common queries
-- Run this migration to improve query performance

-- Leads table indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC);

-- Workflows table indexes
CREATE INDEX IF NOT EXISTS idx_workflows_trigger ON workflows(trigger_event);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);

-- Activities table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_leads_user_status ON leads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_workflows_user_active ON workflows(user_id, is_active);
