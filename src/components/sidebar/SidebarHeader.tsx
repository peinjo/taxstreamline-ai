
import React from "react";

const SidebarHeader = () => {
  return (
    <div className="p-4">
      <div className="mb-8 flex items-center gap-2 px-2">
        <img
          src="/lovable-uploads/8f4d9e33-a30b-4278-98bf-b226eb32a5f6.png"
          alt="TaxPal Logo"
          className="h-8 w-8"
        />
        <span className="text-xl font-bold text-white">TaxPal</span>
      </div>
    </div>
  );
};

export default SidebarHeader;
