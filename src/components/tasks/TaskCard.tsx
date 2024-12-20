import React from "react";
import { format } from "date-fns";
import { Task } from "@/types/team";

interface TaskCardProps {
  task: Task;
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "";
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow space-y-2">
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{task.title}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            task.status
          )}`}
        >
          {task.status.replace("_", " ")}
        </span>
      </div>
      {task.description && (
        <p className="text-sm text-gray-600">{task.description}</p>
      )}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span className={getPriorityColor(task.priority)}>
          Priority: {task.priority}
        </span>
        {task.due_date && (
          <span>Due: {format(new Date(task.due_date), "PPP")}</span>
        )}
      </div>
    </div>
  );
};