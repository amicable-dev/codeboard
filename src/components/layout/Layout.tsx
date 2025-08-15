import { useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import MainPanel from "./MainPanel";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-200">
      <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <Sidebar />}
        <MainPanel />
      </div>
    </div>
  );
};

export default Layout;
