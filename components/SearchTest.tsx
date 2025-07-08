"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, TestTube, Plus, Search } from "lucide-react"
import { localStorageService } from "@/lib/localStorage"
import { dateUtils } from "@/lib/dateUtils"
import type { Task } from "@/types/task"

export default function SearchTest() {
  const [testResults, setTestResults] = useState<Array<{ test: string; passed: boolean; details: string }>>([])
  const [isRunning, setIsRunning] = useState(false)
  const [sampleTasks, setSampleTasks] = useState<Task[]>([])

  const createSampleTasks = () => {
    // Clear existing tasks first
    localStorageService.clearAllTasks()

    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    const lastWeek = new Date(now)
    lastWeek.setDate(lastWeek.getDate() - 7)

    const sampleData = [
      {
        title: "Buy groceries",
        description: "Get milk, bread, and eggs from the store",
        name: "John Smith",
        role: "Family Member",
        isCompleted: false,
        createdAt: now.toISOString(),
      },
      {
        title: "Team meeting",
        description: "Discuss project progress and next steps",
        name: "Sarah Johnson",
        role: "Project Manager",
        isCompleted: true,
        createdAt: yesterday.toISOString(),
      },
      {
        title: "Write report",
        description: "Complete the quarterly financial report",
        name: "Mike Davis",
        role: "Analyst",
        isCompleted: false,
        createdAt: lastWeek.toISOString(),
      },
      {
        title: "Call dentist",
        description: "Schedule appointment for next month",
        name: "Emma Wilson",
        role: "Personal",
        isCompleted: true,
        createdAt: now.toISOString(),
      },
      {
        title: "Fix bug in code",
        description: "Resolve the authentication issue in the login module",
        name: "Alex Chen",
        role: "Developer",
        isCompleted: false,
        createdAt: yesterday.toISOString(),
      },
    ]

    const tasks: Task[] = []
    sampleData.forEach((data, index) => {
      const createdDate = new Date(data.createdAt)
      const task: Task = {
        id: `test-${index}-${Date.now()}`,
        title: data.title,
        description: data.description,
        isCompleted: data.isCompleted,
        createdAt: data.createdAt,
        updatedAt: data.createdAt,
        dateAdded: dateUtils.formatDateForSearch(createdDate),
        dayAdded: dateUtils.getDayName(createdDate),
        name: data.name,
        role: data.role,
      }
      tasks.push(task)
    })

    localStorageService.saveTasks(tasks)
    setSampleTasks(tasks)
    return tasks
  }

  const runSearchTests = async () => {
    setIsRunning(true)
    setTestResults([])

    const tasks = createSampleTasks()
    const results: Array<{ test: string; passed: boolean; details: string }> = []

    // Test 1: Text search in titles
    const titleSearch = localStorageService.searchTasks("groceries")
    results.push({
      test: "Title Search",
      passed: titleSearch.length === 1 && titleSearch[0].title.includes("groceries"),
      details: `Found ${titleSearch.length} task(s) containing "groceries" in title`,
    })

    // Test 2: Text search in descriptions
    const descriptionSearch = localStorageService.searchTasks("authentication")
    results.push({
      test: "Description Search",
      passed: descriptionSearch.length === 1 && descriptionSearch[0].description?.includes("authentication"),
      details: `Found ${descriptionSearch.length} task(s) containing "authentication" in description`,
    })

    // Test 3: Case insensitive search
    const caseSearch = localStorageService.searchTasks("MEETING")
    results.push({
      test: "Case Insensitive Search",
      passed: caseSearch.length === 1 && caseSearch[0].title.toLowerCase().includes("meeting"),
      details: `Found ${caseSearch.length} task(s) with case-insensitive "MEETING" search`,
    })

    // Test 4: Date search (today's date)
    const todayDate = dateUtils.formatDateForSearch(new Date())
    const dateSearch = localStorageService.searchTasks(todayDate)
    const todayTasks = tasks.filter((t) => t.dateAdded === todayDate)
    results.push({
      test: "Date Search (Today)",
      passed: dateSearch.length === todayTasks.length,
      details: `Found ${dateSearch.length} task(s) for today (${todayDate}), expected ${todayTasks.length}`,
    })

    // Test 5: Partial date search
    const yearMonth = todayDate.substring(0, 7) // YYYY-MM
    const partialDateSearch = localStorageService.searchTasks(yearMonth)
    results.push({
      test: "Partial Date Search",
      passed: partialDateSearch.length >= 1,
      details: `Found ${partialDateSearch.length} task(s) for ${yearMonth}`,
    })

    // Test 6: Day name search
    const todayDayName = dateUtils.getDayName(new Date()).toLowerCase()
    const daySearch = localStorageService.searchTasks(todayDayName)
    results.push({
      test: "Day Name Search",
      passed: daySearch.length >= 1,
      details: `Found ${daySearch.length} task(s) for "${todayDayName}"`,
    })

    // Test 7: Filter completed tasks only
    const completedOnly = localStorageService.searchTasks("", true, false)
    const expectedCompleted = tasks.filter((t) => t.isCompleted)
    results.push({
      test: "Completed Tasks Filter",
      passed: completedOnly.length === expectedCompleted.length,
      details: `Found ${completedOnly.length} completed task(s), expected ${expectedCompleted.length}`,
    })

    // Test 8: Filter pending tasks only
    const pendingOnly = localStorageService.searchTasks("", false, true)
    const expectedPending = tasks.filter((t) => !t.isCompleted)
    results.push({
      test: "Pending Tasks Filter",
      passed: pendingOnly.length === expectedPending.length,
      details: `Found ${pendingOnly.length} pending task(s), expected ${expectedPending.length}`,
    })

    // Test 9: Combined search (text + filter)
    const combinedSearch = localStorageService.searchTasks("report", false, true)
    const expectedCombined = tasks.filter(
      (t) =>
        !t.isCompleted && (t.title.toLowerCase().includes("report") || t.description?.toLowerCase().includes("report")),
    )
    results.push({
      test: "Combined Search (Text + Filter)",
      passed: combinedSearch.length === expectedCombined.length,
      details: `Found ${combinedSearch.length} pending task(s) containing "report", expected ${expectedCombined.length}`,
    })

    // Test 10: Empty search returns all tasks
    const allTasks = localStorageService.searchTasks("")
    results.push({
      test: "Empty Search Returns All",
      passed: allTasks.length === tasks.length,
      details: `Empty search returned ${allTasks.length} task(s), expected ${tasks.length}`,
    })

    // Test 11: No results search
    const noResults = localStorageService.searchTasks("nonexistentterm12345")
    results.push({
      test: "No Results Search",
      passed: noResults.length === 0,
      details: `Search for non-existent term returned ${noResults.length} results (should be 0)`,
    })

    // Test 12: Special characters in search
    const specialCharSearch = localStorageService.searchTasks("bug in code")
    results.push({
      test: "Multi-word Search",
      passed: specialCharSearch.length >= 1,
      details: `Multi-word search "bug in code" found ${specialCharSearch.length} result(s)`,
    })

    // Test 13: Name search
    const nameSearch = localStorageService.searchTasks("Sarah")
    results.push({
      test: "Name Search",
      passed: nameSearch.length === 1 && nameSearch[0].name?.includes("Sarah"),
      details: `Found ${nameSearch.length} task(s) assigned to "Sarah"`,
    })

    // Test 14: Role search
    const roleSearch = localStorageService.searchTasks("Developer")
    results.push({
      test: "Role Search",
      passed: roleSearch.length === 1 && roleSearch[0].role?.includes("Developer"),
      details: `Found ${roleSearch.length} task(s) with "Developer" role`,
    })

    setTestResults(results)
    setIsRunning(false)
  }

  const clearTestData = () => {
    localStorageService.clearAllTasks()
    setSampleTasks([])
    setTestResults([])
  }

  const passedTests = testResults.filter((r) => r.passed).length
  const totalTests = testResults.length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Search Feature Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={runSearchTests} disabled={isRunning} className="flex items-center gap-2">
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Running Tests...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Run All Search Tests
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearTestData}>
              Clear Test Data
            </Button>
          </div>

          {testResults.length > 0 && (
            <Alert
              className={passedTests === totalTests ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}
            >
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>
                  Test Results: {passedTests}/{totalTests} tests passed
                </strong>
                {passedTests === totalTests ? " 🎉 All tests passed!" : " ⚠️ Some tests failed"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {sampleTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Sample Tasks Created ({sampleTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sampleTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="text-xs text-gray-600">{task.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {task.dateAdded} ({task.dayAdded}) - {task.isCompleted ? "Completed" : "Pending"}
                    </div>
                    {task.name && <div className="text-xs text-gray-500">Name: {task.name}</div>}
                    {task.role && <div className="text-xs text-gray-500">Role: {task.role}</div>}
                  </div>
                  <Badge variant={task.isCompleted ? "default" : "secondary"}>
                    {task.isCompleted ? "Done" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{result.test}</span>
                    <Badge variant={result.passed ? "default" : "destructive"}>{result.passed ? "PASS" : "FAIL"}</Badge>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{result.details}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
