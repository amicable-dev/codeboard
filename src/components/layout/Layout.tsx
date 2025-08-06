import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import MainPanel from "./MainPanel";

const Layout = () => {
  return (
    <div className="flex flex-col h-screen w-screen bg-gray-200">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainPanel />
      </div>
    </div>
  );
};

export default Layout;
