const VisualPanel = () => {
  return (
    <div className="h-full w-full bg-gray-50 p-4 flex flex-col">
      <h2 className="font-semibold mb-2 text-gray-700">visualSolutions</h2>
      <div className="flex-1 bg-white border rounded p-2 shadow-inner overflow-auto">
        <p className="text-gray-400">Visual representation appears here...</p>
      </div>
      <div className="mt-4 flex justify-end">
        <button className="px-4 flex py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Clear
        </button>
      </div>
    </div>
  );
};
export default VisualPanel;
