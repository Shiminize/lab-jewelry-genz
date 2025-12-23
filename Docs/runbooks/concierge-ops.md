# Aurora Concierge Widget - Operations Runbook

**Last Updated**: 2025-10-19  
**Owner**: Engineering Operations  
**On-Call Contact**: #aurora-concierge-oncall

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Deployment Procedures](#deployment-procedures)
3. [Environment Configuration](#environment-configuration)
4. [Health Checks](#health-checks)
5. [Monitoring](#monitoring)
6. [Log Aggregation](#log-aggregation)
7. [Backup & Restore](#backup--restore)
8. [Scaling](#scaling)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

### Architecture

The Aurora Concierge Widget is a client-side React component with server-side API support:

- **Frontend**: `SupportWidget.tsx` (client component)
- **Backend APIs**: 7 support routes + 3 dashboard routes
- **Database**: MongoDB (widget data, orders, analytics)
- **AI**: DeepSeek API (conversational intelligence)
- **Caching**: In-memory (metrics, rate limiting)

### Dependencies

| Service | Purpose | Criticality |
|---------|---------|-------------|
| MongoDB | Data persistence | Critical |
| DeepSeek API | Conversational AI | High |
| Next.js App | Hosting | Critical |
| Redis (optional) | Rate limiting cache | Medium |

---

## Deployment Procedures

### Pre-Deployment Checklist

- [ ] All tests passing (`npm run test`, `npm run test:e2e`)
- [ ] Build successful (`npm run build`)
- [ ] Environment variables verified (`.env.production`)
- [ ] Database migrations applied (if any)
- [ ] Staging validation complete
- [ ] Feature flags configured

### Standard Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci

# 3. Run build
npm run build

# 4. Run database migrations (if applicable)
npm run migrate:up

# 5. Restart application
pm2 restart glowglitch-app
# OR for Docker:
docker-compose up -d --no-deps --build app

# 6. Verify health
curl https://glowglitch.com/api/health
```

### Rollback Procedure

```bash
# 1. Identify last known good commit
git log --oneline -10

# 2. Revert to previous version
git checkout <commit-hash>

# 3. Rebuild and restart
npm ci
npm run build
pm2 restart glowglitch-app

# 4. Verify health
curl https://glowglitch.com/api/health

# 5. Set feature flag to disable widget (emergency)
# In production environment:
export NEXT_PUBLIC_CONCIERGE_ENABLED=false
```

### Blue-Green Deployment

```bash
# 1. Deploy to green environment
./scripts/deploy-green.sh

# 2. Run smoke tests against green
npm run test:e2e -- --base-url=https://green.glowglitch.com

# 3. Switch traffic to green
./scripts/switch-traffic.sh green

# 4. Monitor for 10 minutes
watch -n 30 'curl -s https://glowglitch.com/api/metrics?format=summary'

# 5. If stable, decommission blue
./scripts/decommission-blue.sh
```

---

## Environment Configuration

### Required Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://glowglitch.com
NEXTAUTH_SECRET=<secret>

# Aurora Concierge Feature Flags
NEXT_PUBLIC_CONCIERGE_ENABLED=true
NEXT_PUBLIC_CONCIERGE_ROLLOUT_PERCENTAGE=100
NEXT_PUBLIC_CONCIERGE_ALLOWED_USERS=beta1@example.com,beta2@example.com

# AI
DEEPSEEK_API_KEY=<secret>

# Database
MONGODB_URI=mongodb://username:password@mongodb:27017/glowglitch

# Security
JWT_SECRET=<secret>
ENCRYPTION_KEY=<secret>

# Optional: External service endpoints
CONCIERGE_PRODUCTS_ENDPOINT=https://api.glowglitch.com/catalog/search
CONCIERGE_ORDER_STATUS_ENDPOINT=https://api.glowglitch.com/orders/status
```

### Configuration Management

- **Development**: `.env.local` (not committed)
- **Staging**: `.env.staging` (encrypted in vault)
- **Production**: `.env.production` (encrypted in vault)

Retrieve secrets from vault:

```bash
# Using HashiCorp Vault
vault kv get -field=DEEPSEEK_API_KEY secret/glowglitch/production

# Using AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id glowglitch/production/DEEPSEEK_API_KEY
```

---

## Health Checks

### Application Health

```bash
# Basic health check
curl https://glowglitch.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-10-19T10:30:00.000Z"
}

# With database check
curl https://glowglitch.com/api/health?check=db

# Expected response:
{
  "status": "ok",
  "checks": {
    "database": "ok"
  },
  "timestamp": "2025-10-19T10:30:00.000Z"
}
```

### Automated Health Monitoring

Configure external monitoring (e.g., UptimeRobot, Pingdom):

- **Endpoint**: `https://glowglitch.com/api/health`
- **Interval**: 60 seconds
- **Timeout**: 10 seconds
- **Expected Status**: 200
- **Alert on**: 3 consecutive failures

---

## Monitoring

### Metrics Dashboard

**Location**: [https://monitoring.glowglitch.com/dashboards/concierge](https://monitoring.glowglitch.com/dashboards/concierge)

**Key Metrics**:
- API latency (p50, p95, p99)
- Error rates per endpoint
- Widget open rate
- Intent detection success rate
- Database query latency
- CSAT scores

### Accessing Metrics Programmatically

```bash
# JSON format
curl https://glowglitch.com/api/metrics

# Prometheus format
curl https://glowglitch.com/api/metrics?format=prometheus

# Summary format
curl https://glowglitch.com/api/metrics?format=summary
```

### Alert Channels

- **Slack**: `#aurora-concierge-alerts`
- **PagerDuty**: `on-call-engineering` escalation policy
- **Email**: `ops@glowglitch.com`

---

## Log Aggregation

### Log Locations

**Application Logs**:
```bash
# Local (PM2)
pm2 logs glowglitch-app

# Docker
docker logs glowglitch-app -f --tail=100

# Server files
tail -f /var/log/glowglitch/app.log
```

**Structured Logs**:

All API requests include:
- `requestId`: Unique identifier
- `timestamp`: ISO 8601 format
- `endpoint`: API route
- `method`: HTTP method
- `statusCode`: Response status
- `duration`: Request duration (ms)

### Centralized Logging (Optional)

If using Datadog/Splunk/ELK:

```bash
# Query logs by requestId
# Datadog
datadog logs query 'service:concierge requestId:req-12345'

# Splunk
index=glowglitch sourcetype=concierge requestId="req-12345"

# Elasticsearch
GET /glowglitch-logs/_search
{
  "query": {
    "match": { "requestId": "req-12345" }
  }
}
```

---

## Backup & Restore

### MongoDB Backup

```bash
# Create backup
mongodump --uri="$MONGODB_URI" --out=/backups/$(date +%Y%m%d)

# Automated daily backup (cron)
0 2 * * * /usr/local/bin/mongodump --uri="$MONGODB_URI" --out=/backups/$(date +\%Y\%m\%d) && find /backups -type d -mtime +30 -exec rm -rf {} +
```

### Restore Procedure

```bash
# Restore from backup
mongorestore --uri="$MONGODB_URI" --dir=/backups/20251019

# Restore specific collection
mongorestore --uri="$MONGODB_URI" --nsInclude=glowglitch.stylistTickets --dir=/backups/20251019
```

### Backup Verification

```bash
# Verify backup integrity
mongorestore --uri="mongodb://localhost/glowglitch-test" --dir=/backups/20251019 --dryRun
```

---

## Scaling

### Horizontal Scaling

The application is stateless and can be horizontally scaled:

```bash
# Docker Swarm
docker service scale glowglitch-app=5

# Kubernetes
kubectl scale deployment glowglitch-app --replicas=5

# PM2 Cluster Mode
pm2 start npm --name glowglitch-app -i max -- start
```

### Vertical Scaling

MongoDB performance tuning:

```javascript
// Create indexes for widget queries
db.widgetShortlists.createIndex({ sessionId: 1, expiresAt: 1 })
db.stylistTickets.createIndex({ createdAt: -1, status: 1 })
db.widgetCSAT.createIndex({ sessionId: 1 })
```

### Auto-Scaling Rules

**CPU-based**:
- Scale up: CPU > 70% for 5 minutes
- Scale down: CPU < 30% for 10 minutes

**Request-based**:
- Scale up: Request rate > 1000 req/min
- Scale down: Request rate < 200 req/min

---

## Troubleshooting

### Widget Not Appearing

**Symptoms**: Widget button not visible on page

**Diagnosis**:
```bash
# 1. Check feature flag
echo $NEXT_PUBLIC_CONCIERGE_ENABLED

# 2. Check rollout percentage
echo $NEXT_PUBLIC_CONCIERGE_ROLLOUT_PERCENTAGE

# 3. Check browser console
# Open DevTools → Console → Look for widget errors
```

**Resolution**:
- Ensure `NEXT_PUBLIC_CONCIERGE_ENABLED=true`
- Ensure rollout percentage > 0
- Clear browser cache
- Check if user is in allowed users list (for partial rollout)

### High API Latency

**Symptoms**: API responses > 2 seconds

**Diagnosis**:
```bash
# Check current latency
curl https://glowglitch.com/api/metrics?format=summary | jq '.summary["/api/support/products"].latency'

# Check database performance
mongosh $MONGODB_URI --eval "db.currentOp()"
```

**Resolution**:
- Check MongoDB slow queries
- Add missing indexes
- Scale up application instances
- Enable caching layer (Redis)

### Database Connection Failures

**Symptoms**: 500 errors, "Cannot connect to database"

**Diagnosis**:
```bash
# Test MongoDB connection
mongosh $MONGODB_URI --eval "db.runCommand({ ping: 1 })"

# Check connection pool
curl https://glowglitch.com/api/health?check=db
```

**Resolution**:
- Restart MongoDB service
- Check network connectivity
- Verify MongoDB credentials
- Increase connection pool size in code

### DeepSeek API Failures

**Symptoms**: Widget conversations not responding

**Diagnosis**:
```bash
# Check DeepSeek API status
curl https://api.deepseek.com/health

# Check API key validity
curl -H "Authorization: Bearer $DEEPSEEK_API_KEY" https://api.deepseek.com/v1/models
```

**Resolution**:
- Verify API key is correct and not expired
- Check rate limits (DeepSeek quota)
- Implement fallback responses in code
- Contact DeepSeek support if service is down

### Memory Leaks

**Symptoms**: Application memory usage growing over time

**Diagnosis**:
```bash
# Monitor memory usage
pm2 monit

# Generate heap snapshot
node --inspect=9229 npm start
# In Chrome DevTools: chrome://inspect → Take heap snapshot
```

**Resolution**:
- Restart application
- Review metrics store retention (limit to 1000 items)
- Check for unclosed database connections
- Profile code for memory leaks

---

## Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| Engineering Lead | @john-doe | 24/7 (on-call rotation) |
| DevOps Lead | @jane-smith | Mon-Fri 9am-5pm PT |
| Database Admin | @db-admin | On-call via PagerDuty |
| Security Team | security@glowglitch.com | 24/7 for critical issues |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-19 | Initial runbook creation | AI Agent |
| | | |

