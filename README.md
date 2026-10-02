# 🎵 MKOnlinePlayer · 在线音乐播放器

> MKOnlinePlayer v2.41 二次美化版 | Next.js + Vercel 部署

**线上地址**: https://music.coaar.com  
**GitHub**: https://github.com/ybming/MusicPlayer

---

## ✨ 特性

- 🎨 **毛玻璃弹窗** — 统一 layer 弹窗风格，白色光晕边框 + 弹跳动画
- 🎵 **动态粒子背景** — particles.js 白色粒子飘动效果
- 🖼️ **壁纸系统** — 7 张 SVG 渐变 + 自定义壁纸配置（wallpaperList）
- 🎧 **倍速/播放控制** — 支持 0.5x~4x 播放倍速
- 📝 **歌词同步** — 网易云/QQ 音乐实时歌词，支持翻译切换
- 🎤 **多音源搜索** — 网易云、QQ 音乐歌单/歌曲搜索
- 🎡 **黑胶唱片封面** — 播放时匀速旋转动画
- 🔐 **JSONP 跨域** — 支持前端跨域调用

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 原生 HTML/CSS/JS + jQuery + layer.js + tippy.js |
| 后端 API | **Next.js 14 App Router Route Handler** |
| 加密 | Node.js `crypto` (AES-128-ECB) |
| 部署 | **Vercel** (Serverless Functions) |
| 原 PHP api.php | ✅ 已重写为 TypeScript |

## 📁 项目结构

```
mkonlineplayer/
├── app/
│   ├── api/music/route.ts   # ⭐ Next.js Route Handler（替代 api.php + Meting.php）
│   ├── page.tsx             # 根路径 → /index.html
│   └── layout.tsx
├── public/
│   ├── index.html           # 播放器入口
│   ├── css/                 # player.css · small.css · font-awesome
│   │   └── fonts/           # MiSans · yw · fontawesome
│   ├── js/                  # player.js · functions.js · ajax.js · lyric.js · awkins.js
│   ├── images/              # 封面/按钮/光标/动画 GIF
│   │   └── bg/              # 7 张 SVG + 自定义 JPG
│   ├── plugns/              # layer.js（弹窗库）
│   └── favicon.ico
├── next.config.js           # rewrites: /api.php → /api/music
├── package.json
└── tsconfig.json
```

## 🔌 API 接口

前端 jQuery.ajax 默认调 `POST /api/music`，参数合并自 query string + form body。

| types | source | 参数 | 说明 | 返回格式 |
|-------|--------|------|------|----------|
| `search` | netease | `name` `count` `pages` | 搜索歌曲 | 格式化数组 `[{id,name,artist:[],...}]` |
| `playlist` | netease | `id` | 歌单详情 | **原始网易云** `{playlist:{tracks:[...]}}` |
| `url` | netease | `id` | 歌曲播放链接 | `{url:"...", br:320}` |
| `lyric` | netease | `id` | 歌词 | `{lyric:"...", tlyric:"..."}` |
| `pic` | netease | `id` | 封面 URL | `{url:"https://..."}` |
| `userlist` | netease | `uid` | 用户歌单列表 | 原始网易云 JSON |

> 加 `&callback=xxx` 返回 JSONP。

### 为什么 playlist 不格式化？

前端 `ajaxSearch()` 期望**统一格式**（`artist` 是数组），但 `ajaxPlayList()` 期望**原始网易云格式**（`playlist.tracks[i].ar[0].name`）。Route Handler 按前端实际需要返回不同格式。

## 🎨 自定义壁纸

打开 `js/awkins.js` 顶部的 wallpaperList 配置：

```js
// 往 images/bg/ 丢图片后，把文件名（含后缀）加到这个数组里即可
var wallpaperList = [
    '0.svg', '1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg',
    'Z.jpg', 'bg1.jpg', 'bg2.jpg'   // ← 你自己的图
];
```

然后把图片文件丢进 `public/images/bg/` 目录即可。

## 🚀 本地开发

```bash
# 安装依赖
npm install

# 开发模式（http://localhost:3000）
npm run dev

# 生产构建
npm run build

# 启动生产版本
npm start
```

## 📦 部署到 Vercel

本项目已配置好 Next.js，直接连接 GitHub 仓库即可：

1. 新建 Vercel Project → Import `ybming/MusicPlayer`
2. Framework 自动检测为 **Next.js**，无需额外配置
3. Build Command: `next build`，Output: `.next`
4. Domain: `music.coaar.com`（已绑定）

### 手动部署

```bash
npm install -g vercel
vercel --prod
```

### 本地 XAMPP 运行（旧版 PHP api.php）

```
c:\xampp\htdocs\mkonlineplayer\  ← 项目放这里
访问 http://localhost:8080/mkonlineplayer/
```

> ⚠️ XAMPP 跑的是原版 api.php（PHP），不是 Next.js Route Handler。两者接口完全一致，前端代码零改动即可切换。

## ⚡ Next.js Route Handler vs 原版 PHP

| 对比 | 原版 PHP | Next.js Route Handler |
|------|---------|----------------------|
| 入口 | api.php | app/api/music/route.ts |
| 加密 | openssl_encrypt (aes-128-ecb) | Node crypto createCipheriv |
| HTTP | curl | fetch |
| JSONP | ✅ | ✅ |
| CORS | header() | NextResponse headers |
| 部署 | PHP 服务器 | Vercel Serverless |
| 依赖 | Meting.php（1100 行） | 内嵌重写 ~360 行 TS |

## 📜 License

MIT © mengkun (http://mkblog.cn) — 原作者  
MIT © ybming — Next.js 重写 + 界面美化
