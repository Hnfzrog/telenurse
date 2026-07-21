# TeleNurse — Production Runbook

## Description

Operational runbook untuk TeleNurse production (Next.js on Vercel).

## Important

- **1 project** di Vercel — single deployment
- All services are managed/serverless — no server maintenance
- Monitor free tier limits to avoid service interruption

## Table of Contents

- [Scope](#scope)
- [Goals](#goals)
- [Non Goals](#non-goals)
- [Service URLs](#service-urls)
- [Monitoring Free Tier Usage](#monitoring-free-tier-usage)
- [Common Issues](#common-issues)

## Scope

Operational procedures untuk maintaining TeleNurse in production.

## Goals

1. Quick reference untuk troubleshooting
2. Monitor free tier limits

## Non Goals

- 24/7 on-call procedures
- Incident management process
- Disaster recovery plan

---

## Service URLs

| Service | Dashboard URL | Purpose |
|---------|--------------|---------|
| **Vercel** | https://vercel.com/dashboard | App deployment & logs |
| **Neon Tech** | https://console.neon.tech | Database management |
| **Resend** | https://resend.com/dashboard | Email delivery status |
| **cron-job.org** | https://cron-job.org/en/members | Supplemental cron monitoring |

---

## Monitoring Free Tier Usage

### Weekly Check

| Service | What to Check | Limit | Where |
|---------|---------------|-------|-------|
| **Vercel** | Bandwidth | 100GB/mo | Vercel → Usage |
| **Vercel** | Function invocations | 100K/mo | Vercel → Usage |
| **Neon** | Storage | 512MB | Neon Console |
| **Neon** | Compute hours | 190 hrs/mo | Neon Console |
| **Resend** | Emails sent | 100/day | Resend Dashboard |

---

## Common Issues

### Neon Database Sleep
**Symptom**: First API call after idle is slow (1-2s).
**Cause**: Neon free tier suspends compute after 5 min idle.
**Solution**: Expected behavior. cron-job.org can ping `/api/health` every 5 min to keep warm.

### Vercel Function Timeout
**Symptom**: 504 Gateway Timeout.
**Solution**: All endpoints should complete in < 10s (free tier limit). If timeout, check for N+1 queries in Prisma.

### Email Not Delivered
**Symptom**: Medication reminders not received.
**Check**: Resend dashboard → delivery status. Common: daily limit hit, or email in spam.

### Build Failure
**Symptom**: Vercel deploy fails.
**Check**: Vercel → Deployments → build logs. Common causes:
- TypeScript errors (`npx tsc --noEmit` locally first)
- Prisma client not generated (add `prisma generate` to build script)
- Missing env vars
