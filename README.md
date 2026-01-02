# 🏎️ 兒童卡通賽車遊戲

一個色彩繽紛的兒童賽車遊戲，適合所有年齡的小朋友！

## 🎮 遊戲特色

- 🎨 **色彩繽紛**：卡通風格的設計，明亮可愛的顏色
- 🚗 **簡單操作**：使用方向鍵或點擊螢幕控制
- 📱 **支援手機**：完美支援觸控螢幕
- 🎯 **計分系統**：閃避障礙物獲得分數
- ❤️ **生命值系統**：3次碰撞機會

## 🎯 遊戲玩法

1. 點擊「開始遊戲」按鈕
2. 使用 **←** 和 **→** 方向鍵控制賽車左右移動
3. 或者直接點擊螢幕左右兩邊來控制
4. 閃避迎面而來的其他賽車
5. 每成功閃避一輛車可獲得 10 分
6. 避免碰撞，保護你的 3 條生命！

## 🚀 本地運行

1. 直接打開 `index.html` 文件
2. 或使用 HTTP 服務器：
   ```bash
   npx http-server -p 3000
   ```
3. 在瀏覽器訪問 `http://localhost:3000`

## 🌐 部署到 Vercel

### 方法 1：使用 Vercel CLI

1. 安裝 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 在項目目錄運行：
   ```bash
   vercel
   ```

3. 跟隨提示完成部署

### 方法 2：通過 GitHub

1. 將代碼推送到 GitHub
2. 在 [Vercel](https://vercel.com) 註冊/登錄
3. 點擊「Import Project」
4. 選擇你的 GitHub 倉庫
5. 點擊「Deploy」

部署完成後，你會獲得一個公開的網址，任何人都可以訪問！

## 📁 文件結構

```
.
├── index.html      # 主 HTML 文件
├── style.css       # 樣式表
├── game.js         # 遊戲邏輯
├── vercel.json     # Vercel 配置
├── package.json    # 項目配置
└── README.md       # 說明文件
```

## 🎨 自定義

你可以輕鬆自定義遊戲：

- 修改 `game.js` 中的 `COLORS` 對象來改變顏色
- 調整 `gameSpeed` 來改變難度
- 修改 `canvas.width` 和 `canvas.height` 來改變遊戲畫面大小

## 📝 技術棧

- HTML5 Canvas
- 純 JavaScript (無框架)
- CSS3 動畫
- 響應式設計

## 🎉 享受遊戲！

祝你玩得開心！看看你能得到多少分吧！🏆
