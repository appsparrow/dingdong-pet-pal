# Cloudflare Pages Build Error - Fix Checklist

## ✅ Build Works Locally

The build command runs successfully on your local machine:
```bash
cd mobile && npm run build:web
# Successfully exports to dist/ folder
```

## 🔧 Cloudflare Pages Configuration Checklist

### 1. Root Directory (CRITICAL)
Go to: **Cloudflare Dashboard → Workers & Pages → Your Project → Settings → Builds & deployments**

**Correct Setting:**
```
Root directory (advanced): mobile
```

❌ **Common mistake:** Setting it to `/` or leaving it empty
✅ **Must be:** `mobile`

---

### 2. Build Command
**Correct Setting:**
```
Build command: npx expo export --platform web --output-dir dist --clear
```

Or use the npm script:
```
Build command: npm run build:web
```

---

### 3. Build Output Directory
**Correct Setting:**
```
Build output directory: dist
```

Note: This is relative to the root directory (`mobile/dist`)

---

### 4. Node Version
**Recommended:** Node 18 or higher

Check/Set in Cloudflare:
```
Environment Variable:
NODE_VERSION = 18
```

Or add a `.node-version` file in the root:
```bash
echo "18" > /Users/siva/Documents/GitHub/pettabl/.node-version
```

---

### 5. Environment Variables
Go to: **Settings → Environment variables → Production**

**Required Variables:**
```
EXPO_PUBLIC_SUPABASE_URL=https://cxnvsqkeifgbjzrelytl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Optional (for R2 storage):**
```
EXPO_PUBLIC_R2_ACCOUNT_ID=
EXPO_PUBLIC_R2_ACCESS_KEY_ID=
EXPO_PUBLIC_R2_SECRET_ACCESS_KEY=
EXPO_PUBLIC_R2_BUCKET_NAME=
EXPO_PUBLIC_R2_PUBLIC_URL=
EXPO_PUBLIC_R2_ENDPOINT=
```

---

## 🐛 Common Deployment Errors

### Error: "expo: command not found"
**Cause:** npm install not running properly
**Fix:** Check root directory is set to `mobile`

### Error: "Module not found"
**Cause:** Dependencies not installed
**Fix:** 
1. Ensure `package-lock.json` is committed
2. Remove any `bun.lockb` files
3. Check root directory setting

### Error: "Build exceeded timeout"
**Cause:** Large build or slow network
**Fix:** 
- Try building again (sometimes resolves itself)
- Use `--clear` flag in build command

### Error: Build succeeds but page is blank
**Cause:** Environment variables missing
**Fix:** Add all `EXPO_PUBLIC_*` variables to Cloudflare

---

## 📋 Step-by-Step Fix Process

### Step 1: Verify Root Directory
```
Cloudflare Dashboard → Your Project → Settings → Builds & deployments
Root directory (advanced): mobile  ← MUST BE SET
```

### Step 2: Verify Build Settings
```
Framework preset: None (or Other)
Build command: npm run build:web
Build output directory: dist
```

### Step 3: Add Node Version
Add environment variable:
```
NODE_VERSION = 18
```

Or commit a `.node-version` file:
```bash
echo "18" > .node-version
git add .node-version
git commit -m "add node version for cloudflare"
git push
```

### Step 4: Add Environment Variables
Copy all `EXPO_PUBLIC_*` variables from `mobile/.env` to:
```
Cloudflare → Settings → Environment variables → Production
```

### Step 5: Retry Deployment
```
Cloudflare → Deployments → Retry deployment
```

Or trigger a new build:
```bash
git commit --allow-empty -m "trigger rebuild"
git push
```

---

## 🔍 Viewing Build Logs

1. Go to **Cloudflare Dashboard → Your Project → Deployments**
2. Click on the failed deployment
3. Look for the actual error message (not just "Failed: error occurred while running build command")
4. Common errors to look for:
   - `expo: command not found` → Root directory issue
   - `Cannot find module` → Dependencies issue
   - `Build timeout` → Try again
   - Environment variable errors → Add variables

---

## ✅ Quick Test After Fix

Once deployed successfully:

1. **Visit the URL** (e.g., `https://pettabl.pages.dev`)
2. **Landing page** should show:
   - Pettabl logo
   - "Coming Soon" banners (top and bottom)
   - Coral-pink to lavender gradient
3. **Try signing in** with Google OAuth
4. **Create a pet** and verify image upload works
5. **Switch roles** (Boss ↔ Watcher)

---

## 📞 Need More Help?

If the build still fails after checking all settings above:

1. **Share the full build log** from Cloudflare (click on the failed deployment)
2. **Check the commit** that Cloudflare is building (should be latest)
3. **Try a manual export locally** to confirm it still works:
   ```bash
   cd mobile
   rm -rf dist
   npm run build:web
   ```

---

**Last Updated:** Current session  
**Status:** Build works locally ✅ | Cloudflare config needs verification ⚠️

