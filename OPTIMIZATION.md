# 文件加载效率优化说明

## 已实施的优化

### 1. 资源预加载和优先级
- 使用 `preload` 和 `fetchpriority` 标记关键资源
- DNS 预解析（`dns-prefetch`）和预连接（`preconnect`）外部资源
- 优化字体加载，使用 `font-display: swap` 避免阻塞渲染

### 2. 智能加载策略
- **并行预加载**：关键资源并行加载，不阻塞主流程
- **延迟加载 MediaPipe**：页面完全加载后再加载，不阻塞主界面渲染
- **requestIdleCallback**：非关键资源在浏览器空闲时加载
- **超时控制**：30秒超时保护，避免无限等待

### 3. Service Worker 缓存
- 自动缓存 WASM 文件和模型文件
- 网络优先策略：优先使用网络，失败时使用缓存
- 离线支持：即使网络断开也能使用缓存资源

### 4. 代码优化
- 粒子系统等非关键功能延迟初始化
- 使用 `requestIdleCallback` 优化非关键任务
- 资源加载错误处理，确保主功能不受影响

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

