# Staging Environment Setup Checklist

**Purpose**: Comprehensive checklist for setting up the staging environment for Aurora Concierge Widget testing before production deployment.

**Owner**: DevOps + Engineering  
**Timeline**: 1-2 days

---

## Infrastructure Provisioning

### MongoDB Staging Instance
- [ ] Provision MongoDB instance (Atlas M10 or equivalent)
- [ ] Configure connection string
- [ ] Set up authentication (username/password)
- [ ] Enable TLS/SSL
- [ ] Configure IP whitelist for staging servers
- [ ] Test connection from staging app server

**Connection String Format**:
```
mongodb://staging_user:PASSWORD@staging-mongodb:27017/glowglitch_staging?authSource=admin&tls=true
```

### Application Server
- [ ] Provision staging server (AWS/Vercel/DigitalOcean)
- [ ] Install Node.js (v18+ LTS)
- [ ] Install npm/pnpm
- [ ] Configure system resources (min: 2 CPU, 4GB RAM)
- [ ] Set up process manager (PM2/systemd)
- [ ] Configure firewall rules (allow 443, 3000)

### DNS & SSL
- [ ] Create DNS record: `staging.glowglitch.com`
- [ ] Provision SSL certificate (Let's Encrypt or CloudFlare)
- [ ] Configure nginx/Apache reverse proxy
- [ ] Test HTTPS access

---

## Environment Configuration

### Create `.env.staging` File
```bash
# Application
NODE_ENV=staging
PORT=3000
NEXTAUTH_URL=https://staging.glowglitch.com
NEXTAUTH_SECRET=<generate-unique-secret>

# Database
MONGODB_URI=mongodb://staging_user:PASSWORD@staging-mongodb:27017/glowglitch_staging

# AI
DEEPSEEK_API_KEY=<staging-or-production-key>

# Concierge Feature Flags
NEXT_PUBLIC_CONCIERGE_ENABLED=true
NEXT_PUBLIC_CONCIERGE_ROLLOUT_PERCENTAGE=100
NEXT_PUBLIC_CONCIERGE_ALLOWED_USERS=

# Security
JWT_SECRET=<generate-unique-secret>
ENCRYPTION_KEY=<generate-unique-secret>

# Monitoring (optional for staging)
SENTRY_DSN=<staging-sentry-project>

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Health Checks
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_DATABASE=true

# Logging
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
```

### Generate Secrets
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 64

# Generate ENCRYPTION_KEY
openssl rand -base64 32
```

- [ ] Create `.env.staging` file
- [ ] Generate all required secrets
- [ ] Store secrets in vault (e.g., AWS Secrets Manager, HashiCorp Vault)
- [ ] Verify no secrets committed to git

---

## Database Setup

### Seed Data
- [ ] Create test products collection
- [ ] Seed 20-30 ready-to-ship products
- [ ] Create test orders (5-10)
- [ ] Create test users (support, admin, customer)
- [ ] Seed widget collections (stylistTickets, widgetShortlists, widgetCSAT)

**Seed Script**:
```bash
# Run seed script
npm run seed:staging

# Or manual seed
node scripts/seed-database.js --env=staging
```

### Database Indexes
- [ ] Run index creation script
- [ ] Verify indexes exist:
  - `products.readyToShip + products.category`
  - `orders.orderId`
  - `stylistTickets.email + stylistTickets.createdAt`
  - `widgetShortlists.sessionId + widgetShortlists.expiresAt`

```bash
# Verify indexes
mongosh $MONGODB_URI --eval "db.products.getIndexes()"
```

---

## Application Deployment

### Build & Deploy
```bash
# 1. Clone repository
git clone https://github.com/glowglitch/glowglitch-frontend.git
cd glowglitch-frontend
git checkout main

# 2. Install dependencies
npm ci

# 3. Copy environment file
cp .env.staging .env

# 4. Build application
npm run build

# 5. Start with PM2
pm2 start npm --name glowglitch-staging -- start
pm2 save
pm2 startup

# 6. Configure PM2 for auto-restart
pm2 set pm2:autodump true
```

- [ ] Clone repository
- [ ] Checkout main branch
- [ ] Install dependencies
- [ ] Build application
- [ ] Start with PM2
- [ ] Configure auto-restart
- [ ] Test application start

### Verify Deployment
```bash
# Health check
curl https://staging.glowglitch.com/api/health

# Expected: {"status":"ok",...}

# Check widget renders
curl -I https://staging.glowglitch.com/

# Expected: 200 OK
```

- [ ] Health check returns 200
- [ ] Homepage loads successfully
- [ ] Widget button visible
- [ ] No console errors in browser

---

## Testing Setup

### Install Test Dependencies
```bash
# Install Playwright
npm install -D @playwright/test

# Install axe-core for accessibility
npm install -D @axe-core/playwright

# Install browsers
npx playwright install --with-deps
```

- [ ] Install Playwright
- [ ] Install @axe-core/playwright
- [ ] Install browser binaries
- [ ] Verify Playwright can connect to staging

### Configure Test Environment
Create `playwright.staging.config.ts`:
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'https://staging.glowglitch.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { channel: 'chrome' } },
    { name: 'firefox' },
    { name: 'webkit' },
  ],
})
```

- [ ] Create staging Playwright config
- [ ] Update test scripts in `package.json`
- [ ] Run smoke test

---

## Monitoring & Logging

### Log Aggregation (Optional)
- [ ] Configure log shipping (if using centralized logging)
- [ ] Set up log rotation (`logrotate`)
- [ ] Test log access

### Metrics (Optional for Staging)
- [ ] Set up staging metrics dashboard (if desired)
- [ ] Configure alerts for critical errors

---

## Security

### Firewall Configuration
```bash
# Allow HTTPS
sudo ufw allow 443/tcp

# Allow HTTP (redirect to HTTPS)
sudo ufw allow 80/tcp

# Allow SSH (your IP only)
sudo ufw allow from YOUR_IP to any port 22

# Enable firewall
sudo ufw enable
```

- [ ] Configure firewall rules
- [ ] Block unnecessary ports
- [ ] Allow SSH from authorized IPs only

### SSL/TLS
- [ ] Verify SSL certificate valid
- [ ] Test HTTPS redirect
- [ ] Check SSL Labs rating (A or better)

```bash
# Test SSL
curl -I https://staging.glowglitch.com

# Should not show certificate errors
```

---

## Quality Assurance

### Manual Testing Checklist
- [ ] Homepage loads
- [ ] Widget button appears
- [ ] Can open widget
- [ ] Can browse ready-to-ship products
- [ ] Can filter products by price
- [ ] Can add product to shortlist
- [ ] Can track order (test order ID)
- [ ] Can submit return request
- [ ] Can escalate to stylist
- [ ] Dashboard login works
- [ ] Support tickets visible
- [ ] CSAT feedback visible
- [ ] Analytics dashboard loads

### Automated Test Execution
```bash
# Run all tests against staging
npm run test:staging

# Run E2E tests
npx playwright test --config=playwright.staging.config.ts tests/e2e/

# Run accessibility tests
npx playwright test --config=playwright.staging.config.ts tests/a11y/

# Generate HTML report
npx playwright show-report
```

- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Run E2E tests (all passing)
- [ ] Run accessibility tests (no violations)
- [ ] Review test report

---

## Performance Testing

### Baseline Metrics
```bash
# Test API latency
for i in {1..10}; do
  curl -o /dev/null -s -w "Time: %{time_total}s\n" https://staging.glowglitch.com/api/health
done

# Expected: < 1 second per request
```

- [ ] Measure API latency (p95 < 1s)
- [ ] Test concurrent users (10-20)
- [ ] Verify database performance
- [ ] Check memory usage (< 1GB)
- [ ] Monitor CPU usage (< 50%)

### Load Testing (Optional)
```bash
# Install k6 or Apache Bench
npm install -g k6

# Run load test
k6 run tests/load/widget-load.js
```

- [ ] Run basic load test
- [ ] Verify no errors under moderate load

---

## Documentation

### Update Staging URLs
- [ ] Add staging URL to README
- [ ] Update team wiki with staging credentials
- [ ] Document test accounts (support, admin, customer)

### Test Account Credentials
```
Admin:
  Email: admin@staging.glowglitch.com
  Password: <secure-password>

Support:
  Email: support@staging.glowglitch.com
  Password: <secure-password>

Customer:
  Email: customer@staging.glowglitch.com
  Password: <secure-password>
```

---

## Sign-Off

### Stakeholder Approval
- [ ] Engineering Lead reviewed setup
- [ ] QA team confirmed all tests pass
- [ ] Product Manager demoed widget flows
- [ ] Security team approved configuration

### Go/No-Go Decision
**Criteria**:
- ✅ All infrastructure provisioned
- ✅ Application deployed and running
- ✅ Database seeded with test data
- ✅ All automated tests passing
- ✅ Manual QA completed
- ✅ No critical bugs found
- ✅ Performance acceptable
- ✅ Stakeholders approved

**Decision**: [ ] GO TO PRODUCTION ROLLOUT

---

## Troubleshooting

### Common Issues

**Issue**: Application won't start
```bash
# Check logs
pm2 logs glowglitch-staging

# Check environment variables
pm2 env glowglitch-staging

# Restart
pm2 restart glowglitch-staging
```

**Issue**: Database connection fails
```bash
# Test MongoDB connection
mongosh $MONGODB_URI --eval "db.adminCommand('ping')"

# Check firewall
telnet staging-mongodb 27017
```

**Issue**: Tests failing
```bash
# Run in headed mode to see browser
npx playwright test --headed

# Check specific test
npx playwright test tests/e2e/widget-product-discovery.spec.ts --debug
```

---

## Maintenance

### Weekly Tasks
- [ ] Check application logs for errors
- [ ] Review test results
- [ ] Update dependencies if needed
- [ ] Backup database

### Monthly Tasks
- [ ] Review and refresh test data
- [ ] Update SSL certificate (if expiring)
- [ ] Performance audit

---

**Checklist Created**: 2025-10-19  
**Last Updated**: 2025-10-19  
**Next Review**: Before each major deployment

