import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Brush, 
  Pen, 
  Square, 
  Circle, 
  Type, 
  Move, 
  Eraser, 
  Undo, 
  Redo, 
  Download, 
  Upload,
  Palette,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Settings,
  Grid,
  Save
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  id: string;
  tool: string;
  points: Point[];
  color: string;
  strokeWidth: number;
  fill?: string;
  opacity?: number;
}

interface TextElement {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  paths: DrawingPath[];
  textElements: TextElement[];
}

type Tool = 'brush' | 'pen' | 'rectangle' | 'circle' | 'text' | 'move' | 'eraser';

const DrawingBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('brush');
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [layers, setLayers] = useState<Layer[]>([
    { id: '1', name: 'Background', visible: true, opacity: 1, paths: [], textElements: [] }
  ]);
  const [activeLayerId, setActiveLayerId] = useState('1');
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [history, setHistory] = useState<Layer[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<Point | null>(null);
  const [fontSize, setFontSize] = useState(16);

  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(layers)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [layers, history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLayers(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLayers(history[historyIndex + 1]);
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom
    };
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    const gridSize = 20;
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    
    for (let x = 0; x <= 800; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    
    for (let y = 0; y <= 600; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  };

  const drawPath = (ctx: CanvasRenderingContext2D, path: DrawingPath) => {
    if (path.points.length === 0) return;

    ctx.globalAlpha = path.opacity || 1;
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (path.tool) {
      case 'brush':
        // Brush: smooth, pressure-sensitive strokes
        ctx.shadowBlur = 2;
        ctx.shadowColor = path.color;
        ctx.beginPath();
        if (path.points.length > 2) {
          // Smooth curve drawing
          ctx.moveTo(path.points[0].x, path.points[0].y);
          for (let i = 1; i < path.points.length - 1; i++) {
            const currentPoint = path.points[i];
            const nextPoint = path.points[i + 1];
            const controlX = (currentPoint.x + nextPoint.x) / 2;
            const controlY = (currentPoint.y + nextPoint.y) / 2;
            ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
          }
        } else {
          ctx.moveTo(path.points[0].x, path.points[0].y);
          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        break;
      case 'pen':
        // Pen: crisp, precise lines detailed ones 
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
        break;
      case 'rectangle':
        if (path.points.length >= 2) {
          const start = path.points[0];
          const end = path.points[path.points.length - 1];
          const width = end.x - start.x;
          const height = end.y - start.y;
          
          if (path.fill && path.fill !== 'transparent') {
            ctx.fillStyle = path.fill;
            ctx.fillRect(start.x, start.y, width, height);
          }
          ctx.strokeRect(start.x, start.y, width, height);
        }
        break;
      case 'circle':
        if (path.points.length >= 2) {
          const start = path.points[0];
          const end = path.points[path.points.length - 1];
          const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          
          ctx.beginPath();
          ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          if (path.fill && path.fill !== 'transparent') {
            ctx.fillStyle = path.fill;
            ctx.fill();
          }
          ctx.stroke();
        }
        break;
    }
    ctx.globalAlpha = 1;
  };

  const drawTextElements = (ctx: CanvasRenderingContext2D, textElements: TextElement[]) => {
    textElements.forEach(textEl => {
      ctx.fillStyle = textEl.color;
      ctx.font = `${textEl.fontSize}px ${textEl.fontFamily}`;
      ctx.fillText(textEl.text, textEl.x, textEl.y);
    });
  };

  const eraseAt = (point: Point, radius: number = strokeWidth * 2) => {
    setLayers(prevLayers => 
      prevLayers.map(layer => 
        layer.id === activeLayerId 
          ? {
              ...layer,
              paths: layer.paths.filter(path => {
                return !path.points.some(p => 
                  Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)) <= radius
                );
              })
            }
          : layer
      )
    );
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear and set black background to ensure visual hirearchy
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(panOffset.x / zoom, panOffset.y / zoom);

    drawGrid(ctx);

    layers.forEach(layer => {
      if (layer.visible) {
        ctx.globalAlpha = layer.opacity;
        layer.paths.forEach(path => drawPath(ctx, path));
        drawTextElements(ctx, layer.textElements);
      }
    });

    ctx.restore();
  };

  const drawPreview = (point: Point) => {
    const overlayCanvas = overlayCanvasRef.current;
    const ctx = overlayCanvas?.getContext('2d');
    if (!overlayCanvas || !ctx || !startPoint) return;

    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(panOffset.x / zoom, panOffset.y / zoom);
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.globalAlpha = brushOpacity;

    switch (currentTool) {
      case 'rectangle':
        const width = point.x - startPoint.x;
        const height = point.y - startPoint.y;
        if (fillColor !== 'transparent') {
          ctx.fillStyle = fillColor;
          ctx.fillRect(startPoint.x, startPoint.y, width, height);
        }
        ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(point.x - startPoint.x, 2) + Math.pow(point.y - startPoint.y, 2));
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        if (fillColor !== 'transparent') {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        ctx.stroke();
        break;
      case 'eraser':
        // Show eraser preview
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(point.x, point.y, strokeWidth * 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
    }

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(point);

    if (currentTool === 'eraser') {
      eraseAt(point);
      return;
    }

    if (currentTool === 'text') {
      setTextPosition(point);
      setTimeout(() => textInputRef.current?.focus(), 100);
      return;
    }

    const newPath: DrawingPath = {
      id: Date.now().toString(),
      tool: currentTool,
      points: [point],
      color: strokeColor,
      strokeWidth: strokeWidth,
      fill: fillColor,
      opacity: brushOpacity
    };

    setCurrentPath(newPath);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);

    if (currentTool === 'eraser') {
      drawPreview(point);
      if (isDrawing) {
        eraseAt(point);
      }
      return;
    }

    if (!isDrawing || !currentPath) return;

    if (currentTool === 'brush' || currentTool === 'pen') {
      setCurrentPath(prev => prev ? {
        ...prev,
        points: [...prev.points, point]
      } : null);
    } else if (currentTool === 'rectangle' || currentTool === 'circle') {
      drawPreview(point);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'eraser') {
      setIsDrawing(false);
      saveToHistory();
      return;
    }

    if (!isDrawing || !currentPath) return;

    const point = getMousePos(e);
    let finalPath = currentPath;

    if (currentTool === 'rectangle' || currentTool === 'circle') {
      finalPath = {
        ...currentPath,
        points: [startPoint!, point]
      };
      
      // Clear preview
      const overlayCanvas = overlayCanvasRef.current;
      const ctx = overlayCanvas?.getContext('2d');
      if (ctx && overlayCanvas) ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    setLayers(prevLayers => 
      prevLayers.map(layer => 
        layer.id === activeLayerId 
          ? { ...layer, paths: [...layer.paths, finalPath] }
          : layer
      )
    );

    saveToHistory();
    setIsDrawing(false);
    setCurrentPath(null);
    setStartPoint(null);
  };

  const handleTextSubmit = () => {
    if (textInput.trim() && textPosition) {
      const newTextElement: TextElement = {
        id: Date.now().toString(),
        x: textPosition.x,
        y: textPosition.y,
        text: textInput,
        color: strokeColor,
        fontSize: fontSize,
        fontFamily: 'Arial'
      };

      setLayers(prevLayers => 
        prevLayers.map(layer => 
          layer.id === activeLayerId 
            ? { ...layer, textElements: [...layer.textElements, newTextElement] }
            : layer
        )
      );

      setTextInput('');
      setTextPosition(null);
      saveToHistory();
    }
  };

  const addLayer = () => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      paths: [],
      textElements: []
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const deleteLayer = (layerId: string) => {
    if (layers.length > 1) {
      setLayers(prevLayers => prevLayers.filter(layer => layer.id !== layerId));
      if (activeLayerId === layerId) {
        setActiveLayerId(layers[0].id);
      }
    }
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId
          ? { ...layer, visible: !layer.visible }
          : layer
      )
    );
  };

  const clearCanvas = () => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === activeLayerId
          ? { ...layer, paths: [], textElements: [] }
          : layer
      )
    );
    saveToHistory();
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'artwork.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    redrawCanvas();
  }, [layers, zoom, panOffset, showGrid]);

  useEffect(() => {
    if (currentPath && (currentTool === 'brush' || currentTool === 'pen')) {
      redrawCanvas();
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && currentPath.points.length > 0) {
        ctx.save();
        ctx.scale(zoom, zoom);
        ctx.translate(panOffset.x / zoom, panOffset.y / zoom);
        drawPath(ctx, currentPath);
        ctx.restore();
      }
    }
  }, [currentPath]);

  const tools = [
    { id: 'brush', icon: Brush, label: 'Brush', description: 'Soft painting tool' },
    { id: 'pen', icon: Pen, label: 'Pen', description: 'Precise drawing tool' },
    { id: 'rectangle', icon: Square, label: 'Rectangle', description: 'Draw rectangles' },
    { id: 'circle', icon: Circle, label: 'Circle', description: 'Draw circles' },
    { id: 'text', icon: Type, label: 'Text', description: 'Add text elements' },
    { id: 'move', icon: Move, label: 'Move', description: 'Move objects' },
    { id: 'eraser', icon: Eraser, label: 'Eraser', description: 'Remove strokes' },
  ];

  const grayscaleColors = [
    '#ffffff', '#e5e5e5', '#cccccc', '#b3b3b3', '#999999', 
    '#808080', '#666666', '#4d4d4d', '#333333', '#000000'
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white mb-1">Drawing Studio</h1>
          <p className="text-gray-400 text-sm">Professional drawing tools</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Tools</h3>
            <div className="space-y-2">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id as Tool)}
                  className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 group ${
                    currentTool === tool.id 
                      ? 'bg-white text-gray-900 border-white shadow-lg' 
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <tool.icon size={20} />
                  <div className="text-left">
                    <div className="font-medium">{tool.label}</div>
                    <div className="text-xs opacity-70">{tool.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Colors</h3>
            <div className="grid grid-cols-5 gap-3 mb-4">
              {grayscaleColors.map(color => (
                <button
                  key={color}
                  onClick={() => setStrokeColor(color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                    strokeColor === color ? 'border-white scale-110' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-600 bg-gray-700"
            />
          </div>

          {/* Fill Color */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Fill</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setFillColor('transparent')}
                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
                  fillColor === 'transparent' 
                    ? 'bg-white text-gray-900 border-white' 
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
              >
                None
              </button>
              <input
                type="color"
                value={fillColor === 'transparent' ? '#ffffff' : fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="flex-1 h-10 rounded-lg border border-gray-600 bg-gray-700"
              />
            </div>
          </div>

          {/* Brush Settings */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Brush Size</h3>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="flex-1 bg-gray-600"
                />
                <span className="text-sm text-gray-400 w-12">{strokeWidth}px</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Opacity</h3>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={brushOpacity}
                  onChange={(e) => setBrushOpacity(Number(e.target.value))}
                  className="flex-1 bg-gray-600"
                />
                <span className="text-sm text-gray-400 w-12">{Math.round(brushOpacity * 100)}%</span>
              </div>
            </div>

            {currentTool === 'text' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Font Size</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="8"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 bg-gray-600"
                  />
                  <span className="text-sm text-gray-400 w-12">{fontSize}px</span>
                </div>
              </div>
            )}
          </div>

          {/* Layers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Layers</h3>
              <button
                onClick={addLayer}
                className="p-1 rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-600"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {layers.map(layer => (
                <div
                  key={layer.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    activeLayerId === layer.id 
                      ? 'bg-gray-700 border-gray-500' 
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                  }`}
                  onClick={() => setActiveLayerId(layer.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLayerVisibility(layer.id);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <span className="text-sm flex-1 text-white">{layer.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLayer(layer.id);
                    }}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-700 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="flex-1 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 flex items-center justify-center gap-2"
            >
              <Undo size={16} />
              <span className="text-sm">Undo</span>
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="flex-1 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 flex items-center justify-center gap-2"
            >
              <Redo size={16} />
              <span className="text-sm">Redo</span>
            </button>
          </div>
          
          <button
            onClick={clearCanvas}
            className="w-full p-3 bg-red-900 text-red-100 rounded-lg hover:bg-red-800 border border-red-700 flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Clear Layer
          </button>
          
          <button
            onClick={exportCanvas}
            className="w-full p-3 bg-green-900 text-green-100 rounded-lg hover:bg-green-800 border border-green-700 flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Export Artwork
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-2">
              <button
                onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                className="p-1 hover:bg-gray-600 rounded text-gray-300"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-sm min-w-[60px] text-center text-white font-mono">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                className="p-1 hover:bg-gray-600 rounded text-gray-300"
              >
                <ZoomIn size={18} />
              </button>
            </div>
            
            <button
              onClick={() => {
                setZoom(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-sm border border-gray-600"
            >
              Reset View
            </button>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-4 py-2 rounded-lg text-sm border transition-all duration-200 ${
                showGrid 
                  ? 'bg-white text-gray-900 border-white' 
                  : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              }`}
            >
              <Grid size={16} className="inline mr-2" />
              Grid
            </button>
          </div>

          <div className="text-sm text-gray-400">
            Canvas: 800 × 600px
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 overflow-hidden relative bg-gray-900">
          <div className="absolute inset-0 overflow-auto">
            <div className="relative" style={{ 
              width: `${800 * zoom}px`, 
              height: `${600 * zoom}px`,
              minWidth: '100%',
              minHeight: '100%'
            }}>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="absolute top-0 left-0 border border-gray-600 shadow-2xl cursor-crosshair"
                style={{ 
                  width: `${800 * zoom}px`, 
                  height: `${600 * zoom}px`,
                  backgroundColor: '#1a1a1a'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  setIsDrawing(false);
                  setCurrentPath(null);
                }}
              />
              <canvas
                ref={overlayCanvasRef}
                width={800}
                height={600}
                className="absolute top-0 left-0 pointer-events-none"
                style={{ 
                  width: `${800 * zoom}px`, 
                  height: `${600 * zoom}px` 
                }}
              />
            </div>
          </div>

          {/* Text Input Overlay */}
          {textPosition && (
            <div 
              className="absolute bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl"
              style={{ 
                left: textPosition.x * zoom + panOffset.x,
                top: textPosition.y * zoom + panOffset.y - 60
              }}
            >
              <input
                ref={textInputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSubmit();
                  } else if (e.key === 'Escape') {
                    setTextInput('');
                    setTextPosition(null);
                  }
                }}
                placeholder="Enter text..."
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm w-48 focus:outline-none focus:border-white"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleTextSubmit}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setTextInput('');
                    setTextPosition(null);
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Status Bar */}
          <div className="absolute bottom-4 left-4 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-300">
            <div className="flex items-center gap-4">
              <span>Tool: <span className="text-white font-medium">{currentTool}</span></span>
              <span>Size: <span className="text-white font-medium">{strokeWidth}px</span></span>
              <span>Opacity: <span className="text-white font-medium">{Math.round(brushOpacity * 100)}%</span></span>
              <span>Layer: <span className="text-white font-medium">{layers.find(l => l.id === activeLayerId)?.name}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingBoard;