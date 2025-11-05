const CACHE_NAME = 'comic-images-v1';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB

export const cacheImage = async (url) => {
  try {
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(url);
      if (!cached) {
        await cache.add(url);
      }
    }
  } catch (e) {
    console.error('Error caching image', e);
  }
};

export const getCachedImage = async (url) => {
  try {
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(url);
      if (cached) {
        return await cached.blob();
      }
    }
  } catch (e) {
    console.error('Error getting cached image', e);
  }
  return null;
};

export const preloadImages = async (urls) => {
  try {
    const imagePromises = urls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = reject;
        img.src = url;
      });
    });
    
    await Promise.all(imagePromises);
    
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(urls);
    }
  } catch (e) {
    console.error('Error preloading images', e);
  }
};

export const clearImageCache = async () => {
  try {
    if ('caches' in window) {
      await caches.delete(CACHE_NAME);
    }
  } catch (e) {
    console.error('Error clearing cache', e);
  }
};
