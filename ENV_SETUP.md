# Environment Variable Setup Guide

## Overview

This frontend app uses **build-time environment variables** injected by Vite.

**IMPORTANT:** Do NOT commit `.env` files to the repo! Use `.env.local` for local development.

---

## Local Development Setup

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your local values:
   ```bash
   # .env.local
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=  # Optional: your Google OAuth client ID
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

Vite will automatically load `.env.local` (gitignored, safe).

---

## Production Build

**Method 1: Environment variable at build time (RECOMMENDED)**

```bash
VITE_API_URL=https://api.usecordy.com npm run build
```

**Method 2: Using .env.production.local (NOT RECOMMENDED for CI/CD)**

Create `.env.production.local`:
```bash
VITE_API_URL=https://api.usecordy.com
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Then build:
```bash
npm run build
```

**Method 3: CI/CD Pipeline (GitHub Actions, etc.)**

Set environment variables as GitHub Secrets, then inject at build time:

```yaml
# .github/workflows/deploy-frontend.yml
- name: Build frontend
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL }}
    VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
  run: npm run build
```

---

## Environment Variables Reference

### VITE_API_URL (REQUIRED)

- **Description:** Backend API base URL (without `/api/v1` suffix)
- **Local:** `http://localhost:5000`
- **Production:** `https://api.usecordy.com`
- **Build command:** `VITE_API_URL=https://api.usecordy.com npm run build`

### VITE_GOOGLE_CLIENT_ID (OPTIONAL)

- **Description:** Google OAuth 2.0 Client ID for Sign-In
- **If missing:** Google Sign-In button will be hidden
- **Setup:** See `.env.example` for instructions

### VITE_FIREBASE_* (OPTIONAL)

- **Description:** Firebase Cloud Messaging for push notifications
- **If missing:** Push notifications gracefully disabled

---

## Troubleshooting

### "API URL still points to localhost" warning in production build

**Cause:** `VITE_API_URL` was not set at build time.

**Fix:**
```bash
# Clear old build
rm -rf dist

# Rebuild with correct env
VITE_API_URL=https://api.usecordy.com npm run build
```

### "Google Client ID not configured" warning

**Cause:** `VITE_GOOGLE_CLIENT_ID` is not set.

**Fix:** Either:
1. Leave it empty (Google login will be hidden)
2. Set it at build time: `VITE_GOOGLE_CLIENT_ID=your-id npm run build`

### Socket connection errors / reconnection spam

**Cause:** Invalid socket URL or server unreachable.

**Fix:** Ensure `VITE_API_URL` is set correctly at build time. Socket URL is derived from API URL.

---

## File Priority (Vite)

Vite loads env files in this order (higher priority = later):

1. `.env` (committed, not recommended)
2. `.env.local` (gitignored, **recommended for local dev**)
3. `.env.[mode]` (e.g., `.env.production`)
4. `.env.[mode].local` (e.g., `.env.production.local`, gitignored)
5. **Environment variables passed at build time** (highest priority, **recommended for CI/CD**)

**Recommendation:** Use `.env.local` for local dev, and pass env vars at build time for production.

---

## Security Notes

- **Never commit** `.env`, `.env.local`, `.env.production` to git
- `.gitignore` already excludes these files
- Use GitHub Secrets or similar for CI/CD secrets
- Client-side env vars are **publicly visible** in the built JavaScript bundle
- Do NOT put secrets (API keys, passwords) in `VITE_*` variables
