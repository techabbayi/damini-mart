# GitHub Actions Setup for EAS Build

## Prerequisites

### 1. Get Your Expo Access Token
```bash
cd mobile
npx eas login
npx eas whoami
npx eas build:configure
```

### 2. Generate Expo Token
```bash
npx eas token:create
```
Copy the token that's generated.

### 3. Add Token to GitHub Secrets
1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `EXPO_TOKEN`
5. Value: Paste the token you copied
6. Click **Add secret**

## Workflows

### 🤖 `build-android.yml`
Automatically builds Android APK using EAS Build.

**Triggers:**
- Push to `main` or `master` branch
- Pull requests to `main` or `master`
- Manual trigger with custom build profile

**Manual Trigger:**
1. Go to **Actions** tab in GitHub
2. Select **Build Android APK** workflow
3. Click **Run workflow**
4. Choose build profile (preview/production)
5. Click **Run workflow**

## Build Profiles

Your `eas.json` should have these profiles:
- **preview**: Development builds with debug enabled
- **production**: Release builds for Play Store

## Troubleshooting

### Build fails with "EXPO_TOKEN not set"
- Make sure you added `EXPO_TOKEN` to GitHub Secrets
- Token should be valid and not expired

### Build fails with "Project not configured"
Run locally first:
```bash
cd mobile
npx eas build:configure
git add eas.json
git commit -m "Configure EAS Build"
git push
```

### Build fails with authentication error
Generate a new token:
```bash
npx eas token:create
```
Update the `EXPO_TOKEN` secret in GitHub.

## Monitoring Builds

After the workflow runs:
1. Visit [Expo Dashboard](https://expo.dev)
2. Go to your project builds
3. Download APK when ready
4. You'll receive email notifications for build completion

## Cost Notes

- EAS Build free tier: 30 builds/month
- Builds typically take 10-20 minutes
- Failed builds don't count against quota
