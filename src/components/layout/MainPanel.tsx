import { useState, useRef, useEffect } from "react";
import EditorPanel from "./EditorPanel";
import VisualPanel from "./VisualPanel";

const SNAP_THRESHOLD = 50;

// Type definitions
interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ContainerBounds {
  width: number;
  height: number;
}

interface SnapZone {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DraggablePanelProps {
  children: React.ReactNode;
  position: Position;
  onPositionChange: (position: Position) => void;
  onSnapPreview: (snapZone: SnapZone | null) => void;
  containerBounds: ContainerBounds;
  className?: string;
}

// Simple Drawing Panel - you can replace this with your own component
const DrawingPanel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>('#000000');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = currentColor;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-green-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-between">
        <span>🎨 Drawing Board</span>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="w-6 h-6 rounded border-none cursor-pointer"
          />
          <button
            onClick={clearCanvas}
            className="px-2 py-1 bg-green-500 hover:bg-green-400 rounded text-xs"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 flex items-center justify-center bg-gray-50">
        <canvas
          ref={canvasRef}
          width="200"
          height="150"
          className="border border-gray-300 rounded-lg bg-white cursor-crosshair shadow-sm"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
};

const DraggablePanel: React.FC<DraggablePanelProps> = ({
  children,
  position,
  onPositionChange,
  onSnapPreview,
  containerBounds,
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number }>({ 
    x: 0, 
    y: 0, 
    width: 0, 
    height: 0 
  });
  const panelRef = useRef<HTMLDivElement>(null);

  const getSnapZone = (x: number, y: number, width: number, height: number): SnapZone | null => {
    if (!containerBounds) return null;
    
    const W = containerBounds.width;
    const H = containerBounds.height;

    // Check Corners First
    if (x < SNAP_THRESHOLD && y < SNAP_THRESHOLD) {
      return { x: 0, y: 0, w: W / 2, h: H / 2 };
    }
    if (x + width > W - SNAP_THRESHOLD && y < SNAP_THRESHOLD) {
      return { x: W / 2, y: 0, w: W / 2, h: H / 2 };
    }
    if (x < SNAP_THRESHOLD && y + height > H - SNAP_THRESHOLD) {
      return { x: 0, y: H / 2, w: W / 2, h: H / 2 };
    }
    if (x + width > W - SNAP_THRESHOLD && y + height > H - SNAP_THRESHOLD) {
      return { x: W / 2, y: H / 2, w: W / 2, h: H / 2 };
    }

    // Check Edges
    if (x < SNAP_THRESHOLD) {
      return { x: 0, y: 0, w: W / 2, h: H };
    }
    if (x + width > W - SNAP_THRESHOLD) {
      return { x: W / 2, y: 0, w: W / 2, h: H };
    }
    if (y < SNAP_THRESHOLD) {
      return { x: 0, y: 0, w: W, h: H / 2 };
    }
    if (y + height > H - SNAP_THRESHOLD) {
      return { x: 0, y: H / 2, w: W, h: H / 2 };
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: position.width,
      height: position.height
    });
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(e.clientX - dragStart.x, containerBounds.width - position.width));
        const newY = Math.max(0, Math.min(e.clientY - dragStart.y, containerBounds.height - position.height));
        
        const snapZone = getSnapZone(newX, newY, position.width, position.height);
        onSnapPreview(snapZone);
        
        onPositionChange({
          ...position,
          x: newX,
          y: newY
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        const newWidth = Math.max(200, Math.min(resizeStart.width + deltaX, containerBounds.width - position.x));
        const newHeight = Math.max(150, Math.min(resizeStart.height + deltaY, containerBounds.height - position.y));
        
        onPositionChange({
          ...position,
          width: newWidth,
          height: newHeight
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        const snapZone = getSnapZone(position.x, position.y, position.width, position.height);
        if (snapZone) {
          onPositionChange({
            x: snapZone.x,
            y: snapZone.y,
            width: snapZone.w,
            height: snapZone.h
          });
        }
        onSnapPreview(null);
      }
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, position, containerBounds, onPositionChange, onSnapPreview, resizeStart]);

  return (
    <div
      ref={panelRef}
      className={`absolute border shadow-md cursor-move select-none ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: position.width,
        height: position.height,
        zIndex: isDragging ? 1000 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-gray-400 cursor-se-resize hover:bg-gray-600 opacity-50 hover:opacity-100"
        onMouseDown={handleResizeMouseDown}
        style={{
          clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
        }}
      />
    </div>
  );
};

const MainPanel: React.FC = () => {
  const [containerBounds, setContainerBounds] = useState<ContainerBounds>({ width: 800, height: 600 });
  const [snapPreview, setSnapPreview] = useState<SnapZone | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [editorPos, setEditorPos] = useState<Position>({
    x: 0,
    y: 0,
    width: 320,
    height: 600,
  });

  const [visualPos, setVisualPos] = useState<Position>({
    x: 320,
    y: 0,
    width: 240,
    height: 360,
  });

  const [drawingPos, setDrawingPos] = useState<Position>({
    x: 560,
    y: 0,
    width: 240,   
    height: 360,
  });

  useEffect(() => {
    const updateBounds = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerBounds({ width: rect.width, height: rect.height });
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  useEffect(() => {
    setEditorPos(prev => ({
      ...prev,
      width: Math.min(prev.width, containerBounds.width),
      height: Math.min(prev.height, containerBounds.height)
    }));
    setVisualPos(prev => ({
      ...prev,
      width: Math.min(prev.width, containerBounds.width),
      height: Math.min(prev.height, containerBounds.height)
    }));
    setDrawingPos(prev => ({
      ...prev,
      width: Math.min(prev.width, containerBounds.width),
      height: Math.min(prev.height, containerBounds.height)
    }));
  }, [containerBounds]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 relative bg-gray-200 overflow-hidden"
    >
      {snapPreview && (
        <div
          className="absolute border-2 border-blue-400 bg-blue-200/30 rounded pointer-events-none transition-all duration-100 z-50"
          style={{
            left: snapPreview.x,
            top: snapPreview.y,
            width: snapPreview.w,
            height: snapPreview.h,
          }}
        />
      )}

      {/* Your EditorPanel Component */}
      <DraggablePanel
        position={editorPos}
        onPositionChange={setEditorPos}
        onSnapPreview={setSnapPreview}
        containerBounds={containerBounds}
        className="bg-white"
      >
        <EditorPanel />
      </DraggablePanel>

      {/* Your VisualPanel Component */}
      <DraggablePanel
        position={visualPos}
        onPositionChange={setVisualPos}
        onSnapPreview={setSnapPreview}
        containerBounds={containerBounds}
        className="bg-gray-50"
      >
        <VisualPanel />
      </DraggablePanel>

      {/* Optional Drawing Panel - replace with your own if needed */}
      <DraggablePanel
        position={drawingPos}
        onPositionChange={setDrawingPos}
        onSnapPreview={setSnapPreview}
        containerBounds={containerBounds}
        className="bg-green-50"
      >
        <DrawingPanel />
      </DraggablePanel>

      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg text-sm max-w-xs z-10">
        <div className="font-semibold mb-2">Snap Zones:</div>
        <div className="text-xs space-y-1">
          <div>• Drag panels near edges to snap (50% size)</div>
          <div>• Drag to corners for quarter-screen snap</div>
          <div>• Blue preview shows snap target</div>
          <div>• Resize from bottom-right corner</div>
        </div>
      </div>
    </div>
  );
};

export default MainPanel;