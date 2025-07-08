"use client";

import SearchBar from "@/components/SearchBar";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import TaskStats from "@/components/TaskStats";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/hooks/useTasks";
import { CheckSquare, RefreshCw, TestTube, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const {
    tasks,
    allTasks,
    loading,
    filters,
    addTask,
    updateTask,
    deleteTask,
    clearAllTasks,
    updateFilters,
    getStats,
  } = useTasks();
  const [error, setError] = useState("");

  const handleTaskAdded = async (taskData: {
    title: string;
    description?: string;
    name?: string;
    role?: string;
  }) => {
    try {
      setError("");
      addTask(taskData);
    } catch (error) {
      setError("Failed to add task");
    }
  };

  const handleTaskUpdated = (taskId: string, updates: any) => {
    try {
      setError("");
      updateTask(taskId, updates);
    } catch (error) {
      setError("Failed to update task");
    }
  };

  const handleTaskDeleted = (taskId: string) => {
    try {
      setError("");
      deleteTask(taskId);
    } catch (error) {
      setError("Failed to delete task");
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all tasks? This action cannot be undone."
      )
    ) {
      try {
        setError("");
        clearAllTasks();
      } catch (error) {
        setError("Failed to clear tasks");
      }
    }
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <div className="absolute inset-0 h-8 w-8 mx-auto mb-4 bg-blue-600 rounded-full opacity-20 animate-ping"></div>
          </div>
          <p className="text-base text-gray-600 font-medium">
            Loading your tasks...
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Setting up your workspace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Task Manager
                  </h1>
                  <p className="text-sm text-gray-600 hidden sm:block">
                    Organize, assign, and track your team's progress
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/test">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 hover:bg-white border-gray-300 shadow-sm"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Test Features</span>
                  <span className="sm:hidden">Test</span>
                </Button>
              </Link>
              {allTasks.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-white/80"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert
            variant="destructive"
            className="mb-6 border-red-200 bg-red-50"
          >
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Stats */}
        <div className="mb-8">
          <TaskStats stats={stats} />
        </div>

        {/* Enhanced Search Bar */}
        {allTasks.length > 0 && (
          <div className="mb-8">
            <SearchBar
              filters={filters}
              onFiltersChange={updateFilters}
              totalTasks={allTasks.length}
              filteredCount={tasks.length}
            />
          </div>
        )}

        {/* Enhanced Task Management Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Add Task Form */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <TaskForm onTaskAdded={handleTaskAdded} />
          </div>

          {/* Enhanced Task List */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-t-lg border-b border-gray-200/50">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="block">Your Tasks ({tasks.length})</span>
                    {tasks.length !== allTasks.length && (
                      <span className="text-sm font-normal text-gray-500 block">
                        Showing {tasks.length} of {allTasks.length} total tasks
                      </span>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <TaskList
                  tasks={tasks}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className="mt-16 text-center space-y-3">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
            <div className="p-2 bg-white rounded-full shadow-sm">
              <CheckSquare className="h-4 w-4 text-gray-400" />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center justify-center gap-2">
              <span className="text-green-500">✨</span>
              All your tasks are stored locally in your browser - completely
              private and secure
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-blue-500">🔍</span>
              Search by title, description, name, role, date (YYYY-MM-DD), or
              day name
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-purple-500">🚀</span>
              No servers, no accounts, no data collection - just pure
              productivity
            </p>
            <p className="text-align: center; font-size: 14px; color: #888;">
              © 2025 All rights reserved. This TaskManager is developed and
              maintained by <strong>Bilal</strong> — Developer at{" "}
              <strong>DigiPup Studio</strong> &{" "}
              <strong>The Linkage Digital</strong>.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
