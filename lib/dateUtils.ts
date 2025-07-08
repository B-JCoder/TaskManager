// Native JavaScript date utilities - no external dependencies
export const dateUtils = {
  // Get current date and time
  now: () => new Date(),

  // Format date for display with smart relative formatting
  formatDate: (date: string | Date) => {
    const d = new Date(date)
    const now = new Date()
    const diffInMs = now.getTime() - d.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

    // Today
    if (diffInDays < 1 && d.getDate() === now.getDate()) {
      return `Today, ${d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`
    }

    // Yesterday
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth()) {
      return `Yesterday, ${d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`
    }

    // This week
    if (diffInDays < 7) {
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    }

    // Older dates
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  },

  // Format date for search (YYYY-MM-DD)
  formatDateForSearch: (date: string | Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  },

  // Get day name
  getDayName: (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", { weekday: "long" })
  },

  // Get relative time (e.g., "2 hours ago")
  getRelativeTime: (date: string | Date) => {
    const d = new Date(date)
    const now = new Date()
    const diffInMs = now.getTime() - d.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  },

  // Check if date matches search query
  matchesDateSearch: (date: string | Date, searchQuery: string) => {
    const dateStr = dateUtils.formatDateForSearch(date)
    return dateStr.includes(searchQuery)
  },

  // Parse and validate date string
  isValidDate: (dateString: string) => {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  },

  // Get formatted date with day for display
  getFormattedDateWithDay: (date: string | Date) => {
    const d = new Date(date)
    return {
      date: dateUtils.formatDateForSearch(d),
      day: dateUtils.getDayName(d),
      time: d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      full: d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    }
  },

  // Check if two dates are the same day
  isSameDay: (date1: string | Date, date2: string | Date) => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
  },

  // Check if date is today
  isToday: (date: string | Date) => {
    return dateUtils.isSameDay(date, new Date())
  },

  // Check if date is yesterday
  isYesterday: (date: string | Date) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return dateUtils.isSameDay(date, yesterday)
  },
}
