# Aurora Concierge Widget - Incident Response Runbook

**Last Updated**: 2025-10-19  
**Owner**: Engineering Operations  
**Emergency Contact**: #aurora-concierge-oncall

---

## Table of Contents

1. [Incident Severity Classification](#incident-severity-classification)
2. [Escalation Paths](#escalation-paths)
3. [Rollback Procedures](#rollback-procedures)
4. [Common Incident Scenarios](#common-incident-scenarios)
5. [Communication Templates](#communication-templates)
6. [Post-Mortem Template](#post-mortem-template)

---

## Incident Severity Classification

### SEV-1: Critical (P0)

**Impact**: Complete service outage or data loss

**Examples**:
- Widget completely unavailable for all users
- Database corruption or data loss
- Security breach or PII exposure
- API error rate > 50%

**Response**:
- **Response Time**: < 15 minutes
- **Escalation**: Immediate page to on-call engineer + notify engineering lead
- **Communication**: Post in `#incidents` every 30 minutes
- **Resolution Target**: < 1 hour

### SEV-2: High (P1)

**Impact**: Significant degradation affecting majority of users

**Examples**:
- Widget available but key features broken (e.g., product recommendations failing)
- API latency > 5 seconds (p95)
- Error rate 20-50%
- Dashboard unavailable for admins

**Response**:
- **Response Time**: < 30 minutes
- **Escalation**: Notify on-call engineer via Slack
- **Communication**: Post in `#incidents` + `#aurora-concierge-alerts`
- **Resolution Target**: < 4 hours

### SEV-3: Medium (P2)

**Impact**: Limited functionality degraded, workarounds available

**Examples**:
- Single feature not working (e.g., CSAT feedback submission failing)
- API latency 2-5 seconds (p95)
- Error rate 10-20%
- Affecting < 10% of users

**Response**:
- **Response Time**: < 2 hours (business hours)
- **Escalation**: Create ticket, assign to on-call
- **Communication**: Post in `#aurora-concierge-alerts`
- **Resolution Target**: < 24 hours

### SEV-4: Low (P3)

**Impact**: Minor issues, cosmetic problems

**Examples**:
- Styling issues
- Typos in copy
- Analytics not recording correctly
- Error rate < 10%

**Response**:
- **Response Time**: Next business day
- **Escalation**: Create ticket for sprint planning
- **Communication**: Optional
- **Resolution Target**: < 1 week

---

## Escalation Paths

### Level 1: On-Call Engineer

**Contact**: Slack `#aurora-concierge-oncall` or PagerDuty
**Scope**: Initial triage and common issues
**Escalate if**: Cannot resolve within 30 minutes (SEV-1/2)

### Level 2: Engineering Lead

**Contact**: @engineering-lead (PagerDuty escalation)
**Scope**: Complex technical issues, architectural decisions
**Escalate if**: Requires code changes or infrastructure modifications

### Level 3: CTO / VP Engineering

**Contact**: Via PagerDuty (auto-escalates after 1 hour for SEV-1)
**Scope**: Business-critical decisions, vendor escalation
**Escalate if**: Issue affects multiple systems or requires executive approval

### External Escalations

**DeepSeek API Issues**:
- Email: support@deepseek.com
- Priority Support: +1-XXX-XXX-XXXX (if subscribed)

**MongoDB Issues**:
- MongoDB Atlas Support Portal
- Critical: 24/7 phone support (Atlas M10+ clusters)

**Infrastructure Provider (AWS/Vercel)**:
- AWS Support: Console → Support Center
- Vercel: support@vercel.com or dashboard support ticket

---

## Rollback Procedures

### Immediate Rollback (Feature Flag)

**Fastest option** - Disables widget without code deployment:

```bash
# SSH to production server
ssh production.glowglitch.com

# Set feature flag to disable
export NEXT_PUBLIC_CONCIERGE_ENABLED=false

# Restart app
pm2 restart glowglitch-app

# Verify widget is disabled
curl https://glowglitch.com/ | grep -c "glowglitch-aurora-widget"
# Should return 0
```

**Time to Complete**: < 2 minutes

### Code Rollback

If feature flag is insufficient:

```bash
# 1. Identify last known good deployment
git log --oneline -10

# 2. Check out previous version
git checkout <last-known-good-commit>

# 3. Rebuild
npm ci
npm run build

# 4. Restart
pm2 restart glowglitch-app

# 5. Verify health
curl https://glowglitch.com/api/health
```

**Time to Complete**: 5-10 minutes

### Database Rollback

**⚠️ CAUTION**: Only for data corruption scenarios

```bash
# 1. Stop application to prevent new writes
pm2 stop glowglitch-app

# 2. Restore from latest backup
mongorestore --uri="$MONGODB_URI" --dir=/backups/latest --drop

# 3. Verify data integrity
mongosh $MONGODB_URI --eval "db.stylistTickets.countDocuments()"

# 4. Restart application
pm2 start glowglitch-app

# 5. Monitor for errors
pm2 logs glowglitch-app --lines 100
```

**Time to Complete**: 15-30 minutes (depends on database size)

---

## Common Incident Scenarios

### Scenario 1: Widget Button Not Appearing

**Symptoms**:
- Users report widget not visible
- No errors in console
- Health checks passing

**Diagnosis**:
```bash
# Check feature flags
echo $NEXT_PUBLIC_CONCIERGE_ENABLED
echo $NEXT_PUBLIC_CONCIERGE_ROLLOUT_PERCENTAGE

# Check application logs
pm2 logs glowglitch-app | grep -i "concierge\|widget"

# Test in browser
# Open DevTools → Console → Run:
localStorage.getItem('aurora-concierge-session-v1')
```

**Resolution**:
1. Verify feature flags are enabled
2. Check rollout percentage (should be > 0)
3. Clear browser cache / test in incognito
4. Verify JavaScript bundle includes widget code
5. Check for CSP violations in browser console

**Severity**: SEV-3 (unless affecting all users → SEV-2)

---

### Scenario 2: High Error Rate on /api/support/products

**Symptoms**:
- Metrics dashboard shows error rate > 20%
- Users report "No products found" errors
- Alert triggered

**Diagnosis**:
```bash
# Check API metrics
curl https://glowglitch.com/api/metrics?format=summary | jq '.summary["/api/support/products"]'

# Check MongoDB connection
mongosh $MONGODB_URI --eval "db.products.countDocuments({ readyToShip: true })"

# Check application logs
pm2 logs glowglitch-app --lines 200 | grep "support/products"
```

**Resolution**:
1. Verify MongoDB is responding
2. Check if products collection has data
3. Verify indexes exist (`db.products.getIndexes()`)
4. Check DeepSeek API (if used for recommendations)
5. Restart application if connection pool exhausted
6. Scale up if CPU/memory constrained

**Severity**: SEV-2

---

### Scenario 3: Database Connection Pool Exhausted

**Symptoms**:
- All APIs returning 500 errors
- Logs show "MongoPoolClearedError" or "Connection timeout"
- Health check fails for database

**Diagnosis**:
```bash
# Check current connections
mongosh $MONGODB_URI --eval "db.serverStatus().connections"

# Check pool settings in code
grep -r "maxPoolSize\|minPoolSize" src/lib/mongodb.ts
```

**Resolution**:
1. **Immediate**: Restart application to clear pool
```bash
pm2 restart glowglitch-app
```

2. **Short-term**: Increase pool size in `src/lib/mongodb.ts`:
```typescript
const client = new MongoClient(uri, {
  maxPoolSize: 50, // Increase from default 10
  minPoolSize: 10,
})
```

3. **Long-term**: Optimize queries, add connection pooling layer (Redis)

**Severity**: SEV-1

---

### Scenario 4: DeepSeek API Rate Limit Exceeded

**Symptoms**:
- Widget conversations not responding
- Logs show 429 errors from DeepSeek
- Users stuck on "thinking..." state

**Diagnosis**:
```bash
# Check DeepSeek API calls in logs
pm2 logs glowglitch-app | grep -i "deepseek" | grep "429"

# Check rate limit headers
curl -H "Authorization: Bearer $DEEPSEEK_API_KEY" https://api.deepseek.com/v1/models -I | grep -i "x-ratelimit"
```

**Resolution**:
1. **Immediate**: Implement fallback responses (if not already)
2. **Short-term**: Reduce API call frequency (add caching)
3. **Long-term**: Upgrade DeepSeek plan or implement request queuing

**Code Hotfix** (if needed):
```typescript
// Add to src/lib/concierge/providers/deepseek.ts
const FALLBACK_RESPONSE = "I'm experiencing high traffic. Please try again in a moment."

try {
  const response = await deepseekAPI.chat(...)
} catch (error) {
  if (error.status === 429) {
    return { content: FALLBACK_RESPONSE }
  }
  throw error
}
```

**Severity**: SEV-2

---

### Scenario 5: Memory Leak Causing OOM Crashes

**Symptoms**:
- Application restarts every few hours
- Logs show "JavaScript heap out of memory"
- Metrics show steadily increasing memory usage

**Diagnosis**:
```bash
# Monitor memory usage
pm2 monit

# Check heap size
node --max-old-space-size=4096 npm start  # Increase heap temporarily

# Generate heap dump
kill -USR2 $(pgrep -f "node.*npm start")
# Analyze with Chrome DevTools
```

**Resolution**:
1. **Immediate**: Increase Node.js heap size temporarily
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
pm2 restart glowglitch-app
```

2. **Short-term**: Restart application every 12 hours (cron job)
```bash
0 */12 * * * pm2 restart glowglitch-app
```

3. **Long-term**: Profile code, fix memory leaks
- Check metrics store (limit retention)
- Review catalog provider (potential large object retention)
- Check for unclosed database cursors

**Severity**: SEV-2

---

## Communication Templates

### Initial Incident Notification

**Slack Post** (use in `#incidents`):

```
🚨 **INCIDENT: Aurora Concierge Widget - SEV-[X]**

**Summary**: [Brief description of issue]
**Impact**: [Who/what is affected]
**Started**: [Time incident began]
**Incident Commander**: @[on-call engineer]
**Status**: Investigating

**Current Actions**:
- [ ] Triage and diagnosis
- [ ] Mitigation in progress
- [ ] Root cause analysis

Updates will be posted every [15/30/60] minutes.
```

### Incident Update

```
📊 **UPDATE: Aurora Concierge Widget Incident**

**Time**: [Current time]
**Status**: [Investigating / Identified / Monitoring / Resolved]

**Progress**:
- [What we've done]
- [What we've learned]
- [Current blockers, if any]

**Next Steps**:
- [Planned actions]

**ETA to Resolution**: [Time estimate]
```

### Incident Resolution

```
✅ **RESOLVED: Aurora Concierge Widget Incident**

**Time Resolved**: [Time]
**Duration**: [Total incident duration]

**Root Cause**: [Brief explanation]
**Resolution**: [What fixed it]

**Affected Systems**: [List]
**User Impact**: [Estimated % of users affected]

**Post-Mortem**: Will be posted within 48 hours to #post-mortems

Thank you to @[everyone who helped] for the quick response!
```

---

## Post-Mortem Template

### Title
`[YYYY-MM-DD] Aurora Concierge Widget - [Brief Description]`

### Metadata
- **Date**: [Incident date]
- **Duration**: [Total duration]
- **Severity**: [SEV-X]
- **Incident Commander**: [Name]
- **Participants**: [All who helped]

### Executive Summary
[2-3 sentences describing what happened, the impact, and the resolution]

### Impact
- **Users Affected**: [Number or percentage]
- **Downtime**: [Total minutes]
- **Revenue Impact**: [$XX or N/A]
- **SLA Breach**: [Yes/No]

### Timeline (All times in UTC)

| Time | Event |
|------|-------|
| 14:00 | Incident began (first error detected) |
| 14:05 | Alert triggered, on-call paged |
| 14:10 | Incident commander joined, started triage |
| 14:25 | Root cause identified |
| 14:35 | Fix deployed |
| 14:40 | Monitoring shows recovery |
| 15:00 | Incident resolved |

### Root Cause Analysis

**What Happened**:
[Detailed technical explanation of the issue]

**Why It Happened**:
[Contributing factors, gaps in process/monitoring]

**Why Wasn't It Caught Earlier**:
[If applicable - gaps in testing, monitoring, etc.]

### Resolution

**Immediate Fix**:
[What was done to resolve the incident]

**Temporary Workarounds**:
[Any temporary solutions applied]

### Action Items

| Action | Owner | Due Date | Priority |
|--------|-------|----------|----------|
| [Specific, measurable action] | @owner | YYYY-MM-DD | P0 |
| [Another action] | @owner | YYYY-MM-DD | P1 |

### Lessons Learned

**What Went Well**:
- [List things that worked well]

**What Could Be Improved**:
- [List areas for improvement]

### Appendix

**Relevant Links**:
- Incident Slack thread: [link]
- Metrics dashboard during incident: [link]
- Related tickets: [links]

**Commands Run**:
```bash
[Copy of diagnostic commands used]
```

---

## Incident Command Checklist

### When Incident Starts

- [ ] Acknowledge alert
- [ ] Post initial notification in `#incidents`
- [ ] Assign incident commander (yourself or delegate)
- [ ] Create incident Slack thread
- [ ] Begin diagnosis using runbooks

### During Incident

- [ ] Post updates every [15/30/60] minutes
- [ ] Escalate if needed (see Escalation Paths)
- [ ] Keep stakeholders informed
- [ ] Document all actions taken
- [ ] Consider rollback if fix is taking too long

### After Resolution

- [ ] Post resolution message
- [ ] Verify all systems stable for 15 minutes
- [ ] Schedule post-mortem (within 48 hours)
- [ ] Create follow-up tickets for action items
- [ ] Thank the team publicly

---

## Emergency Kill Switch

**Use only in extreme scenarios** (security breach, massive data corruption):

```bash
# 1. Disable widget globally
export NEXT_PUBLIC_CONCIERGE_ENABLED=false
pm2 restart glowglitch-app

# 2. Block API routes at nginx/load balancer
# Add to nginx config:
location /api/support/ {
  return 503;
}
nginx -s reload

# 3. Notify stakeholders
# Post in #incidents + #engineering + tag @here
```

**Requires**: Engineering Lead or CTO approval (except for security incidents)

---

## Contacts & Resources

| Resource | Link / Contact |
|----------|----------------|
| On-Call Rotation | PagerDuty or Slack `#aurora-concierge-oncall` |
| Incident Channel | `#incidents` |
| Metrics Dashboard | https://monitoring.glowglitch.com/dashboards/concierge |
| Ops Runbook | `Docs/runbooks/concierge-ops.md` |
| Engineering Lead | @john-doe |
| DevOps Lead | @jane-smith |

---

**Remember**: Stay calm, communicate clearly, and follow the runbooks. When in doubt, escalate!

