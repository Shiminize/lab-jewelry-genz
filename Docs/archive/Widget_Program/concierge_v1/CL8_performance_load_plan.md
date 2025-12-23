# CL8 – Performance & Load Validation Plan

## Objectives
- Validate concierge endpoints and Mongo queries perform adequately under expected production load.
- Identify any scaling bottlenecks post-canary before full 100% rollout.

## Approach (No Code)
1. **Synthetic Load Observation**
   - Leverage natural traffic during 25% and 50% phases; monitor latency, throughput, and resource utilization.
   - Document peak requests per minute; compare against capacity projections.

2. **Manual Burst Testing**
   - Coordinate 10–20 concurrent manual flows (team or scheduled script runner) hitting key endpoints (products, returns, capsule, order status) within a 5-minute window.
   - Capture latency metrics and DB impact (mongo `currentOp` output).

3. **Back-of-Envelope Scaling Analysis**
   - Using observed throughput, calculate headroom: `maxRequests/minute` vs `targetRequests/minute` for 100% load.
   - Identify if indexes or caching adjustments needed.

4. **Resource Monitoring**
   - Monitor Mongo CPU/memory usage, connection pool utilization during bursts.
   - Monitor application server load (CPU, memory) and thread pools.

5. **Error Budget Review**
   - Track error counts per endpoint; ensure they remain within SLO (<1% error rate).

## Data to Capture
- Latency histograms (p50/p90/p95) for each endpoint during load windows.
- Mongo operation metrics (query time, lock percentage).
- Application server resource metrics (CPU/mem) for each phase.
- Analytics event throughput per minute (ensuring ingestion keeps pace).

## Criteria for Success
- Endpoint latency p95 ≤ 500 ms during peak; no sustained spikes >600 ms.
- Mongo holds steady with operations < 200 ms average; no lock contention.
- Application servers < 70% CPU; memory stable (no major GC spikes) during bursts.
- Error rate remains below 1%; no new degradation of response correctness.

## Mitigation Actions if Criteria Not Met
- Investigate query plans; add indexes as identified in CL2/CL7 plans.
- Increase server resources or connection pools as temporary measure.
- Adjust rollout pace; delay 100% until resolved.
- Document findings and patches in ops log and update runbooks.

## Evidence Checklist
- Store performance dashboards screenshots, resource graphs, Mongo metrics, manual burst run notes in `evidence/canary_day0` or `post_launch/` folders.
- Include calculations of throughput vs capacity.

## Assumptions & Deltas (TODO-CONFIRM)
- Access to performance monitoring tools (APM, Mongo metrics) available post-canary.
- Manual burst testing feasible with small group or automated non-code load tool (e.g., Postman collection runner).
- Capacity projections documented (expected user volume) for comparison.

## Next Actions
- Schedule manual bursts during Phase 3 (50%) and early Phase 4 (100%).
- Record results and adjust rollout if thresholds exceeded.
- Include findings in Day 3 security/performance follow-up (WF10 plan).
