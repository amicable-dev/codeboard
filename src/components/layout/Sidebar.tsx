import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, File, Folder, FolderOpen, Plus, Save, Trash2, Crown, Zap } from 'lucide-react';

interface FileItem {
  id: number;
  name: string;
  type: 'file' | 'folder';
  isOpen?: boolean;
  children?: FileItem[];
}

interface FileExtension {
  value: string;
  label: string;
  icon: string;
}

interface DataStructureTool {
  name: string;
  icon: string;
  color: string;
  description: string;
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'files' | 'tools'>('files');
  const [showNewFileDialog, setShowNewFileDialog] = useState<boolean>(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [selectedExtension, setSelectedExtension] = useState<string>('js');
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<FileItem | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [currentPlan, setCurrentPlan] = useState<'normal' | 'pro' | 'pro-plus'>('pro');
  const [files, setFiles] = useState<FileItem[]>([
    { id: 1, name: 'array-demo.js', type: 'file', isOpen: false },
    { id: 2, name: 'linked-list.js', type: 'file', isOpen: true },
    { 
      id: 3, 
      name: 'graph-algorithms', 
      type: 'folder', 
      isOpen: true, 
      children: [
        { id: 4, name: 'bfs.js', type: 'file', isOpen: false },
        { id: 5, name: 'dfs.js', type: 'file', isOpen: false }
      ]
    },
    { id: 6, name: 'tree-visualizer.js', type: 'file', isOpen: false },
    { 
      id: 7, 
      name: 'utils', 
      type: 'folder', 
      isOpen: false, 
      children: [
        { id: 8, name: 'helpers.js', type: 'file', isOpen: false }
      ]
    }
  ]);

  const fileExtensions: FileExtension[] = [
    { value: 'js', label: 'JavaScript (.js)', icon: '🟨' },
    { value: 'ts', label: 'TypeScript (.ts)', icon: '🔷' },
    { value: 'jsx', label: 'React JSX (.jsx)', icon: '⚛️' },
    { value: 'tsx', label: 'React TSX (.tsx)', icon: '⚛️' },
    { value: 'html', label: 'HTML (.html)', icon: '🌐' },
    { value: 'css', label: 'CSS (.css)', icon: '🎨' },
    { value: 'scss', label: 'SCSS (.scss)', icon: '🎨' },
    { value: 'json', label: 'JSON (.json)', icon: '📋' },
    { value: 'md', label: 'Markdown (.md)', icon: '📝' },
    { value: 'txt', label: 'Text (.txt)', icon: '📄' },
    { value: 'py', label: 'Python (.py)', icon: '🐍' },
    { value: 'java', label: 'Java (.java)', icon: '☕' },
    { value: 'cpp', label: 'C++ (.cpp)', icon: '⚙️' },
    { value: 'c', label: 'C (.c)', icon: '⚙️' }
  ];

  const dataStructureTools: DataStructureTool[] = [
    { name: 'Array', icon: '📊', color: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900', description: 'Create and visualize arrays' },
    { name: 'Linked List', icon: '🔗', color: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800', description: 'Build linked list structures' },
    { name: 'Stack', icon: '📚', color: 'bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-black', description: 'LIFO data structure' },
    { name: 'Queue', icon: '🚶‍♂️', color: 'bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-900', description: 'FIFO data structure' },
    { name: 'Binary Tree', icon: '🌳', color: 'bg-gradient-to-r from-gray-700 to-black hover:from-gray-800 hover:to-black', description: 'Tree data structure' },
    { name: 'Graph', icon: '🕸️', color: 'bg-gradient-to-r from-black to-gray-700 hover:from-gray-900 hover:to-gray-800', description: 'Graph networks' },
    { name: 'Hash Table', icon: '#️⃣', color: 'bg-gradient-to-r from-gray-600 to-black hover:from-gray-700 hover:to-gray-900', description: 'Key-value mapping' },
    { name: 'Heap', icon: '⛰️', color: 'bg-gradient-to-r from-gray-800 to-gray-600 hover:from-gray-900 hover:to-gray-700', description: 'Priority queue structure' }
  ];

  const planConfig = {
    normal: { name: 'Normal', icon: '⚪', color: 'bg-gray-600', textColor: 'text-white' },
    pro: { name: 'Pro', icon: '⚫', color: 'bg-black', textColor: 'text-white' },
    'pro-plus': { name: 'Pro Plus', icon: '💎', color: 'bg-gradient-to-r from-black to-gray-800', textColor: 'text-white' }
  };

  const toggleFolder = (folderId: number): void => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === folderId 
          ? { ...file, isOpen: !file.isOpen }
          : file
      )
    );
  };

  const addNewFile = (): void => {
    setNewFileName('');
    setSelectedExtension('js');
    setShowNewFileDialog(true);
  };

  const addNewFolder = (): void => {
    setNewFolderName('');
    setShowNewFolderDialog(true);
  };

  const findItemById = (items: FileItem[], id: number): FileItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const addItemToPath = (items: FileItem[], targetId: number, newItem: FileItem): FileItem[] => {
    return items.map(item => {
      if (item.id === targetId && item.type === 'folder') {
        return {
          ...item,
          children: [...(item.children || []), newItem]
        };
      }
      if (item.children) {
        return {
          ...item,
          children: addItemToPath(item.children, targetId, newItem)
        };
      }
      return item;
    });
  };

  const removeItemById = (items: FileItem[], targetId: number): FileItem[] => {
    return items.filter(item => {
      if (item.id === targetId) return false;
      if (item.children) {
        item.children = removeItemById(item.children, targetId);
      }
      return true;
    });
  };

  const moveItem = (sourceId: number, targetId: number): void => {
    const sourceItem = findItemById(files, sourceId);
    if (!sourceItem) return;

    const targetItem = findItemById(files, targetId);
    if (!targetItem || targetItem.type !== 'folder') return;

    const filesWithoutSource = removeItemById(files, sourceId);
    const updatedFiles = addItemToPath(filesWithoutSource, targetId, sourceItem);
    setFiles(updatedFiles);
  };

  const createFile = (): void => {
    if (newFileName.trim()) {
      const newFile: FileItem = {
        id: Date.now(),
        name: `${newFileName.trim()}.${selectedExtension}`,
        type: 'file',
        isOpen: false
      };
      
      if (selectedFolder) {
        setFiles(prev => addItemToPath(prev, selectedFolder, newFile));
      } else {
        setFiles(prev => [...prev, newFile]);
      }
      
      setShowNewFileDialog(false);
      setNewFileName('');
      setSelectedFolder(null);
    }
  };

  const createFolder = (): void => {
    if (newFolderName.trim()) {
      const newFolder: FileItem = {
        id: Date.now(),
        name: newFolderName.trim(),
        type: 'folder',
        isOpen: false,
        children: []
      };
      
      if (selectedFolder) {
        setFiles(prev => addItemToPath(prev, selectedFolder, newFolder));
      } else {
        setFiles(prev => [...prev, newFolder]);
      }
      
      setShowNewFolderDialog(false);
      setNewFolderName('');
      setSelectedFolder(null);
    }
  };

  const cancelFileCreation = (): void => {
    setShowNewFileDialog(false);
    setNewFileName('');
    setSelectedExtension('js');
    setSelectedFolder(null);
  };

  const cancelFolderCreation = (): void => {
    setShowNewFolderDialog(false);
    setNewFolderName('');
    setSelectedFolder(null);
  };

  const selectFolder = (folderId: number, folderPath: string[]): void => {
    setSelectedFolder(folderId);
    setCurrentPath(folderPath);
  };

  const deleteFile = (fileId: number, event: React.MouseEvent): void => {
    event.stopPropagation();
    setFiles(prevFiles => removeItemById(prevFiles, fileId));
  };

  const handleDragStart = (e: React.DragEvent, item: FileItem): void => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, item: FileItem): void => {
    e.preventDefault();
    if (item.type === 'folder') {
      setDropTarget(item.id);
    }
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, targetItem: FileItem): void => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedItem && targetItem && targetItem.type === 'folder' && draggedItem.id !== targetItem.id) {
      moveItem(draggedItem.id, targetItem.id);
    }
    
    setDraggedItem(null);
    setDropTarget(null);
  };

  const renderFileTree = (items: FileItem[], depth = 0, parentPath: string[] = []): React.ReactNode[] => {
    return items.map(item => {
      const itemPath = [...parentPath, item.name];
      const isDropTarget = dropTarget === item.id;
      
      return (
        <div key={item.id} className={`${isCollapsed ? 'hidden' : ''}`}>
          <div 
            className={`group flex items-center gap-2 p-1.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
              item.isOpen 
                ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-md' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            } ${isDropTarget ? 'bg-white text-black border-2 border-gray-400' : ''}`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, item)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, item)}
            onClick={() => {
              if (item.type === 'folder') {
                toggleFolder(item.id);
                selectFolder(item.id, itemPath);
              }
            }}
          >
            {item.type === 'folder' ? (
              item.isOpen ? <FolderOpen size={16} className="text-current" /> : <Folder size={16} className="text-current" />
            ) : (
              <File size={16} className="text-current" />
            )}
            <span className="flex-1 truncate">{item.name}</span>
            <button 
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-600 rounded transition-all duration-200 hover:scale-110"
              onClick={(e) => deleteFile(item.id, e)}
              title={`Delete ${item.type}`}
            >
              <Trash2 size={12} />
            </button>
          </div>
          {item.children && item.isOpen && renderFileTree(item.children, depth + 1, itemPath)}
        </div>
      );
    });
  };

  interface TabButtonProps {
    id: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }

  const TabButton: React.FC<TabButtonProps> = ({ id, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-white text-black shadow-lg transform scale-105' 
          : 'text-gray-300 hover:text-white hover:bg-gray-700'
      } ${isCollapsed ? 'hidden' : ''}`}
    >
      {label}
    </button>
  );

  return (
    <div className={`
      ${isCollapsed ? 'w-12' : 'w-80'} 
      h-screen bg-gradient-to-b from-black via-gray-900 to-black border-r border-gray-700 shadow-2xl flex flex-col transition-all duration-300 ease-in-out relative overflow-hidden
      ${isCollapsed ? 'md:w-12' : 'md:w-80'}
      ${isCollapsed ? 'sm:w-8' : 'sm:w-72'}
    `}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-transparent to-white"></div>
      </div>

      {/* Header with Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-black to-gray-900 relative z-10">
        {!isCollapsed && (
          <h1 className="font-bold text-white text-lg tracking-tight">Workspace</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200 text-white hover:scale-110"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Tab Navigation */}
      {!isCollapsed && (
        <div className="flex gap-2 p-3 bg-gradient-to-r from-gray-900 to-black border-b border-gray-700 relative z-10">
          <TabButton 
            id="files" 
            label="Files" 
            isActive={activeTab === 'files'} 
            onClick={() => setActiveTab('files')}
          />
          <TabButton 
            id="tools" 
            label="Tools" 
            isActive={activeTab === 'tools'} 
            onClick={() => setActiveTab('tools')}
          />
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {/* New Folder Dialog */}
        {showNewFolderDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-xl shadow-2xl p-6 w-80 mx-4 border border-gray-600">
              <h3 className="text-xl font-bold mb-4 text-center">Create New Folder</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name..."
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                  />
                </div>
                
                {selectedFolder && (
                  <div className="text-sm text-white bg-gray-800 p-3 rounded-lg border border-gray-600">
                    <strong>📁 Creating inside:</strong> {currentPath.join(' / ')}
                  </div>
                )}
                
                <div className="text-sm text-gray-300 bg-gray-800 p-3 rounded-lg border border-gray-600">
                  <strong>Preview:</strong> 📁 {newFolderName || 'folder-name'}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={createFolder}
                  disabled={!newFolderName.trim()}
                  className="flex-1 bg-white text-black rounded-lg py-2 px-4 text-sm font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  Create Folder
                </button>
                <button
                  onClick={cancelFolderCreation}
                  className="flex-1 bg-gray-700 text-white rounded-lg py-2 px-4 text-sm font-medium hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New File Dialog */}
        {showNewFileDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-xl shadow-2xl p-6 w-80 mx-4 border border-gray-600">
              <h3 className="text-xl font-bold mb-4 text-center">Create New File</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Enter file name..."
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && createFile()}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    File Type
                  </label>
                  <select
                    value={selectedExtension}
                    onChange={(e) => setSelectedExtension(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white"
                  >
                    {fileExtensions.map((ext) => (
                      <option key={ext.value} value={ext.value} className="bg-gray-800">
                        {ext.icon} {ext.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedFolder && (
                  <div className="text-sm text-white bg-gray-800 p-3 rounded-lg border border-gray-600">
                    <strong>📁 Creating inside:</strong> {currentPath.join(' / ')}
                  </div>
                )}
                
                <div className="text-sm text-gray-300 bg-gray-800 p-3 rounded-lg border border-gray-600">
                  <strong>Preview:</strong> {newFileName || 'filename'}.{selectedExtension}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={createFile}
                  disabled={!newFileName.trim()}
                  className="flex-1 bg-white text-black rounded-lg py-2 px-4 text-sm font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  Create File
                </button>
                <button
                  onClick={cancelFileCreation}
                  className="flex-1 bg-gray-700 text-white rounded-lg py-2 px-4 text-sm font-medium hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="p-4">
            {!isCollapsed && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-sm tracking-wider">EXPLORER</h3>
                    {selectedFolder && (
                      <div className="text-xs text-gray-300 mt-1 flex items-center gap-1">
                        📁 Selected: {currentPath.join(' / ')}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={addNewFile}
                      className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200 text-white hover:scale-110"
                      title="New File"
                    >
                      <Plus size={14} />
                    </button>
                    <button 
                      onClick={addNewFolder}
                      className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200 text-white hover:scale-110"
                      title="New Folder"
                    >
                      <Folder size={14} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  {renderFileTree(files)}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="p-4">
            {!isCollapsed && (
              <>
                <h3 className="font-bold text-white text-sm mb-4 tracking-wider">DATA STRUCTURES</h3>
                <div className="space-y-3">
                  {dataStructureTools.map((tool, index) => (
                    <button
                      key={index}
                      className={`w-full ${tool.color} text-white rounded-xl p-4 text-sm shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-3 border border-gray-600 hover:border-gray-500`}
                      title={tool.description}
                    >
                      <span className="text-lg">{tool.icon}</span>
                      <div className="text-left">
                        <div className="font-bold">{tool.name}</div>
                        <div className="text-xs opacity-80">{tool.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Collapsed State - Quick Actions */}
      {isCollapsed && (
        <div className="p-2 space-y-2 relative z-10">
          <button 
            className="w-full p-3 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200 hover:scale-110"
            title="Files"
            onClick={() => {
              setActiveTab('files');
              setIsCollapsed(false);
            }}
          >
            <File size={18} />
          </button>
          <button 
            className="w-full p-3 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200 hover:scale-110"
            title="Tools"
            onClick={() => {
              setActiveTab('tools');
              setIsCollapsed(false);
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      )}

      {/* Footer Actions & Plan Indicator */}
      {!isCollapsed && (
        <div className="border-t border-gray-700 bg-gradient-to-r from-black to-gray-900 relative z-10">
          <div className="p-3">
            <button className="w-full bg-white text-black rounded-lg p-3 text-sm font-bold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 shadow-lg">
              <Save size={14} />
              Save All
            </button>
          </div>
          
          {/* Plan Indicator */}
          <div className="px-3 pb-3">
            <div className={`${planConfig[currentPlan].color} ${planConfig[currentPlan].textColor} rounded-lg p-3 text-center border border-gray-600 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-pulse"></div>
              <div className="relative z-10 flex items-center justify-center gap-2">
                <span className="text-lg">{planConfig[currentPlan].icon}</span>
                <div>
                  <div className="font-bold text-sm">{planConfig[currentPlan].name} Plan</div>
                  <div className="text-xs opacity-75">
                    {currentPlan === 'normal' && 'Basic features'}
                    {currentPlan === 'pro' && 'Advanced tools'}
                    {currentPlan === 'pro-plus' && 'Premium experience'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;