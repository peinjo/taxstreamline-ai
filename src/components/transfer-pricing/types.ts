export interface Document {
  id: number;
  title: string;
  modified: string;
  type: "master" | "local";
  content?: string;
}