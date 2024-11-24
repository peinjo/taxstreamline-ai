import { Activity } from "./types";

interface ActivityLogProps {
  activities: Activity[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
      <div className="space-y-2">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center space-x-2 text-gray-600"
          >
            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
            <span className="text-sm">
              {activity.action} {activity.documentTitle} ({activity.documentType}) - {activity.timestamp}
            </span>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-gray-500">No recent activity</p>
        )}
      </div>
    </div>
  );
}