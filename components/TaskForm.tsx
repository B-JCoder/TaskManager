"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { dateUtils } from "@/lib/dateUtils";
import { Briefcase, Calendar, Clock, Plus, Sparkles, User } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface TaskFormProps {
  onTaskAdded: (task: {
    title: string;
    description?: string;
    name?: string;
    role?: string;
  }) => void;
}

export default function TaskForm({ onTaskAdded }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError("");

    try {
      await onTaskAdded({
        title: title.trim(),
        description: description.trim() || undefined,
        name: name.trim() || undefined,
        role: role.trim() || undefined,
      });

      setTitle("");
      setDescription("");
      setName("");
      setRole("");
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const currentDateTime = dateUtils.getFormattedDateWithDay(
    dateUtils.now().toISOString()
  );

  return (
    <Card className="h-fit shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
      <CardHeader className="pb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <span className="block">Create New Task</span>
            <span className="text-sm font-normal text-blue-100 block mt-1">
              Add a task with team assignment
            </span>
          </div>
        </CardTitle>

        <div className="flex items-center gap-4 mt-4 text-sm text-blue-100">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <Calendar className="h-4 w-4" />
            <span>
              {currentDateTime.date} ({currentDateTime.day})
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <Clock className="h-4 w-4" />
            <span>{currentDateTime.time}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-sm text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Task Title */}
          <div className="space-y-3">
            <Label
              htmlFor="title"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-blue-500" />
              Task Title
            </Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/80"
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Make it clear and actionable
              </div>
              <div
                className={`text-xs ${
                  title.length > 80 ? "text-orange-500" : "text-gray-400"
                }`}
              >
                {title.length}/100
              </div>
            </div>
          </div>

          {/* Task Description */}
          <div className="space-y-3">
            <Label
              htmlFor="description"
              className="text-sm font-semibold text-gray-700"
            >
              Description{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Add more details, requirements, or context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none bg-white/80"
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Provide context and requirements
              </div>
              <div
                className={`text-xs ${
                  description.length > 400 ? "text-orange-500" : "text-gray-400"
                }`}
              >
                {description.length}/500
              </div>
            </div>
          </div>

          {/* Assignment Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <div className="p-1 bg-blue-100 rounded">
                <User className="h-3 w-3 text-blue-600" />
              </div>
              Team Assignment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-600 flex items-center gap-2"
                >
                  <User className="h-3 w-3 text-blue-500" />
                  Assigned To
                </Label>
                <Input
                  id="name"
                  placeholder="Person's name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  className="h-11 border-2 border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 bg-white"
                />
                <div className="text-xs text-gray-500">{name.length}/50</div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="role"
                  className="text-sm font-medium text-gray-600 flex items-center gap-2"
                >
                  <Briefcase className="h-3 w-3 text-purple-500" />
                  Role/Department
                </Label>
                <Input
                  id="role"
                  placeholder="Developer, Designer, Manager..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  maxLength={50}
                  className="h-11 border-2 border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-200 bg-white"
                />
                <div className="text-xs text-gray-500">{role.length}/50</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Task...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Task
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
