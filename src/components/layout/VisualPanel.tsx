const VisualPanel = () => {
  return (
    <div className="h-full w-full bg-gray-50 p-4 flex flex-col">
      <h2 className="font-semibold mb-2 text-gray-700">📊 Visual Output</h2>
      <div className="flex-1 bg-white border rounded p-2 shadow-inner overflow-auto">
        <p className="text-gray-400">Visual representation appears here...</p>
      </div>
    </div>
  );
};

export default VisualPanel;
