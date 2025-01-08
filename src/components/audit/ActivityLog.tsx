import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityLogProps {
  organizationId: number;
}

export const ActivityLog = ({ organizationId }: ActivityLogProps) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["organization-activities", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_activities")
        .select(`
          *,
          user:user_id (
            email
          )
        `)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="text-center py-4">Loading activities...</div>
          ) : activities?.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No activities recorded yet
            </div>
          ) : (
            <div className="space-y-4">
              {activities?.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 text-sm"
                >
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <div>
                    <p>
                      <span className="font-medium">
                        {activity.user?.email?.split("@")[0]}
                      </span>{" "}
                      {activity.action}
                    </p>
                    <time className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString()}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};