# GitHub Pages Deployment Fix

## Problem
The original error was 404 when trying to deploy:
```
Error: Failed to create deployment (status: 404)
```

This happens because GitHub Pages was not enabled in repository settings.

## Root Cause
The deployment action `actions/deploy-pages@v4` requires:
1. GitHub Pages to be enabled in repository settings
2. The workflow needs proper permissions (`pages: write`, `id-token: write`)
3. The source must be set to "GitHub Actions" in settings

## Files Created/Modified

### 1. `.github/workflows/deploy.yml`
- Created GitHub Actions workflow for automated deployment
- Runs on push to main/master
- Builds Next.js app with `output: 'export'`
- Uploads `dist` folder as artifact
- Deploys using `actions/deploy-pages@v4`

### 2. `BLACKJACK/next.config.mjs`
- Added `basePath: '/BlackJack'` for subdirectory path
- Configured for static export with `output: 'export'`
- Outputs to `distDir: 'dist'`

### 3. `BLACKJACK/README.md`
- Added deployment instructions
- Documented required GitHub repository settings

## Manual Setup Required

You MUST complete these steps before deployment will work:

1. Go to: https://github.com/ravisairockey/BlackJack/settings/pages
2. Under "Build and deployment", set Source to "GitHub Actions"
3. Click Save

After that, push these changes to trigger deployment.

## Workflow Details

The workflow:
1. Checks out code on Ubuntu
2. Sets up Node.js 20
3. Installs dependencies: `npm ci` in BLACKJACK/
4. Builds: `npm run build` (Next.js exports to `dist/`)
5. Uploads artifact from `BLACKJACK/dist`
6. Deploys to GitHub Pages

## Verification

Local build (from BLACKJACK directory):
```bash
cd BLACKJACK
npm ci
npm run build
# Check dist/ folder exists
```

## Common Issues

### Issue: 404 on deployment
**Fix**: Enable GitHub Pages in repository settings as described above.

### Issue: Build fails locally
**Cause**: Local npm hoisting to parent directory.
**Note**: This won't affect GitHub Actions which has clean environment.

### Issue: Site assets not loading
**Cause**: Missing or incorrect `basePath` in next.config.mjs
**Fix**: Verify `basePath: '/BlackJack'` matches repository name exactly.
