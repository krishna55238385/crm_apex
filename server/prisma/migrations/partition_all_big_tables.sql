-- Global Partitioning Migration
-- Target Tables: activity_logs, workflow_logs, notifications, sessions, communications
-- Strategy: RANGE Partitioning by Year

-- ==========================================
-- 1. ACTIVITY LOGS
-- ==========================================
-- Drop FK (Required for Partitioning)
ALTER TABLE activity_logs DROP FOREIGN KEY activity_logs_ibfk_1;
-- Modify PK to include Partition Key
ALTER TABLE activity_logs DROP PRIMARY KEY;
ALTER TABLE activity_logs ADD PRIMARY KEY (id, timestamp);
-- Partition
ALTER TABLE activity_logs PARTITION BY RANGE ( YEAR(timestamp) ) (
    PARTITION p_archive VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p2027 VALUES LESS THAN (2028),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- ==========================================
-- 2. WORKFLOW LOGS
-- ==========================================
-- Ensure Partition Key is NOT NULL (Required for PK)
UPDATE workflow_logs SET timestamp = NOW() WHERE timestamp IS NULL;
ALTER TABLE workflow_logs MODIFY timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
-- Modify PK
ALTER TABLE workflow_logs DROP PRIMARY KEY;
ALTER TABLE workflow_logs ADD PRIMARY KEY (id, timestamp);
-- Partition
ALTER TABLE workflow_logs PARTITION BY RANGE ( YEAR(timestamp) ) (
    PARTITION p_archive VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- ==========================================
-- 3. NOTIFICATIONS
-- ==========================================
-- Drop FK
ALTER TABLE notifications DROP FOREIGN KEY notifications_ibfk_1;
-- Ensure Partition Key is NOT NULL
UPDATE notifications SET created_at = NOW() WHERE created_at IS NULL;
ALTER TABLE notifications MODIFY created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
-- Modify PK
ALTER TABLE notifications DROP PRIMARY KEY;
ALTER TABLE notifications ADD PRIMARY KEY (id, created_at);
-- Partition
ALTER TABLE notifications PARTITION BY RANGE ( YEAR(created_at) ) (
    PARTITION p_archive VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- ==========================================
-- 4. SESSIONS
-- ==========================================
-- Drop FK
ALTER TABLE sessions DROP FOREIGN KEY sessions_ibfk_1;
-- Modify PK (login_time is already NOT NULL per schema)
ALTER TABLE sessions DROP PRIMARY KEY;
ALTER TABLE sessions ADD PRIMARY KEY (id, login_time);
-- Partition
ALTER TABLE sessions PARTITION BY RANGE ( YEAR(login_time) ) (
    PARTITION p_archive VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- ==========================================
-- 5. COMMUNICATIONS
-- ==========================================
-- Drop FK
ALTER TABLE communications DROP FOREIGN KEY communications_ibfk_1;
-- Modify PK (timestamp is already NOT NULL per schema)
ALTER TABLE communications DROP PRIMARY KEY;
ALTER TABLE communications ADD PRIMARY KEY (id, timestamp);
-- Partition
ALTER TABLE communications PARTITION BY RANGE ( YEAR(timestamp) ) (
    PARTITION p_archive VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
