import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

export const TeamMessaging = ({ teamId }: { teamId: number }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MessageList teamId={teamId} />
        <MessageInput teamId={teamId} />
      </CardContent>
    </Card>
  );
};