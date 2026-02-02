-- Partitioning Migration for 'activity_logs'
-- Goal: Improve performance and manageability for high-volume logs.

-- 1. Drop Foreign Key Constraint
-- MySQL limitation: Partitioned tables cannot have foreign keys.
-- We sacrifice strict referential integrity for scalability here (Standard for Log tables).
ALTER TABLE activity_logs DROP FOREIGN KEY activity_logs_ibfk_1;

-- 2. Modify Primary Key
-- The partitioning key (timestamp) must be part of the Primary Key.
ALTER TABLE activity_logs DROP PRIMARY KEY;
ALTER TABLE activity_logs ADD PRIMARY KEY (id, timestamp);

-- 3. Apply Range Partitioning
ALTER TABLE activity_logs PARTITION BY RANGE ( YEAR(timestamp) ) (
    PARTITION p_archive VALUES LESS THAN (2025), -- Data before 2025
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p2027 VALUES LESS THAN (2028),
    PARTITION p_future VALUES LESS THAN MAXVALUE -- Catch-all for future dates
);

-- Verification:
-- SELECT PARTITION_NAME, TABLE_ROWS FROM information_schema.PARTITIONS WHERE TABLE_NAME = 'activity_logs';
