# Local Dev Environment Clean Restart

## Problem
Frontend still sends requests to `https://api.usecordy.com` instead of `http://localhost:5000`

## Root Cause
Vite dev server doesn't hot-reload environment variables. Must restart after `.env.local` changes.

## Fix Steps

### 1. Stop ALL dev servers
```bash
# Press Ctrl+C in ALL terminal windows running:
# - Frontend (npm run dev)
# - Backend (npm run dev)
```

### 2. Verify .env.local exists and is correct
```bash
cd C:\Users\ustun\Desktop\Projeler\MotoGain\apps\motogain-frontend
cat .env.local
```

**Must contain:**
```
VITE_API_URL=http://localhost:5000
```

### 3. Clean browser cache (CRITICAL)
**Option A: Use Incognito/Private Window (Recommended)**
- Chrome: Ctrl+Shift+N
- Firefox: Ctrl+Shift+P
- Edge: Ctrl+Shift+N

**Option B: Clear Cache**
- Chrome: Ctrl+Shift+Delete → Check "Cached images and files" → Clear

### 4. Restart Backend
```bash
cd C:\Users\ustun\Desktop\Projeler\MotoGain\apps\backend
npm run dev
```

**Wait for:**
```
🔒 CORS Mode: DEVELOPMENT
🔒 Allowed origins: 8 origins
✅ [STARTUP] Cloudinary preset validated: motogain_listings
✅ MongoDB bağlandı
🚀 Server 5000 portunda çalışıyor
```

### 5. Restart Frontend
```bash
cd C:\Users\ustun\Desktop\Projeler\MotoGain\apps\motogain-frontend
npm run dev
```

**Wait for:**
```
  VITE v... ready in ...ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 6. Open in FRESH browser window
- If using regular browser: Hard refresh with Ctrl+Shift+R
- If using incognito: Just open http://localhost:5173

### 7. Verify in Browser Console
**Open DevTools (F12) → Console**

**You MUST see:**
```javascript
🔧 Environment Config: {
  mode: 'development',
  apiUrl: 'http://localhost:5000',    // ← CRITICAL: Must be localhost
  socketUrl: 'http://localhost:5000',  // ← CRITICAL: Must be localhost
  googleClientId: 'not configured'
}
```

**If you still see `api.usecordy.com`:**
- Browser is using OLD cached bundle
- Close ALL browser tabs for localhost:5173
- Clear browser cache completely
- Restart browser
- Try incognito mode

### 8. Verify Network Requests
**DevTools → Network tab**

1. Navigate to http://localhost:5173/login
2. Enter any email/password
3. Click "Giriş Yap"
4. **Check the login request:**
   - URL MUST be: `http://localhost:5000/api/v1/auth/login`
   - NOT: `https://api.usecordy.com/api/v1/auth/login`

### 9. If STILL hitting production API
**Nuclear option - clear Vite cache:**
```bash
cd C:\Users\ustun\Desktop\Projeler\MotoGain\apps\motogain-frontend
rm -rf node_modules/.vite
npm run dev
```

## Verification Checklist

After restart, verify these requests go to **localhost:5000**:

- [ ] POST /api/v1/auth/login
- [ ] GET /api/v1/listings
- [ ] POST /api/v1/listings
- [ ] GET /api/v1/brands
- [ ] GET /api/v1/notifications/feed
- [ ] GET /api/v1/conversations
- [ ] POST /api/v1/blocks
- [ ] POST /api/v1/reports/user
- [ ] POST /api/v1/reports/listing

**All requests MUST show:**
```
Request URL: http://localhost:5000/api/v1/...
```

**NONE should show:**
```
Request URL: https://api.usecordy.com/api/v1/...
```

## Common Pitfalls

❌ **Don't do this:**
- Modifying .env.local while dev server is running
- Not restarting frontend after env changes
- Testing in browser with old cached bundle
- Having multiple .env files with conflicting values

✅ **Do this:**
- Stop dev server BEFORE editing .env.local
- Restart dev server AFTER editing .env.local
- Use incognito mode or hard refresh after restart
- Check console log for env config on every restart
