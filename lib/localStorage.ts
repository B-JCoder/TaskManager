import { dateUtils } from "@/lib/dateUtils"
import { BatchProcessor, memoize, PerformanceMonitor } from "@/lib/performance"
import type { Task } from "@/types/task"

const TASKS_KEY = "task-manager-tasks"
const CACHE_KEY = "task-manager-cache"
const CACHE_EXPIRY = 10 * 60 * 1000 // 10 minutes
const BATCH_SIZE = 5
const BATCH_DELAY = 50

interface CacheEntry {
  data: Task[]
  timestamp: number
  checksum: string
}

class LocalStorageService {
  private cache: Task[] | null = null
  private cacheTimestamp = 0
  private monitor = PerformanceMonitor.getInstance()
  private batchProcessor: BatchProcessor<() => void>
  private searchCache = new Map<string, { result: Task[]; timestamp: number }>()

  constructor() {
    // Initialize batch processor for save operations
    this.batchProcessor = new BatchProcessor(
      (operations) => {
        operations.forEach((op) => op())
      },
      { batchSize: BATCH_SIZE, delay: BATCH_DELAY },
    )

    // Initialize performance monitoring
    this.monitor.observePerformance(["measure"])
  }

  // Generate checksum for cache validation
  private generateChecksum(data: Task[]): string {
    return btoa(JSON.stringify(data.map((t) => ({ id: t.id, updatedAt: t.updatedAt }))))
  }

  // Optimized task retrieval with enhanced caching
  getTasks = memoize(
    (): Task[] => {
      if (typeof window === "undefined") return []

      this.monitor.startTimer("getTasks")

      try {
        // Check memory cache first
        if (this.cache && Date.now() - this.cacheTimestamp < CACHE_EXPIRY) {
          this.monitor.endTimer("getTasks")
          return this.cache
        }

        // Check localStorage cache with checksum validation
        const cachedData = localStorage.getItem(CACHE_KEY)
        if (cachedData) {
          try {
            const cache: CacheEntry = JSON.parse(cachedData)
            if (Date.now() - cache.timestamp < CACHE_EXPIRY) {
              // Validate cache integrity
              const currentChecksum = this.generateChecksum(cache.data)
              if (currentChecksum === cache.checksum) {
                this.cache = cache.data
                this.cacheTimestamp = cache.timestamp
                this.monitor.endTimer("getTasks")
                return cache.data
              }
            }
          } catch (error) {
            console.warn("Cache validation failed:", error)
            localStorage.removeItem(CACHE_KEY)
          }
        }

        // Fallback to main storage
        const tasks = localStorage.getItem(TASKS_KEY)
        const parsedTasks = tasks ? JSON.parse(tasks) : []

        // Validate and clean data
        const validTasks = this.validateAndCleanTasks(parsedTasks)

        // Update cache
        this.updateCache(validTasks)

        this.monitor.endTimer("getTasks")
        return validTasks
      } catch (error) {
        console.error("Error reading tasks from localStorage:", error)
        this.monitor.endTimer("getTasks")
        return []
      }
    },
    { maxSize: 1, ttl: CACHE_EXPIRY },
  )

  // Validate and clean task data
  private validateAndCleanTasks(tasks: any[]): Task[] {
    return tasks
      .filter((task) => {
        return (
          task &&
          typeof task.id === "string" &&
          typeof task.title === "string" &&
          typeof task.isCompleted === "boolean" &&
          typeof task.createdAt === "string" &&
          typeof task.updatedAt === "string"
        )
      })
      .map((task) => ({
        ...task,
        title: task.title.trim(),
        description: task.description?.trim() || "",
        name: task.name?.trim() || "",
        role: task.role?.trim() || "",
      }))
  }

  // Optimized batch saving
  saveTasks = (tasks: Task[]): void => {
    if (typeof window === "undefined") return

    this.batchProcessor.add(() => {
      this.monitor.startTimer("saveTasks")

      try {
        const serializedTasks = JSON.stringify(tasks)
        localStorage.setItem(TASKS_KEY, serializedTasks)
        this.updateCache(tasks)
        this.clearSearchCache()
        this.monitor.endTimer("saveTasks")
      } catch (error) {
        console.error("Error in batch save:", error)
        this.monitor.endTimer("saveTasks")
      }
    })
  }

  // Immediate save for critical operations
  saveTasksImmediate = (tasks: Task[]): void => {
    if (typeof window === "undefined") return

    this.monitor.startTimer("saveTasksImmediate")

    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
      this.updateCache(tasks)
      this.clearSearchCache()
      this.monitor.endTimer("saveTasksImmediate")
    } catch (error) {
      console.error("Error in immediate save:", error)
      this.monitor.endTimer("saveTasksImmediate")
    }
  }

  private updateCache(tasks: Task[]): void {
    this.cache = tasks
    this.cacheTimestamp = Date.now()

    // Update localStorage cache with checksum
    const cacheEntry: CacheEntry = {
      data: tasks,
      timestamp: this.cacheTimestamp,
      checksum: this.generateChecksum(tasks),
    }

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry))
    } catch (error) {
      console.warn("Cache update failed:", error)
    }
  }

  private clearSearchCache(): void {
    this.searchCache.clear()
  }

  // Optimized task addition with immediate feedback
  addTask = (taskData: { title: string; description?: string; name?: string; role?: string }): Task => {
    const now = dateUtils.now()
    const newTask: Task = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: taskData.title.trim(),
      description: taskData.description?.trim() || "",
      name: taskData.name?.trim() || "",
      role: taskData.role?.trim() || "",
      isCompleted: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      dateAdded: dateUtils.formatDateForSearch(now),
      dayAdded: dateUtils.getDayName(now),
    }

    const tasks = this.getTasks()
    const updatedTasks = [newTask, ...tasks]

    // Use immediate save for better UX
    this.saveTasksImmediate(updatedTasks)

    return newTask
  }

  // Optimized task update with minimal data changes
  updateTask = (taskId: string, updates: Partial<Task>): Task | null => {
    const tasks = this.getTasks()
    const taskIndex = tasks.findIndex((task) => task.id === taskId)

    if (taskIndex === -1) return null

    const currentTask = tasks[taskIndex]
    const updatedTask: Task = {
      ...currentTask,
      ...updates,
      updatedAt: dateUtils.now().toISOString(),
    }

    // Only save if there are actual changes
    const hasChanges = Object.keys(updates).some(
      (key) => currentTask[key as keyof Task] !== updatedTask[key as keyof Task],
    )

    if (!hasChanges) return currentTask

    tasks[taskIndex] = updatedTask
    this.saveTasksImmediate(tasks)

    return updatedTask
  }

  // Optimized task deletion
  deleteTask = (taskId: string): boolean => {
    const tasks = this.getTasks()
    const taskIndex = tasks.findIndex((task) => task.id === taskId)

    if (taskIndex === -1) return false

    tasks.splice(taskIndex, 1)
    this.saveTasksImmediate(tasks)

    return true
  }

  // Clear all tasks and caches
  clearAllTasks = (): void => {
    if (typeof window === "undefined") return

    localStorage.removeItem(TASKS_KEY)
    localStorage.removeItem(CACHE_KEY)
    this.cache = null
    this.cacheTimestamp = 0
    this.clearSearchCache()
    this.getTasks.clear()
  }

  // Highly optimized search with caching and early returns
  searchTasks = (searchQuery: string, showCompleted = true, showPending = true): Task[] => {
    this.monitor.startTimer("searchTasks")

    // Create cache key
    const cacheKey = `${searchQuery}-${showCompleted}-${showPending}`
    const cached = this.searchCache.get(cacheKey)

    // Return cached result if still valid
    if (cached && Date.now() - cached.timestamp < 30000) {
      // 30 second cache
      this.monitor.endTimer("searchTasks")
      return cached.result
    }

    const tasks = this.getTasks()

    // Early return for no filters
    if (!searchQuery.trim() && showCompleted && showPending) {
      this.searchCache.set(cacheKey, { result: tasks, timestamp: Date.now() })
      this.monitor.endTimer("searchTasks")
      return tasks
    }

    const query = searchQuery.toLowerCase().trim()
    const queryWords = query.split(/\s+/).filter((word) => word.length > 0)

    const filtered = tasks.filter((task) => {
      // Status filter (most selective first)
      if (!showCompleted && task.isCompleted) return false
      if (!showPending && !task.isCompleted) return false

      // Early return if no search query
      if (!query) return true

      // Multi-word search optimization
      if (queryWords.length > 1) {
        const searchText =
          `${task.title} ${task.description} ${task.name} ${task.role} ${task.dateAdded} ${task.dayAdded}`.toLowerCase()
        return queryWords.every((word) => searchText.includes(word))
      }

      // Single word search with priority order
      return (
        task.title.toLowerCase().includes(query) ||
        (task.name && task.name.toLowerCase().includes(query)) ||
        (task.role && task.role.toLowerCase().includes(query)) ||
        task.dateAdded.includes(query) ||
        task.dayAdded.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        dateUtils.matchesDateSearch(task.createdAt, query)
      )
    })

    // Cache the result
    this.searchCache.set(cacheKey, { result: filtered, timestamp: Date.now() })

    this.monitor.endTimer("searchTasks")
    return filtered
  }

  // Get comprehensive performance metrics
  getPerformanceMetrics = () => {
    const metrics = this.monitor.getAllMetrics()
    return {
      ...metrics,
      cacheHitRate: this.cache ? "Active" : "Inactive",
      searchCacheSize: this.searchCache.size,
      batchQueueSize: this.batchProcessor.size,
    }
  }

  // Cleanup method for memory management
  cleanup = (): void => {
    this.batchProcessor.flush()
    this.clearSearchCache()
    this.getTasks.clear()
    this.monitor.clear()
  }
}

export const localStorageService = new LocalStorageService()

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    localStorageService.cleanup()
  })
}
