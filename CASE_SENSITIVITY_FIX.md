# 🐛 Case Sensitivity Fix - Header.tsx and Footer.tsx

## The Problem

Docker build was failing with:
```
Module not found: Can't resolve '@/components/layout/Header'
Module not found: Can't resolve '@/components/layout/Footer'
```

## Root Cause

**Case sensitivity mismatch between Windows and Linux!**

### What Happened:
1. On **Windows** (development):
   - File system is case-**insensitive**
   - Files were named: `Header.tsx` and `Footer.tsx` (uppercase)
   - Git tracked them as: `header.tsx` and `footer.tsx` (lowercase)
   - Everything worked fine locally because Windows doesn't care about case

2. On **Linux** (Docker/Server):
   - File system is case-**sensitive**
   - Git checkout created: `header.tsx` and `footer.tsx` (lowercase)
   - Code imported: `@/components/layout/Header` (uppercase)
   - **Mismatch! Files not found.**

## The Fix

Fixed by correcting the filename case in git:

```bash
# Rename in git to use proper case
git mv src/components/layout/header.tsx src/components/layout/Header-temp.tsx
git mv src/components/layout/Header-temp.tsx src/components/layout/Header.tsx

git mv src/components/layout/footer.tsx src/components/layout/Footer-temp.tsx
git mv src/components/layout/Footer-temp.tsx src/components/layout/Footer.tsx

# Commit the changes
git commit -m "fix: correct case-sensitive filenames for Header.tsx and Footer.tsx"
```

**Why the temp rename?**
Git on Windows sometimes doesn't detect case-only renames, so we:
1. Rename to a temp name first
2. Then rename to the correct case

## Verification

Before:
```bash
$ git ls-files src/components/layout/ | grep -E "(Header|Footer)"
src/components/layout/footer.tsx  ❌
src/components/layout/header.tsx  ❌
```

After:
```bash
$ git ls-files src/components/layout/ | grep -E "(Header|Footer)"
src/components/layout/Footer.tsx  ✅
src/components/layout/Header.tsx  ✅
```

## Prevention

### For Developers on Windows:

1. **Use `core.ignorecase = false` in git config:**
   ```bash
   git config core.ignorecase false
   ```
   This makes git on Windows respect case changes.

2. **Always use correct casing:**
   - React components: `PascalCase.tsx`
   - Regular modules: `camelCase.ts`
   - Config files: `lowercase.config.ts`

3. **Check before committing:**
   ```bash
   # Show actual filenames in git
   git ls-files src/components/
   ```

4. **Use a linter:**
   ESLint can catch import case mismatches:
   ```json
   {
     "rules": {
       "import/no-unresolved": "error"
     }
   }
   ```

## Related Issues

This is a common problem when developing on Windows and deploying to Linux:
- [Next.js #15913](https://github.com/vercel/next.js/issues/15913)
- [React #10996](https://github.com/facebook/react/issues/10996)

## Testing After Fix

On the server:
```bash
# Pull the latest changes
git pull origin main

# Rebuild Docker image (will now work!)
make deploy

# Or manually:
docker compose build --no-cache bb-front
docker compose up -d bb-front
```

## Summary

✅ **Fixed:** Case sensitivity issue with Header.tsx and Footer.tsx  
✅ **Committed:** Changes are in git with correct casing  
✅ **Status:** Docker build will now work on Linux servers  

**Next step:** Push to remote and redeploy on the server.

```bash
git push origin main
```

Then on server:
```bash
git pull
make deploy
```

