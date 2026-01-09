#!/usr/bin/env node
/**
 * Uninstall script for IHateWork
 * Completely removes the application and all user data
 *
 * Usage:
 *   node scripts/uninstall.js
 *   npm run uninstall
 */

const fs = require('fs')
const path = require('path')
const os = require('os')
const { execSync } = require('child_process')

const APP_NAME = 'IHW-ZoZ'
const APP_ID = 'com.ihw-zoz.app'

function log(message) {
  console.log(`[uninstall] ${message}`)
}

function warn(message) {
  console.warn(`[uninstall] WARNING: ${message}`)
}

function removeIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      if (stats.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true })
      } else {
        fs.unlinkSync(filePath)
      }
      log(`Removed: ${filePath}`)
      return true
    }
  } catch (e) {
    warn(`Failed to remove ${filePath}: ${e.message}`)
  }
  return false
}

function getMacPaths() {
  const home = os.homedir()
  return [
    // Application Support
    path.join(home, 'Library', 'Application Support', APP_NAME),
    path.join(home, 'Library', 'Application Support', 'ihw-zoz'),
    // Preferences
    path.join(home, 'Library', 'Preferences', `${APP_ID}.plist`),
    // Caches
    path.join(home, 'Library', 'Caches', APP_NAME),
    path.join(home, 'Library', 'Caches', 'ihw-zoz'),
    // Saved Application State
    path.join(home, 'Library', 'Saved Application State', `${APP_ID}.savedState`),
    // Logs
    path.join(home, 'Library', 'Logs', APP_NAME),
    // Application binary (if installed via DMG)
    '/Applications/IHW-ZoZ.app',
    '/Applications/IHateWork.app',
  ]
}

function getWindowsPaths() {
  const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming')
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
  return [
    // Roaming AppData
    path.join(appData, APP_NAME),
    path.join(appData, 'ihw-zoz'),
    // Local AppData
    path.join(localAppData, APP_NAME),
    path.join(localAppData, 'ihw-zoz'),
    path.join(localAppData, 'ihw-zoz-updater'),
    // Program Files (requires admin)
    path.join(process.env.PROGRAMFILES || 'C:\\Program Files', APP_NAME),
    path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', APP_NAME),
  ]
}

function getLinuxPaths() {
  const home = os.homedir()
  return [
    // Config
    path.join(home, '.config', APP_NAME),
    path.join(home, '.config', 'ihw-zoz'),
    path.join(home, '.config', 'IHW-ZoZ'),
    // Local data
    path.join(home, '.local', 'share', APP_NAME),
    path.join(home, '.local', 'share', 'ihw-zoz'),
    // Cache
    path.join(home, '.cache', APP_NAME),
    path.join(home, '.cache', 'ihw-zoz'),
    // Desktop entry
    path.join(home, '.local', 'share', 'applications', 'ihw-zoz.desktop'),
    path.join(home, '.local', 'share', 'applications', 'ihatework.desktop'),
    // Snap data
    path.join(home, 'snap', 'ihatework'),
  ]
}

function uninstallMac() {
  log('Uninstalling on macOS...')

  const paths = getMacPaths()
  let removed = 0

  for (const p of paths) {
    if (removeIfExists(p)) removed++
  }

  // Try to remove from Homebrew if installed
  try {
    execSync('brew uninstall --cask ihatework 2>/dev/null', { stdio: 'pipe' })
    log('Removed Homebrew Cask installation')
    removed++
  } catch (e) {
    // Not installed via Homebrew
  }

  return removed
}

function uninstallWindows() {
  log('Uninstalling on Windows...')

  const paths = getWindowsPaths()
  let removed = 0

  for (const p of paths) {
    if (removeIfExists(p)) removed++
  }

  // Try to remove from Winget
  try {
    execSync('winget uninstall maplex18.IHateWork 2>nul', { stdio: 'pipe' })
    log('Removed Winget installation')
    removed++
  } catch (e) {
    // Not installed via Winget
  }

  // Note: Registry entries would require admin privileges
  log('Note: Some registry entries may remain. Run Windows uninstaller for complete removal.')

  return removed
}

function uninstallLinux() {
  log('Uninstalling on Linux...')

  const paths = getLinuxPaths()
  let removed = 0

  for (const p of paths) {
    if (removeIfExists(p)) removed++
  }

  // Try to remove Snap installation
  try {
    execSync('snap remove ihatework 2>/dev/null', { stdio: 'pipe' })
    log('Removed Snap installation')
    removed++
  } catch (e) {
    // Not installed via Snap
  }

  // Try to remove apt installation
  try {
    execSync('sudo apt remove -y ihatework 2>/dev/null', { stdio: 'pipe' })
    log('Removed apt installation')
    removed++
  } catch (e) {
    // Not installed via apt
  }

  return removed
}

function main() {
  console.log('╔════════════════════════════════════════╗')
  console.log('║     IHateWork Complete Uninstaller     ║')
  console.log('╚════════════════════════════════════════╝')
  console.log('')

  const platform = process.platform
  let removed = 0

  switch (platform) {
    case 'darwin':
      removed = uninstallMac()
      break
    case 'win32':
      removed = uninstallWindows()
      break
    case 'linux':
      removed = uninstallLinux()
      break
    default:
      console.error(`Unsupported platform: ${platform}`)
      process.exit(1)
  }

  console.log('')
  if (removed > 0) {
    log(`Uninstall complete. Removed ${removed} items.`)
  } else {
    log('No files found to remove. Application may not be installed.')
  }
}

main()
