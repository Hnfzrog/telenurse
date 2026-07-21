# TeleNurse — Development Workflow

## Description

Development workflow dan proses kolaborasi untuk project TeleNurse.

## Important

- Repo: monorepo (`frontend/` + `backend/` + `docs/`)
- Deployment: auto-deploy via Vercel Git integration
- Satu developer (solo) — workflow simplified

## Table of Contents

- [Scope](#scope)
- [Goals](#goals)
- [Non Goals](#non-goals)
- [Git Workflow](#git-workflow)
- [Development Loop](#development-loop)
- [Branch Strategy](#branch-strategy)

## Scope

Git workflow, branching strategy, dan development loop untuk solo developer.

## Goals

1. Simple, fast iteration cycle
2. Auto-deploy on push to main
3. Clear commit history

## Non Goals

- PR review process (solo developer)
- Multiple environment (staging/production) — hanya production
- CI/CD pipeline complex

---

## Git Workflow

### Branch Strategy

| Branch | Purpose | Deploy |
|--------|---------|--------|
| `main` | Production-ready code | Auto-deploy ke Vercel |
| `dev` | Active development | Local only |
| `feature/*` | Individual features | Local, merge ke dev |

### Commit Convention

```
feat: add monitoring input form
fix: fix abnormal threshold calculation
docs: update API contract
style: adjust mobile responsive layout
refactor: extract health record service
```

---

## Development Loop

1. **Pick task** dari `docs/project-docs/foundation/status.md`
2. **Create branch** `feature/[task-name]` dari `dev`
3. **Develop** — code + test locally
4. **Test** — manual testing di browser (mobile viewport)
5. **Merge** ke `dev`, then `dev` → `main`
6. **Auto-deploy** — Vercel picks up push to `main`
7. **Update status** di `status.md`
