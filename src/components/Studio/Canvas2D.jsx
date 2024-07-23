import React, { useEffect, useRef, useState, useCallback } from 'react';
import { IoSquareOutline } from 'react-icons/io5';
import useStore from '../../store/store';
import ToolBox from './ToolBox';
import drawGrid from '../../utils/drawGrid';
import drawLine from '../../utils/drawLine';
import useCanvasSetup from '../../hooks/useCanvasSetup';
import handleKeyDown from '../../utils/handleKeyDown';
import useMouseHandlers from '../../hooks/useMouseHandlers';
import getCursorStyle from '../../utils/getCursorStyle';
import drawBezierCurve from '../../utils/drawBezierCurve';
import drawTriangle from '../../utils/drawTriangle';
import drawCircle from '../../utils/drawCircle';
import { drawPath } from '../../utils/pathUtils';

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

  const renderLayers = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    layerList.forEach((layer) => {
      if (layer && layer.visible && Array.isArray(layer.path)) {
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
            if (path.mask) {
              const mask = layer.masks.find((m) => m.id === path.mask);
              if (mask) {
                ctx.save();
                ctx.beginPath();
                drawPath(ctx, mask.outerPath);
                ctx.clip();
                mask.innerPaths.forEach((innerPath) => {
                  ctx.beginPath();
                  drawPath(ctx, innerPath);
                  ctx.clip('evenodd');
                });
                ctx.fillStyle = path.fill;
                drawPath(ctx, path);
                ctx.fill();
                ctx.restore();
              }
            } else {
              ctx.fillStyle = path.fill;
              ctx.fill();
            }
          }

          if (path.closed) {
            ctx.closePath();
          }

          if (path.fill && path.fill !== 'none') {
            ctx.fillStyle = path.fill;
            ctx.fill();
          }

          ctx.strokeStyle = 'blue';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }
    });
  }, [layerList, canvasRef]);

  const updateLayerInFirestore = useStore(
    (state) => state.updateLayerInFirestore,
  );

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
    rectEnd,
    trianglePoints,
    currentMousePos,
    circleCenter,
    circleRadius,
    snapPoint,
    cancelDrawing,
    finalizeErase,
    isErasing,
    setIsErasing,
    eraserStart,
    setEraserStart,
    eraserEnd,
    setEraserEnd,
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
    const handleKeyDownCallback = (event) => {
      handleKeyDown(event, selectTool);
      if (event.key === 'Escape' && (lineStart || bezierStart || rectStart)) {
        cancelDrawing();
      }
    };

    window.addEventListener('keydown', handleKeyDownCallback);
    return () => {
      window.removeEventListener('keydown', handleKeyDownCallback);
    };
  }, [selectTool, lineStart, bezierStart, rectStart, cancelDrawing]);

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
      if (selectedTool === 'line' && lineStart && lineEnd) {
        drawLine(ctx, lineStart.x, lineStart.y, lineEnd.x, lineEnd.y, 'red', 1);
      } else if (selectedTool === 'bezier') {
        if (bezierStart && bezierEnd && bezierControl) {
          drawBezierCurve(
            ctx,
            bezierStart.x,
            bezierStart.y,
            bezierEnd.x,
            bezierEnd.y,
            bezierControl.x,
            bezierControl.y,
            'red',
            1,
          );
        } else if (bezierStart && bezierEnd) {
          drawLine(
            ctx,
            bezierStart.x,
            bezierStart.y,
            bezierEnd.x,
            bezierEnd.y,
            'red',
            1,
          );
        } else if (bezierStart) {
          drawLine(
            ctx,
            bezierStart.x,
            bezierStart.y,
            snapPoint ? snapPoint.x : mousePosition.x,
            snapPoint ? snapPoint.y : mousePosition.y,
            'red',
            1,
          );
        }
      } else if (selectedTool === 'rectangle' && rectStart && rectEnd) {
        ctx.beginPath();
        ctx.rect(
          rectStart.x,
          rectStart.y,
          rectEnd.x - rectStart.x,
          rectEnd.y - rectStart.y,
        );
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (selectedTool === 'triangle') {
        if (trianglePoints.length === 1) {
          drawLine(
            ctx,
            trianglePoints[0].x,
            trianglePoints[0].y,
            currentMousePos.x,
            currentMousePos.y,
            'red',
            1,
          );
        } else if (trianglePoints.length === 2) {
          drawTriangle(ctx, [...trianglePoints, currentMousePos], 'red', 1);
        }
      } else if (selectedTool === 'circle' && circleCenter && circleRadius) {
        drawCircle(ctx, circleCenter, circleRadius, 'red', 1);
      }
    },
    [
      selectedTool,
      lineStart,
      lineEnd,
      bezierStart,
      bezierEnd,
      bezierControl,
      rectStart,
      rectEnd,
      trianglePoints,
      currentMousePos,
      circleCenter,
      circleRadius,
      snapPoint,
      mousePosition,
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
    layerList,
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
