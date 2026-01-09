<p align="center">
  <img src="resources/icons/icon.png" alt="IHW-ZoZ Logo" width="120" height="120">
</p>

<h1 align="center">IHW-ZoZ</h1>

<p align="center">
  <strong>跨平台本地媒體處理工具</strong><br>
  完全離線運作，您的檔案不會上傳至任何伺服器
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/license-Non--Commercial-orange?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/version-1.0.0-green?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/electron-33.0-47848F?style=flat-square&logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/react-18.3-61DAFB?style=flat-square&logo=react" alt="React">
</p>

<p align="center">
  <a href="#-功能特色">功能特色</a> •
  <a href="#-下載安裝">下載安裝</a> •
  <a href="#️-卸載方式">卸載方式</a> •
  <a href="#-開發指南">開發指南</a> •
  <a href="#-授權條款">授權條款</a>
</p>

---

## ✨ 功能特色

<table>
<tr>
<td width="33%" valign="top">

### 📄 PDF 工具

| 功能 | 說明 |
|:-----|:-----|
| 合併 | 多個 PDF 合而為一 |
| 分割 | 拆分為多個檔案 |
| 壓縮 | 減少檔案大小 |
| 轉圖片 | 頁面轉換為圖片 |
| 旋轉 | 旋轉頁面方向 |
| 浮水印 | 添加文字浮水印 |
| 加解密 | 密碼保護功能 |

</td>
<td width="33%" valign="top">

### 🎬 媒體工具

| 功能 | 說明 |
|:-----|:-----|
| 影片壓縮 | 減少影片大小 |
| 影片轉檔 | MP4/MKV/AVI... |
| 音訊轉檔 | MP3/WAV/FLAC... |
| 音訊提取 | 從影片提取音軌 |
| 媒體裁剪 | 擷取特定片段 |

</td>
<td width="33%" valign="top">

### 🖼️ 圖片工具

| 功能 | 說明 |
|:-----|:-----|
| GIF 製作 | 多圖合成動圖 |
| 縮放 | 調整圖片尺寸 |
| 裁切 | 裁切指定區域 |
| 旋轉 | 任意角度旋轉 |
| 翻轉 | 水平/垂直翻轉 |
| 放大 | AI 無損放大 |

</td>
</tr>
</table>

---

## 🔒 隱私保護

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   🔐 所有處理皆在本地完成，檔案不會離開您的電腦        │
│                                                         │
│   ✓ 無需網路連線        ✓ 無雲端上傳                   │
│   ✓ 無追蹤程式          ✓ 完全開源                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📥 下載安裝

### 一般用戶

從 [GitHub Releases](https://github.com/maplex18/IHW-ZoZ/releases) 下載最新版本：

| 平台 | 檔案 | 說明 |
|:-----|:-----|:-----|
| 🍎 macOS (Apple Silicon) | `IHW-ZoZ-x.x.x-arm64.dmg` | M1/M2/M3 晶片 |
| 🪟 Windows (安裝版) | `IHW-ZoZ Setup x.x.x.exe` | 標準安裝程式 |
| 🪟 Windows (免安裝) | `IHW-ZoZ x.x.x.exe` | 綠色版，無需安裝 |

### ⚠️ macOS 首次開啟說明

由於應用程式尚未經過 Apple 公證，首次開啟時會顯示安全警告。

<details>
<summary><b>👉 點擊查看解決方法</b></summary>

#### 方法 A：右鍵開啟（推薦）

1. 在 Applications 資料夾中找到 **IHW-ZoZ**
2. **按住 Control 鍵並點擊**（或右鍵點擊）
3. 選擇「**打開**」
4. 在彈出的對話框中點擊「**打開**」

![右鍵打開](docs/images/right-click-open.png)

#### 方法 B：從系統設定開啟

1. 開啟「**系統設定**」→「**隱私權與安全性**」
2. 向下捲動找到安全性區域
3. 點擊「**強制打開**」(Open Anyway)

![系統設定](docs/images/system-settings-security.png)

</details>

📖 詳細圖文教學：[macOS 安裝指南](docs/INSTALL_MACOS.md)

### 系統需求

| 項目 | 需求 |
|:-----|:-----|
| 作業系統 | Windows 10+、macOS 10.15+、Linux |
| Node.js | 18.0 或更高版本 (開發用) |
| Python | 3.9 或更高版本 (開發用) |

---

## 🗑️ 卸載方式

### 方式 1：使用套件管理器

<table>
<tr>
<td width="33%" align="center">

**🍎 macOS**

```bash
brew uninstall --cask ihatework --zap
```
`--zap` 會移除所有使用者資料

</td>
<td width="33%" align="center">

**🪟 Windows**

```bash
winget uninstall maplex18.IHateWork
```

</td>
<td width="33%" align="center">

**🐧 Linux**

```bash
snap remove ihatework
```

</td>
</tr>
</table>

### 方式 2：使用平台專用腳本

<details>
<summary><b>🍎 macOS</b></summary>

```bash
# 下載並執行
curl -fsSL https://raw.githubusercontent.com/maplex18/IHW-ZoZ/main/scripts/uninstall-mac.sh | bash

# 或本地執行
./scripts/uninstall-mac.sh
```

</details>

<details>
<summary><b>🪟 Windows (PowerShell)</b></summary>

```powershell
# 右鍵 uninstall-windows.ps1 → "以 PowerShell 執行"
# 或在 PowerShell 中：
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\scripts\uninstall-windows.ps1
```

</details>

<details>
<summary><b>🐧 Linux</b></summary>

```bash
# 下載並執行
curl -fsSL https://raw.githubusercontent.com/maplex18/IHW-ZoZ/main/scripts/uninstall-linux.sh | bash

# 或本地執行
./scripts/uninstall-linux.sh
```

</details>

### 方式 3：使用 npm 腳本

```bash
npm run uninstall
```

### 移除項目說明

| 平台 | 移除項目 |
|:-----|:---------|
| 🍎 macOS | `~/Library/Application Support/`、`~/Library/Caches/`、`~/Library/Preferences/`、`/Applications/*.app` |
| 🪟 Windows | `%APPDATA%`、`%LOCALAPPDATA%`、Program Files、開始選單捷徑 |
| 🐧 Linux | `~/.config/`、`~/.local/share/`、`~/.cache/`、Snap 資料 |

---

## 🔧 開發指南

### 環境設定

```bash
# 1️⃣ 複製專案
git clone https://github.com/maplex18/IHW-ZoZ.git
cd IHW-ZoZ

# 2️⃣ 安裝依賴
npm install
pip install -r python/requirements.txt

# 3️⃣ 啟動開發模式
npm run dev
```

### 打包應用程式

<table>
<tr>
<td>

**Windows**
```bash
npm run build:win
```

</td>
<td>

**macOS**
```bash
npm run build:mac
```

</td>
<td>

**Linux**
```bash
npm run build:linux
```

</td>
</tr>
</table>

### 發布流程

```bash
# 1️⃣ 本地測試
npm run build:python    # 構建 Python 後端
npm run release:mac     # 完整構建 macOS 版本

# 2️⃣ 建立版本標籤
git tag v1.0.0
git push origin v1.0.0
```

> 📦 推送 tag 後，GitHub Actions 會自動構建三平台版本並發布到 Releases

---

## 🛠️ 技術架構

```
IHW-ZoZ
├── 前端 (Renderer)
│   ├── ⚛️  React 18
│   ├── 📘 TypeScript
│   └── 🎨 Tailwind CSS
│
├── 桌面框架
│   └── ⚡ Electron 33
│
└── 後端 (Python)
    ├── 📄 PyPDF2 / pdf2image
    ├── 🎬 FFmpeg
    └── 🖼️  Pillow
```

---

## ⚠️ 授權條款

本專案採用 **自訂授權條款**，詳見 [LICENSE](LICENSE)

<table>
<tr>
<td>🚫</td>
<td><strong>禁止違法使用</strong></td>
<td>不得用於任何違法用途</td>
</tr>
<tr>
<td>🚫</td>
<td><strong>禁止商業使用</strong></td>
<td>未經授權不得用於商業目的</td>
</tr>
<tr>
<td>✅</td>
<td><strong>署名要求</strong></td>
<td>修改或散布時須保留原作者資訊</td>
</tr>
</table>

---

## 👤 作者

**maple**

---

## 📜 免責聲明

> 本軟體僅供個人學習與合法用途使用。作者不對任何因使用本軟體而導致的損失或法律問題負責。使用者須自行確保其使用方式符合當地法律法規。

---

<p align="center">
  <sub>Built with ❤️ using Electron + React + Python</sub>
</p>
