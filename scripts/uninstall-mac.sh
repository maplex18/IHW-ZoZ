#!/bin/bash
#
# IHateWork Complete Uninstaller for macOS
#
# Usage:
#   chmod +x uninstall-mac.sh
#   ./uninstall-mac.sh
#
# Or run directly:
#   curl -fsSL https://raw.githubusercontent.com/maplex18/IHateWork/main/scripts/uninstall-mac.sh | bash
#

set -e

APP_NAME="IHW-ZoZ"
APP_ID="com.ihw-zoz.app"

echo "╔════════════════════════════════════════╗"
echo "║   IHateWork Uninstaller for macOS      ║"
echo "╚════════════════════════════════════════╝"
echo ""

removed=0

remove_if_exists() {
    if [ -e "$1" ]; then
        rm -rf "$1"
        echo "[uninstall] Removed: $1"
        ((removed++))
    fi
}

echo "[uninstall] Removing application data..."

# Application Support
remove_if_exists "$HOME/Library/Application Support/$APP_NAME"
remove_if_exists "$HOME/Library/Application Support/ihw-zoz"

# Preferences
remove_if_exists "$HOME/Library/Preferences/${APP_ID}.plist"

# Caches
remove_if_exists "$HOME/Library/Caches/$APP_NAME"
remove_if_exists "$HOME/Library/Caches/ihw-zoz"

# Saved Application State
remove_if_exists "$HOME/Library/Saved Application State/${APP_ID}.savedState"

# Logs
remove_if_exists "$HOME/Library/Logs/$APP_NAME"

# Application binaries
remove_if_exists "/Applications/IHW-ZoZ.app"
remove_if_exists "/Applications/IHateWork.app"

# Try Homebrew uninstall
echo "[uninstall] Checking Homebrew installation..."
if command -v brew &> /dev/null; then
    if brew list --cask ihatework &> /dev/null; then
        brew uninstall --cask ihatework
        echo "[uninstall] Removed Homebrew Cask installation"
        ((removed++))
    fi
fi

echo ""
echo "[uninstall] Complete! Removed $removed items."
echo ""
echo "Note: If you installed via DMG, please also empty your Trash."
