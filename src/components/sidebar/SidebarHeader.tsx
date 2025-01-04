import React from "react";

const SidebarHeader = () => {
  return (
    <div className="p-4">
      <div className="mb-8 flex items-center gap-2 px-2">
        <img
          src="/lovable-uploads/235a3f0b-697d-47c6-8c81-c2b3066c1717.png"
          alt="Phester Consult Logo"
          className="h-8 w-8"
        />
        <span className="text-xl font-bold text-white">Phester Consult</span>
      </div>
    </div>
  );
};

export default SidebarHeader;