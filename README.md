# IHW-ZoZ

跨平台本地媒體處理工具 - 完全離線運作，保護您的隱私。

## 功能特色

### PDF 工具
- **合併 PDF** - 將多個 PDF 檔案合併為一個
- **分割 PDF** - 將 PDF 拆分為多個檔案
- **壓縮 PDF** - 減少 PDF 檔案大小
- **PDF 轉圖片** - 將 PDF 頁面轉換為圖片
- **旋轉 PDF** - 旋轉 PDF 頁面
- **浮水印** - 為 PDF 添加浮水印
- **加密/解密** - PDF 密碼保護

### 媒體工具
- **影片壓縮** - 壓縮影片檔案大小
- **影片轉檔** - 轉換影片格式
- **音訊轉檔** - 轉換音訊格式
- **音訊提取** - 從影片中提取音訊
- **媒體裁剪** - 裁剪影片/音訊片段

### 圖片工具
- **GIF 製作** - 從多張圖片製作 GIF
- **圖片縮放** - 調整圖片尺寸
- **圖片裁切** - 裁切圖片區域
- **圖片旋轉** - 旋轉圖片角度
- **圖片翻轉** - 水平/垂直翻轉
- **圖片放大** - AI 圖片放大

## 系統需求

- **作業系統**: Windows 10+、macOS 10.15+、Linux
- **Node.js**: 18+
- **Python**: 3.9+
- **FFmpeg**: 需要另外安裝

## 安裝

### 1. 安裝依賴

```bash
# 安裝 Node.js 依賴
npm install

# 安裝 Python 依賴
pip install -r python/requirements.txt
```

### 2. 安裝 FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
下載 FFmpeg 並加入系統 PATH

**Linux:**
```bash
sudo apt install ffmpeg
```

### 3. 開發模式

```bash
npm run dev
```

### 4. 打包應用程式

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## 技術架構

- **前端**: Electron + React + TypeScript + Tailwind CSS
- **後端**: Python JSON-RPC Server
- **媒體處理**: FFmpeg
- **PDF 處理**: PyPDF2、pdf2image
- **圖片處理**: Pillow

## 授權條款

本專案採用自訂授權條款，詳見 [LICENSE](LICENSE) 檔案。

**重要限制:**
- 禁止用於任何違法用途
- 禁止商業使用
- 必須保留原作者署名

## 作者

maple

## 免責聲明

本軟體僅供個人學習與合法用途使用。作者不對任何因使用本軟體而導致的損失或法律問題負責。使用者須自行確保其使用方式符合當地法律法規。
