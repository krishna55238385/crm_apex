# Backup and Disaster Recovery

Complete disaster recovery procedures for the CRM application.

---

## 🎯 Recovery Objectives

- **RTO** (Recovery Time Objective): < 1 hour
- **RPO** (Recovery Point Objective): < 15 minutes

---

## 💾 Backup Strategy

### Database Backups (RDS)

**Automated Backups**:
- Daily automated backups
- 7-day retention period
- Backup window: 03:00-04:00 UTC
- Multi-AZ for automatic failover

**Manual Snapshots**:
```bash
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier apexai-crm-prod-db \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d)

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier apexai-crm-prod-db
```

### Application Backups

**Docker Images**:
- Stored in Amazon ECR
- Immutable tags
- Retention: 30 days

**Infrastructure**:
- Terraform state in S3
- State locking with DynamoDB
- Versioning enabled

---

## 🔄 Recovery Procedures

### Scenario 1: Database Failure

**Automatic Failover** (Multi-AZ):
- RDS automatically fails over to standby
- DNS endpoint remains the same
- Downtime: < 2 minutes

**Manual Recovery from Snapshot**:
```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier apexai-crm-prod-db-restored \
  --db-snapshot-identifier <snapshot-id>

# Update connection string
# Modify Terraform or update Secrets Manager
```

---

### Scenario 2: Application Failure

**ECS Service Recovery**:
```bash
# Force new deployment
aws ecs update-service \
  --cluster apexai-crm-prod-cluster \
  --service apexai-crm-prod-server \
  --force-new-deployment

# Rollback to previous image
aws ecs update-service \
  --cluster apexai-crm-prod-cluster \
  --service apexai-crm-prod-server \
  --task-definition apexai-crm-prod-server:previous-version
```

---

### Scenario 3: Complete Infrastructure Loss

**Full Recovery**:
```bash
# 1. Restore Terraform state (if lost)
aws s3 cp s3://terraform-state-bucket/crm/terraform.tfstate .

# 2. Recreate infrastructure
cd infrastructure/terraform
terraform init
terraform apply

# 3. Restore database from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier apexai-crm-prod-db \
  --db-snapshot-identifier latest-snapshot

# 4. Deploy application
./infrastructure/scripts/build-and-push.sh
```

**Estimated Recovery Time**: 45-60 minutes

---

## 🧪 Disaster Recovery Testing

### Monthly DR Test

```bash
# 1. Create test environment
./infrastructure/scripts/deploy.sh dr-test

# 2. Restore latest snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier apexai-crm-dr-test-db \
  --db-snapshot-identifier latest-snapshot

# 3. Deploy application
./infrastructure/scripts/build-and-push.sh

# 4. Verify functionality
curl http://<dr-test-alb>/health

# 5. Cleanup
./infrastructure/scripts/destroy.sh dr-test
```

---

## 📋 Incident Response Plan

### Severity Levels

**P0 - Critical**:
- Complete service outage
- Data loss
- Security breach
- Response time: Immediate

**P1 - High**:
- Partial service degradation
- Performance issues
- Response time: < 1 hour

**P2 - Medium**:
- Minor issues
- Non-critical bugs
- Response time: < 4 hours

**P3 - Low**:
- Cosmetic issues
- Feature requests
- Response time: Next business day

---

### Incident Response Steps

1. **Detection**
   - CloudWatch alarms
   - User reports
   - Monitoring dashboards

2. **Assessment**
   - Determine severity
   - Identify affected components
   - Estimate impact

3. **Communication**
   - Notify stakeholders
   - Update status page
   - Create incident ticket

4. **Mitigation**
   - Implement temporary fix
   - Restore service
   - Monitor recovery

5. **Resolution**
   - Implement permanent fix
   - Deploy to production
   - Verify resolution

6. **Post-Mortem**
   - Document incident
   - Identify root cause
   - Implement preventive measures

---

## 🚨 Emergency Contacts

- **On-Call Engineer**: [Phone/Slack]
- **DevOps Lead**: [Phone/Email]
- **CTO**: [Phone/Email]
- **AWS Support**: [Support Plan]

---

## 📊 Backup Verification

### Weekly Backup Tests

```bash
# Verify backup exists
aws rds describe-db-snapshots \
  --db-instance-identifier apexai-crm-prod-db \
  --query 'DBSnapshots[0].DBSnapshotIdentifier'

# Test restore (to test instance)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier test-restore \
  --db-snapshot-identifier latest-snapshot

# Verify data integrity
mysql -h test-restore-endpoint -u admin -p -e "SELECT COUNT(*) FROM leads;"

# Cleanup
aws rds delete-db-instance \
  --db-instance-identifier test-restore \
  --skip-final-snapshot
```

---

## 🔐 Data Retention Policy

- **Database Backups**: 7 days (automated), 90 days (manual)
- **Application Logs**: 30 days
- **Audit Logs**: 1 year
- **Docker Images**: 30 days
- **Terraform State**: Indefinite (versioned)

---

## ✅ Checklist

### Before Disaster
- [ ] Automated backups enabled
- [ ] Multi-AZ configured
- [ ] Terraform state backed up
- [ ] DR procedures documented
- [ ] Team trained on procedures
- [ ] Monthly DR tests scheduled

### During Disaster
- [ ] Incident declared
- [ ] Stakeholders notified
- [ ] Recovery initiated
- [ ] Progress tracked
- [ ] Communication maintained

### After Recovery
- [ ] Service verified
- [ ] Users notified
- [ ] Post-mortem scheduled
- [ ] Documentation updated
- [ ] Preventive measures implemented
