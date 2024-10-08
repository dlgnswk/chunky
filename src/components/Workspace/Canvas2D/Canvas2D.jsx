import { useEffect, useRef, useState, useCallback } from 'react';
import { IoSquareOutline } from 'react-icons/io5';

import useCanvasSetup from '../../../hooks/useCanvasSetup';

import drawGrid from '../../../utils/drawGrid';
import handleKeyDown from '../../../utils/handleKeyDown';
import getCursorStyle from '../../../utils/getCursorStyle';

import useStore from '../../../store/store';

import ToolBox from '../ToolBox';
import renderEraserArea from '../../../utils/renderEraserArea';
import renderSnapPoint from '../../../utils/renderSnapPoint';
import renderCurrentTool from '../../../utils/renderCurrentTool';
import drawLine from '../../../utils/drawLine';
import moveCanvas from '../../../utils/moveCanvas';
import drawBezier from '../../../utils/drawBezier';
import drawRectangle from '../../../utils/drawRectangle';
import drawTriangle from '../../../utils/drawTriangle';
import drawCircle from '../../../utils/drawCircle';
import removeShapes from '../../../utils/removeShapes';
import fillColor from '../../../utils/fillColor';
import checkMousePoint from '../../../utils/checkMousePoint';
import findSnapPoint from '../../../utils/findSnapPoint';

function Canvas2D() {
  const canvasRef = useRef(null);
  const screenRef = useRef(null);

  const drawingToolList = useStore((state) => state.drawingToolList);
  const canvasSize = useStore((state) => state.canvasSize);
  const addPathToLayer = useStore((state) => state.addPathToLayer);
  const selectedLayer = useStore((state) => state.selectedLayer);
  const user = useStore((state) => state.user);
  const layerList = useStore((state) => state.layerList);
  const initializeLayerListener = useStore(
    (state) => state.initializeLayerListener,
  );
  const setAlertState = useStore((state) => state.setAlertState);

  // lineTool
  const [setLineStart] = useState(null);
  const [lineEnd, setLineEnd] = useState(null);
  const [currentPolyline, setCurrentPolyline] = useState([]);
  const [isDrawingPolyline, setIsDrawingPolyline] = useState(false);

  // BezierTool
  const [bezierStart, setBezierStart] = useState(null);
  const [bezierEnd, setBezierEnd] = useState(null);
  const [bezierControl, setBezierControl] = useState(null);
  const [isBezierDrawing, setIsBezierDrawing] = useState(false);

  // RectangleTool
  const [rectStart, setRectStart] = useState(null);
  const [rectEnd, setRectEnd] = useState(null);

  // TriangleTool
  const [trianglePoints, setTrianglePoints] = useState([]);
  const [currentMousePos, setCurrentMousePos] = useState(null);

  // CircleTool
  const [circleCenter, setCircleCenter] = useState(null);
  const [circleRadius, setCircleRadius] = useState(0);

  // EraseTool
  const [isErasing, setIsErasing] = useState(false);
  const [eraserStart, setEraserStart] = useState(null);
  const [eraserEnd, setEraserEnd] = useState(null);

  // snapPoint
  const [snapPoint, setSnapPoint] = useState(null);

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
        if (layer.type === 'draw') {
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

            ctx.strokeStyle = layer.fill;
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

  renderLayersRef.current = renderLayers;

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

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drawGrid(ctx, canvasSize.width, canvasSize.height);
    renderLayers();
    renderCurrentTool(ctx, selectedTool, {
      isDrawingPolyline,
      currentPolyline,
      lineEnd,
      bezierStart,
      bezierEnd,
      bezierControl,
      rectStart,
      rectEnd,
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
    layerList,
  ]);

  useEffect(() => {
    if (canvasRef.current) {
      renderCanvas();
    }
  }, [renderCanvas]);

  useEffect(() => {
    const handleKeyDownCallback = (event) => {
      handleKeyDown(event, selectTool);

      if (event.key === 'Escape') {
        if (selectedTool === 'line' && isDrawingPolyline) {
          setIsDrawingPolyline(false);
          setCurrentPolyline([]);
          setLineStart(null);
          setLineEnd(null);
          renderCanvas();
        } else if (bezierStart || rectStart) {
          renderCanvas();
        }
      }
      if (event.key === ' ' && selectedTool === 'line' && isDrawingPolyline) {
        event.preventDefault();

        drawLine
          .finalizeLine({
            isDrawingPolyline,
            currentPolyline,
            selectedLayer,
            layerList,
            updateLayerInFirestore,
          })
          .then((result) => {
            if (!result.success) {
              setAlertState(result.message);
            }
          })
          .finally(() => {
            setIsDrawingPolyline(false);
            setCurrentPolyline([]);
            setLineStart(null);
            setLineEnd(null);
          });
      }
    };

    window.addEventListener('keydown', handleKeyDownCallback);
    return () => {
      window.removeEventListener('keydown', handleKeyDownCallback);
    };
  }, [
    selectTool,
    selectedTool,
    isDrawingPolyline,
    currentPolyline,
    bezierStart,
    rectStart,
    renderCanvas,
    selectedLayer,
    layerList,
    updateLayerInFirestore,
  ]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(ctx, canvasSize.width, canvasSize.height);

      renderLayers();
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

  const handleMouseDown = useCallback(
    (event) => {
      if (selectedTool === 'line') {
        drawLine.handleStart(event, {
          canvasRef,
          scale,
          isDrawingPolyline,
          currentPolyline,
          setIsDrawingPolyline,
          setCurrentPolyline,
          setLineStart,
          setLineEnd,
          renderCanvas,
          layerList,
        });
      } else if (selectedTool === 'move') {
        moveCanvas.handleStart(event, {
          setDragging,
          setStartPoint,
          offset,
        });
      } else if (selectedTool === 'bezier') {
        drawBezier.handleStart(event, {
          canvasRef,
          scale,
          bezierStart,
          setBezierStart,
          bezierEnd,
          setBezierEnd,
          setBezierControl,
          setIsBezierDrawing,
          layerList,
        });
      } else if (selectedTool === 'rectangle') {
        drawRectangle.handleStart(event, {
          canvasRef,
          scale,
          setRectStart,
          setRectEnd,
          renderCanvas,
          layerList,
        });
      } else if (selectedTool === 'triangle') {
        drawTriangle.handleStart(event, {
          canvasRef,
          scale,
          setTrianglePoints,
          layerList,
        });
      } else if (selectedTool === 'circle') {
        drawCircle.handleStart(event, {
          canvasRef,
          scale,
          setCircleCenter,
          layerList,
        });
      } else if (selectedTool === 'eraser') {
        removeShapes.handleStart(event, {
          canvasRef,
          scale,
          setIsErasing,
          setEraserStart,
          setEraserEnd,
        });
      } else if (selectedTool === 'paintBucket') {
        fillColor.handleStart(event, {
          canvasRef,
          scale,
          layerList,
          checkMousePoint,
          updateLayerInFirestore,
        });
      }
    },
    [
      selectedTool,
      canvasRef,
      scale,
      layerList,
      isDrawingPolyline,
      currentPolyline,
      setIsDrawingPolyline,
      setCurrentPolyline,
      setLineStart,
      setLineEnd,
      setDragging,
      setStartPoint,
      offset,
      setBezierStart,
      setIsBezierDrawing,
      setRectStart,
      setRectEnd,
      setTrianglePoints,
      setCircleCenter,
      isErasing,
      setIsErasing,
      setEraserStart,
      setEraserEnd,
      checkMousePoint,
      renderCanvas,
    ],
  );

  const handleMouseMove = useCallback(
    (event) => {
      findSnapPoint(event, {
        canvasRef,
        scale,
        setSnapPoint,
        layerList,
      });

      if (selectedTool === 'line') {
        drawLine.handleMove(event, {
          canvasRef,
          scale,
          isDrawingPolyline,
          setLineEnd,
          renderCanvas,
          layerList,
        });
      } else if (selectedTool === 'move') {
        moveCanvas.handleMove(event, {
          dragging,
          startPoint,
          setOffset,
        });
      } else if (selectedTool === 'bezier') {
        drawBezier.handleMove(event, {
          canvasRef,
          scale,
          bezierStart,
          bezierEnd,
          setBezierControl,
          isBezierDrawing,
          layerList,
        });
      } else if (selectedTool === 'rectangle') {
        drawRectangle.handleMove(event, {
          canvasRef,
          scale,
          rectStart,
          setRectEnd,
          setCurrentMousePos,
          renderCanvas,
          layerList,
        });
      } else if (selectedTool === 'triangle') {
        drawTriangle.handleMove(event, {
          canvasRef,
          scale,
          setCurrentMousePos,
          layerList,
        });
      } else if (selectedTool === 'circle') {
        drawCircle.handleMove(event, {
          canvasRef,
          scale,
          circleCenter,
          setCircleRadius,
          setCurrentMousePos,
          layerList,
        });
      } else if (selectedTool === 'eraser') {
        removeShapes.handleMove(event, {
          canvasRef,
          scale,
          isErasing,
          setEraserEnd,
        });
      }
    },
    [
      selectedTool,
      canvasRef,
      scale,
      isDrawingPolyline,
      setLineEnd,
      dragging,
      startPoint,
      setOffset,
      bezierStart,
      isBezierDrawing,
      bezierControl,
      setBezierControl,
      setBezierEnd,
      rectStart,
      setRectStart,
      rectEnd,
      setRectEnd,
      setCurrentMousePos,
      circleCenter,
      setCircleRadius,
      isErasing,
      setEraserEnd,
      renderCanvas,
      setSnapPoint,
      layerList,
    ],
  );

  const handleMouseUp = useCallback(
    (event) => {
      if (selectedTool === 'line') {
        drawLine.handleEnd(event, {
          isDrawingPolyline,
          lineEnd,
          currentPolyline,
          setCurrentPolyline,
          setLineStart,
          selectedLayer,
          addPathToLayer,
          renderCanvas,
        });
      } else if (selectedTool === 'move') {
        moveCanvas.handleEnd({
          setDragging,
        });
      } else if (selectedTool === 'bezier') {
        if (bezierStart && bezierEnd && bezierControl) {
          drawBezier
            .handleEnd(event, {
              bezierStart,
              bezierEnd,
              bezierControl,
              selectedLayer,
              layerList,
              updateLayerInFirestore,
            })
            .then((result) => {
              if (!result.success) {
                setAlertState(result.message);
              }
            })
            .finally(() => {
              setBezierStart(null);
              setBezierEnd(null);
              setBezierControl(null);
            });
        }
      } else if (selectedTool === 'rectangle') {
        if (rectStart && rectEnd) {
          drawRectangle
            .handleEnd(event, {
              rectStart,
              rectEnd,
              selectedLayer,
              layerList,
              updateLayerInFirestore,
              renderCanvas,
            })
            .then((result) => {
              if (!result.success) {
                setAlertState(result.message);
              }
            })
            .finally(() => {
              setRectStart(null);
              setRectEnd(null);
            });
        }
      } else if (selectedTool === 'triangle') {
        if (trianglePoints.length === 3) {
          drawTriangle
            .handleEnd(event, {
              layerList,
              trianglePoints,
              selectedLayer,
              updateLayerInFirestore,
              renderCanvas,
            })
            .then((result) => {
              if (!result.success) {
                setAlertState(result.message);
              }
            })
            .finally(() => {
              setTrianglePoints([]);
            });
        }
      } else if (selectedTool === 'circle') {
        if (circleCenter && circleRadius) {
          drawCircle
            .handleEnd(event, {
              circleCenter,
              setCircleCenter,
              circleRadius,
              setCircleRadius,
              layerList,
              selectedLayer,
              updateLayerInFirestore,
              renderCanvas,
            })
            .then((result) => {
              if (!result.success) {
                setAlertState(result.message);
              }
            })
            .finally(() => {
              setCircleCenter(null);
              setCircleRadius(0);
            });
        }
      } else if (selectedTool === 'eraser') {
        if (isErasing && eraserStart && eraserEnd) {
          removeShapes
            .handleEnd({
              eraserStart,
              eraserEnd,
              selectedLayer,
              layerList,
              updateLayerInFirestore,
            })
            .then((result) => {
              if (!result.success) {
                setAlertState(result.message);
              }
            })
            .finally(() => {
              setIsErasing(false);
              setEraserStart(null);
              setEraserEnd(null);
            });
        }
      }
    },
    [
      selectedTool,
      isDrawingPolyline,
      lineEnd,
      currentPolyline,
      setCurrentPolyline,
      setLineStart,
      selectedLayer,
      renderCanvas,
      setDragging,
      bezierStart,
      bezierControl,
      bezierEnd,
      setIsBezierDrawing,
      setBezierStart,
      setBezierControl,
      setBezierEnd,
      selectedLayer,
      rectStart,
      setRectStart,
      rectEnd,
      setRectEnd,
      selectedLayer,
      circleCenter,
      setCircleCenter,
      circleRadius,
      setCircleRadius,
      isErasing,
      eraserStart,
      eraserEnd,
      setIsErasing,
      setEraserStart,
      setEraserEnd,
      layerList,
    ],
  );

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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
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
