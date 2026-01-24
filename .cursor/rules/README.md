# Busibox App Template - Cursor Rules

This directory contains rules for AI agents (Cursor, Claude Code, etc.) to follow when working on apps built from this template.

## Purpose

These rules ensure:
- **Consistency** - Code follows Next.js 16 App Router best practices
- **Architecture** - Proper mode usage (frontend-only vs prisma)
- **Quality** - Components and APIs are properly structured
- **Maintainability** - Code is organized predictably

## Rule Files

| File | Purpose |
|------|---------|
| `000-core.mdc` | Meta-rule for creating/updating rules |
| `001-architect.mdc` | Planning and architecture decisions |
| `002-nextjs-patterns.mdc` | Next.js 16 App Router patterns |
| `003-component-org.mdc` | Component organization |
| `004-database.mdc` | Prisma patterns (prisma mode) |
| `005-api-routes.mdc` | API route patterns |
| `006-authentication.mdc` | Busibox SSO authentication |
| `007-error-handling.mdc` | Error handling approach |
| `008-testing.mdc` | Testing standards |

## Key Principle: Choose Your Mode

This template supports two operational modes:

### Frontend-Only Mode (APP_MODE=frontend)
- All data via API proxy routes
- No direct database access
- Use `requireAuthWithTokenExchange` for auth

### Prisma Mode (APP_MODE=prisma)
- Direct database access via Prisma
- Multi-tenant with organizationId filtering
- Use `getSession` for auth

## Quick Reference

### "What mode should I use?"
- **Frontend-only**: App proxies to existing backend APIs
- **Prisma**: App needs its own database

### "Where should I create this component?"
- **Shared** → `components/`
- **Feature-specific** → `components/[feature]/`
- **Page-only** → `app/[page]/components/`

### "How do I handle authentication?"
```typescript
// API routes
const auth = await requireAuthWithTokenExchange(request);
if (auth instanceof NextResponse) return auth;

// Use auth.apiToken for backend calls
```

### "How do I handle route params?"
```typescript
// ALWAYS await params in Next.js 16
const { id } = await params;
```

## Related Files

- **CLAUDE.md** - Main AI guidance file
- **README.md** - Project documentation
- **env.example** - Environment variables
