import { useState, useCallback, useEffect, useRef } from 'react';
import useStore from '../store/store';

const SNAP_THRESHOLD = 10;
const ERASER_SIZE = 5;

const useMouseHandlers = (
  selectedTool,
  { x: offsetX, y: offsetY, scale },
  setOffset,
  setDragging,
  setStartPoint,
  dragging,
  startPoint,
  canvasRef,
  addPathToLayer,
  selectedLayer,
  layerList,
  updateLayerInFirestore,
  setLayerList,
  renderCanvas,
) => {
  const [lineStart, setLineStart] = useState(null);
  const [lineEnd, setLineEnd] = useState(null);
  const [bezierStart, setBezierStart] = useState(null);
  const [bezierEnd, setBezierEnd] = useState(null);
  const [bezierControl, setBezierControl] = useState(null);
  const [isBezierDrawing, setIsBezierDrawing] = useState(false);
  const [rectStart, setRectStart] = useState(null);
  const [rectEnd, setRectEnd] = useState(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [snapPoint, setSnapPoint] = useState(null);
  const eraserCanvasRef = useRef(null);
  const [erasedAreas, setErasedAreas] = useState([]);
  const [trianglePoints, setTrianglePoints] = useState([]);
  const [currentMousePos, setCurrentMousePos] = useState(null);
  const [circleCenter, setCircleCenter] = useState(null);
  const [circleRadius, setCircleRadius] = useState(0);
  const [paintBucketColor, setPaintBucketColor] = useState('#0000FF');
  const [isErasing, setIsErasing] = useState(false);
  const [eraserStart, setEraserStart] = useState(null);
  const [eraserEnd, setEraserEnd] = useState(null);

  useEffect(() => {
    if (selectedTool !== 'eraser') {
      setIsErasing(false);
      setEraserStart(null);
      setEraserEnd(null);
    }
  }, [selectedTool]);

  const renderEraserArea = useCallback(
    (ctx) => {
      if (isErasing && eraserStart && eraserEnd) {
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2 / scale;
        ctx.setLineDash([5 / scale, 5 / scale]);
        ctx.beginPath();
        ctx.rect(
          Math.min(eraserStart.x, eraserEnd.x),
          Math.min(eraserStart.y, eraserEnd.y),
          Math.abs(eraserEnd.x - eraserStart.x),
          Math.abs(eraserEnd.y - eraserStart.y),
        );
        ctx.stroke();
        ctx.restore();
      }
    },
    [isErasing, eraserStart, eraserEnd, scale],
  );

  const isPointInPath = (path, x, y) => {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.beginPath();

    switch (path.type) {
      case 'rectangle':
        ctx.rect(path.x, path.y, path.width, path.height);
        break;
      case 'circle':
        ctx.arc(path.cx, path.cy, path.r, 0, Math.PI * 2);
        break;
      case 'line':
        ctx.moveTo(path.x1, path.y1);
        ctx.lineTo(path.x2, path.y2);
        break;
      case 'bezier':
        ctx.moveTo(path.x1, path.y1);
        ctx.quadraticCurveTo(path.cx, path.cy, path.x2, path.y2);
        break;
      case 'triangle':
        ctx.moveTo(path.points[0].x, path.points[0].y);
        ctx.lineTo(path.points[1].x, path.points[1].y);
        ctx.lineTo(path.points[2].x, path.points[2].y);
        ctx.closePath();
        break;
      default:
        break;
    }

    return ctx.isPointInPath(x, y);
  };

  const handlePaintBucket = useCallback(
    (event) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / scale);
      const y = Math.floor((event.clientY - rect.top) / scale);

      if (selectedLayer) {
        selectedLayer.path.forEach((path, pathIndex) => {
          if (isPointInPath(path, x, y)) {
            useStore
              .getState()
              .updatePathInLayer(selectedLayer.index, pathIndex, {
                fill: paintBucketColor,
              });
          }
        });
      }
    },
    [selectedLayer, paintBucketColor, scale, canvasRef],
  );

  useEffect(() => {
    const updateCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        layerList.forEach((layer) => {
          layer.path.forEach((path) => {
            if (path.type === 'rectangle') {
              ctx.rect(path.x1, path.y1, path.x2 - path.x1, path.y2 - path.y1);
            } else if (path.type === 'circle') {
              ctx.arc(
                path.center.x,
                path.center.y,
                path.radius,
                0,
                Math.PI * 2,
              );
            } else if (path.type === 'line') {
              ctx.moveTo(path.x1, path.y1);
              ctx.lineTo(path.x2, path.y2);
            } else if (path.type === 'bezier') {
              ctx.moveTo(path.x1, path.y1);
              ctx.quadraticCurveTo(path.cx, path.cy, path.x2, path.y2);
            } else if (path.type === 'triangle') {
              ctx.moveTo(path.points[0].x, path.points[0].y);
              path.points.forEach((point, index) => {
                if (index > 0) {
                  ctx.lineTo(point.x, point.y);
                }
              });
              ctx.closePath();
            }
            if (path.fill) {
              ctx.fillStyle = path.fill;
              ctx.fill();
            }
            ctx.stroke();
          });
        });
      }
    };

    updateCanvas();
  }, [layerList, canvasRef]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      eraserCanvasRef.current = document.createElement('canvas');
      eraserCanvasRef.current.width = canvas.width;
      eraserCanvasRef.current.height = canvas.height;
    }
  }, [canvasRef.current]);

  const applyEraserEffect = useCallback(() => {
    if (canvasRef.current && eraserCanvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const eraserCtx = eraserCanvasRef.current.getContext('2d');

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(eraserCanvasRef.current, 0, 0);
      ctx.restore();

      eraserCtx.clearRect(
        0,
        0,
        eraserCanvasRef.current.width,
        eraserCanvasRef.current.height,
      );
    }
  }, [canvasRef]);

  const getLineLineIntersection = (line1, line2) => {
    const { x1, y1, x2, y2 } = line1;
    const x3 = line2.x1;
    const y3 = line2.y1;
    const x4 = line2.x2;
    const y4 = line2.y2;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(den) < 1e-8) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1),
      };
    }
    return null;
  };

  const getRectangleLineIntersections = (rect, line) => {
    const rectLines = [
      { x1: rect.x1, y1: rect.y1, x2: rect.x2, y2: rect.y1 },
      { x1: rect.x2, y1: rect.y1, x2: rect.x2, y2: rect.y2 },
      { x1: rect.x2, y1: rect.y2, x2: rect.x1, y2: rect.y2 },
      { x1: rect.x1, y1: rect.y2, x2: rect.x1, y2: rect.y1 },
    ];

    const intersections = [];
    rectLines.forEach((rectLine) => {
      const intersection = getLineLineIntersection(rectLine, line);
      if (intersection) intersections.push(intersection);
    });

    return intersections;
  };

  const getRectangleRectangleIntersections = (rect1, rect2) => {
    const rect1Lines = [
      { x1: rect1.x1, y1: rect1.y1, x2: rect1.x2, y2: rect1.y1 },
      { x1: rect1.x2, y1: rect1.y1, x2: rect1.x2, y2: rect1.y2 },
      { x1: rect1.x2, y1: rect1.y2, x2: rect1.x1, y2: rect1.y2 },
      { x1: rect1.x1, y1: rect1.y2, x2: rect1.x1, y2: rect1.y1 },
    ];

    const intersections = [];
    rect1Lines.forEach((line) => {
      const lineIntersections = getRectangleLineIntersections(rect2, line);
      intersections.push(...lineIntersections);
    });

    return intersections;
  };

  const findAllIntersections = useCallback((layers) => {
    const intersections = [];

    layers.forEach((layer, i) => {
      if (layer.visible && Array.isArray(layer.path)) {
        layer.path.forEach((path1, j) => {
          layer.path.slice(j + 1).forEach((path2) => {
            if (path1.type === 'line' && path2.type === 'line') {
              const intersection = getLineLineIntersection(path1, path2);
              if (intersection) intersections.push(intersection);
            } else if (path1.type === 'rectangle' && path2.type === 'line') {
              const newIntersections = getRectangleLineIntersections(
                path1,
                path2,
              );
              intersections.push(...newIntersections);
            } else if (path1.type === 'line' && path2.type === 'rectangle') {
              const newIntersections = getRectangleLineIntersections(
                path2,
                path1,
              );
              intersections.push(...newIntersections);
            }
          });

          layers.slice(i + 1).forEach((otherLayer) => {
            if (otherLayer.visible && Array.isArray(otherLayer.path)) {
              otherLayer.path.forEach((path2) => {
                if (path1.type === 'line' && path2.type === 'line') {
                  const intersection = getLineLineIntersection(path1, path2);
                  if (intersection) intersections.push(intersection);
                } else if (
                  path1.type === 'rectangle' &&
                  path2.type === 'line'
                ) {
                  const newIntersections = getRectangleLineIntersections(
                    path1,
                    path2,
                  );
                  intersections.push(...newIntersections);
                } else if (
                  path1.type === 'line' &&
                  path2.type === 'rectangle'
                ) {
                  const newIntersections = getRectangleLineIntersections(
                    path2,
                    path1,
                  );
                  intersections.push(...newIntersections);
                } else if (
                  path1.type === 'rectangle' &&
                  path2.type === 'rectangle'
                ) {
                  const newIntersections = getRectangleRectangleIntersections(
                    path1,
                    path2,
                  );
                  intersections.push(...newIntersections);
                }
              });
            }
          });
        });
      }
    });

    return intersections;
  }, []);

  const findNearestPoint = useCallback(
    (x, y) => {
      let nearest = null;
      let minDistance = Infinity;

      const checkPoint = (point) => {
        const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
        if (distance < minDistance && distance < SNAP_THRESHOLD) {
          minDistance = distance;
          nearest = point;
        }
      };

      layerList.forEach((layer) => {
        if (layer.visible && Array.isArray(layer.path)) {
          layer.path.forEach((path) => {
            let points = [];
            if (path.type === 'rectangle') {
              points = [
                { x: path.x, y: path.y },
                { x: path.x + path.width, y: path.y },
                { x: path.x, y: path.y + path.height },
                { x: path.x + path.width, y: path.y + path.height },
              ];
            } else if (path.type === 'line') {
              points = [
                { x: path.x1, y: path.y1 },
                { x: path.x2, y: path.y2 },
              ];
            } else if (path.type === 'triangle') {
              points = path.points;
            } else if (path.type === 'bezier') {
              points = [
                { x: path.x1, y: path.y1 },
                { x: path.x2, y: path.y2 },
                { x: path.cx, y: path.cy },
              ];
            } else if (path.type === 'circle') {
              points = [{ x: path.center.x, y: path.center.y }];
            }
            points.forEach(checkPoint);
          });
        }
      });

      const intersections = findAllIntersections(layerList);
      intersections.forEach(checkPoint);

      return nearest;
    },
    [layerList, findAllIntersections],
  );

  const cancelDrawing = useCallback(() => {
    setLineStart(null);
    setLineEnd(null);
    setBezierStart(null);
    setBezierEnd(null);
    setBezierControl(null);
    setIsBezierDrawing(false);
    setRectStart(null);
    setRectEnd(null);
    setSnapPoint(null);
    setTrianglePoints([]);
    setCircleCenter(null);
    setCircleRadius(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && (lineStart || rectStart || bezierStart)) {
        cancelDrawing();
      }
      if (event.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [lineStart, rectStart, bezierStart, cancelDrawing]);

  const isPathInEraserArea = (path, area) => {
    if (!area || !area.start || !area.end) return false;
    if (!path || typeof path !== 'object') return false;

    const minX = Math.min(area.start.x, area.end.x);
    const maxX = Math.max(area.start.x, area.end.x);
    const minY = Math.min(area.start.y, area.end.y);
    const maxY = Math.max(area.start.y, area.end.y);

    switch (path.type) {
      case 'line':
        return (
          (path.x1 >= minX &&
            path.x1 <= maxX &&
            path.y1 >= minY &&
            path.y1 <= maxY) ||
          (path.x2 >= minX &&
            path.x2 <= maxX &&
            path.y2 >= minY &&
            path.y2 <= maxY)
        );
      case 'rectangle':
        return (
          path.x < maxX &&
          path.x + path.width > minX &&
          path.y < maxY &&
          path.y + path.height > minY
        );
      case 'circle': {
        const centerInArea =
          path.center.x >= minX &&
          path.center.x <= maxX &&
          path.center.y >= minY &&
          path.center.y <= maxY;
        return (
          centerInArea ||
          (path.center.x + path.radius > minX &&
            path.center.x - path.radius < maxX &&
            path.center.y + path.radius > minY &&
            path.center.y - path.radius < maxY)
        );
      }
      case 'bezier':
        return (
          (path.x1 >= minX &&
            path.x1 <= maxX &&
            path.y1 >= minY &&
            path.y1 <= maxY) ||
          (path.x2 >= minX &&
            path.x2 <= maxX &&
            path.y2 >= minY &&
            path.y2 <= maxY) ||
          (path.cx >= minX &&
            path.cx <= maxX &&
            path.cy >= minY &&
            path.cy <= maxY)
        );
      default:
        return false;
    }
  };

  const getMousePosition = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / scale,
      y: (event.clientY - rect.top) / scale,
    };
  };

  const handleMouseDown = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    let mouseX = (event.clientX - rect.left) / scale;
    let mouseY = (event.clientY - rect.top) / scale;

    const nearestPoint = findNearestPoint(mouseX, mouseY);
    if (nearestPoint) {
      mouseX = nearestPoint.x;
      mouseY = nearestPoint.y;
    }

    if (selectedTool === 'move') {
      setDragging(true);
      setStartPoint({
        x: event.clientX - offsetX,
        y: event.clientY - offsetY,
      });
    } else if (selectedTool === 'bezier') {
      if (!bezierStart) {
        setBezierStart({ x: mouseX, y: mouseY });
        setIsBezierDrawing(true);
      } else if (!bezierEnd) {
        setBezierEnd({ x: mouseX, y: mouseY });
        setBezierControl({ x: mouseX, y: mouseY });
      }
    } else if (selectedTool === 'rectangle') {
      setRectStart({ x: mouseX, y: mouseY });
      setRectEnd({ x: mouseX, y: mouseY });
    } else if (selectedTool === 'triangle') {
      setTrianglePoints((prevPoints) => {
        const newPoints = [...prevPoints, { x: mouseX, y: mouseY }];
        if (newPoints.length === 3) {
          if (selectedLayer) {
            addPathToLayer(selectedLayer.index, {
              type: 'triangle',
              points: newPoints,
            });
          }
          return [];
        }
        return newPoints;
      });
    } else if (selectedTool === 'circle') {
      if (!circleCenter) {
        setCircleCenter({ x: mouseX, y: mouseY });
      }
    } else if (selectedTool === 'eraser') {
      setIsErasing(true);
      const mousePos = getMousePosition(event);
      setEraserStart(mousePos);
      setEraserEnd(mousePos);
    } else if (selectedTool === 'paintBucket') {
      handlePaintBucket(event);
    }
  };

  const handleMouseMove = useCallback(
    (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      let mouseX = (event.clientX - rect.left) / scale;
      let mouseY = (event.clientY - rect.top) / scale;

      const nearestPoint = findNearestPoint(mouseX, mouseY);
      if (nearestPoint) {
        mouseX = nearestPoint.x;
        mouseY = nearestPoint.y;
        setSnapPoint({ x: mouseX, y: mouseY });
      } else {
        setSnapPoint(null);
      }

      setCurrentMousePos({ x: mouseX, y: mouseY });

      if (dragging && selectedTool === 'move') {
        setOffset({
          x: event.clientX - startPoint.x,
          y: event.clientY - startPoint.y,
        });
      } else if (selectedTool === 'line' && lineStart) {
        if (isShiftPressed) {
          const dx = mouseX - lineStart.x;
          const dy = mouseY - lineStart.y;
          if (Math.abs(dx) > Math.abs(dy)) {
            mouseY = lineStart.y;
          } else {
            mouseX = lineStart.x;
          }
        }
        setLineEnd({ x: mouseX, y: mouseY });
      } else if (
        selectedTool === 'bezier' &&
        isBezierDrawing &&
        bezierStart &&
        bezierEnd
      ) {
        setBezierControl({ x: mouseX, y: mouseY });
      } else if (selectedTool === 'rectangle' && rectStart) {
        setRectEnd({ x: mouseX, y: mouseY });
      } else if (selectedTool === 'triangle') {
        setCurrentMousePos({ x: mouseX, y: mouseY });
      } else if (selectedTool === 'circle' && circleCenter) {
        const dx = mouseX - circleCenter.x;
        const dy = mouseY - circleCenter.y;
        setCircleRadius(Math.sqrt(dx * dx + dy * dy));
      } else if (selectedTool === 'eraser' && isErasing) {
        setEraserEnd(getMousePosition(event));
      }
    },
    [
      scale,
      findNearestPoint,
      dragging,
      selectedTool,
      startPoint,
      lineStart,
      isShiftPressed,
      isBezierDrawing,
      bezierStart,
      bezierEnd,
      rectStart,
      circleCenter,
      isErasing,
      getMousePosition,
    ],
  );

  const handleCanvasClick = (event) => {
    if (selectedTool === 'rectangle') return;

    if (selectedTool === 'paintBucket') {
      handlePaintBucket(event);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    let mouseX = (event.clientX - rect.left) / scale;
    let mouseY = (event.clientY - rect.top) / scale;

    const nearestPoint = findNearestPoint(mouseX, mouseY);
    if (nearestPoint) {
      mouseX = nearestPoint.x;
      mouseY = nearestPoint.y;
    }
    if (selectedTool === 'line') {
      if (!lineStart) {
        setLineStart({ x: mouseX, y: mouseY });
        setLineEnd({ x: mouseX, y: mouseY });
      } else {
        if (isShiftPressed) {
          const dx = mouseX - lineStart.x;
          const dy = mouseY - lineStart.y;
          if (Math.abs(dx) > Math.abs(dy)) {
            mouseY = lineStart.y;
          } else {
            mouseX = lineStart.x;
          }
        }

        setLineEnd({ x: mouseX, y: mouseY });
        if (selectedLayer) {
          addPathToLayer(selectedLayer.index, {
            type: 'line',
            x1: lineStart.x,
            y1: lineStart.y,
            x2: mouseX,
            y2: mouseY,
          });
        }
        setLineStart(null);
        setLineEnd(null);
      }
    }
  };

  const isLineIntersectingWithCircle = (line, circle) => {
    const { x1, y1, x2, y2 } = line;
    const { x, y, radius } = circle;

    const dx = x2 - x1;
    const dy = y2 - y1;

    const lengthSquared = dx * dx + dy * dy;

    const t = Math.max(
      0,
      Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSquared),
    );

    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    const distanceSquared = (closestX - x) ** 2 + (closestY - y) ** 2;

    return distanceSquared <= radius * radius;
  };

  const isRectangleIntersectingWithCircle = (rect, circle) => {
    const { x1, y1, x2, y2 } = rect;
    const { x, y, radius } = circle;

    const rectCenterX = (x1 + x2) / 2;
    const rectCenterY = (y1 + y2) / 2;

    const rectHalfWidth = Math.abs(x2 - x1) / 2;
    const rectHalfHeight = Math.abs(y2 - y1) / 2;

    const distanceX = Math.abs(x - rectCenterX);
    const distanceY = Math.abs(y - rectCenterY);

    if (distanceX <= rectHalfWidth && distanceY <= rectHalfHeight) {
      return true;
    }

    if (
      distanceX > rectHalfWidth + radius ||
      distanceY > rectHalfHeight + radius
    ) {
      return false;
    }

    if (distanceX <= rectHalfWidth || distanceY <= rectHalfHeight) {
      return true;
    }

    const cornerDistanceSquared =
      (distanceX - rectHalfWidth) ** 2 + (distanceY - rectHalfHeight) ** 2;
    return cornerDistanceSquared <= radius * radius;
  };

  const isBezierIntersectingWithCircle = (bezier, circle) => {
    const segments = 20;
    const { x1: bx1, y1: by1, x2: bx2, y2: by2, cx: bcx, cy: bcy } = bezier;

    for (let i = 0; i < segments; i += 1) {
      const t1 = i / segments;
      const t2 = (i + 1) / segments;

      const sx1 = (1 - t1) ** 2 * bx1 + 2 * (1 - t1) * t1 * bcx + t1 ** 2 * bx2;
      const sy1 = (1 - t1) ** 2 * by1 + 2 * (1 - t1) * t1 * bcy + t1 ** 2 * by2;
      const sx2 = (1 - t2) ** 2 * bx1 + 2 * (1 - t2) * t2 * bcx + t2 ** 2 * bx2;
      const sy2 = (1 - t2) ** 2 * by1 + 2 * (1 - t2) * t2 * bcy + t2 ** 2 * by2;

      if (
        isLineIntersectingWithCircle(
          { x1: sx1, y1: sy1, x2: sx2, y2: sy2 },
          circle,
        )
      ) {
        return true;
      }
    }

    return false;
  };

  const isPathIntersectingWithCircle = (path, circle) => {
    switch (path.type) {
      case 'line':
        return isLineIntersectingWithCircle(path, circle);
      case 'rectangle':
        return isRectangleIntersectingWithCircle(path, circle);
      case 'bezier':
        return isBezierIntersectingWithCircle(path, circle);
      default:
        return false;
    }
  };

  const finalizeErase = useCallback(() => {
    if (selectedLayer && erasedAreas.length > 0) {
      const updatedPaths = selectedLayer.path.filter(
        (path) =>
          !erasedAreas.some((area) =>
            isPathIntersectingWithCircle(path, {
              ...area,
              radius: ERASER_SIZE / 2,
            }),
          ),
      );

      addPathToLayer(selectedLayer.index, updatedPaths);

      setErasedAreas([]);
      renderCanvas();
    } else {
      renderCanvas();
    }
  }, [selectedLayer, erasedAreas, addPathToLayer, renderCanvas]);

  const updateLayerList = useCallback((updatedLayer) => {
    setLayerList((prevLayers) => {
      const newLayerList = prevLayers.map((layer) => {
        return layer.id === updatedLayer.id ? updatedLayer : layer;
      });

      return newLayerList;
    });

    return updatedLayer;
  }, []);

  const handleMouseUp = useCallback(async () => {
    if (
      selectedTool === 'eraser' &&
      isErasing &&
      eraserStart &&
      eraserEnd &&
      selectedLayer
    ) {
      try {
        const updatedPaths = selectedLayer.path.filter((path) => {
          return !isPathInEraserArea(path, {
            start: eraserStart,
            end: eraserEnd,
          });
        });

        const updatedLayer = {
          ...selectedLayer,
          id: selectedLayer.id,
          path: updatedPaths,
        };

        updateLayerList(updatedLayer);

        await useStore.getState().updateLayerInFirestore(updatedLayer);
      } catch (error) {
        return false;
      } finally {
        setIsErasing(false);
        setEraserStart(null);
        setEraserEnd(null);

        finalizeErase();
      }
    }

    if (selectedTool === 'move') {
      setDragging(false);
    } else if (selectedTool === 'line' && lineStart && lineEnd) {
      if (selectedLayer) {
        const newPath = {
          type: 'line',
          x1: lineStart.x,
          y1: lineStart.y,
          x2: lineEnd.x,
          y2: lineEnd.y,
        };
        addPathToLayer(selectedLayer.index, newPath);
      }
      setLineStart(null);
      setLineEnd(null);
    } else if (
      selectedTool === 'bezier' &&
      bezierStart &&
      bezierEnd &&
      bezierControl
    ) {
      if (selectedLayer) {
        const newPath = {
          type: 'bezier',
          x1: bezierStart.x,
          y1: bezierStart.y,
          x2: bezierEnd.x,
          y2: bezierEnd.y,
          cx: bezierControl.x,
          cy: bezierControl.y,
        };
        addPathToLayer(selectedLayer.index, newPath);
      }
      setBezierStart(null);
      setBezierEnd(null);
      setBezierControl(null);
      setIsBezierDrawing(false);
    } else if (selectedTool === 'rectangle' && rectStart && rectEnd) {
      if (selectedLayer) {
        const newPath = {
          type: 'rectangle',
          x: Math.min(rectStart.x, rectEnd.x),
          y: Math.min(rectStart.y, rectEnd.y),
          width: Math.abs(rectEnd.x - rectStart.x),
          height: Math.abs(rectEnd.y - rectStart.y),
          fill: 'none',
        };
        addPathToLayer(selectedLayer.index, newPath);
      }
      setRectStart(null);
      setRectEnd(null);
    } else if (selectedTool === 'circle' && circleCenter && circleRadius) {
      if (selectedLayer) {
        const newPath = {
          type: 'circle',
          center: circleCenter,
          radius: circleRadius,
        };
        addPathToLayer(selectedLayer.index, newPath);
      }
      setCircleCenter(null);
      setCircleRadius(0);
    }
    renderCanvas();
    return false;
  }, [
    selectedTool,
    isErasing,
    eraserStart,
    eraserEnd,
    selectedLayer,
    updateLayerInFirestore,
    updateLayerList,
    isPathInEraserArea,
    renderCanvas,
  ]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasClick,
    handlePaintBucket,
    lineStart,
    lineEnd,
    bezierStart,
    bezierEnd,
    bezierControl,
    rectStart,
    rectEnd,
    snapPoint,
    applyEraserEffect,
    finalizeErase,
    cancelDrawing,
    trianglePoints,
    currentMousePos,
    circleCenter,
    circleRadius,
    setPaintBucketColor,
    isErasing,
    setIsErasing,
    eraserStart,
    setEraserStart,
    eraserEnd,
    setEraserEnd,
    renderEraserArea,
  };
};

export default useMouseHandlers;
