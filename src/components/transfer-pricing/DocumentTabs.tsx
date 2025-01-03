import { startTransition } from "react";

interface DocumentTabsProps {
  activeTab: "master" | "local";
  setActiveTab: (tab: "master" | "local") => void;
}

export function DocumentTabs({ activeTab, setActiveTab }: DocumentTabsProps) {
  return (
    <div className="flex space-x-4 border-b">
      <button 
        className={`px-4 py-2 ${activeTab === "master" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}
        onClick={() => startTransition(() => setActiveTab("master"))}
      >
        Master File
      </button>
      <button 
        className={`px-4 py-2 ${activeTab === "local" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}
        onClick={() => startTransition(() => setActiveTab("local"))}
      >
        Local File
      </button>
    </div>
  );
}