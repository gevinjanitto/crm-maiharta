# Auth testing — existing repository integration

## Verifikasi sesi sinkronisasi Kanban (2026-10-03)
JWT playbook consulted for local runtime configuration only; existing authentication implementation preserved. Use the current seed accounts in memory/test_credentials.md, not credentials from older repository history.
Browser: wait for brand intro/inert to clear AND wait until captcha-question contains digits before solving the displayed question and submitting. CAPTCHA is single use. A test that reads `...` before the challenge loads is invalid. Actual browser login passed without auth code changes. The existing lockout is 15 failed attempts/10 minutes, not the generic playbook's example of 5.

Preserve existing auth.py, core.py and seed.py. Environment supplies JWT_SECRET, SEED_PASSWORD, ADMIN_EMAIL. No production credentials used.

1. Verify local Mongo users have bcrypt password_hash, unique username/id indexes, sessions and captcha TTL indexes.
2. GET /api/auth/captcha; solve returned arithmetic challenge. POST /api/auth/login with username, password, captcha_id and captcha_answer.
3. Verify returned bearer token and secure HttpOnly session cookie, GET /api/auth/me, logout invalidation.
4. Test unauthorized 401, Developer assignment/project scope, Client read-only task fields, manager-only changes.
5. Use external REACT_APP_BACKEND_URL and accounts in memory/test_credentials.md. Existing auth API contract is retained; no register/refresh endpoint added.
6. Existing login policy is 15 failed attempts within 10 minutes. This was not requested to change. Test 16th attempt with a unique nonexistent username, never lock out the admin account.
7. Preview ingress rewrites Origin to a cluster alias. Verify application CORS in isolation with ASGI transport and verify browser same-origin authenticated requests; do not mistake ingress rewriting for an application regression.

## JWT playbook testing reference — mapped to existing CRM contract
The JWT integration playbook was consulted for the idle rehydration bug. Its generic email/access-token/refresh-token examples must not replace this established username, captcha, `maiharta_session` cookie + Bearer session contract.

### Step 1: MongoDB verification
Read only the configured MONGO_URL/DB_NAME. Verify bcrypt `$2b$` hashes, unique username/id indexes, and session/captcha expiry TTL indexes. Existing credentials remain in memory/test_credentials.md; do not reseed or change them to generic example credentials.

### Step 2: API and browser verification
Use external REACT_APP_BACKEND_URL. Solve GET /api/auth/captcha, POST /api/auth/login with repository fields. Verify returned user/token and Secure HttpOnly SameSite=None cookie. GET /api/auth/me must restore the same user; POST /api/auth/logout must invalidate token and remove cookie. Preserve current authorization behavior.

### Step 3: Idle lifecycle regression
- Create test sessions through actual login; only backdate those sessions for deterministic 899/901-second boundary checks.
- GET /auth/me and polling must not change last_activity_at; /auth/activity must reject age outside [0,900000), and expired sessions cannot be renewed.
- Browser reload must preserve exact last-event timestamp for a matching session. Do not choose the newer server time on hydration. Real input is the only renewal trigger.
- Verify each input class, hidden/sleep resume, remember-me, cross-tab activity/logout, offline logout, expiry notice and server token revocation. Use controlled browser clocks rather than waiting 15 minutes.
- Confirm logo intro on login/logout/refresh, not route changes. Reduced-motion must leave no inert blockers.

### Deterministic UI readiness (verified in iteration25)
Before filling login fields, wait for login-form, wait brand-intro to detach, and wait until login-username has no `[inert]` ancestor. Do not force-fill through the intro. Use a separate requests/cookie session for admin fixture setup, otherwise the browser can restore the wrong authenticated account.
The iteration24 input-instability finding was a timing false positive; iteration25 confirms fresh client email/12345678 login redirects to /settings and cannot leave until first password change.