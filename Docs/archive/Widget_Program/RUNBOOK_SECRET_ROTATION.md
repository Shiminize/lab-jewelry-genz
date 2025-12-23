# RUNBOOK: Auth Secret Rotation

_Last updated: Nov 17, 2025_

Use this guide to rotate the secrets that power GlowGlitch authentication.

## 1. Required Secrets

| Variable | Description | Location |
| --- | --- | --- |
| `AUTH_SECRET` | NextAuth JWT signing key | `.env`, Vercel/Render secret store |
| `MONGODB_URI` / `MONGODB_DB` | Atlas cluster + database | Secret store |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth (web app) | Google Cloud Console |
| `AUTH_APPLE_ID` / `AUTH_APPLE_SECRET` | Apple Sign-In | Apple Developer portal |
| `AUTH_FACEBOOK_ID` / `AUTH_FACEBOOK_SECRET` | Meta Login | Meta Developer portal |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Password reset delivery | Email provider |

## 2. Rotation Checklist

1. **Stage the new secret** in the provider dashboard (Google/Azure/Meta/etc.). Grant only the scopes we use (`email`, `profile`).
2. **Update `.env.local`** and run `npm run dev:next` locally to verify sign-in/reset flows.
3. **Sync secrets to the remote store** (Vercel/Render/Doppler):
   ```bash
   vercel env add AUTH_GOOGLE_SECRET
   ```
4. **Deploy to staging** (or use `NEXT_DISABLE_MIDDLEWARE_AUTH=1`) and run:
   - `npm run seed:auth` (ensures admin/customer accounts still exist)
   - `npm run test:unit`
   - `npx playwright test tests/e2e/auth.spec.ts` (once merged)
5. **Monitor logs** for `Session verification failed` or SMTP errors after rollout.

## 3. Emergency Rollback

All social + email features are guarded by env detection. To disable:

```bash
AUTH_GOOGLE_ID=""
AUTH_APPLE_ID=""
AUTH_FACEBOOK_ID=""
```

Restart the server—login/register will hide social buttons automatically.

If password reset emails fail, SMTP helper logs the reset link to stdout so support can assist manually.

## 4. References

- `src/lib/auth/config.ts` – provider definitions.
- `src/app/api/auth/forgot-password/route.ts` – reset emails + rate limiting.
- `src/lib/email.ts` – SMTP transport configuration.
- `scripts/seed-auth-users.ts` – bootstrap admin + customer accounts.
