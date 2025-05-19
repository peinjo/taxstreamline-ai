
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface ReceiptViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: {
    reference: string;
    amount: number;
    date: string;
    status: string;
  };
}

export function ReceiptViewer({ open, onOpenChange, receipt }: ReceiptViewerProps) {
  const handleDownload = () => {
    try {
      // Create a text representation of the receipt
      const receiptText = `
PAYMENT RECEIPT
--------------
Reference: ${receipt.reference}
Amount: NGN ${receipt.amount.toLocaleString()}
Date: ${format(new Date(receipt.date), "PPP")}
Status: ${receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
      `;
      
      // Create a Blob with the receipt text
      const blob = new Blob([receiptText], { type: "text/plain" });
      
      // Create an object URL for the Blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${receipt.reference.substring(0, 8)}.txt`;
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "successful":
      case "success":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Payment Receipt</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold">NGN {receipt.amount.toLocaleString()}</p>
            <Badge className={receipt.status === "successful" || receipt.status === "success" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
              {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
            </Badge>
          </div>
          
          <div className="space-y-3 border-t border-b py-4">
            <p>
              <span className="font-medium">Reference:</span>{" "}
              <span className="font-mono">{receipt.reference}</span>
            </p>
            <p>
              <span className="font-medium">Date:</span>{" "}
              {format(new Date(receipt.date), "PPP pp")}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              <span className={getStatusColor(receipt.status)}>
                {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
              </span>
            </p>
          </div>
          
          <Button onClick={handleDownload} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
