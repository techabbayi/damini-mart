#!/bin/bash
# Fix for expo-modules-core Gradle plugin issue
# This patches the ExpoModulesCorePlugin.gradle file to prevent the 'release' component error

EXPO_PLUGIN_FILE="node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle"

if [ -f "$EXPO_PLUGIN_FILE" ]; then
  echo "🔧 Patching ExpoModulesCorePlugin.gradle..."
  
  # Backup original file
  cp "$EXPO_PLUGIN_FILE" "${EXPO_PLUGIN_FILE}.backup" 2>/dev/null || true
  
  # Comment out the problematic line that references 'components.release'
  sed -i.bak 's/from components\.release/\/\/ PATCHED: from components.release/' "$EXPO_PLUGIN_FILE" 2>/dev/null || \
  sed -i '' 's/from components\.release/\/\/ PATCHED: from components.release/' "$EXPO_PLUGIN_FILE" 2>/dev/null || \
  perl -pi -e 's/from components\.release/\/\/ PATCHED: from components.release/' "$EXPO_PLUGIN_FILE" 2>/dev/null
  
  echo "✅ Expo modules patch applied successfully"
  echo "📄 Patched file: $EXPO_PLUGIN_FILE"
else
  echo "⚠️  ExpoModulesCorePlugin.gradle not found"
  echo "💡 Make sure to run 'npm install' first"
  exit 1
fi
