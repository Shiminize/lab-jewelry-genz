# Monitoring Platform Integration Guide

**Purpose**: Guide for integrating Aurora Concierge Widget metrics with monitoring platforms.

**Safe Default Choice**: **Grafana + Prometheus** (open-source, no vendor lock-in)

---

## Platform Comparison

| Feature | Grafana + Prometheus | Datadog | New Relic |
|---------|---------------------|---------|-----------|
| Cost | Free (self-hosted) | $15+/host/month | $99+/user/month |
| Setup Time | 2-3 hours | 1 hour | 1 hour |
| Data Retention | Configurable (recommend 90 days) | 15 days (standard) | 8 days (standard) |
| Alert Management | ✅ Built-in | ✅ Advanced | ✅ Advanced |
| Learning Curve | Medium | Low | Low |
| Vendor Lock-in | None | High | High |
| Custom Metrics | ✅ Unlimited | Pay per metric | Pay per metric |

**Recommendation**: Grafana + Prometheus for cost-effectiveness and flexibility.

---

## Option 1: Grafana + Prometheus (RECOMMENDED)

### Why Choose This?
- ✅ **Free & Open Source**: No per-host or per-metric fees
- ✅ **Industry Standard**: Wide community support
- ✅ **Flexible**: Full control over data retention
- ✅ **No Vendor Lock-in**: Can switch or self-host anytime

### Architecture
```
Aurora Concierge → /api/metrics (Prometheus format)
                       ↓
                   Prometheus (scrapes metrics every 30s)
                       ↓
                   Grafana (visualizes + alerts)
```

### Setup Steps

#### 1. Install Prometheus

**Docker Compose** (easiest):
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=90d'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=<secure-password>
    restart: unless-stopped

volumes:
  prometheus-data:
  grafana-data:
```

```bash
# Start services
docker-compose -f docker-compose.monitoring.yml up -d
```

#### 2. Configure Prometheus to Scrape Metrics

Create `prometheus.yml`:
```yaml
global:
  scrape_interval: 30s
  evaluation_interval: 30s

scrape_configs:
  - job_name: 'aurora-concierge'
    metrics_path: '/api/metrics'
    params:
      format: ['prometheus']
    static_configs:
      - targets: ['glowglitch.com:443']
    scheme: https
```

#### 3. Set Up Grafana Dashboards

1. **Access Grafana**: `http://localhost:3001`
2. **Login**: admin / <password-from-docker-compose>
3. **Add Prometheus Data Source**:
   - Settings → Data Sources → Add Prometheus
   - URL: `http://prometheus:9090`
   - Save & Test

4. **Import Dashboard Template**:
   - Create → Import → Upload `grafana-dashboard.json` (see below)

**Dashboard JSON** (`grafana-dashboard.json`):
```json
{
  "dashboard": {
    "title": "Aurora Concierge Widget",
    "panels": [
      {
        "title": "API Latency (p95)",
        "targets": [{
          "expr": "concierge_api_latency_p95"
        }],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [{
          "expr": "concierge_api_error_rate"
        }],
        "type": "graph"
      },
      {
        "title": "Widget Opens",
        "targets": [{
          "expr": "rate(concierge_widget_opens_total[5m])"
        }],
        "type": "stat"
      }
    ]
  }
}
```

#### 4. Configure Alerts

In Grafana:
1. **Alerting → Alert Rules → New Alert Rule**
2. **Create alert for high latency**:
   - Query: `concierge_api_latency_p95 > 1000`
   - Condition: Threshold above 1000ms for 5 minutes
   - Action: Send to Slack/Email

**Alert Rules to Create**:
- API Latency p95 > 1s (warning)
- API Latency p95 > 2s (critical)
- Error Rate > 5% (warning)
- Error Rate > 10% (critical)
- Database connection failures (critical)

#### 5. Notification Channels

**Slack Integration**:
1. Grafana → Alerting → Contact Points → New Contact Point
2. Type: Slack
3. Webhook URL: (create in Slack: Incoming Webhooks app)
4. Test and Save

**Email Integration**:
1. Edit `grafana.ini` or environment variables:
```ini
[smtp]
enabled = true
host = smtp.gmail.com:587
user = alerts@glowglitch.com
password = <app-password>
from_address = alerts@glowglitch.com
```

### Total Setup Time: 2-3 hours

---

## Option 2: Datadog (Commercial, Easy Setup)

### Why Choose This?
- ✅ **Quick Setup**: 15-minute integration
- ✅ **All-in-One**: APM, logs, metrics, traces
- ✅ **Pre-built Dashboards**: Industry-standard templates
- ❌ **Cost**: ~$15/host/month + $0.10/million custom metrics

### Setup Steps

#### 1. Sign Up & Install Agent
```bash
# Install Datadog agent
DD_API_KEY=<your-api-key> DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
```

#### 2. Configure Custom Metrics

Create `datadog.yaml`:
```yaml
logs_enabled: true
apm_enabled: true

integrations:
  - type: openmetrics
    url: https://glowglitch.com/api/metrics?format=prometheus
    namespace: aurora_concierge
    metrics:
      - concierge_api_latency_*
      - concierge_api_error_*
      - concierge_widget_*
```

#### 3. Import Dashboard
1. Datadog → Dashboards → New Dashboard
2. Add widgets for:
   - API Latency (timeseries)
   - Error Rate (query value)
   - Widget Opens (top list)

#### 4. Set Up Monitors
1. Monitors → New Monitor → Metric
2. Metric: `aurora_concierge.api_latency_p95`
3. Alert threshold: `> 1000`
4. Notify: `@slack-aurora-concierge-alerts`

### Total Setup Time: 1 hour

---

## Option 3: New Relic (Commercial, Full APM)

### Why Choose This?
- ✅ **Full APM**: Automatic instrumentation
- ✅ **Powerful Query Language**: NRQL for complex queries
- ✅ **Error Tracking**: Automatic error capture
- ❌ **Cost**: $99+/user/month

### Setup Steps

#### 1. Install Agent
```bash
# Install New Relic Node.js agent
npm install newrelic

# Add to start script
node -r newrelic app.js
```

#### 2. Configure `newrelic.js`
```javascript
exports.config = {
  app_name: ['Aurora Concierge Widget'],
  license_key: '<your-license-key>',
  logging: {
    level: 'info'
  },
  custom_insights_events: {
    enabled: true
  }
}
```

#### 3. Send Custom Metrics
```typescript
// In src/lib/metrics.ts
import newrelic from 'newrelic'

export function trackLatency(endpoint: string, duration: number) {
  newrelic.recordMetric(`Custom/API/Latency/${endpoint}`, duration)
}
```

#### 4. Create Dashboards
1. New Relic One → Dashboards → Create Dashboard
2. Add charts using NRQL:
```sql
SELECT percentile(duration, 95) FROM Transaction WHERE appName = 'Aurora Concierge Widget' TIMESERIES
```

### Total Setup Time: 1-2 hours

---

## Implementation Recommendation

### Phase 1: Start with Built-in Metrics (Current State)
**Status**: ✅ Already Implemented
- Using `/api/metrics` endpoint
- JSON/Prometheus format support
- No external dependencies

**Use Case**: Development & initial testing

### Phase 2: Add Grafana + Prometheus (Recommended for Production)
**Timeline**: Week 3 of deployment plan
- Cost-effective
- Full control
- No vendor lock-in

**Use Case**: Production monitoring

### Phase 3: Consider Datadog/New Relic (Optional)
**Timeline**: Post-launch if needed
- Add if team prefers managed solution
- Easy migration from Prometheus

---

## Quick Start: Grafana + Prometheus (Safe Default)

### 1-Hour Setup Script

```bash
#!/bin/bash
# setup-monitoring.sh

# Create monitoring directory
mkdir -p monitoring && cd monitoring

# Create Prometheus config
cat > prometheus.yml <<EOF
global:
  scrape_interval: 30s

scrape_configs:
  - job_name: 'aurora-concierge'
    metrics_path: '/api/metrics'
    params:
      format: ['prometheus']
    static_configs:
      - targets: ['glowglitch.com:443']
    scheme: https
EOF

# Create Docker Compose file
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=90d'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=ChangeMeNow123!
      - GF_INSTALL_PLUGINS=grafana-clock-panel
    restart: unless-stopped

volumes:
  prometheus-data:
  grafana-data:
EOF

# Start services
docker-compose up -d

echo "✅ Monitoring stack started!"
echo "📊 Prometheus: http://localhost:9090"
echo "📈 Grafana: http://localhost:3001 (admin / ChangeMeNow123!)"
echo ""
echo "Next steps:"
echo "1. Open Grafana at http://localhost:3001"
echo "2. Add Prometheus data source (http://prometheus:9090)"
echo "3. Import dashboard (see documentation)"
```

**Run**:
```bash
chmod +x setup-monitoring.sh
./setup-monitoring.sh
```

---

## Alert Rules (Import to Grafana)

Save as `alert-rules.yml`:
```yaml
groups:
  - name: aurora_concierge_alerts
    interval: 30s
    rules:
      - alert: HighAPILatency
        expr: concierge_api_latency_p95 > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API latency above 1 second"
          description: "P95 latency is {{ $value }}ms"

      - alert: CriticalAPILatency
        expr: concierge_api_latency_p95 > 2000
        for: 3m
        labels:
          severity: critical
        annotations:
          summary: "API latency above 2 seconds"
          description: "P95 latency is {{ $value }}ms"

      - alert: HighErrorRate
        expr: concierge_api_error_rate > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Error rate above 5%"
          description: "Error rate is {{ $value }}"

      - alert: CriticalErrorRate
        expr: concierge_api_error_rate > 0.10
        for: 3m
        labels:
          severity: critical
        annotations:
          summary: "Error rate above 10%"
          description: "Error rate is {{ $value }}"
```

---

## Cost Comparison (Production)

| Platform | Monthly Cost | Setup Time | Maintenance |
|----------|--------------|------------|-------------|
| Grafana + Prometheus (self-hosted) | $20-50 (server costs) | 2-3 hours | 2 hours/month |
| Datadog | $150-300 | 1 hour | Minimal |
| New Relic | $300-500 | 1-2 hours | Minimal |

**Recommendation**: Start with Grafana + Prometheus, migrate to commercial platform if team bandwidth is limited.

---

## Success Criteria

✅ **Week 3 Deliverables**:
- [ ] Monitoring platform running
- [ ] Metrics being collected
- [ ] Dashboards created
- [ ] Alerts configured
- [ ] Team trained on using dashboards

✅ **Metrics to Track**:
- API latency (p50, p95, p99)
- Error rates
- Widget open rate
- CSAT scores
- Database query latency

---

**Document Created**: 2025-10-19  
**Safe Default**: Grafana + Prometheus  
**Setup Script**: Included above

