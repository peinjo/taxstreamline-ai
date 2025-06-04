
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComplianceItem } from "@/types/compliance";
import { CheckCircle, Clock, AlertCircle, XCircle, Edit, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface ComplianceItemCardProps {
  item: ComplianceItem;
  onEdit: (item: ComplianceItem) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export function ComplianceItemCard({ item, onEdit, onDelete, onUpdateStatus }: ComplianceItemCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "attention":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "overdue":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "attention":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {item.country}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {item.requirement_type}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(item.status)}
            <Badge className={`text-xs ${getStatusColor(item.status)}`}>
              {item.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {item.description && (
          <p className="text-sm text-gray-600">{item.description}</p>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Priority:</span>
              <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                {item.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Frequency:</span>
              <span className="capitalize">{item.frequency}</span>
            </div>
          </div>
          
          {item.next_due_date && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">Due:</span>
              </div>
              <span className="text-sm font-medium">
                {format(new Date(item.next_due_date), "MMM dd, yyyy")}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-2">
            {item.status !== 'compliant' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(item.id, 'compliant')}
                className="text-green-600 hover:text-green-700"
              >
                Mark Complete
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(item)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
