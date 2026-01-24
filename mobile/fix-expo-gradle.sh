#!/bin/bash
# Fix for expo-modules-core Gradle plugin issue
# This patches the ExpoModulesCorePlugin.gradle file to prevent the 'release' component error

EXPO_PLUGIN_FILE="node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle"

if [ -f "$EXPO_PLUGIN_FILE" ]; then
  echo "Patching ExpoModulesCorePlugin.gradle..."
  
  # Backup original file
  cp "$EXPO_PLUGIN_FILE" "${EXPO_PLUGIN_FILE}.backup"
  
  # Replace the problematic section
  sed -i 's/from components\.release/\/\/ from components.release/' "$EXPO_PLUGIN_FILE" 2>/dev/null || \
  sed -i '' 's/from components\.release/\/\/ from components.release/' "$EXPO_PLUGIN_FILE" 2>/dev/null
  
  echo "✅ Patched successfully"
else
  echo "⚠️  ExpoModulesCorePlugin.gradle not found - install dependencies first"
fi
