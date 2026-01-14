<p align="center">
  <img src="resources/icons/icon.png" alt="IHW-ZoZ Logo" width="120" height="120">
</p>

<h1 align="center">IHW-ZoZ</h1>

<p align="center">
  <strong>クロスプラットフォーム・ローカルメディア処理ツール</strong><br>
  完全オフライン動作 - ファイルがコンピュータから外部に出ることはありません
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/license-Non--Commercial-orange?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/version-1.1.0-green?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/electron-33.0-47848F?style=flat-square&logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/react-18.3-61DAFB?style=flat-square&logo=react" alt="React">
</p>

<p align="center">
  <a href="#-機能">機能</a> •
  <a href="#-インストール">インストール</a> •
  <a href="#-技術スタック">技術スタック</a> •
  <a href="#-ライセンス">ライセンス</a> •
  <a href="README.md">English</a> •
  <a href="README.zh-TW.md">繁體中文</a>
</p>

---

<p align="center">
  <img src="docs/screenshots/home-en.png" alt="IHW-ZoZ Screenshot" width="800">
</p>

---

## 機能

<table>
<tr>
<td width="33%" valign="top">

### PDF ツール

| 機能 | 説明 |
|:-----|:-----|
| 結合 | 複数のPDFを結合 |
| 分割 | 複数のファイルに分割 |
| 圧縮 | ファイルサイズを削減 |
| 画像変換 | ページを画像に変換 |
| 回転 | ページの向きを回転 |
| 透かし | テキスト透かしを追加 |
| 暗号化/復号化 | パスワード保護 |

</td>
<td width="33%" valign="top">

### メディアツール

| 機能 | 説明 |
|:-----|:-----|
| 動画圧縮 | 動画サイズを削減 |
| 動画変換 | MP4/MKV/AVI... |
| 音声変換 | MP3/WAV/FLAC... |
| 音声抽出 | 動画から音声を抽出 |
| メディアトリミング | 特定部分を切り出し |

</td>
<td width="33%" valign="top">

### 画像ツール

| 機能 | 説明 |
|:-----|:-----|
| GIF作成 | 画像からGIFを作成 |
| リサイズ | 画像サイズを調整 |
| トリミング | 指定範囲を切り抜き |
| 回転 | 任意の角度に回転 |
| 反転 | 水平/垂直反転 |
| 高画質化 | AIによるロスレス拡大 |

</td>
</tr>
</table>

---

## プライバシー保護

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   🔒 全ての処理はあなたのコンピュータ上でローカルに行われます    │
│                                                         │
│   ✓ インターネット不要      ✓ クラウドアップロードなし        │
│   ✓ トラッキングなし        ✓ 完全オープンソース            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## システム要件

| 項目 | 要件 |
|:-----|:-----|
| オペレーティングシステム | Windows 10+, macOS 10.15+, Linux |
| Node.js | 18.0 以上 |
| Python | 3.9 以上 |

---

## インストール

### クイックスタート

```bash
# 1. リポジトリをクローン
git clone https://github.com/maplex18/IHW-ZoZ.git
cd IHW-ZoZ

# 2. Node.jsの依存関係をインストール
npm install

# 3. Pythonの依存関係をインストール
pip install -r python/requirements.txt

# 4. 開発モードを開始
npm run dev
```

### アプリケーションのビルド

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

---

## 技術スタック

```
IHW-ZoZ
├── フロントエンド (Renderer)
│   ├── ⚛️  React 18
│   ├── 📘 TypeScript
│   └── 🎨 Tailwind CSS
│
├── デスクトップフレームワーク
│   └── ⚡ Electron 33
│
└── バックエンド (Python)
    ├── 📄 PyPDF2 / pdf2image
    ├── 🎬 FFmpeg
    └── 🖼️  Pillow
```

---

## ライセンス

本プロジェクトは **カスタムライセンス** を使用しています。詳細は [LICENSE](LICENSE) をご覧ください。

<table>
<tr>
<td>🚫</td>
<td><strong>違法な使用の禁止</strong></td>
<td>違法な目的で使用してはなりません</td>
</tr>
<tr>
<td>🚫</td>
<td><strong>商用利用の禁止</strong></td>
<td>許可なく商用目的で使用することはできません</td>
</tr>
<tr>
<td>✅</td>
<td><strong>帰属表示の義務</strong></td>
<td>変更または配布する際は原作者の情報を保持する必要があります</td>
</tr>
</table>

---

## 作者

**maple**

---

## 免責事項

> 本ソフトウェアは個人の学習および合法的な使用のみを目的として提供されています。作者は、本ソフトウェアの使用に起因するいかなる損失や法的問題についても責任を負いません。ユーザーは、自身の使用が現地の法律および規制に準拠していることを確認する必要があります。

---

<p align="center">
  <sub>Built with ❤️ using Electron + React + Python</sub>
</p>
