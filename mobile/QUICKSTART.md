# 🚀 QUICK START GUIDE - Damini Mart Mobile v1.1.0

## ⚡ Get Started in 5 Minutes

### **Step 1: Install Packages** (1 min)
```bash
cd mobile
npm install
```

### **Step 2: Configure API** (1 min)
Edit `mobile/lib/config.js`:
```javascript
const ENV = {
    dev: {
        apiUrl: 'http://YOUR_LOCAL_IP:5000/api',  // ← Change this!
    },
};
```

**Find your IP:**
- Windows: `ipconfig` (look for IPv4)
- Mac/Linux: `ifconfig` (look for inet)

### **Step 3: Start the App** (1 min)
```bash
npx expo start
```

### **Step 4: Open on Device** (1 min)
1. Install "Expo Go" app from Play Store/App Store
2. Scan QR code shown in terminal
3. Wait for app to load

### **Step 5: Test Features** (1 min)
1. Browse products ✅
2. Add to cart ✅
3. Enable notifications (Account → Notifications) ✅
4. Share a product ✅
5. Try "Use Current Location" in checkout ✅

---

## 🔥 **What Works Out of the Box**

✅ All basic e-commerce features  
✅ Push notifications (on physical device)  
✅ Location services  
✅ Product sharing  
✅ Infinite scroll  
✅ Image caching  
✅ Haptic feedback  
✅ Error handling  

---

## 🐛 **Common Issues**

### **Issue: Can't connect to API**
**Solution:** Update IP in `lib/config.js`
```javascript
apiUrl: 'http://192.168.1.100:5000/api'  // Use YOUR IP
```

### **Issue: Push notifications not working**
**Reason:** Emulators don't support push notifications  
**Solution:** Use a physical Android/iOS device

### **Issue: Location not working**
**Solution:** Grant location permission in device settings

### **Issue: Images not loading**
**Solution:** Check backend is returning correct image URLs

---

## 📱 **Build APK (For Testing)**

```bash
# One-time setup
npm install -g eas-cli
eas login

# Build APK
cd mobile
eas build --profile preview --platform android --local
```

The APK will be in `mobile/` folder after build completes (~5-10 mins).

---

## 🎯 **Key Files to Know**

| File | Purpose |
|------|---------|
| `lib/config.js` | API URL configuration |
| `app.json` | App settings & permissions |
| `eas.json` | Build configuration |
| `package.json` | Dependencies |
| `lib/api.js` | API client |
| `lib/notificationService.js` | Push notifications |
| `lib/locationService.js` | GPS & maps |

---

## 🛠️ **Troubleshooting Commands**

```bash
# Clear cache
npx expo start -c

# Reset everything
rm -rf node_modules
npm install

# Check errors
npx expo-doctor

# View logs
npx react-native log-android  # Android logs
npx react-native log-ios      # iOS logs
```

---

## 📖 **More Documentation**

- **UPGRADE_COMPLETE.md** - Full list of changes
- **FEATURES.md** - Feature documentation
- **BUILD_INSTRUCTIONS.md** - Building APK/AAB

---

## 🆘 **Need Help?**

1. Check console logs in terminal
2. Check device logs in Expo Go app
3. Read UPGRADE_COMPLETE.md for details
4. Contact: AKMultivision Multimedia Services

---

## ✨ **Next Steps**

1. Test all features thoroughly
2. Update backend API URL for production
3. Build production APK
4. Upload to Google Play Store
5. Celebrate! 🎉

---

**Happy Coding! 🚀**
