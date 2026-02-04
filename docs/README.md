# CRM Application Documentation

Welcome to the comprehensive documentation for the Enterprise CRM Application.

## 📚 Documentation Sections

### [API Documentation](./api/)
Complete REST API reference with interactive Swagger UI.
- Authentication endpoints
- Leads management
- Workflows and automation
- Analytics and reporting

### [Architecture](./architecture/)
System design and infrastructure documentation.
- System architecture diagrams
- Database schema
- AWS infrastructure
- Security architecture

### [Developer Guide](./developer/)
Everything developers need to get started.
- Local setup instructions
- Development workflow
- Code style guide
- Testing guide

### [Deployment](./deployment/)
Production deployment procedures.
- AWS deployment guide
- Environment configuration
- Rollback procedures
- Monitoring setup

### [Operations](./operations/)
Day-to-day operations and incident response.
- Backup and recovery
- Monitoring and alerts
- Incident response
- Runbooks

---

## 🚀 Quick Start

### For Developers
```bash
# Clone and setup
git clone <repository-url>
cd CRM
cp .env.example .env

# Install dependencies
cd server && npm install
cd ../studio && npm install

# Start development
npm run dev  # In both server and studio directories
```

### For Operators
```bash
# Deploy to AWS
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars
./infrastructure/scripts/deploy.sh prod
```

---

## 📖 Key Resources

- **API Docs**: http://localhost:3000/api-docs
- **GitHub**: [Repository URL]
- **Production**: https://app.yourdomain.com
- **Monitoring**: CloudWatch Dashboards

---

## 🆘 Support

- **Issues**: GitHub Issues
- **Email**: support@yourdomain.com
- **Slack**: #crm-support

---

## 📝 License

[Your License Here]
