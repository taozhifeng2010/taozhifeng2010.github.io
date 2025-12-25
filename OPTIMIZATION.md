# WASM 文件加载优化说明

## 已实施的优化

### 1. 资源预加载
在 HTML 头部添加了预加载链接，让浏览器提前开始下载 WASM 文件：
- `vision_wasm_internal.wasm`
- `vision_wasm_internal.js`
- `hand_landmarker.task`

### 2. 延迟加载 MediaPipe
MediaPipe 初始化不再阻塞主界面渲染，应用可以更快显示。

### 3. 加载进度提示
添加了视觉反馈，让用户知道手势识别功能正在加载。

## GitHub Pages 额外优化建议

### 方案 1: 使用 CDN 加速（推荐）

如果文件较大，可以考虑将 WASM 文件托管到 CDN：

1. 使用 jsDelivr CDN（如果文件在 GitHub 仓库中）：
   ```html
   <link rel="preload" href="https://cdn.jsdelivr.net/gh/你的用户名/仓库名@main/vision_wasm_internal.wasm" as="fetch" crossorigin="anonymous">
   ```

2. 或使用其他 CDN 服务（如 Cloudflare、阿里云等）

### 方案 2: 启用 GitHub Pages 压缩

GitHub Pages 默认支持 Gzip 压缩，但确保：
- 文件大小合理（WASM 文件通常已经压缩）
- 服务器会自动应用压缩

### 方案 3: 使用 Service Worker 缓存

可以添加 Service Worker 来缓存 WASM 文件，提升后续访问速度。

### 方案 4: 压缩 WASM 文件

如果文件很大，可以考虑：
- 使用 `wasm-opt` 工具进一步优化 WASM 文件
- 使用 Brotli 压缩（需要服务器支持）

## 检查加载速度

在浏览器开发者工具中：
1. 打开 Network 标签
2. 查找 `vision_wasm_internal.wasm`
3. 检查：
   - 文件大小
   - 加载时间
   - 是否使用了压缩（查看 Response Headers 中的 `Content-Encoding`）

## 进一步优化

如果仍然较慢，可以考虑：
1. 将 MediaPipe 相关功能改为按需加载（用户需要时才加载）
2. 使用 Web Workers 在后台加载 WASM
3. 提供降级方案（如果 WASM 加载失败，使用纯 JS 实现）

