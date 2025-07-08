"use client"

import { localStorageService } from "@/lib/localStorage"
import { debounce } from "@/lib/performance"
import type { Task, TaskFilters, TaskStats } from "@/types/task"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export function useTasks() {
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TaskFilters>({
    searchQuery: "",
    showCompleted: true,
    showPending: true,
  })

  // Use refs to prevent unnecessary re-renders
  const allTasksRef = useRef<Task[]>([])
  const filtersRef = useRef<TaskFilters>(filters)

  // Update refs when state changes
  useEffect(() => {
    allTasksRef.current = allTasks
  }, [allTasks])

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // Optimized debounced search with immediate execution for empty queries
  const debouncedSearch = useMemo(
    () =>
      debounce(
        (query: string, showCompleted: boolean, showPending: boolean) => {
          const filtered = localStorageService.searchTasks(query, showCompleted, showPending)
          setFilteredTasks(filtered)
        },
        200, // Fixed delay
      ),
    [],
  )

  // Load tasks with optimized initial loading
  useEffect(() => {
    let mounted = true

    const loadTasks = async () => {
      try {
        // Use requestIdleCallback for non-blocking load
        const loadFn = () => {
          if (!mounted) return

          const savedTasks = localStorageService.getTasks()
          setAllTasks(savedTasks)
          setFilteredTasks(savedTasks)
          setLoading(false)
        }

        if (window.requestIdleCallback) {
          window.requestIdleCallback(loadFn, { timeout: 100 })
        } else {
          setTimeout(loadFn, 0)
        }
      } catch (error) {
        console.error("Error loading tasks:", error)
        if (mounted) setLoading(false)
      }
    }

    loadTasks()

    return () => {
      mounted = false
    }
  }, [])

  // Apply filters with optimized dependency tracking
  useEffect(() => {
    // Immediate execution for empty queries, debounced for others
    if (filters.searchQuery.trim() === "") {
      const filtered = localStorageService.searchTasks(filters.searchQuery, filters.showCompleted, filters.showPending)
      setFilteredTasks(filtered)
    } else {
      debouncedSearch(filters.searchQuery, filters.showCompleted, filters.showPending)
    }
  }, [allTasks, filters, debouncedSearch])

  // Optimized add task with immediate UI update
  const addTask = useCallback((taskData: { title: string; description?: string; name?: string; role?: string }) => {
    try {
      const newTask = localStorageService.addTask(taskData)

      // Optimistic update
      setAllTasks((prev) => {
        const updated = [newTask, ...prev]
        allTasksRef.current = updated
        return updated
      })

      return newTask
    } catch (error) {
      console.error("Error adding task:", error)
      throw error
    }
  }, [])

  // Optimized update task with minimal re-renders
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = localStorageService.updateTask(taskId, updates)

      if (updatedTask) {
        setAllTasks((prev) => {
          const updated = prev.map((task) => (task.id === taskId ? updatedTask : task))
          allTasksRef.current = updated
          return updated
        })
        return updatedTask
      }
      return null
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    }
  }, [])

  // Optimized delete task
  const deleteTask = useCallback((taskId: string) => {
    try {
      const success = localStorageService.deleteTask(taskId)

      if (success) {
        setAllTasks((prev) => {
          const updated = prev.filter((task) => task.id !== taskId)
          allTasksRef.current = updated
          return updated
        })
      }
      return success
    } catch (error) {
      console.error("Error deleting task:", error)
      throw error
    }
  }, [])

  // Optimized toggle completion with batch updates
  const toggleTaskCompletion = useCallback(
    (taskId: string) => {
      const task = allTasksRef.current.find((t) => t.id === taskId)
      if (task) {
        return updateTask(taskId, { isCompleted: !task.isCompleted })
      }
      return null
    },
    [updateTask],
  )

  // Clear all tasks with immediate feedback
  const clearAllTasks = useCallback(() => {
    try {
      localStorageService.clearAllTasks()
      setAllTasks([])
      setFilteredTasks([])
      allTasksRef.current = []
    } catch (error) {
      console.error("Error clearing tasks:", error)
      throw error
    }
  }, [])

  // Optimized filter updates
  const updateFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters }
      filtersRef.current = updated
      return updated
    })
  }, [])

  // Memoized statistics with optimized calculation
  const getStats = useCallback((): TaskStats => {
    const tasks = allTasksRef.current
    const filtered = filteredTasks

    const total = tasks.length
    const completed = tasks.reduce((count, task) => count + (task.isCompleted ? 1 : 0), 0)
    const pending = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    const filteredTotal = filtered.length
    const filteredCompleted = filtered.reduce((count, task) => count + (task.isCompleted ? 1 : 0), 0)
    const filteredPending = filteredTotal - filteredCompleted

    return {
      total,
      completed,
      pending,
      completionRate,
      filtered: {
        total: filteredTotal,
        completed: filteredCompleted,
        pending: filteredPending,
      },
    }
  }, [filteredTasks])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localStorageService.cleanup()
    }
  }, [])

  return {
    tasks: filteredTasks,
    allTasks,
    loading,
    filters,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    clearAllTasks,
    updateFilters,
    getStats,
  }
}
