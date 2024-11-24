export interface Document {
  id: number;
  title: string;
  modified: string;
  type: "master" | "local";
  content?: string;
}

export interface Activity {
  id: number;
  action: string;
  documentTitle: string;
  documentType: "master" | "local";
  timestamp: string;
}