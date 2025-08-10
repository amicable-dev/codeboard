import { useState, useRef, useEffect } from "react";
import EditorPanel from "./EditorPanel";
import VisualPanel from "./VisualPanel";

/* ----------------- COLOR PALETTE ----------------- */
const COLORS = {
  gold: "#FFD700",
  deepGold: "#DAA520",
  cream: "#FFF8E7",
  maroon: "#800000",
};

/* ----------------- SNAP SETTINGS ----------------- */
const SNAP_THRESHOLD = 50;

/* ----------------- TYPE DEFINITIONS ----------------- */
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

/* ----------------- DRAWING PANEL ----------------- */
const DrawingPanel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.strokeStyle = currentColor;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  return (
    <div className="w-full h-full flex flex-col bg-cream border-t border-gold">
      <div
        className="px-4 py-2 text-sm font-semibold flex items-center justify-between"
        style={{ backgroundColor: COLORS.maroon, color: COLORS.gold }}
      >
        <span>🎨 Drawing Board</span>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border-none"
          />
          <button
            onClick={() => {
              const ctx = canvasRef.current?.getContext("2d");
              if (ctx && canvasRef.current)
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }}
            className="px-2 py-1 rounded text-xs"
            style={{
              backgroundColor: COLORS.gold,
              color: COLORS.maroon,
              fontWeight: "bold",
            }}
          >
            Clear
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 flex items-center justify-center bg-cream">
        <canvas
          ref={canvasRef}
          width="200"
          height="150"
          className="border border-gold rounded-lg bg-white cursor-crosshair shadow-md"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
        />
      </div>
    </div>
  );
};

/* ----------------- DRAGGABLE PANEL ----------------- */
const DraggablePanel: React.FC<DraggablePanelProps> = ({
  children,
  position,
  onPositionChange,
  onSnapPreview,
  containerBounds,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const getSnapZone = (x: number, y: number, width: number, height: number): SnapZone | null => {
    const W = containerBounds.width;
    const H = containerBounds.height;
    if (x < SNAP_THRESHOLD && y < SNAP_THRESHOLD) return { x: 0, y: 0, w: W / 2, h: H / 2 };
    if (x + width > W - SNAP_THRESHOLD && y < SNAP_THRESHOLD) return { x: W / 2, y: 0, w: W / 2, h: H / 2 };
    if (x < SNAP_THRESHOLD && y + height > H - SNAP_THRESHOLD) return { x: 0, y: H / 2, w: W / 2, h: H / 2 };
    if (x + width > W - SNAP_THRESHOLD && y + height > H - SNAP_THRESHOLD) return { x: W / 2, y: H / 2, w: W / 2, h: H / 2 };
    if (x < SNAP_THRESHOLD) return { x: 0, y: 0, w: W / 2, h: H };
    if (x + width > W - SNAP_THRESHOLD) return { x: W / 2, y: 0, w: W / 2, h: H };
    if (y < SNAP_THRESHOLD) return { x: 0, y: 0, w: W, h: H / 2 };
    if (y + height > H - SNAP_THRESHOLD) return { x: 0, y: H / 2, w: W, h: H / 2 };
    return null;
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(e.clientX - dragStart.x, containerBounds.width - position.width));
        const newY = Math.max(0, Math.min(e.clientY - dragStart.y, containerBounds.height - position.height));
        const snapZone = getSnapZone(newX, newY, position.width, position.height);
        onSnapPreview(snapZone);
        onPositionChange({ ...position, x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        onPositionChange({
          ...position,
          width: Math.max(200, resizeStart.width + deltaX),
          height: Math.max(150, resizeStart.height + deltaY),
        });
      }
    };
    const stop = () => {
      setIsDragging(false);
      setIsResizing(false);
      onSnapPreview(null);
    };
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", stop);
    }
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", stop);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, position]);

  return (
    <div
      className={`absolute border rounded-lg overflow-hidden shadow-lg cursor-move ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: position.width,
        height: position.height,
        borderColor: COLORS.gold,
        boxShadow: `0 4px 20px rgba(218,165,32,0.4)`,
        backgroundColor: COLORS.cream,
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).classList.contains("resize-handle")) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }}
    >
      {children}
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-70"
        style={{
          backgroundColor: COLORS.deepGold,
          clipPath: "polygon(100% 0%, 0% 100%, 100% 100%)",
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsResizing(true);
          setResizeStart({ x: e.clientX, y: e.clientY, width: position.width, height: position.height });
        }}
      />
    </div>
  );
};

/* ----------------- MAIN PANEL ----------------- */
const MainPanelGolden: React.FC = () => {
  const [containerBounds, setContainerBounds] = useState({ width: 800, height: 600 });
  const [snapPreview, setSnapPreview] = useState<SnapZone | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [editorPos, setEditorPos] = useState<Position>({ x: 0, y: 0, width: 320, height: 600 });
  const [visualPos, setVisualPos] = useState<Position>({ x: 320, y: 0, width: 240, height: 360 });
  const [drawingPos, setDrawingPos] = useState<Position>({ x: 560, y: 0, width: 240, height: 360 });

  useEffect(() => {
    const updateBounds = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerBounds({ width: rect.width, height: rect.height });
      }
    };
    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden"
      style={{
        backgroundColor: COLORS.cream,
        backgroundImage:
          "radial-gradient(circle at 20px 20px, rgba(255,215,0,0.15) 2px, transparent 0)",
        backgroundSize: "40px 40px",
      }}
    >
      {snapPreview && (
        <div
          className="absolute rounded pointer-events-none transition-all duration-100 z-50"
          style={{
            left: snapPreview.x,
            top: snapPreview.y,
            width: snapPreview.w,
            height: snapPreview.h,
            border: `2px solid ${COLORS.gold}`,
            backgroundColor: "rgba(255,215,0,0.15)",
            boxShadow: `0 0 20px rgba(255,215,0,0.6)`,
          }}
        />
      )}

      <DraggablePanel
        position={editorPos}
        onPositionChange={setEditorPos}
        onSnapPreview={setSnapPreview}
        containerBounds={containerBounds}
      >
        <EditorPanel />
      </DraggablePanel>

      <DraggablePanel
        position={visualPos}
        onPositionChange={setVisualPos}
        onSnapPreview={setSnapPreview}
        containerBounds={containerBounds}
      >
        <VisualPanel />
      </DraggablePanel>

      <DraggablePanel
        position={drawingPos}
        onPositionChange={setDrawingPos}
        onSnapPreview={setSnapPreview}
        containerBounds={containerBounds}
      >
        <DrawingPanel />
      </DraggablePanel>
    </div>
  );
};

export default MainPanelGolden;
