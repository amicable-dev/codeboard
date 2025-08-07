import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, File, Folder, FolderOpen, Plus, Save, Trash2 } from 'lucide-react';

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
    { name: 'Array', icon: '📊', color: 'bg-blue-500 hover:bg-blue-600', description: 'Create and visualize arrays' },
    { name: 'Linked List', icon: '🔗', color: 'bg-green-500 hover:bg-green-600', description: 'Build linked list structures' },
    { name: 'Stack', icon: '📚', color: 'bg-yellow-500 hover:bg-yellow-600', description: 'LIFO data structure' },
    { name: 'Queue', icon: '🚶‍♂️', color: 'bg-orange-500 hover:bg-orange-600', description: 'FIFO data structure' },
    { name: 'Binary Tree', icon: '🌳', color: 'bg-purple-500 hover:bg-purple-600', description: 'Tree data structure' },
    { name: 'Graph', icon: '🕸️', color: 'bg-indigo-500 hover:bg-indigo-600', description: 'Graph networks' },
    { name: 'Hash Table', icon: '#️⃣', color: 'bg-pink-500 hover:bg-pink-600', description: 'Key-value mapping' },
    { name: 'Heap', icon: '⛰️', color: 'bg-red-500 hover:bg-red-600', description: 'Priority queue structure' }
  ];

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

    // Remove from current location
    const filesWithoutSource = removeItemById(files, sourceId);
    
    // Add to new location
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

  const getItemPath = (items: FileItem[], targetId: number, currentPath: string[] = []): string[] | null => {
    for (const item of items) {
      const newPath = [...currentPath, item.name];
      if (item.id === targetId) {
        return newPath;
      }
      if (item.children) {
        const foundPath = getItemPath(item.children, targetId, newPath);
        if (foundPath) return foundPath;
      }
    }
    return null;
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
          className={`group flex items-center gap-2 p-1.5 rounded text-sm cursor-pointer transition-colors ${
            item.isOpen ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          } ${isDropTarget ? 'bg-green-100 border-2 border-green-300' : 'hover:bg-gray-200'}`}
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
            item.isOpen ? <FolderOpen size={16} /> : <Folder size={16} />
          ) : (
            <File size={16} />
          )}
          <span className="flex-1 truncate">{item.name}</span>
          <button 
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-200 rounded transition-opacity"
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
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive 
          ? 'bg-white text-blue-600 shadow-sm' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      } ${isCollapsed ? 'hidden' : ''}`}
    >
      {label}
    </button>
  );

  return (
    <div className={`
      ${isCollapsed ? 'w-12' : 'w-80'} 
      h-screen bg-gray-50 border-r border-gray-200 shadow-sm flex flex-col transition-all duration-300 ease-in-out
      ${isCollapsed ? 'md:w-12' : 'md:w-80'}
      ${isCollapsed ? 'sm:w-8' : 'sm:w-72'}
    `}>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
        {!isCollapsed && (
          <h1 className="font-semibold text-gray-800 text-lg">Workspace</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Tab Navigation */}
      {!isCollapsed && (
        <div className="flex gap-1 p-2 bg-gray-100 border-b border-gray-200">
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
      <div className="flex-1 overflow-y-auto">
        {/* New Folder Dialog */}
        {showNewFolderDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-80 mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Folder</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                  />
                </div>
                
                {selectedFolder && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                    <strong>📁 Creating inside:</strong> {currentPath.join(' / ')}
                  </div>
                )}
                
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  <strong>Preview:</strong> 📁 {newFolderName || 'folder-name'}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={createFolder}
                  disabled={!newFolderName.trim()}
                  className="flex-1 bg-blue-600 text-white rounded-md py-2 px-4 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Folder
                </button>
                <button
                  onClick={cancelFolderCreation}
                  className="flex-1 bg-gray-200 text-gray-800 rounded-md py-2 px-4 text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New File Dialog */}
        {showNewFileDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-80 mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New File</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Enter file name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && createFile()}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Type
                  </label>
                  <select
                    value={selectedExtension}
                    onChange={(e) => setSelectedExtension(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {fileExtensions.map((ext) => (
                      <option key={ext.value} value={ext.value}>
                        {ext.icon} {ext.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedFolder && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                    <strong>📁 Creating inside:</strong> {currentPath.join(' / ')}
                  </div>
                )}
                
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  <strong>Preview:</strong> {newFileName || 'filename'}.{selectedExtension}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={createFile}
                  disabled={!newFileName.trim()}
                  className="flex-1 bg-blue-600 text-white rounded-md py-2 px-4 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create File
                </button>
                <button
                  onClick={cancelFileCreation}
                  className="flex-1 bg-gray-200 text-gray-800 rounded-md py-2 px-4 text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="p-3">
            {!isCollapsed && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-700 text-sm">EXPLORER</h3>
                    {selectedFolder && (
                      <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        📁 Selected: {currentPath.join(' / ')}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={addNewFile}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="New File"
                    >
                      <Plus size={14} />
                    </button>
                    <button 
                      onClick={addNewFolder}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="New Folder"
                    >
                      <Folder size={14} />
                    </button>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {renderFileTree(files)}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="p-3">
            {!isCollapsed && (
              <>
                <h3 className="font-medium text-gray-700 text-sm mb-3">DATA STRUCTURES</h3>
                <div className="space-y-2">
                  {dataStructureTools.map((tool, index) => (
                    <button
                      key={index}
                      className={`w-full ${tool.color} text-white rounded-lg p-3 text-sm shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 flex items-center gap-3`}
                      title={tool.description}
                    >
                      <span className="text-lg">{tool.icon}</span>
                      <div className="text-left">
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-xs opacity-90">{tool.description}</div>
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
        <div className="p-2 space-y-2">
          <button 
            className="w-full p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            title="Files"
            onClick={() => {
              setActiveTab('files');
              setIsCollapsed(false);
            }}
          >
            <File size={18} />
          </button>
          <button 
            className="w-full p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
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

      {/* Footer Actions */}
      {!isCollapsed && (
        <div className="border-t border-gray-200 p-3 bg-white">
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 text-white rounded-md p-2 text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Save size={14} />
              Save All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;