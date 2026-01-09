#!/bin/bash
#
# IHateWork Complete Uninstaller for Linux
#
# Usage:
#   chmod +x uninstall-linux.sh
#   ./uninstall-linux.sh
#
# Or run directly:
#   curl -fsSL https://raw.githubusercontent.com/maplex18/IHateWork/main/scripts/uninstall-linux.sh | bash
#

set -e

APP_NAME="IHW-ZoZ"

echo "╔════════════════════════════════════════╗"
echo "║   IHateWork Uninstaller for Linux      ║"
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

# Config directories
remove_if_exists "$HOME/.config/$APP_NAME"
remove_if_exists "$HOME/.config/ihw-zoz"
remove_if_exists "$HOME/.config/IHW-ZoZ"

# Local data
remove_if_exists "$HOME/.local/share/$APP_NAME"
remove_if_exists "$HOME/.local/share/ihw-zoz"

# Cache
remove_if_exists "$HOME/.cache/$APP_NAME"
remove_if_exists "$HOME/.cache/ihw-zoz"

# Desktop entries
remove_if_exists "$HOME/.local/share/applications/ihw-zoz.desktop"
remove_if_exists "$HOME/.local/share/applications/ihatework.desktop"
remove_if_exists "$HOME/.local/share/applications/IHW-ZoZ.desktop"

# Icons
remove_if_exists "$HOME/.local/share/icons/hicolor/256x256/apps/ihw-zoz.png"
remove_if_exists "$HOME/.local/share/icons/hicolor/512x512/apps/ihw-zoz.png"

# AppImage in common locations
remove_if_exists "$HOME/Applications/IHW-ZoZ.AppImage"
remove_if_exists "$HOME/Applications/IHateWork.AppImage"
remove_if_exists "$HOME/.local/bin/IHW-ZoZ.AppImage"
remove_if_exists "$HOME/.local/bin/IHateWork.AppImage"

# Try Snap uninstall
echo "[uninstall] Checking Snap installation..."
if command -v snap &> /dev/null; then
    if snap list ihatework &> /dev/null; then
        sudo snap remove ihatework
        echo "[uninstall] Removed Snap installation"
        ((removed++))
    fi
fi

# Snap data directory
remove_if_exists "$HOME/snap/ihatework"

# Try apt uninstall
echo "[uninstall] Checking apt installation..."
if command -v apt &> /dev/null; then
    if dpkg -l | grep -q ihatework; then
        sudo apt remove -y ihatework
        echo "[uninstall] Removed apt installation"
        ((removed++))
    fi
fi

# Try flatpak uninstall
echo "[uninstall] Checking Flatpak installation..."
if command -v flatpak &> /dev/null; then
    if flatpak list | grep -qi ihatework; then
        flatpak uninstall -y com.ihw-zoz.app
        echo "[uninstall] Removed Flatpak installation"
        ((removed++))
    fi
fi

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
fi

echo ""
echo "[uninstall] Complete! Removed $removed items."
