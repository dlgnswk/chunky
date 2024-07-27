import { useEffect, useRef, useState, useCallback } from 'react';
import { IoSquareOutline } from 'react-icons/io5';

import useCanvasSetup from '../../hooks/useCanvasSetup';
import useMouseHandlers from '../../hooks/useMouseHandlers';

import drawGrid from '../../utils/drawGrid';
import handleKeyDown from '../../utils/handleKeyDown';
import getCursorStyle from '../../utils/getCursorStyle';

import useStore from '../../store/store';

import ToolBox from './ToolBox';

function Canvas2D() {
  const {
    drawingToolList,
    canvasSize,
    addPathToLayer,
    selectedLayer,
    loadLayers,
    user,
    layerList,
    initializeLayerListener,
    setLayerList,
  } = useStore();

  const canvasRef = useRef(null);
  const screenRef = useRef(null);

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
  const imageCache = useRef({});

  const drawImageLayer = (ctx, img, layer) => {
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.drawImage(img, layer.x || 0, layer.y || 0, layer.width, layer.height);
    ctx.restore();
  };

  useEffect(() => {
    return () => {
      Object.values(imageCache.current).forEach((img) => {
        img.onload = null;
      });
      imageCache.current = {};
    };
  }, []);

  const renderLayers = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    layerList.forEach((layer) => {
      if (layer && layer.visible) {
        if (layer.type === 'draw' && Array.isArray(layer.path)) {
          layer.path.forEach((path) => {
            ctx.beginPath();

            switch (path.type) {
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
        } else if (layer.type === 'image') {
          const imageData = localStorage.getItem(layer.name);

          if (imageData) {
            if (!imageCache.current[layer.name]) {
              const img = new Image();
              img.onload = () => {
                imageCache.current[layer.name] = img;
                drawImageLayer(ctx, img, layer);
              };
              img.src = imageData;
            } else {
              drawImageLayer(ctx, imageCache.current[layer.name], layer);
            }
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
    selectedLayer,
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

  const renderCurrentTool = useCallback(
    (ctx) => {
      if (
        selectedTool === 'line' &&
        isDrawingPolyline &&
        currentPolyline.length > 0
      ) {
        ctx.beginPath();
        ctx.moveTo(currentPolyline[0].x, currentPolyline[0].y);
        for (let i = 1; i < currentPolyline.length; i += 1) {
          ctx.lineTo(currentPolyline[i].x, currentPolyline[i].y);
        }
        ctx.strokeStyle = '#0068ff';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (lineEnd) {
          ctx.beginPath();
          ctx.moveTo(
            currentPolyline[currentPolyline.length - 1].x,
            currentPolyline[currentPolyline.length - 1].y,
          );
          ctx.lineTo(lineEnd.x, lineEnd.y);
          ctx.strokeStyle = 'tomato';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (currentPolyline.length > 2 && lineEnd) {
          const distToStart = Math.hypot(
            lineEnd.x - currentPolyline[0].x,
            lineEnd.y - currentPolyline[0].y,
          );
          if (distToStart < 10) {
            ctx.beginPath();
            ctx.moveTo(lineEnd.x, lineEnd.y);
            ctx.lineTo(currentPolyline[0].x, currentPolyline[0].y);
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = 'gray';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      } else if (selectedTool === 'bezier' && bezierStart && bezierEnd) {
        ctx.beginPath();
        ctx.moveTo(bezierStart.x, bezierStart.y);
        ctx.quadraticCurveTo(
          bezierControl ? bezierControl.x : currentMousePos.x,
          bezierControl ? bezierControl.y : currentMousePos.y,
          bezierEnd.x,
          bezierEnd.y,
        );
        ctx.strokeStyle = 'tomato';
        ctx.stroke();
      } else if (selectedTool === 'rectangle' && rectStart) {
        ctx.beginPath();
        ctx.rect(
          rectStart.x,
          rectStart.y,
          currentMousePos.x - rectStart.x,
          currentMousePos.y - rectStart.y,
        );
        ctx.strokeStyle = 'tomato';
        ctx.stroke();
      } else if (selectedTool === 'triangle' && trianglePoints.length > 0) {
        ctx.beginPath();
        ctx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
        for (let i = 1; i < trianglePoints.length; i += 1) {
          ctx.lineTo(trianglePoints[i].x, trianglePoints[i].y);
        }
        if (trianglePoints.length < 3) {
          ctx.lineTo(currentMousePos.x, currentMousePos.y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'tomato';
        ctx.stroke();
      } else if (selectedTool === 'circle' && circleCenter) {
        const radius = Math.sqrt(
          (currentMousePos.x - circleCenter.x) ** 2 +
            (currentMousePos.y - circleCenter.y) ** 2,
        );
        ctx.beginPath();
        ctx.arc(circleCenter.x, circleCenter.y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'tomato';
        ctx.stroke();
      }

      if (snapPoint) {
        ctx.beginPath();
        ctx.arc(snapPoint.x, snapPoint.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'tomato';
        ctx.fill();
      }
    },
    [
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
    ],
  );

  const renderSnapPoint = useCallback(
    (ctx) => {
      if (
        snapPoint &&
        (selectedTool === 'line' ||
          selectedTool === 'bezier' ||
          selectedTool === 'rectangle' ||
          selectedTool === 'triangle' ||
          selectedTool === 'circle')
      ) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(snapPoint.x, snapPoint.y, 5 / scale, 0, 2 * Math.PI);
        ctx.fillStyle = '#0068ff';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2 / scale;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(snapPoint.x - 7 / scale, snapPoint.y);
        ctx.lineTo(snapPoint.x + 7 / scale, snapPoint.y);
        ctx.moveTo(snapPoint.x, snapPoint.y - 7 / scale);
        ctx.lineTo(snapPoint.x, snapPoint.y + 7 / scale);
        ctx.strokeStyle = '#0068ff';
        ctx.lineWidth = 2 / scale;
        ctx.stroke();
        ctx.restore();
      }
    },
    [snapPoint, selectedTool, scale],
  );

  const renderEraserArea = useCallback(
    (ctx) => {
      if (isErasing && eraserStart && eraserEnd) {
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2 / scale;
        ctx.setLineDash([5 / scale, 5 / scale]);
        ctx.beginPath();
        ctx.rect(
          eraserStart.x,
          eraserStart.y,
          eraserEnd.x - eraserStart.x,
          eraserEnd.y - eraserStart.y,
        );
        ctx.stroke();
        ctx.restore();
      }
    },
    [isErasing, eraserStart, eraserEnd, scale],
  );

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) {
      return;
    }
    const context = canvasRef.current.getContext('2d');
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drawGrid(context, canvasSize.width, canvasSize.height);
    renderLayers();
    renderCurrentTool(context);
    renderSnapPoint(context);
    if (isErasing && eraserStart && eraserEnd) {
      renderEraserArea(context);
    }
  }, [
    canvasRef,
    canvasSize,
    renderLayers,
    renderCurrentTool,
    renderSnapPoint,
    renderEraserArea,
    isErasing,
    eraserStart,
    eraserEnd,
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
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, canvasSize.width, canvasSize.height);

    renderLayers(ctx);

    renderCurrentTool(ctx);

    renderSnapPoint(ctx);

    if (isErasing && eraserStart && eraserEnd) {
      renderEraserArea(ctx);
    }

    const handleResize = () => {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(ctx, canvasSize.width, canvasSize.height);
      renderLayers(ctx);
      renderCurrentTool(ctx);
      renderSnapPoint(ctx);
      if (isErasing && eraserStart && eraserEnd) {
        renderEraserArea(ctx);
      }
    };

    window.addEventListener('resize', handleResize);
  }, [
    canvasRef,
    canvasSize,
    renderLayers,
    renderCurrentTool,
    renderSnapPoint,
    renderEraserArea,
    isErasing,
    eraserStart,
    eraserEnd,
    drawGrid,
  ]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(ctx, canvasSize.width, canvasSize.height);

      renderLayers(ctx);
      renderCurrentTool(ctx);
      renderSnapPoint(ctx);
      renderEraserArea(ctx);
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
      renderCurrentTool(ctx);
      renderSnapPoint(ctx);
      renderEraserArea(ctx);
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
      renderCurrentTool(ctx);
      renderSnapPoint(ctx);
      renderEraserArea(ctx);
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
      {layerList.length === 0 && (
        <div className="default-logo">
          <IoSquareOutline />
        </div>
      )}
      {layerList.length !== 0 && (
        <button
          ref={screenRef}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMoveWrapper}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            overflow: 'hidden',
            width: '100%',
            height: '100%',
            position: 'relative',
            cursor: getCursorStyle(selectedTool, dragging),
            background: 'none',
            border: 'none',
            padding: 0,
          }}
          aria-label="Drawing canvas area"
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
          ></canvas>
        </button>
      )}
    </div>
  );
}

export default Canvas2D;
