# Incident Postmortem: [Title of Incident]

**Date**: YYYY-MM-DD  
**Authors**: [Author Name]  
**Status**: [Draft / Completed]  
**Severity**: [P1 / P2]

---

## Executive Summary
*Provide a 2-3 sentence overview of what happened, who was affected, what the impact was, and how it was mitigated.*

- **Service Downtime Duration**: X minutes
- **Availability Impact**: XX.XX%
- **Total Requests Failed**: X,XXX requests

---

## Timeline (All times in UTC)
- **12:00** - Incident triggered (describe trigger event/alert).
- **12:05** - On-call engineer paged.
- **12:12** - Cause identified (explain what was discovered).
- **12:20** - Mitigations applied (explain mitigation, e.g., scaling up, failover).
- **12:25** - System returned to healthy status.

---

## Root Cause Analysis (5 Whys)
1. Why did the service fail? -> *Because database connections were exhausted.*
2. Why were connections exhausted? -> *Because the connection pool limit was reached under sudden traffic spike.*
3. Why was the pool limit reached? -> *...*
4. Why...
5. Why...

---

## Action Items (Preventative Measures)

| Action Item | Type | Owner | Bug Link |
| :--- | :--- | :--- | :--- |
| *Scale Redis cache cluster to offload DB queries* | Mitigate | @engineer | #123 |
| *Set connection limit thresholds in Prometheus alerts* | Prevent | @oncall | #124 |
| *Configure dynamic connection pool scaling in Go API* | Code | @dev | #125 |
