-- Users Table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar_url TEXT,
    role ENUM('user', 'admin', 'super_admin') NOT NULL DEFAULT 'user',
    status ENUM('Active', 'Invited', 'Suspended') NOT NULL DEFAULT 'Invited',
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_active DATETIME,
    primary_mfa_method ENUM('Authenticator App', 'SMS'),
    last_mfa_verification DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Invites Table
CREATE TABLE invites (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'super_admin') NOT NULL,
    invited_by VARCHAR(255) NOT NULL,
    invite_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATETIME,
    status ENUM('Pending', 'Expired') DEFAULT 'Pending',
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Leads Table
CREATE TABLE leads (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status ENUM('New', 'Contacted', 'Qualified', 'Lost') NOT NULL DEFAULT 'New',
    owner_id VARCHAR(255),
    deal_score INT DEFAULT 0,
    enriched_data JSON,
    temperature ENUM('Hot', 'Warm', 'Cold') DEFAULT 'Cold',
    last_interaction_type ENUM('Email', 'Call', 'Meeting', 'None', 'AI Update'),
    last_interaction_date DATETIME,
    last_interaction_summary TEXT,
    ai_score_reason TEXT,
    follow_up_status ENUM('Pending', 'Overdue', 'None'),
    hygiene_status ENUM('Clean', 'Duplicate Suspected', 'Incomplete Data'),
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Deals Table
CREATE TABLE deals (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lead_id VARCHAR(255) NOT NULL,
    stage ENUM('Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed - Won', 'Closed - Lost') NOT NULL,
    value DECIMAL(15, 2) DEFAULT 0,
    close_date DATETIME,
    owner_id VARCHAR(255),
    probability DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tasks Table
CREATE TABLE tasks (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    due_date DATETIME,
    completed BOOLEAN DEFAULT FALSE,
    assigned_to_id VARCHAR(255),
    related_deal_id VARCHAR(255),
    related_lead_id VARCHAR(255),
    status ENUM('Focus Now', 'Today', 'Upcoming', 'Overdue', 'Completed') NOT NULL,
    priority INT,
    ai_reason TEXT,
    intent ENUM('High-value deal', 'No reply in 3 days', 'Deal at risk', 'Initial outreach', 'Manual task'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (related_deal_id) REFERENCES deals(id) ON DELETE SET NULL,
    FOREIGN KEY (related_lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

-- FollowUps Table
CREATE TABLE follow_ups (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    lead_id VARCHAR(255) NOT NULL,
    deal_id VARCHAR(255),
    due_date DATETIME,
    priority_score INT,
    status ENUM('Overdue', 'Due', 'Upcoming', 'Completed') NOT NULL,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    last_interaction_summary TEXT,
    ai_suggested_message TEXT,
    ai_best_time_to_contact DATETIME,
    action_type ENUM('Email', 'Call', 'WhatsApp', 'Task'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL
);

-- Communications Table
CREATE TABLE communications (
    id VARCHAR(255) PRIMARY KEY,
    type ENUM('Email', 'WhatsApp', 'SMS', 'Call') NOT NULL,
    contact_id VARCHAR(255) NOT NULL,
    summary TEXT,
    timestamp DATETIME NOT NULL,
    direction ENUM('inbound', 'outbound') NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- Attendance Table
CREATE TABLE attendance (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late', 'On Leave', 'Half Day') NOT NULL,
    check_in_time DATETIME,
    check_out_time DATETIME,
    work_from_home BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Activity Logs Table
CREATE TABLE activity_logs (
    id VARCHAR(255) PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    actor_id VARCHAR(255),
    actor_name VARCHAR(255), -- "AI System" or User Name fallback
    action ENUM('CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'LOGIN', 'LOGOUT', 'CHECK_IN', 'CHECK_OUT', 'COMPLETE', 'EXECUTE', 'OVERRIDE', 'VIEW') NOT NULL,
    target_type ENUM('Lead', 'Deal', 'Task', 'FollowUp', 'User', 'Automation', 'Attendance', 'Setting', 'Role', 'ActivityLog') NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    target_name VARCHAR(255),
    summary TEXT,
    details_before TEXT, -- Serialized JSON or text
    details_after TEXT,  -- Serialized JSON or text
    details_reason TEXT,
    details_confidence DECIMAL(5, 4),
    source ENUM('Manual', 'AI', 'System', 'Automation') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications Table
CREATE TABLE notifications (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Assumed connection to User
    type ENUM('AI', 'Task', 'Deal', 'System', 'Lead') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions Table
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    device_type ENUM('Web', 'Mobile', 'Tablet'),
    browser VARCHAR(255),
    os VARCHAR(255),
    ip_address VARCHAR(45),
    location VARCHAR(255),
    login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME,
    is_mfa_verified BOOLEAN DEFAULT FALSE,
    risk_level ENUM('Low', 'Medium', 'High'),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Workflow Templates Table
CREATE TABLE workflow_templates (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('Lead Management', 'Follow-ups & SLA', 'CRM Hygiene', 'AI Insights', 'Assignment & Routing', 'Notifications'),
    trigger_summary TEXT,
    action_summary TEXT,
    has_ai BOOLEAN DEFAULT FALSE,
    risk_level ENUM('Low', 'Medium', 'High'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Execution Logs Table
CREATE TABLE execution_logs (
    id VARCHAR(255) PRIMARY KEY,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    workflow_name VARCHAR(255),
    triggered_entity_type ENUM('Lead', 'Deal', 'User'),
    triggered_entity_name VARCHAR(255),
    action_executed TEXT,
    status ENUM('Success', 'Failed', 'Skipped'),
    actor ENUM('System', 'AI', 'User'),
    execution_time_ms INT
);

-- AI Anomaly Logs Table
CREATE TABLE ai_anomaly_logs (
    id VARCHAR(255) PRIMARY KEY,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    anomaly TEXT,
    description TEXT,
    risk_level ENUM('Medium', 'High'),
    entity_type ENUM('Lead', 'Deal', 'Rule'),
    entity_name VARCHAR(255)
);
