# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## 專案概述

這是一個單頁 PWA（Progressive Web App），為 2026 年春季東京 13 天旅遊行程表。整個 app 只有一個 `index.html`，沒有建置工具、框架或套件管理器。

## 開發與部署

- **無建置步驟**：直接編輯 `index.html`，用瀏覽器開啟即可預覽。
- **部署**：`git push` 到 `main` branch，GitHub Pages 自動部署。
- **PWA 快取**：每次新增圖片或 PDF 到 `img/` 或 `pdf/`，必須同步將路徑加入 `sw.js` 的 `PRECACHE_URLS`，並將 `CACHE_NAME` 版本號遞增（例如 `tokyo-2026-v5` → `v6`）。

## 架構

### 單一檔案結構（index.html）

整個 app 分為幾個主要區塊，**全部寫在 index.html 內**：

1. **CSS**（`<style>`）：所有樣式，包含 RWD（`@media max-width: 480px`）與深色/淺色模式。
2. **HTML 結構**：Tab 導覽（概覽、Day 1–4、Day 5–6、Day 7–8、Day 9–13）+ 工具 Modal（Lists、Wallet、Gifts、Settings）。
3. **JavaScript**（`<script>`）：所有功能，無外部 JS 框架。

### Tab 切換機制

主 Tab 用 `<input type="radio" name="main-tab">` 的純 CSS 方式控制顯示（`:checked` selector），不依賴 JS。Day 內的手風琴也是同樣的 `<input type="radio/checkbox">` pattern。

### 資料持久化（Firebase + localStorage）

Firebase Firestore 用於兩位使用者之間的即時同步。架構：

- **未登入**：純 localStorage（`tokyo_cl`、`tokyo_memo`、`tokyo_ledger`、`tokyo_gifts`、`tokyo_wishlist`）
- **已登入**：`window.getXxxData` / `window.saveXxxData` 被 Firebase 區塊 override，讀取優先用 `_cache`，寫入同步到 Firestore `sync/{docKey}` collection。
- **`_cache`**：`{ cl, memo, ledger, gifts, wishlist, rate }`，初始全為 `null`。
- **`_migrateKey`**：登入後只在 Firebase 無資料 **且 localStorage 有實際資料時** 才遷移（避免寫入空陣列覆蓋預設值）。

### 行前清單（Checklist）初始化

`initClData()` 用 `localStorage.getItem('tokyo_cl_inited')` flag 判斷是否已初始化過，避免 Firebase 返回空陣列時預設值不顯示。

### Voucher（預約憑證）

位於 `#tab-voucher` 區塊，每天用 `<input type="checkbox" class="voucher-day-input">` 展開。圖片路徑直接用 `img/` 相對路徑。

### 禮品推薦（Gifts Modal）

縮圖 grid + modal 詳細頁，`openGift(id)` / `closeGift()` 控制。

## 常見操作注意事項

- **新增圖片**：放入 `img/`，同步加入 `sw.js` 的 `PRECACHE_URLS`，並升版 `CACHE_NAME`。
- **新增 PDF**：放入 `pdf/`，同步加入 `sw.js` 的 `PRECACHE_URLS`，並升版 `CACHE_NAME`。
- **git 慣例**：commit message 用中文，push 到 `main`。

## Imported Claude Cowork project instructions

我要做一個旅遊的html互動式網頁，之後做成pwa
