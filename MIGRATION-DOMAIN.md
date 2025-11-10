## Domain Migration: erindmuga.in → erindmuga.com

### 1. Overview
We are migrating all frontend and backend services from the `.in` domain to the new `.com` domain. The old domain will remain temporarily accessible for SEO continuity and user bookmarks during a transition window (recommended: 30–60 days) before setting up 301 redirects.

### 2. New Domain Map
| Purpose | Old | New |
|---------|-----|-----|
| Frontend primary | https://www.erindmuga.in | https://www.erindmuga.com |
| Frontend root (redirect) | https://erindmuga.in | https://erindmuga.com |
| Backend API | https://api.erindmuga.in | https://api.erindmuga.com |
| Google OAuth redirect | https://api.erindmuga.in/user/auth/google/callback | https://api.erindmuga.com/user/auth/google/callback |

### 3. Code Changes Applied
Ref updates performed:
- CORS allowed origins now include `.com` plus legacy `.in` entries.
- Vite `allowedHosts` updated.
- Fallback OAuth callback and frontend redirect URLs updated.
- `.env.production` (client + server) updated for BASE_URL/FRONTEND_URL/GOOGLE_CALLBACK_URL.

### 4. Render Dashboard Checklist
Frontend service:
1. Add custom domain `www.erindmuga.com`.
2. (Optional) Add apex/root `erindmuga.com` and set redirect to `www.erindmuga.com`.
3. Update environment variables:
   - `VITE_BASE_URL=https://api.erindmuga.com`
   - `VITE_FRONTEND_URL=https://www.erindmuga.com`
4. Trigger redeploy.

Backend service:
1. Add custom domain `api.erindmuga.com`.
2. Update env vars:
   - `BASE_URL=https://api.erindmuga.com`
   - `FRONTEND_URL=https://www.erindmuga.com`
   - `GOOGLE_CALLBACK_URL=https://api.erindmuga.com/user/auth/google/callback`
3. Redeploy.

### 5. DNS (Nameservers: ns1.dns-parking.com / ns2.dns-parking.com)
Create/verify records at the domain registrar or DNS manager:
| Host | Type | Value | TTL | Notes |
|------|------|-------|-----|-------|
| @ (erindmuga.com) | A / ALIAS | Render frontend IP or ALIAS to onrender host | 300 | Use ALIAS if IP not static |
| www | CNAME | erimuga-frontend.onrender.com | 300 | Points to frontend service |
| api | CNAME | <backend-service>.onrender.com | 300 | Points to backend service |

If Render provides a specific CNAME target for apex, prefer ALIAS/ANAME if supported.

### 6. Google OAuth Console Updates
In Google Cloud Console → APIs & Services → Credentials → OAuth Client:
Authorized JavaScript Origins:
```
https://www.erindmuga.com
https://erindmuga.com
```
Authorized Redirect URIs:
```
https://api.erindmuga.com/user/auth/google/callback
```
Keep localhost dev entries:
```
http://localhost:5173
http://localhost:5000/user/auth/google/callback
```

### 7. Post-Migration Verification
1. Load https://www.erindmuga.com → site renders, console free of CORS/OAuth errors.
2. Perform Google login → redirected back with `?auth=success` param.
3. API requests use `https://api.erindmuga.com` in network tab.
4. Products, cart, and orders pages function normally.
5. SSL certificates valid for new domains.
6. Old `.in` domain still serves content (phase 1) or 301 redirects (phase 2).

### 8. SEO & Redirect Strategy (Phase 2)
After 30–60 days configure 301 redirects from `.in` to `.com` to preserve search ranking. Update sitemap, robots.txt, and resubmit property in Google Search Console.

### 9. Rollback Plan
If critical breakage occurs:
1. Revert env variables to `.in` values.
2. Remove `.com` CNAME/A records temporarily.
3. Redeploy services.

### 10. Next Improvements
- Add automated domain health check endpoint verifying OAuth + CORS.
- Set up monitoring for 4xx/5xx anomalies post-migration.

---
Generated on: ${new Date().toISOString()}