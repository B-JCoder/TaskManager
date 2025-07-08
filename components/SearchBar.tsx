"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { debounce } from "@/lib/performance";
import type { TaskFilters } from "@/types/task";
import { CheckCircle, Clock, Filter, Search, Sparkles, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface SearchBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: Partial<TaskFilters>) => void;
  totalTasks: number;
  filteredCount: number;
}

export default function SearchBar({
  filters,
  onFiltersChange,
  totalTasks,
  filteredCount,
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [inputValue, setInputValue] = useState(filters.searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(filters.searchQuery);
  }, [filters.searchQuery]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        onFiltersChange({ searchQuery: value });
      }, 150),
    [onFiltersChange]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      if (value.trim() === "") {
        onFiltersChange({ searchQuery: value });
      } else {
        debouncedSearch(value);
      }
    },
    [debouncedSearch, onFiltersChange]
  );

  const clearSearch = useCallback(() => {
    setInputValue("");
    onFiltersChange({ searchQuery: "" });
    inputRef.current?.focus();
  }, [onFiltersChange]);

  const toggleFilter = useCallback(
    (filterType: "showCompleted" | "showPending") => {
      onFiltersChange({ [filterType]: !filters[filterType] });
    },
    [filters, onFiltersChange]
  );

  const clearAllFilters = useCallback(() => {
    setInputValue("");
    onFiltersChange({
      searchQuery: "",
      showCompleted: true,
      showPending: true,
    });
    setShowFilters(false);
  }, [onFiltersChange]);

  const hasActiveFilters = useMemo(
    () =>
      !filters.showCompleted ||
      !filters.showPending ||
      filters.searchQuery.trim(),
    [filters]
  );

  const isFiltered = useMemo(
    () => filteredCount !== totalTasks,
    [filteredCount, totalTasks]
  );

  const searchTips = useMemo(() => {
    if (!filters.searchQuery || filteredCount > 0) return null;

    return (
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-sm">
        <CardContent className="p-4">
          <div className="text-sm text-orange-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-orange-600" />
              <p className="font-semibold">No tasks found</p>
            </div>
            <p className="text-xs mb-2">Try searching by:</p>
            <ul className="text-xs space-y-1 ml-4">
              <li>• Task title or description</li>
              <li>• Person's name or role</li>
              <li>
                • Date in YYYY-MM-DD format (e.g.,{" "}
                {new Date().toISOString().split("T")[0]})
              </li>
              <li>• Day name (e.g., Monday, Tuesday)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }, [filters.searchQuery, filteredCount]);

  return (
    <div className="space-y-4">
      {/* Enhanced Search Input */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              ref={inputRef}
              placeholder="Search by title, description, name, role, or date (YYYY-MM-DD)..."
              value={inputValue}
              onChange={handleSearchChange}
              className="pl-12 pr-24 h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/90"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {inputValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-8 px-3 text-sm rounded-full transition-all duration-200 ${
                  hasActiveFilters
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <Filter className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Filter Options */}
      {showFilters && (
        <Card className="shadow-md border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={filters.showPending ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter("showPending")}
                className={`transition-all duration-200 ${
                  filters.showPending
                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                    : "border-orange-300 text-orange-600 hover:bg-orange-50"
                }`}
              >
                <Clock className="h-4 w-4 mr-2" />
                Pending Tasks
              </Button>
              <Button
                variant={filters.showCompleted ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter("showCompleted")}
                className={`transition-all duration-200 ${
                  filters.showCompleted
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-md"
                    : "border-green-300 text-green-600 hover:bg-green-50"
                }`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Search Results Info */}
      {(hasActiveFilters || isFiltered) && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-medium text-blue-800">
                  Showing {filteredCount} of {totalTasks} tasks
                </span>
                {filters.searchQuery && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 border-blue-200"
                  >
                    <Search className="h-3 w-3 mr-1" />"{filters.searchQuery}"
                  </Badge>
                )}
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 text-sm"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Tips */}
      {searchTips}
    </div>
  );
}
