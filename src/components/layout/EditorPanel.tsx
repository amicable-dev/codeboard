import { useState, useRef, useEffect } from "react";

const EditorPanel = () => {
  const [code, setCode] = useState<string>(`// Welcome to the Code Editor!
function greet(name) {
  console.log("Hello, " + name + "!");
  return "Welcome to coding!";
}

// Try editing this code
const result = greet("Developer");
console.log(result);`);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(14);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    if (isEditing) {
      adjustTextareaHeight();
    }
  }, [code, isEditing]);

  const handleCodeClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(code.length, code.length);
      }
    }, 0);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start + 2, start + 2);
        }
      }, 0);
    }

    // Ctrl+S to save (just shows feedback)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      setIsEditing(false);
      // You can add save logic here
    }

    // Esc to exit editing
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const renderCodeWithHighlighting = (codeText: string) => {
    const lines = codeText.split('\n');
    
    return lines.map((line, index) => (
      <div key={index} className="flex hover:bg-gray-100/50 group">
        <span className={`select-none w-8 text-right mr-3 flex-shrink-0 ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {index + 1}
        </span>
        <span className="flex-1 whitespace-pre-wrap break-words">
          {highlightSyntax(line)}
        </span>
      </div>
    ));
  };

  const highlightSyntax = (line: string) => {
    if (!line.trim()) return line;

    // Comment highlighting
    if (line.trim().startsWith('//')) {
      return <span className="text-green-600 italic">{line}</span>;
    }

    let highlightedLine = line;
    
    // Keywords
    const keywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export'];
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlightedLine = highlightedLine.replace(regex, `<span class="text-blue-600 font-semibold">${keyword}</span>`);
    });

    // Strings
    highlightedLine = highlightedLine.replace(/"([^"]*)"/g, '<span class="text-green-600">"$1"</span>');
    highlightedLine = highlightedLine.replace(/'([^']*)'/g, '<span class="text-green-600">\'$1\'</span>');

    // Functions
    highlightedLine = highlightedLine.replace(/\b(\w+)\s*\(/g, '<span class="text-purple-600 font-medium">$1</span>(');

    // Numbers
    highlightedLine = highlightedLine.replace(/\b\d+\b/g, '<span class="text-orange-600">$&</span>');

    return <span dangerouslySetInnerHTML={{ __html: highlightedLine }} />;
  };

  const getStats = () => {
    const lines = code.split('\n').length;
    const words = code.split(/\s+/).filter(word => word.length > 0).length;
    const chars = code.length;
    return { lines, words, chars };
  };

  const stats = getStats();

  return (
    <div className={`h-full w-full flex flex-col ${
      theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'
    }`}>
      {/* Header */}
      <div className={`p-3 border-b flex items-center justify-between ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center space-x-2">
          <span className="text-lg">💻</span>
          <h2 className="font-semibold">Code Editor</h2>
          <span className={`text-xs px-2 py-1 rounded ${
            isEditing 
              ? 'bg-green-100 text-green-700' 
              : theme === 'dark' 
                ? 'bg-gray-700 text-gray-300' 
                : 'bg-gray-200 text-gray-600'
          }`}>
            {isEditing ? 'Editing' : 'Preview'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Font Size Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFontSize(Math.max(10, fontSize - 1))}
              className={`px-2 py-1 rounded text-xs ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}
            >
              A-
            </button>
            <span className="text-xs">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(20, fontSize + 1))}
              className={`px-2 py-1 rounded text-xs ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}
            >
              A+
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`px-2 py-1 rounded text-xs ${
              theme === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* Action Buttons */}
          <button
            onClick={() => setCode('')}
            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
          >
            Clear
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 relative overflow-hidden">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsEditing(false)}
            className={`w-full h-full font-mono resize-none border-none outline-none p-4 leading-6 ${
              theme === 'dark' 
                ? 'bg-gray-900 text-gray-100' 
                : 'bg-white text-gray-800'
            }`}
            style={{ fontSize: `${fontSize}px`, tabSize: 2 }}
            placeholder="Start typing your code here..."
            spellCheck={false}
          />
        ) : (
          <div
            className={`w-full h-full p-4 font-mono cursor-text overflow-auto leading-6 ${
              theme === 'dark' ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'
            } transition-colors`}
            onClick={handleCodeClick}
            style={{ fontSize: `${fontSize}px` }}
          >
            {code ? (
              <div className="space-y-0">
                {renderCodeWithHighlighting(code)}
              </div>
            ) : (
              <div className={`${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              } italic flex items-center justify-center h-full`}>
                <div className="text-center">
                  <div className="text-4xl mb-2">📝</div>
                  <div>Click here to start coding...</div>
                  <div className="text-xs mt-2 space-y-1">
                    <div>• Tab for indentation</div>
                    <div>• Ctrl+S to save</div>
                    <div>• Esc to exit editing</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className={`px-4 py-2 text-xs border-t flex items-center justify-between ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700 text-gray-400' 
          : 'bg-gray-50 border-gray-200 text-gray-500'
      }`}>
        <div className="flex items-center space-x-4">
          <span>Lines: {stats.lines}</span>
          <span>Words: {stats.words}</span>
          <span>Characters: {stats.chars}</span>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing && (
            <span className="text-green-600">● Editing</span>
          )}
          <span>JavaScript</span>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;