// Enhanced performance utilities and optimizations

// Optimized debounce with immediate execution option
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      timeout = null
      if (!immediate) func(...args)
    }, wait)

    if (callNow) func(...args)
  }
}

// Enhanced throttle with trailing execution
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = { leading: true, trailing: true },
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  let lastFunc: NodeJS.Timeout
  let lastRan: number

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      if (options.leading !== false) {
        func(...args)
      }
      lastRan = Date.now()
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    } else {
      if (options.trailing !== false) {
        clearTimeout(lastFunc)
        lastFunc = setTimeout(
          () => {
            if (Date.now() - lastRan >= limit) {
              func(...args)
              lastRan = Date.now()
            }
          },
          limit - (Date.now() - lastRan),
        )
      }
    }
  }
}

// Enhanced memoization with TTL and size limits - Fixed TypeScript issues
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    maxSize?: number
    ttl?: number
    keyGenerator?: (args: any[]) => string
  } = {},
): T & { clear: () => void; size: () => number } {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>()
  const { maxSize = 100, ttl = 5 * 60 * 1000, keyGenerator = JSON.stringify } = options

  const memoized = ((...args: any[]): ReturnType<T> => {
    const key = keyGenerator(args)
    const now = Date.now()

    // Check if cached value exists and is still valid
    const cached = cache.get(key)
    if (cached && (!ttl || now - cached.timestamp < ttl)) {
      return cached.value
    }

    // Compute new value
    const result = fn(...args) as ReturnType<T>

    // Clean up expired entries if cache is getting large
    if (cache.size >= maxSize) {
      const entries = Array.from(cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

      // Remove oldest 25% of entries
      const toRemove = Math.floor(entries.length * 0.25)
      for (let i = 0; i < toRemove; i++) {
        cache.delete(entries[i][0])
      }
    }

    cache.set(key, { value: result, timestamp: now })
    return result
  }) as T & { clear: () => void; size: () => number }

  // Add utility methods
  memoized.clear = () => cache.clear()
  memoized.size = () => cache.size

  return memoized
}

// Optimized virtual scrolling with dynamic item heights
export function getVisibleItems<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number | ((item: T, index: number) => number),
  scrollTop: number,
  overscan = 5,
): {
  startIndex: number
  endIndex: number
  visibleItems: T[]
  totalHeight: number
  offsetY: number
} {
  if (typeof itemHeight === "number") {
    // Fixed height optimization
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2
    const endIndex = Math.min(startIndex + visibleCount, items.length - 1)

    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex + 1),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    }
  }

  // Dynamic height calculation
  let totalHeight = 0
  let startIndex = 0
  let endIndex = 0
  let offsetY = 0
  let currentHeight = 0

  // Find start index
  for (let i = 0; i < items.length; i++) {
    const height = itemHeight(items[i], i)
    if (currentHeight + height > scrollTop) {
      startIndex = Math.max(0, i - overscan)
      offsetY = currentHeight - (i - startIndex) * (height || 20)
      break
    }
    currentHeight += height
    totalHeight += height
  }

  // Find end index
  currentHeight = offsetY
  for (let i = startIndex; i < items.length; i++) {
    const height = itemHeight(items[i], i)
    if (currentHeight > scrollTop + containerHeight + overscan * (height || 20)) {
      endIndex = i
      break
    }
    currentHeight += height
    if (i >= startIndex) totalHeight += height
  }

  if (endIndex === 0) endIndex = items.length - 1

  return {
    startIndex,
    endIndex,
    visibleItems: items.slice(startIndex, endIndex + 1),
    totalHeight,
    offsetY,
  }
}

// Enhanced performance monitoring with metrics collection
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<
    string,
    {
      times: number[]
      count: number
      total: number
      min: number
      max: number
    }
  > = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTimer(label: string): void {
    if (typeof window !== "undefined" && window.performance) {
      performance.mark(`${label}-start`)
    }
  }

  endTimer(label: string): number {
    if (typeof window !== "undefined" && window.performance) {
      performance.mark(`${label}-end`)

      try {
        performance.measure(label, `${label}-start`, `${label}-end`)
        const measure = performance.getEntriesByName(label).pop()

        if (measure) {
          const duration = measure.duration
          this.recordMetric(label, duration)

          // Clean up marks and measures
          performance.clearMarks(`${label}-start`)
          performance.clearMarks(`${label}-end`)
          performance.clearMeasures(label)

          return duration
        }
      } catch (error) {
        console.warn(`Performance measurement failed for ${label}:`, error)
      }
    }
    return 0
  }

  private recordMetric(label: string, duration: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, {
        times: [],
        count: 0,
        total: 0,
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
      })
    }

    const metric = this.metrics.get(label)!
    metric.times.push(duration)
    metric.count++
    metric.total += duration
    metric.min = Math.min(metric.min, duration)
    metric.max = Math.max(metric.max, duration)

    // Keep only last 100 measurements to prevent memory leaks
    if (metric.times.length > 100) {
      const removed = metric.times.shift()!
      metric.total -= removed
      metric.count--
    }
  }

  getMetrics(label: string) {
    const metric = this.metrics.get(label)
    if (!metric || metric.count === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        count: 0,
        total: 0,
      }
    }

    return {
      average: metric.total / metric.count,
      min: metric.min === Number.POSITIVE_INFINITY ? 0 : metric.min,
      max: metric.max === Number.NEGATIVE_INFINITY ? 0 : metric.max,
      count: metric.count,
      total: metric.total,
    }
  }

  getAllMetrics() {
    const result: Record<string, any> = {}
    for (const [label, _] of this.metrics) {
      result[label] = this.getMetrics(label)
    }
    return result
  }

  // Monitor specific performance entries
  observePerformance(entryTypes: string[] = ["measure", "navigation", "paint"]) {
    if (typeof window === "undefined" || !window.PerformanceObserver) return

    entryTypes.forEach((type) => {
      if (!this.observers.has(type)) {
        try {
          const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              this.recordMetric(`${type}-${entry.name}`, entry.duration || entry.startTime)
            })
          })

          observer.observe({ entryTypes: [type] })
          this.observers.set(type, observer)
        } catch (error) {
          console.warn(`Failed to observe ${type} performance entries:`, error)
        }
      }
    })
  }

  disconnect() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers.clear()
  }

  clear() {
    this.metrics.clear()
    this.disconnect()
  }
}

// Batch operations for better performance
export class BatchProcessor<T> {
  private queue: T[] = []
  private processor: (items: T[]) => void
  private batchSize: number
  private delay: number
  private timeout: NodeJS.Timeout | null = null

  constructor(processor: (items: T[]) => void, options: { batchSize?: number; delay?: number } = {}) {
    this.processor = processor
    this.batchSize = options.batchSize || 10
    this.delay = options.delay || 100
  }

  add(item: T): void {
    this.queue.push(item)
    this.scheduleProcess()
  }

  addMany(items: T[]): void {
    this.queue.push(...items)
    this.scheduleProcess()
  }

  private scheduleProcess(): void {
    if (this.timeout) return

    this.timeout = setTimeout(() => {
      this.process()
      this.timeout = null
    }, this.delay)
  }

  private process(): void {
    if (this.queue.length === 0) return

    const batch = this.queue.splice(0, this.batchSize)
    this.processor(batch)

    // Continue processing if there are more items
    if (this.queue.length > 0) {
      this.scheduleProcess()
    }
  }

  flush(): void {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    if (this.queue.length > 0) {
      this.processor([...this.queue])
      this.queue.length = 0
    }
  }

  clear(): void {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    this.queue.length = 0
  }

  get size(): number {
    return this.queue.length
  }
}

// Optimized event listener management
export class EventManager {
  private listeners: Map<string, Set<EventListener>> = new Map()
  private abortController = new AbortController()

  addEventListener(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions,
  ): void {
    const key = `${type}-${listener.toString()}`

    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }

    this.listeners.get(key)!.add(listener)

    target.addEventListener(type, listener, {
      ...options,
      signal: this.abortController.signal,
    })
  }

  removeEventListener(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: EventListenerOptions,
  ): void {
    const key = `${type}-${listener.toString()}`
    const listeners = this.listeners.get(key)

    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.listeners.delete(key)
      }
    }

    target.removeEventListener(type, listener, options)
  }

  removeAllListeners(): void {
    this.abortController.abort()
    this.abortController = new AbortController()
    this.listeners.clear()
  }
}
