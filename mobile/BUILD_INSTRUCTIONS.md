# Damini Mart Mobile App - Build Instructions

## ✅ All Critical Issues Fixed!

All critical and high-priority issues have been resolved. The app is now ready for APK building.

## Prerequisites

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure Backend URL**:
   - Open `app.json`
   - Update `extra.apiUrl` to your production backend URL
   - Current: `http://192.168.1.100:5000/api` (Change this to your server IP/domain)

## Build APK

### Option 1: Build APK Locally (Recommended for Testing)

```bash
cd mobile
eas build --profile preview --platform android --local
```

### Option 2: Build APK on EAS Servers (For Production)

```bash
cd mobile
eas build --profile production --platform android
```

## Build Profiles

The app has 3 build profiles in `eas.json`:

1. **development** - For development builds with dev client
2. **preview** - For internal testing (APK)
3. **production** - For production release (APK/AAB)

## Before Building

### 1. Update API URL
Edit `mobile/app.json`:
```json
"extra": {
  "apiUrl": "https://your-production-api.com/api"
}
```

### 2. Convert SVG Assets to PNG (Optional but Recommended)

The app includes SVG assets. For better compatibility, convert them to PNG:

```bash
cd mobile/assets

# Using online converters (easiest):
# 1. Go to https://svgtopng.com/
# 2. Upload each .svg file
# 3. Download as .png with same name

# Or use sharp-cli:
npm install -g sharp-cli
npx sharp-cli -i icon.svg -o icon.png --width 1024
npx sharp-cli -i adaptive-icon.svg -o adaptive-icon.png --width 1024
npx sharp-cli -i splash.svg -o splash.png --width 1284 --height 2778
npx sharp-cli -i favicon.svg -o favicon.png --width 48
```

### 3. Test on Device

Before building APK, test on a real device:

```bash
cd mobile
npm start

# Then scan QR code with Expo Go app
```

## Install Dependencies

If you haven't already:

```bash
cd mobile
npm install
```

## Common Issues

### Build Fails?
- Ensure you're logged into EAS: `eas login`
- Check your internet connection
- Verify all dependencies are installed: `npm install`

### API Not Working?
- Make sure backend is running
- Update `apiUrl` in `app.json` to correct IP/domain
- For local testing, use your computer's local IP (not localhost)
- Check firewall settings

### Assets Missing?
- Ensure PNG files exist in `mobile/assets/`
- Icon: 1024x1024px
- Adaptive Icon: 1024x1024px
- Splash: 1284x2778px

## What Was Fixed

### Critical Issues ✅
1. Auth Store - Now correctly parses `{ data: { user, accessToken, refreshToken } }`
2. Cart Endpoints - Fixed to use `/cart/item` for update/remove
3. Cart Parameters - Now sends `variantName` instead of `variantId`
4. Checkout - Sends `variantName` string, not object
5. Assets Folder - Created with placeholder SVG icons

### High Priority ✅
6. API URL - Changed from localhost to network IP
7. API Response - Consistent extraction with fallbacks
8. Token Refresh - Now parses `accessToken` correctly
9. Error Handling - Added network error detection
10. EAS Config - Created `eas.json` for builds

## Production Checklist

Before releasing to users:

- [ ] Replace placeholder icons with real branding
- [ ] Update `apiUrl` to production backend
- [ ] Test all flows: login, cart, checkout, orders
- [ ] Test on multiple Android versions
- [ ] Enable crash reporting (Sentry)
- [ ] Add analytics (Firebase/Amplitude)
- [ ] Configure push notifications
- [ ] Set up deep linking
- [ ] Add app signing for Play Store
- [ ] Create privacy policy & terms
- [ ] Test payment gateway integration

## Next Steps

1. Build preview APK for testing
2. Test on real devices
3. Fix any device-specific issues
4. Build production APK
5. Upload to Google Play Console

## Support

For issues, check:
- Expo documentation: https://docs.expo.dev/
- EAS Build docs: https://docs.expo.dev/build/setup/
- Backend API docs: See `FRONTEND_INTEGRATION.md`

---

**Note**: The app uses Expo Router for navigation and is fully ready for APK building!
