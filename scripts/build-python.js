#!/usr/bin/env node
/**
 * Build script for PyInstaller
 * Builds the Python backend into a standalone executable
 */

const { execSync, spawnSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const ROOT_DIR = path.resolve(__dirname, '..')
const PYTHON_DIR = path.join(ROOT_DIR, 'python')
const DIST_DIR = path.join(PYTHON_DIR, 'dist')

// Determine platform-specific executable name
const isWindows = process.platform === 'win32'
const executableName = isWindows ? 'ihatework-backend.exe' : 'ihatework-backend'

function log(message) {
  console.log(`[build-python] ${message}`)
}

function error(message) {
  console.error(`[build-python] ERROR: ${message}`)
  process.exit(1)
}

function checkPython() {
  const pythonCmd = isWindows ? 'python' : 'python3'
  try {
    const result = spawnSync(pythonCmd, ['--version'], { encoding: 'utf-8' })
    if (result.status !== 0) {
      error('Python is not installed or not in PATH')
    }
    log(`Found ${result.stdout.trim() || result.stderr.trim()}`)
    return pythonCmd
  } catch (e) {
    error('Python is not installed or not in PATH')
  }
}

function checkPyInstaller(pythonCmd) {
  try {
    const result = spawnSync(pythonCmd, ['-m', 'PyInstaller', '--version'], { encoding: 'utf-8' })
    if (result.status !== 0) {
      log('PyInstaller not found, installing...')
      execSync(`${pythonCmd} -m pip install pyinstaller`, { stdio: 'inherit' })
    } else {
      log(`Found PyInstaller ${result.stdout.trim()}`)
    }
  } catch (e) {
    log('PyInstaller not found, installing...')
    execSync(`${pythonCmd} -m pip install pyinstaller`, { stdio: 'inherit' })
  }
}

function installDependencies(pythonCmd) {
  const requirementsPath = path.join(PYTHON_DIR, 'requirements.txt')
  if (fs.existsSync(requirementsPath)) {
    log('Installing Python dependencies...')
    execSync(`${pythonCmd} -m pip install -r "${requirementsPath}"`, {
      stdio: 'inherit',
      cwd: PYTHON_DIR
    })
  }
}

function buildExecutable(pythonCmd) {
  log('Building Python backend with PyInstaller...')

  const specFile = path.join(PYTHON_DIR, 'ihatework.spec')

  if (!fs.existsSync(specFile)) {
    error('Spec file not found: ' + specFile)
  }

  // Clean previous build
  const buildDir = path.join(PYTHON_DIR, 'build')
  if (fs.existsSync(buildDir)) {
    log('Cleaning previous build...')
    fs.rmSync(buildDir, { recursive: true })
  }
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true })
  }

  // Run PyInstaller
  execSync(`${pythonCmd} -m PyInstaller "${specFile}" --noconfirm`, {
    stdio: 'inherit',
    cwd: PYTHON_DIR
  })

  // Verify output
  const outputPath = path.join(DIST_DIR, executableName)
  if (!fs.existsSync(outputPath)) {
    error('Build failed: executable not found at ' + outputPath)
  }

  const stats = fs.statSync(outputPath)
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
  log(`Build successful! Executable size: ${sizeMB} MB`)
  log(`Output: ${outputPath}`)
}

function main() {
  log('Starting Python backend build...')
  log(`Platform: ${process.platform}`)
  log(`Architecture: ${process.arch}`)

  const pythonCmd = checkPython()
  checkPyInstaller(pythonCmd)
  installDependencies(pythonCmd)
  buildExecutable(pythonCmd)

  log('Build complete!')
}

main()
