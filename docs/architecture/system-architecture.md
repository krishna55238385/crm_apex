# System Architecture

## Overview

The CRM application follows a **Modular Monolith** architecture with clear separation between frontend and backend services.

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
    end
    
    subgraph "CDN Layer"
        CF[CloudFront CDN]
    end
    
    subgraph "Load Balancing"
        ALB[Application Load Balancer]
    end
    
    subgraph "Application Layer - ECS Fargate"
        Frontend[Next.js Frontend<br/>Port 9002]
        Backend[Express Backend<br/>Port 3000]
    end
    
    subgraph "Data Layer"
        MySQL[(RDS MySQL<br/>Multi-AZ)]
        Redis[(ElastiCache Redis<br/>Cluster Mode)]
    end
    
    subgraph "External Services"
        Firebase[Firebase Auth]
        Gemini[Gemini AI]
        OpenAI[OpenAI]
    end
    
    subgraph "Monitoring"
        Sentry[Sentry<br/>Error Tracking]
        Prometheus[Prometheus<br/>Metrics]
        CloudWatch[CloudWatch<br/>Logs]
    end
    
    Browser --> CF
    CF --> ALB
    ALB --> Frontend
    ALB --> Backend
    Frontend --> Backend
    Backend --> MySQL
    Backend --> Redis
    Backend --> Firebase
    Backend --> Gemini
    Backend --> OpenAI
    Backend --> Sentry
    Backend --> Prometheus
    Backend --> CloudWatch
```

---

## Component Details

### Frontend (Next.js)
- **Technology**: React 19, Next.js, TypeScript
- **Port**: 9002
- **Deployment**: ECS Fargate (2-10 instances)
- **Features**:
  - Server-side rendering
  - Static generation
  - API routes
  - Real-time updates (Socket.io)

### Backend (Express)
- **Technology**: Node.js, Express, TypeScript
- **Port**: 3000
- **Deployment**: ECS Fargate (2-10 instances)
- **Features**:
  - RESTful API
  - WebSocket support
  - Job scheduling
  - Rate limiting
  - Input validation

### Database (RDS MySQL)
- **Version**: MySQL 8.0
- **Configuration**: Multi-AZ
- **Backup**: Automated daily (7-day retention)
- **Encryption**: At rest and in transit

### Cache (ElastiCache Redis)
- **Version**: Redis 7.0
- **Configuration**: Cluster mode enabled
- **Use Cases**:
  - Session storage
  - Rate limiting
  - Real-time data
  - Job queues

---

## Data Flow

### User Request Flow

```mermaid
sequenceDiagram
    participant User
    participant CloudFront
    participant ALB
    participant Frontend
    participant Backend
    participant Redis
    participant MySQL
    
    User->>CloudFront: HTTPS Request
    CloudFront->>ALB: Forward Request
    ALB->>Frontend: Route to Frontend
    Frontend->>Backend: API Call
    Backend->>Redis: Check Cache
    alt Cache Hit
        Redis-->>Backend: Return Cached Data
    else Cache Miss
        Backend->>MySQL: Query Database
        MySQL-->>Backend: Return Data
        Backend->>Redis: Update Cache
    end
    Backend-->>Frontend: JSON Response
    Frontend-->>User: Rendered Page
```

---

## Security Architecture

```mermaid
graph TB
    subgraph "Public Subnet"
        ALB[Application Load Balancer]
        NAT[NAT Gateway]
    end
    
    subgraph "Private Subnet - App"
        ECS[ECS Tasks]
    end
    
    subgraph "Private Subnet - Data"
        RDS[(RDS MySQL)]
        Redis[(ElastiCache)]
    end
    
    subgraph "Security"
        WAF[AWS WAF]
        SG1[ALB Security Group]
        SG2[ECS Security Group]
        SG3[RDS Security Group]
        Secrets[Secrets Manager]
    end
    
    Internet --> WAF
    WAF --> ALB
    ALB --> ECS
    ECS --> NAT
    ECS --> RDS
    ECS --> Redis
    ECS --> Secrets
    
    SG1 -.->|Port 80,443| ALB
    SG2 -.->|Port 3000,9002| ECS
    SG3 -.->|Port 3306,6379| RDS
```

---

## Scaling Strategy

### Horizontal Scaling
- **Frontend**: 2-10 instances based on CPU/Memory
- **Backend**: 2-10 instances based on CPU/Memory
- **Database**: Read replicas (future)
- **Cache**: Cluster mode with auto-failover

### Auto-Scaling Triggers
- CPU > 70% → Scale up
- CPU < 30% → Scale down
- Memory > 80% → Scale up
- Request count > 1000/min → Scale up

---

## Disaster Recovery

### Backup Strategy
- **Database**: Automated daily backups (7-day retention)
- **Application**: Immutable Docker images in ECR
- **Configuration**: Infrastructure as Code (Terraform)

### Recovery Objectives
- **RTO** (Recovery Time Objective): < 1 hour
- **RPO** (Recovery Point Objective): < 15 minutes

### Failover Procedures
1. Multi-AZ RDS automatic failover
2. ECS tasks distributed across AZs
3. CloudFront edge caching
4. Terraform state for infrastructure recovery

---

## Technology Stack

### Frontend
- React 19
- Next.js 15
- TypeScript
- TailwindCSS
- Socket.io Client

### Backend
- Node.js 20
- Express
- TypeScript
- Prisma ORM
- Socket.io
- Bull (Job Queue)

### Infrastructure
- AWS ECS Fargate
- AWS RDS MySQL
- AWS ElastiCache Redis
- AWS Application Load Balancer
- AWS CloudFront
- Terraform

### Monitoring
- Sentry (Error Tracking)
- Prometheus (Metrics)
- CloudWatch (Logs)
- Grafana (Dashboards - optional)

---

## Performance Metrics

### Target SLAs
- **Availability**: 99.9% uptime
- **Response Time**: p95 < 500ms
- **Error Rate**: < 0.1%
- **Throughput**: > 1000 req/s

### Current Performance
- See [Monitoring Dashboard](../operations/monitoring.md)
