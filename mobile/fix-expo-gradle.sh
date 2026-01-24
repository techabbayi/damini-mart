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

# Fix 2: Patch expo-eas-client build.gradle
EAS_CLIENT_BUILD="node_modules/expo-eas-client/android/build.gradle"
if [ -f "$EAS_CLIENT_BUILD" ]; then
  echo "📝 Patching expo-eas-client build.gradle..."
  cp "$EAS_CLIENT_BUILD" "${EAS_CLIENT_BUILD}.backup" 2>/dev/null || true
  
  # Replace the plugin line with a comment
  sed -i.bak "s/id 'expo-module-gradle-plugin'/\/\/ PATCHED: id 'expo-module-gradle-plugin'/" "$EAS_CLIENT_BUILD" 2>/dev/null || \
  sed -i '' "s/id 'expo-module-gradle-plugin'/\/\/ PATCHED: id 'expo-module-gradle-plugin'/" "$EAS_CLIENT_BUILD" 2>/dev/null || \
  perl -pi -e "s/id 'expo-module-gradle-plugin'/\/\/ PATCHED: id 'expo-module-gradle-plugin'/" "$EAS_CLIENT_BUILD" 2>/dev/null
  
  echo "   ✅ expo-eas-client patched"
fi

echo "✅ All Expo Gradle patches applied successfully!"
