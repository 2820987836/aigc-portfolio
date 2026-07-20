# AIGC 作品集网站 — 使用指南

## 文件结构

```
site/
├── index.html       # 页面主文件
├── style.css        # 样式文件
├── script.js        # 交互逻辑
├── images/          # 所有图片素材
│   ├── ecom/        # 洁牙器电商图
│   ├── fan/         # 风扇电商图
│   ├── pillow/      # 枕头电商图
│   ├── spray/       # 蓬松喷雾电商图
│   └── character/   # AI漫剧角色图
└── videos/          # 视频文件（待放入）
```

## 如何添加新作品

### 1. 添加电商图片

把图片复制到 `images/` 对应的子目录，然后在 `index.html` 中找到 `works-panel` 区域，复制一个 `work-card` 块并修改路径：

```html
<a href="images/ecom/新图.png" class="work-card" data-lightbox>
    <img src="images/ecom/新图.png" alt="新作品" loading="lazy">
</a>
```

### 2. 添加视频

把 MP4 文件放到 `videos/` 目录，然后在 `index.html` 中找到 `video-card` 块，修改 `data-src`：

```html
<div class="video-cover" data-src="videos/新视频.mp4" data-type="mp4">
```

> 视频文件建议压缩到 20MB 以内，可用 HandBrake 等工具转码。

### 3. 修改个人信息

- 名字、slogan：搜索 `hero-title` 区域
- 联系方式：搜索 `contact-items` 区域，替换电话/邮箱/微信二维码
- 工具栈：搜索 `tool-grid` 区域

### 4. 本地预览

```bash
cd site
python3 -m http.server 8088
# 浏览器打开 http://localhost:8088
```

### 5. 重新部署

修改后重新部署到线上即可生效。

