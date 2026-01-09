# macOS 安裝指南

由於 IHW-ZoZ 尚未經過 Apple 公證 (Notarization)，首次開啟時 macOS 會顯示安全警告。請按照以下步驟操作：

---

## 步驟 1：下載並安裝

1. 從 [Releases](https://github.com/maplex18/IHW-ZoZ/releases) 下載 `IHW-ZoZ-x.x.x-arm64.dmg`
2. 開啟 DMG 檔案
3. 將 **IHW-ZoZ** 拖曳到 **Applications** 資料夾

![安裝步驟](images/install-drag.png)

---

## 步驟 2：首次開啟

首次開啟應用程式時，你會看到以下警告：

![無法驗證開發者](images/gatekeeper-warning.png)

> "IHW-ZoZ" cannot be opened because Apple cannot verify it for malicious software.

**請勿點擊「移到垃圾桶」！**

---

## 步驟 3：允許開啟應用程式

### 方法 A：使用右鍵選單（推薦）

1. 在 **Applications** 資料夾中找到 **IHW-ZoZ**
2. **按住 Control 鍵並點擊**（或右鍵點擊）應用程式圖示
3. 從選單中選擇 **「打開」**

![右鍵打開](images/right-click-open.png)

4. 在彈出的對話框中點擊 **「打開」**

![確認打開](images/confirm-open.png)

---

### 方法 B：從系統設定開啟

1. 開啟 **系統設定** (System Settings)
2. 點擊左側的 **「隱私權與安全性」** (Privacy & Security)
3. 向下捲動到 **「安全性」** 區域
4. 你會看到訊息：「"IHW-ZoZ" was blocked...」
5. 點擊 **「強制打開」** (Open Anyway)

![系統設定](images/system-settings-security.png)

6. 輸入你的 Mac 密碼以確認
7. 在彈出的對話框中點擊 **「打開」**

---

## 完成！

之後就可以正常開啟應用程式了，不會再出現警告。

---

## 常見問題

### Q: 為什麼會有這個警告？
A: macOS Gatekeeper 會阻擋未經 Apple 公證的應用程式。這是一個安全機制，但對於獨立開發者的應用程式來說，公證需要付費的 Apple Developer 帳號。

### Q: 這個應用程式安全嗎？
A: 是的。IHW-ZoZ 是開源軟體，你可以在 [GitHub](https://github.com/maplex18/IHW-ZoZ) 上查看完整的原始碼。

### Q: 我使用的是 Intel Mac，可以使用嗎？
A: 目前僅提供 Apple Silicon (M1/M2/M3) 版本。Intel 版本即將推出。
