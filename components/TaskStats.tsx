"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Plus, TrendingUp } from "lucide-react";

interface TaskStatsProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
}

export default function TaskStats({ stats }: TaskStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-blue-700">
            Total Tasks
          </CardTitle>
          <div className="p-2 bg-blue-200/50 rounded-lg">
            <Plus className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-2xl md:text-3xl font-bold text-blue-800">
            {stats.total}
          </div>
          <p className="text-xs text-blue-600 mt-1 hidden md:block">
            All created tasks
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-green-50 to-green-100/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-green-700">
            Completed
          </CardTitle>
          <div className="p-2 bg-green-200/50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-2xl md:text-3xl font-bold text-green-800">
            {stats.completed}
          </div>
          <p className="text-xs text-green-600 mt-1 hidden md:block">
            Tasks finished
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-orange-700">
            Pending
          </CardTitle>
          <div className="p-2 bg-orange-200/50 rounded-lg">
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-2xl md:text-3xl font-bold text-orange-800">
            {stats.pending}
          </div>
          <p className="text-xs text-orange-600 mt-1 hidden md:block">
            Tasks remaining
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-purple-700">
            Success Rate
          </CardTitle>
          <div className="p-2 bg-purple-200/50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-2xl md:text-3xl font-bold text-purple-800">
            {stats.completionRate}%
          </div>
          <p className="text-xs text-purple-600 mt-1 hidden md:block">
            Completion rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
