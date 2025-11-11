import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Search } from "lucide-react";

interface RecentLogsProps {
  logs: any[];
  isLoading: boolean;
}

export function RecentLogs({ logs, isLoading }: RecentLogsProps) {
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
          <CardDescription>Latest application logs</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px]" />
        </CardContent>
      </Card>
    );
  }

  const filteredLogs = logs.filter(log => {
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesSearch = searchQuery === "" || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.component?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getLevelBadge = (level: string) => {
    const variants: Record<string, any> = {
      ERROR: "destructive",
      WARN: "warning",
      INFO: "default",
      DEBUG: "secondary"
    };
    return <Badge variant={variants[level] || "default"}>{level}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Logs</CardTitle>
            <CardDescription>Latest {filteredLogs.length} of {logs.length} logs</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="ERROR">Errors</SelectItem>
                <SelectItem value="WARN">Warnings</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="DEBUG">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Component</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.created_at), "MMM dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>{getLevelBadge(log.level)}</TableCell>
                    <TableCell>
                      <code className="text-xs">{log.component || "—"}</code>
                    </TableCell>
                    <TableCell className="max-w-[400px] truncate">
                      {log.message}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Log Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <strong>Time:</strong> {format(new Date(log.created_at), "PPpp")}
                            </div>
                            <div>
                              <strong>Level:</strong> {getLevelBadge(log.level)}
                            </div>
                            <div>
                              <strong>Component:</strong> <code>{log.component || "—"}</code>
                            </div>
                            <div>
                              <strong>Action:</strong> <code>{log.action || "—"}</code>
                            </div>
                            <div>
                              <strong>Message:</strong>
                              <pre className="mt-2 rounded bg-muted p-2 text-sm">{log.message}</pre>
                            </div>
                            {log.error_message && (
                              <div>
                                <strong className="text-destructive">Error:</strong>
                                <pre className="mt-2 rounded bg-destructive/10 p-2 text-sm text-destructive">
                                  {log.error_message}
                                </pre>
                              </div>
                            )}
                            {log.error_stack && (
                              <div>
                                <strong>Stack Trace:</strong>
                                <pre className="mt-2 rounded bg-muted p-2 text-xs font-mono overflow-auto max-h-[200px]">
                                  {log.error_stack}
                                </pre>
                              </div>
                            )}
                            {log.duration && (
                              <div>
                                <strong>Duration:</strong> {log.duration}ms
                              </div>
                            )}
                            {log.endpoint && (
                              <div>
                                <strong>Endpoint:</strong> <code>{log.method} {log.endpoint}</code>
                              </div>
                            )}
                            {log.context && Object.keys(log.context).length > 0 && (
                              <div>
                                <strong>Context:</strong>
                                <pre className="mt-2 rounded bg-muted p-2 text-xs overflow-auto max-h-[200px]">
                                  {JSON.stringify(log.context, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
