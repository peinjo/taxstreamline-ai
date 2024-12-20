import React from "react";
import { Task } from "@/types/team";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
}

export const TaskList = ({ tasks }: TaskListProps) => {
  return (
    <div className="grid gap-4">
      {tasks?.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};