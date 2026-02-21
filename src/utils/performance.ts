// Utilidades de optimización de rendimiento y caché

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
}

class PerformanceCache {
  private cache = new Map<string, CacheItem>();
  private static instance: PerformanceCache;

  private constructor() {}

  static getInstance(): PerformanceCache {
    if (!PerformanceCache.instance) {
      PerformanceCache.instance = new PerformanceCache();
    }
    return PerformanceCache.instance;
  }

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpiar caché expirado
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of Array.from(this.cache.entries())) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = PerformanceCache.getInstance();

// Lazy loading para componentes
export const lazyLoad = <T>(
  loader: () => Promise<T>,
  fallback: T,
  delay: number = 200
): Promise<T> => {
  return new Promise((resolve) => {
    // Mostrar fallback inmediatamente
    resolve(fallback);
    
    // Cargar componente real después del delay
    setTimeout(async () => {
      try {
        const result = await loader();
        resolve(result);
      } catch (error) {
        console.error('Error en lazy load:', error);
        resolve(fallback);
      }
    }, delay);
  });
};

// Retry automático con backoff exponencial
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`Intento ${attempt + 1} falló, reintentando en ${delay}ms:`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Optimización de imágenes
export const optimizeImage = (src: string, width: number = 400, quality: number = 80): string => {
  if (!src) return '';
  
  // Si es una URL externa, retornar como está
  if (src.startsWith('http')) {
    return src;
  }
  
  // Para imágenes locales, podríamos agregar optimización
  return src;
};

// Debounce para búsquedas
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle para eventos frecuentes
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Medir performance
export const measurePerformance = (name: string, fn: () => void): void => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
};

// Preload de rutas críticas
export const preloadCriticalRoutes = (): void => {
  const criticalRoutes = ['/dashboard', '/area/management', '/area/sales'];
  
  criticalRoutes.forEach(route => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
};

// Detectar conexión lenta
export const isSlowConnection = (): boolean => {
  const connection = (navigator as any).connection;
  if (!connection) return false;
  
  return (
    connection.saveData || 
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' ||
    connection.downlink < 1.5
  );
};

// Adaptar calidad según conexión
export const getAdaptiveQuality = (): 'low' | 'medium' | 'high' => {
  if (isSlowConnection()) return 'low';
  return 'high';
};
