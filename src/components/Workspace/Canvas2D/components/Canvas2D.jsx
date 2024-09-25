import { useEffect, useRef, useState, useCallback } from 'react';
import { IoSquareOutline } from 'react-icons/io5';

import useCanvasSetup from '../hooks/useCanvasSetup';
import useMouseHandlers from '../../../../hooks/useMouseHandlers';

import drawGrid from '../utils/drawGrid';
import handleKeyDown from '../../../../utils/handleKeyDown';
import getCursorStyle from '../../../../utils/getCursorStyle';

import useStore from '../../../../store/store';

import ToolBox from '../../ToolBox';
import renderEraserArea from '../utils/renderEraserArea';
import renderSnapPoint from '../utils/renderSnapPoint';
import renderCurrentTool from '../utils/renderCurrentTool';

function Canvas2D() {
  const canvasRef = useRef(null);
  const screenRef = useRef(null);

  const drawingToolList = useStore((state) => state.drawingToolList);
  const canvasSize = useStore((state) => state.canvasSize);
  const addPathToLayer = useStore((state) => state.addPathToLayer);
  const selectedLayer = useStore((state) => state.selectedLayer);
  const loadLayers = useStore((state) => state.loadLayers);
  const user = useStore((state) => state.user);
  const layerList = useStore((state) => state.layerList);
  const initializeLayerListener = useStore(
    (state) => state.initializeLayerListener,
  );
  const setLayerList = useStore((state) => state.setLayerList);

  const {
    scale,
    offset,
    setOffset,
    dragging,
    startPoint,
    setDragging,
    setStartPoint,
    updateInitialOffset,
  } = useCanvasSetup(canvasSize, screenRef, canvasRef);

  const [wasLayerListEmpty, setWasLayerListEmpty] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);
  const [setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);

  const imageCache = useRef(new Map());

  useEffect(() => {
    let unsubscribe;
    if (user) {
      unsubscribe = initializeLayerListener(user.uid);
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, initializeLayerListener]);

  const fillPath = useCallback((path, color) => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');

      context.save();
      context.fillStyle = color;
      context.beginPath();

      switch (path?.type) {
        case 'rectangle':
          context.rect(path.x, path.y, path.width, path.height);
          break;
        case 'triangle':
          context.moveTo(path.points[0].x, path.points[0].y);
          context.lineTo(path.points[1].x, path.points[1].y);
          context.lineTo(path.points[2].x, path.points[2].y);
          context.closePath();
          break;
        case 'bezier':
          context.moveTo(path.x1, path.y1);
          context.quadraticCurveTo(path.cx, path.cy, path.x2, path.y2);
          break;
        case 'circle':
          context.arc(
            path.center.x,
            path.center.y,
            path.radius,
            0,
            2 * Math.PI,
          );
          break;
        default:
          break;
      }

      context.fill();
      context.restore();
    }
  }, []);

  const renderLayersRef = useRef(null);

  useEffect(() => {
    imageCache.current = new Map();

    return () => {
      if (imageCache.current) {
        imageCache.current.forEach((img) => {
          if (img && typeof img.onload === 'function') {
            img.onload = null;
          }
        });
        imageCache.current.clear();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      const currentImageNames = new Set(
        layerList
          .filter((layer) => layer.type === 'image')
          .map((layer) => layer.name),
      );

      if (
        imageCache.current &&
        typeof imageCache.current.entries === 'function'
      ) {
        Array.from(imageCache.current.entries()).forEach(([name, img]) => {
          if (!currentImageNames.has(name)) {
            if (img && typeof img.onload === 'function') {
              img.onload = null;
            }
            imageCache.current.delete(name);
          }
        });
      }
    };
  }, [layerList]);

  const renderLayers = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    layerList.forEach((layer) => {
      if (layer && layer.visible) {
        if (layer.type === 'draw' && Array.isArray(layer.path)) {
          layer.path.forEach((path) => {
            ctx.beginPath();

            switch (path.type) {
              case 'closedBezier':
                path.curves.forEach((curve, index) => {
                  if (index === 0) {
                    ctx.moveTo(curve.x1, curve.y1);
                  }
                  if (curve.type === 'bezier') {
                    ctx.quadraticCurveTo(
                      curve.cx,
                      curve.cy,
                      curve.x2,
                      curve.y2,
                    );
                  } else if (curve.type === 'line') {
                    ctx.lineTo(curve.x2, curve.y2);
                  }
                });
                ctx.closePath();
                break;
              case 'bezier':
                ctx.moveTo(path.x1, path.y1);
                ctx.quadraticCurveTo(path.cx, path.cy, path.x2, path.y2);
                break;
              case 'rectangle':
                ctx.rect(path.x, path.y, path.width, path.height);
                break;
              case 'triangle':
                ctx.moveTo(path.points[0].x, path.points[0].y);
                ctx.lineTo(path.points[1].x, path.points[1].y);
                ctx.lineTo(path.points[2].x, path.points[2].y);
                ctx.closePath();
                break;
              case 'line':
                ctx.moveTo(path.x1, path.y1);
                ctx.lineTo(path.x2, path.y2);
                break;
              case 'circle':
                ctx.arc(
                  path.center.x,
                  path.center.y,
                  path.radius,
                  0,
                  2 * Math.PI,
                );
                break;
              case 'polyline':
                ctx.moveTo(path.points[0].x, path.points[0].y);
                for (let i = 1; i < path.points.length; i += 1) {
                  ctx.lineTo(path.points[i].x, path.points[i].y);
                }
                if (path.closed) {
                  ctx.closePath();
                }
                break;
              default:
                break;
            }

            if (path.fill && path.fill !== 'none') {
              ctx.fillStyle = path.fill;
              ctx.fill();
            }

            ctx.strokeStyle = '#0068ff';
            ctx.lineWidth = 1;
            ctx.stroke();
          });
        } else if (layer.type === 'image' && layer.imageUrl) {
          if (!imageCache.current.has(layer.imageUrl)) {
            const img = new Image();

            img.onload = () => {
              imageCache.current.set(layer.imageUrl, img);
              ctx.save();
              ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;
              ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
              ctx.restore();
            };

            img.src = layer.imageUrl;
          } else {
            const cachedImg = imageCache.current.get(layer.imageUrl);

            ctx.save();
            ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;
            ctx.drawImage(
              cachedImg,
              layer.x,
              layer.y,
              layer.width,
              layer.height,
            );
            ctx.restore();
          }
        }
      }
    });
  }, [layerList, canvasRef]);

  const updateLayerInFirestore = useStore(
    (state) => state.updateLayerInFirestore,
  );

  const refreshLayerState = useStore((state) => state.refreshLayerState);

  renderLayersRef.current = renderLayers;

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasClick,
    lineStart,
    lineEnd,
    bezierStart,
    bezierEnd,
    bezierControl,
    rectStart,
    trianglePoints,
    currentMousePos,
    circleCenter,
    snapPoint,
    cancelDrawing,
    finalizeErase,
    isErasing,
    setIsErasing,
    eraserStart,
    setEraserStart,
    eraserEnd,
    setEraserEnd,
    currentPolyline,
    isDrawingPolyline,
    finalizePolyline,
  } = useMouseHandlers(
    selectedTool,
    { x: offset.x, y: offset.y, scale },
    setOffset,
    setDragging,
    setStartPoint,
    dragging,
    startPoint,
    canvasRef,
    addPathToLayer,
    selectedLayer,
    layerList,
    renderLayers,
    fillPath,
    updateLayerInFirestore,
    setLayerList,
    updateLayerInFirestore,
    refreshLayerState,
    selectedImage,
    setSelectedImage,
    isResizing,
    setIsResizing,
    resizeHandle,
    setResizeHandle,
  );

  const selectTool = (tool) => {
    setSelectedTool((prevTool) => {
      if (prevTool === tool) {
        return null;
      }
      if (tool === 'eraser') {
        setIsErasing(false);
        setEraserStart(null);
        setEraserEnd(null);
      }
      return tool;
    });
  };

  useEffect(() => {
    loadLayers();
  }, [loadLayers]);

  useEffect(() => {
    if (layerList.length > 0 && wasLayerListEmpty) {
      updateInitialOffset();
      setWasLayerListEmpty(false);
    } else if (layerList.length === 0) {
      updateInitialOffset();
      setWasLayerListEmpty(true);
    }
  }, [
    layerList,
    wasLayerListEmpty,
    canvasSize.width,
    canvasSize.height,
    updateInitialOffset,
  ]);

  useEffect(() => {
    if (selectedTool !== 'eraser') {
      finalizeErase();
    }
  }, [selectedTool, finalizeErase]);

  const handleLayerUpdate = useCallback(
    (updatedLayer) => {
      updateLayerInFirestore(updatedLayer);
    },
    [updateLayerInFirestore],
  );

  useEffect(() => {
    if (selectedLayer) {
      handleLayerUpdate(selectedLayer);
    }
  }, [selectedLayer, handleLayerUpdate]);

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drawGrid(ctx, canvasSize.width, canvasSize.height);
    renderLayers(ctx);
    renderCurrentTool(ctx, selectedTool, {
      isDrawingPolyline,
      currentPolyline,
      lineEnd,
      bezierStart,
      bezierEnd,
      bezierControl,
      rectStart,
      trianglePoints,
      circleCenter,
      currentMousePos,
      snapPoint,
    });
    renderSnapPoint(ctx, snapPoint, selectedTool, scale);
    if (isErasing && eraserStart && eraserEnd) {
      renderEraserArea(ctx, isErasing, eraserStart, eraserEnd, scale);
    }
  }, [
    canvasRef,
    canvasSize,
    renderLayers,
    selectedTool,
    isDrawingPolyline,
    currentPolyline,
    lineEnd,
    bezierStart,
    bezierEnd,
    bezierControl,
    rectStart,
    trianglePoints,
    circleCenter,
    currentMousePos,
    snapPoint,
    isErasing,
    eraserStart,
    eraserEnd,
    scale,
  ]);

  useEffect(() => {
    const handleKeyDownCallback = (event) => {
      handleKeyDown(event, selectTool);
      if (event.key === 'Escape') {
        if (lineStart || bezierStart || rectStart || isDrawingPolyline) {
          cancelDrawing();
          renderCanvas();
        }
      }
      if (event.key === 'Enter' && isDrawingPolyline) {
        finalizePolyline();
      }
    };

    window.addEventListener('keydown', handleKeyDownCallback);
    return () => {
      window.removeEventListener('keydown', handleKeyDownCallback);
    };
  }, [
    selectTool,
    lineStart,
    bezierStart,
    rectStart,
    cancelDrawing,
    isDrawingPolyline,
    finalizePolyline,
    renderCanvas,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas, layerList, finalizeErase]);

  useEffect(() => {
    renderCanvas();
  }, [finalizeErase]);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      renderLayers(ctx);
      renderCanvas();
    }
  }, [renderLayers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    renderCanvas();

    const handleResize = () => {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      renderCanvas();
    };

    window.addEventListener('resize', handleResize);
    // eslint-disable-next-line consistent-return
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasSize, renderCanvas]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(ctx, canvasSize.width, canvasSize.height);

      renderLayers(ctx);
      renderCurrentTool(ctx, selectedTool, {
        isDrawingPolyline,
        currentPolyline,
        lineEnd,
        bezierStart,
        bezierEnd,
        bezierControl,
        rectStart,
        trianglePoints,
        circleCenter,
        currentMousePos,
        snapPoint,
      });
      renderSnapPoint(ctx, snapPoint, selectedTool, scale);
      renderEraserArea(ctx, isErasing, eraserStart, eraserEnd, scale);
    }
  }, [
    canvasSize,
    renderLayers,
    renderCurrentTool,
    renderSnapPoint,
    renderEraserArea,
    isErasing,
    eraserStart,
    eraserEnd,
    layerList,
  ]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(ctx, canvasSize.width, canvasSize.height);

      renderLayers(ctx);
      renderCurrentTool(ctx, selectedTool, {
        isDrawingPolyline,
        currentPolyline,
        lineEnd,
        bezierStart,
        bezierEnd,
        bezierControl,
        rectStart,
        trianglePoints,
        circleCenter,
        currentMousePos,
        snapPoint,
      });
      renderSnapPoint(ctx, snapPoint, selectedTool, scale);
      renderEraserArea(ctx, isErasing, eraserStart, eraserEnd, scale);
    }
  }, [
    canvasSize,
    renderLayers,
    renderCurrentTool,
    renderSnapPoint,
    renderEraserArea,
    layerList,
  ]);

  const handleMouseMoveWrapper = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / scale;
    const mouseY = (event.clientY - rect.top) / scale;
    setMousePosition({ x: mouseX, y: mouseY });
    handleMouseMove(event);
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(ctx, canvasSize.width, canvasSize.height);

      renderLayers(ctx);
      renderCurrentTool(ctx, selectedTool, {
        isDrawingPolyline,
        currentPolyline,
        lineEnd,
        bezierStart,
        bezierEnd,
        bezierControl,
        rectStart,
        trianglePoints,
        circleCenter,
        currentMousePos,
        snapPoint,
      });
      renderSnapPoint(ctx, snapPoint, selectedTool, scale);
      renderEraserArea(ctx, isErasing, eraserStart, eraserEnd, scale);
    }
  }, [
    canvasSize,
    renderLayers,
    renderCurrentTool,
    renderSnapPoint,
    renderEraserArea,
    isErasing,
    eraserStart,
    eraserEnd,
    layerList,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [layerList, renderCanvas]);

  return (
    <div className="canvas-2d">
      <ToolBox
        type="2d"
        iconList={drawingToolList}
        selectTool={selectTool}
        selectedTool={selectedTool}
      />
      {layerList.length === 0 ? (
        <div className="default-logo">
          <IoSquareOutline />
        </div>
      ) : (
        <div
          ref={screenRef}
          className="canvas-container"
          style={{
            overflow: 'hidden',
            width: '100%',
            height: '100%',
            position: 'relative',
            cursor: getCursorStyle(selectedTool, dragging),
          }}
        >
          <canvas
            ref={canvasRef}
            className="drawing-canvas"
            width={canvasSize.width}
            height={canvasSize.height}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
              position: 'absolute',
              left: `${offset.x}px`,
              top: `${offset.y}px`,
            }}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMoveWrapper}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            aria-label="Drawing canvas area"
          />
        </div>
      )}
    </div>
  );
}

export default Canvas2D;
