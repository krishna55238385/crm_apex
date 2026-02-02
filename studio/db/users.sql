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
