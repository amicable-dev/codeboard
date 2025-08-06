interface TopbarProps {
  toggleSidebar: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar }) => {
  return (
    <div className="h-14 bg-white shadow flex items-center justify-between px-6 border-b">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-blue-500"
        >
          ☰
        </button>
        <span className="font-bold text-lg text-blue-600">CodeBoard 🧠</span>
      </div>
      <div className="flex gap-4 text-gray-700">
        <button className="hover:text-blue-500">Dashboard</button>
        <button className="hover:text-blue-500">Logout</button>
      </div>
    </div>
  );
};

export default Topbar;
