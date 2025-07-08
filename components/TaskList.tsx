"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { dateUtils } from "@/lib/dateUtils";
import type { Task } from "@/types/task";
import { Briefcase, Calendar, Clock, Trash2, User } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdated: (taskId: string, updates: Partial<Task>) => void;
  onTaskDeleted: (taskId: string) => void;
}

// Highly optimized task item component with React.memo and custom comparison
const TaskItem = memo(
  ({
    task,
    onToggleComplete,
    onDelete,
    isUpdating,
    isDeleting,
  }: {
    task: Task;
    onToggleComplete: (task: Task) => void;
    onDelete: (taskId: string) => void;
    isUpdating: boolean;
    isDeleting: boolean;
  }) => {
    // Memoize formatted date to prevent recalculation
    const formattedDate = useMemo(
      () => dateUtils.formatDate(task.createdAt),
      [task.createdAt]
    );

    // Memoize assignment info to prevent re-renders
    const assignmentInfo = useMemo(() => {
      if (!task.name && !task.role) return null;

      return (
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {task.name && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <User className="h-3 w-3" />
              <span className="font-medium">{task.name}</span>
            </div>
          )}
          {task.role && (
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <Briefcase className="h-3 w-3" />
              <span>{task.role}</span>
            </div>
          )}
        </div>
      );
    }, [task.name, task.role]);

    const handleToggle = useCallback(() => {
      onToggleComplete(task);
    }, [onToggleComplete, task]);

    const handleDelete = useCallback(() => {
      onDelete(task.id);
    }, [onDelete, task.id]);

    return (
      <Card
        className={`transition-all hover:shadow-sm ${
          task.isCompleted ? "opacity-75" : ""
        }`}
      >
        <CardContent className="p-3 md:p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.isCompleted}
              onCheckedChange={handleToggle}
              disabled={isUpdating}
              className="mt-1 flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-medium text-sm md:text-base leading-tight ${
                      task.isCompleted ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p
                      className={`text-xs md:text-sm mt-1 leading-relaxed ${
                        task.isCompleted
                          ? "line-through text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {task.description}
                    </p>
                  )}

                  {assignmentInfo}

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge
                      variant={task.isCompleted ? "secondary" : "default"}
                      className="text-xs px-2 py-0.5"
                    >
                      {task.isCompleted ? "Done" : "Pending"}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{task.dateAdded}</span>
                      <span className="hidden sm:inline">
                        ({task.dayAdded})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 h-8 w-8 p-0"
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
  // Custom comparison function for better performance
  (prevProps, nextProps) => {
    return (
      prevProps.task.id === nextProps.task.id &&
      prevProps.task.title === nextProps.task.title &&
      prevProps.task.description === nextProps.task.description &&
      prevProps.task.isCompleted === nextProps.task.isCompleted &&
      prevProps.task.updatedAt === nextProps.task.updatedAt &&
      prevProps.task.name === nextProps.task.name &&
      prevProps.task.role === nextProps.task.role &&
      prevProps.isUpdating === nextProps.isUpdating &&
      prevProps.isDeleting === nextProps.isDeleting
    );
  }
);

TaskItem.displayName = "TaskItem";

export default function TaskList({
  tasks,
  onTaskUpdated,
  onTaskDeleted,
}: TaskListProps) {
  const [updatingTasks, setUpdatingTasks] = useState(new Set<string>());
  const [deletingTasks, setDeletingTasks] = useState(new Set<string>());
  const [error, setError] = useState("");

  const handleToggleComplete = useCallback(
    async (task: Task) => {
      if (updatingTasks.has(task.id)) return;

      setUpdatingTasks((prev) => new Set(prev).add(task.id));
      setError("");

      try {
        onTaskUpdated(task.id, { isCompleted: !task.isCompleted });
      } catch (error) {
        console.error("Error updating task:", error);
        setError("Failed to update task");
      } finally {
        setUpdatingTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(task.id);
          return newSet;
        });
      }
    },
    [onTaskUpdated, updatingTasks]
  );

  const handleDelete = useCallback(
    async (taskId: string) => {
      if (deletingTasks.has(taskId)) return;

      setDeletingTasks((prev) => new Set(prev).add(taskId));
      setError("");

      try {
        onTaskDeleted(taskId);
      } catch (error) {
        console.error("Error deleting task:", error);
        setError("Failed to delete task");
      } finally {
        setDeletingTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }
    },
    [onTaskDeleted, deletingTasks]
  );

  // Memoize empty state to prevent re-renders
  const emptyState = useMemo(
    () => (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
          <div className="text-gray-500 text-center">
            <Calendar className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 opacity-50" />
            <h3 className="text-base md:text-lg font-medium mb-1 md:mb-2">
              No tasks found
            </h3>
            <p className="text-sm md:text-base">
              Create your first task or adjust your search filters!
            </p>
          </div>
        </CardContent>
      </Card>
    ),
    []
  );

  if (tasks.length === 0) {
    return emptyState;
  }

  return (
    <div className="space-y-2 md:space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDelete}
          isUpdating={updatingTasks.has(task.id)}
          isDeleting={deletingTasks.has(task.id)}
        />
      ))}
    </div>
  );
}
