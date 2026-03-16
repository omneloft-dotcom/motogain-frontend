# Google Sign-In Setup Guide

## Overview

Web frontend now supports Google Sign-In, matching mobile parity. This is **optional** - email/password login works independently.

## Backend Support

✅ Backend already has Google auth endpoint: `POST /api/v1/auth/google`

## Frontend Configuration

### Step 1: Get Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create new project or select existing
3. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Choose **Web application**
5. Add **Authorized JavaScript origins:**
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
6. Click **Create** and copy the **Client ID**

### Step 2: Configure Frontend Environment

Create `.env` file in `apps/motogain-frontend/`:

```bash
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### Step 3: Configure Backend Environment

Backend must have the **SAME** client ID in `apps/backend/.env`:

```bash
GOOGLE_OAUTH_CLIENT_ID_WEB=your-client-id-here.apps.googleusercontent.com
```

⚠️ **CRITICAL:** Frontend and backend must use the **SAME** client ID for token verification.

### Step 4: Restart Servers

```bash
# Frontend
cd apps/motogain-frontend
npm run dev

# Backend
cd apps/backend
npm run dev
```

## Testing

1. Visit login page: http://localhost:5173/login
2. Should see "Continue with Google" button below email/password form
3. Click button → Google account picker appears
4. Select account → Redirects to dashboard
5. Refresh page → Should stay logged in

## Graceful Degradation

If `VITE_GOOGLE_CLIENT_ID` is not configured:
- ✅ Login page still works
- ✅ Email/password login unaffected
- ✅ Google button simply doesn't appear
- ✅ No crashes or errors

## Security Notes

- ID token is sent to backend for server-side verification
- Backend verifies token with Google before issuing JWT
- Same auth storage format as email/password login
- Token stored in `localStorage.auth` as `{ accessToken, refreshToken, user }`

## Troubleshooting

**Google button doesn't appear:**
- Check `VITE_GOOGLE_CLIENT_ID` is set in `.env`
- Check browser console for errors
- Verify Google Identity Services script loaded (check Network tab)

**401/403 after Google login:**
- Verify backend has same client ID in `GOOGLE_OAUTH_CLIENT_ID_WEB`
- Check backend logs for token verification errors
- Ensure authorized origins include your domain

**Account linking:**
- If user already has email/password account with same email, Google login will link to it
- Name and photo from Google profile will be used if not already set
