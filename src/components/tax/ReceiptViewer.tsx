import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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
    // Implement receipt download logic
    console.log("Downloading receipt:", receipt.reference);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Payment Receipt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold">NGN {receipt.amount.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              Reference: {receipt.reference}
            </p>
          </div>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Date:</span>{" "}
              {new Date(receipt.date).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              <span className={receipt.status === "successful" ? "text-green-600" : "text-yellow-600"}>
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