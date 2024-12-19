import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommentList } from "./CommentList";
import { CommentInput } from "./CommentInput";

export const DocumentComments = ({ documentId }: { documentId: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CommentList documentId={documentId} />
        <CommentInput documentId={documentId} />
      </CardContent>
    </Card>
  );
};