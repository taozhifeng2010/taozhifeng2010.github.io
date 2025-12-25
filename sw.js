// Service Worker for caching WASM and other static assets
const CACHE_NAME = 'mediapipe-cache-v1';
const STATIC_CACHE_NAME = 'static-assets-v1';

// 需要缓存的资源列表
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/vision_wasm_internal.wasm',
    '/vision_wasm_internal.js',
    '/hand_landmarker.task'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                // 只缓存关键资源，其他资源按需缓存
                return cache.addAll(STATIC_ASSETS.filter(url => {
                    // 只缓存存在的资源
                    return url !== '/' || url !== '/index.html';
                })).catch(err => {
                    console.log('[Service Worker] Cache addAll failed:', err);
                });
            })
    );
    // 立即激活新的 Service Worker
    self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // 删除旧版本的缓存
                    if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // 立即控制所有客户端
    return self.clients.claim();
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // 只处理 GET 请求
    if (event.request.method !== 'GET') {
        return;
    }

    // 缓存策略：网络优先，失败时使用缓存
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 检查响应是否有效
                if (!response || response.status !== 200 || response.type === 'error') {
                    throw new Error('Network response was not ok');
                }

                // 克隆响应（因为响应只能使用一次）
                const responseToCache = response.clone();

                // 缓存 WASM 和模型文件
                if (url.pathname.endsWith('.wasm') || 
                    url.pathname.endsWith('.task') || 
                    url.pathname.endsWith('.js')) {
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                }

                return response;
            })
            .catch(() => {
                // 网络请求失败，尝试从缓存获取
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // 如果缓存也没有，返回错误
                        throw new Error('No cache available');
                    });
            })
    );
});

