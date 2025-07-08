export interface Task {
  readonly id: string
  title: string
  description?: string
  name?: string
  role?: string
  isCompleted: boolean
  readonly createdAt: string
  updatedAt: string
  readonly dateAdded: string // YYYY-MM-DD format
  readonly dayAdded: string // Day name (e.g., "Monday")
}

export interface TaskFormData {
  title: string
  description?: string
  name?: string
  role?: string
}

export interface TaskFilters {
  searchQuery: string
  showCompleted: boolean
  showPending: boolean
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
  completionRate: number
  filtered: {
    total: number
    completed: number
    pending: number
  }
}

// Performance types
export interface OptimizedTask extends Omit<Task, "description"> {
  hasDescription: boolean
}

export type TaskAction =
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: { id: string; updates: Partial<Task> } }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "CLEAR_ALL" }
  | { type: "SET_TASKS"; payload: Task[] }
