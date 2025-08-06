const Sidebar = () => {
  return (
    <div className="w-56 bg-gray-100 border-r shadow-inner p-4 flex flex-col gap-3">
      <h2 className="font-semibold text-gray-700 text-sm">🛠 Tools</h2>
      <button className="w-full bg-blue-500 text-white rounded-md p-2 text-sm shadow hover:bg-blue-600">
        ➕ Array
      </button>
      <button className="w-full bg-green-500 text-white rounded-md p-2 text-sm shadow hover:bg-green-600">
        ➕ Linked List
      </button>
      <button className="w-full bg-purple-500 text-white rounded-md p-2 text-sm shadow hover:bg-purple-600">
        ➕ Graph
      </button>
    </div>
  );
};

export default Sidebar;
