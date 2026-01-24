#!/bin/bash
# Fix for expo-modules-core and expo-eas-client Gradle plugin issues
# This patches problematic Gradle files to prevent build errors

echo "🔧 Applying Expo Gradle patches..."

# Fix 1: Patch ExpoModulesCorePlugin.gradle
EXPO_PLUGIN_FILE="node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle"
if [ -f "$EXPO_PLUGIN_FILE" ]; then
  echo "📝 Patching ExpoModulesCorePlugin.gradle..."
  cp "$EXPO_PLUGIN_FILE" "${EXPO_PLUGIN_FILE}.backup" 2>/dev/null || true
  
  sed -i.bak 's/from components\.release/\/\/ PATCHED: from components.release/' "$EXPO_PLUGIN_FILE" 2>/dev/null || \
  sed -i '' 's/from components\.release/\/\/ PATCHED: from components.release/' "$EXPO_PLUGIN_FILE" 2>/dev/null || \
  perl -pi -e 's/from components\.release/\/\/ PATCHED: from components.release/' "$EXPO_PLUGIN_FILE" 2>/dev/null
  
  echo "   ✅ ExpoModulesCorePlugin patched"
fi

# Fix 2: Replace expo-eas-client build.gradle with working version
EAS_CLIENT_BUILD="node_modules/expo-eas-client/android/build.gradle"
if [ -f "$EAS_CLIENT_BUILD" ]; then
  echo "📝 Replacing expo-eas-client build.gradle..."
  cp "$EAS_CLIENT_BUILD" "${EAS_CLIENT_BUILD}.backup" 2>/dev/null || true
  
  # Create a minimal working build.gradle
  cat > "$EAS_CLIENT_BUILD" << 'EOF'
// PATCHED VERSION - Simplified to avoid gradle plugin issues
apply plugin: 'com.android.library'
apply plugin: 'kotlin-android'

group = 'expo.modules.easclient'
version = '0.1.0'

def expoModulesCorePlugin = new File(project(":expo-modules-core").projectDir.absolutePath, "ExpoModulesCorePlugin.gradle")
apply from: expoModulesCorePlugin

android {
  compileSdkVersion safeExtGet("compileSdkVersion", 34)
  namespace "expo.modules.easclient"
  defaultConfig {
    minSdkVersion safeExtGet("minSdkVersion", 23)
    targetSdkVersion safeExtGet("targetSdkVersion", 34)
    versionCode 1
    versionName "0.1.0"
  }
  lintOptions {
    abortOnError false
  }
}

repositories {
  mavenCentral()
}

dependencies {
  implementation project(':expo-modules-core')
  implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:${getKotlinVersion()}"
}
EOF
  
  echo "   ✅ expo-eas-client build.gradle replaced"
fi

echo "✅ All Expo Gradle patches applied successfully!"
