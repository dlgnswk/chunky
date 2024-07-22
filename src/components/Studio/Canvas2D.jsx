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
  const undo = useStore((state) => state.undo);

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
    const context = canvasRef.current.getContext('2d');

    context.save();
    context.fillStyle = color;
    context.beginPath();

    switch (path.type) {
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
        context.arc(path.center.x, path.center.y, path.radius, 0, 2 * Math.PI);
        break;
      default:
        break;
    }

    context.fill();
    context.restore();
  }, []);

  const renderLayersRef = useRef(null);

  const renderLayers = useCallback(
    (context) => {
      layerList.forEach((layer) => {
        if (layer && layer.visible && Array.isArray(layer.path)) {
          layer.path.forEach((path) => {
            context.beginPath();

            switch (path.type) {
              case 'bezier':
                context.moveTo(path.x1, path.y1);
                context.quadraticCurveTo(path.cx, path.cy, path.x2, path.y2);
                break;
              case 'rectangle':
                context.rect(path.x, path.y, path.width, path.height);
                break;
              case 'triangle':
                context.moveTo(path.points[0].x, path.points[0].y);
                context.lineTo(path.points[1].x, path.points[1].y);
                context.lineTo(path.points[2].x, path.points[2].y);
                context.closePath();
                break;
              case 'line':
                context.moveTo(path.x1, path.y1);
                context.lineTo(path.x2, path.y2);
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

            if (path.fill && path.fill !== 'none') {
              context.fillStyle = path.fill;
              context.fill();
            }

            context.strokeStyle = 'blue';
            context.lineWidth = 1;
            context.stroke();
          });
        }
      });
    },
    [layerList],
  );

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
    renderLayers,
  );

  const selectTool = (tool) => {
    setSelectedTool((prevTool) => {
      if (prevTool === tool) {
        return null;
      }
      if (tool === 'eraser') {
        // 지우개 도구 선택 시 상태 초기화
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

      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === 'z' || event.key === 'Z')
      ) {
        event.preventDefault();
        undo();
      }
    };

    window.addEventListener('keydown', handleKeyDownCallback);
    return () => {
      window.removeEventListener('keydown', handleKeyDownCallback);
    };
  }, [selectTool, lineStart, bezierStart, rectStart, cancelDrawing, undo]);

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
    renderLayers(context);
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

    // 캔버스 크기 설정
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 그리드 그리기
    drawGrid(ctx, canvasSize.width, canvasSize.height);

    // 레이어 렌더링
    renderLayers(ctx);

    // 현재 선택된 도구 렌더링
    renderCurrentTool(ctx);

    // 스냅 포인트 렌더링
    renderSnapPoint(ctx);

    // 지우개 영역 렌더링 (해당되는 경우)
    if (isErasing && eraserStart && eraserEnd) {
      renderEraserArea(ctx);
    }

    // 윈도우 리사이즈 이벤트 리스너
    const handleResize = () => {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      // 리사이즈 시 모든 렌더링 함수 다시 호출
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
          ></canvas>
        </button>
      )}
    </div>
  );
}

export default Canvas2D;
