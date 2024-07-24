import { useState, useCallback, useEffect, useRef } from 'react';
import useStore from '../store/store';

const SNAP_THRESHOLD = 10;
const ERASER_SIZE = 5;

const autoClosePath = (path, threshold = 5) => {
  if (path.type === 'line' || path.type === 'bezier') {
    const pathStartPoint = { x: path.x1, y: path.y1 };
    const pathEndPoint = { x: path.x2, y: path.y2 };
    const distance = Math.sqrt(
      (pathStartPoint.x - pathEndPoint.x) ** 2 +
        (pathStartPoint.y - pathEndPoint.y) ** 2,
    );
    if (distance <= threshold) {
      return { ...path, closed: true };
    }
  }
  return path;
};

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
  const [currentPath, setCurrentPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolyline, setCurrentPolyline] = useState([]);
  const [isDrawingPolyline, setIsDrawingPolyline] = useState(false);

  useEffect(() => {
    renderCanvas();
  }, [layerList, renderCanvas]);

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
    const context = document.createElement('canvas').getContext('2d');
    context.beginPath();

    switch (path.type) {
      case 'rectangle':
        context.rect(path.x, path.y, path.width, path.height);
        break;
      case 'circle':
        context.arc(path.center.x, path.center.y, path.radius, 0, Math.PI * 2);
        break;
      case 'line':
        context.moveTo(path.x1, path.y1);
        context.lineTo(path.x2, path.y2);
        break;
      case 'polyline':
        if (path.points && path.points.length > 2) {
          context.moveTo(path.points[0].x, path.points[0].y);
          for (let i = 1; i < path.points.length; i += 1) {
            context.lineTo(path.points[i].x, path.points[i].y);
          }
          if (path.closed) {
            context.closePath();
          }
        }
        break;
      case 'bezier':
        context.moveTo(path.x1, path.y1);
        context.quadraticCurveTo(path.cx, path.cy, path.x2, path.y2);
        break;
      case 'triangle':
        context.moveTo(path.points[0].x, path.points[0].y);
        context.lineTo(path.points[1].x, path.points[1].y);
        context.lineTo(path.points[2].x, path.points[2].y);
        context.closePath();
        break;
      default:
        return false;
    }

    if (path.closed) {
      context.closePath();
    }

    return context.isPointInPath(x, y);
  };

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
            } else if (path.type === 'polyline') {
              ctx.beginPath();
              ctx.moveTo(path.points[0].x, path.points[0].y);
              for (let i = 1; i < path.points.length; i += 1) {
                ctx.lineTo(path.points[i].x, path.points[i].y);
              }
              if (path.closed) {
                ctx.closePath();
              }
              if (path.fill && path.fill !== 'none') {
                ctx.fillStyle = path.fill;
                ctx.fill();
              }
              ctx.stroke();

              path.points.forEach((point) => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'red';
                ctx.fill();
              });
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
            if (path.fill && path.fill !== 'none') {
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
            } else if (path.type === 'polyline') {
              points = path.points;
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

  const updateLayerInFirestore = useStore(
    (state) => state.updateLayerInFirestore,
  );

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
      case 'polyline':
        return path.points.some(
          (point) =>
            point.x >= minX &&
            point.x <= maxX &&
            point.y >= minY &&
            point.y <= maxY,
        );
      case 'rectangle':
        return (
          path.x >= minX &&
          path.x + path.width <= maxX &&
          path.y >= minY &&
          path.y + path.height <= maxY
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
      case 'triangle':
        return path.points.some(
          (point) =>
            point.x >= minX &&
            point.x <= maxX &&
            point.y >= minY &&
            point.y <= maxY,
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

  const handleMouseMove = useCallback(
    (event) => {
      if (!canvasRef.current) {
        return;
      }
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
      } else if (selectedTool === 'line' && isDrawingPolyline) {
        const point = getMousePosition(event);
        setLineEnd(point);
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

  const finalizePolyline = useCallback(() => {
    if (selectedLayer && isDrawingPolyline && currentPolyline.length > 2) {
      const closedPath = {
        type: 'polyline',
        points: [...currentPolyline, currentPolyline[0]],
        closed: true,
        fill: 'none',
      };

      const updatedLayer = {
        ...selectedLayer,
        path: [...selectedLayer.path, closedPath],
      };
      updateLayerInFirestore(updatedLayer);

      setIsDrawingPolyline(false);
      setCurrentPolyline([]);
      setLineStart(null);
      setLineEnd(null);
    }
  }, [
    selectedLayer,
    isDrawingPolyline,
    currentPolyline,
    updateLayerInFirestore,
  ]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === ' ' &&
        isDrawingPolyline &&
        currentPolyline.length > 1
      ) {
        event.preventDefault();
        finalizePolyline();
      } else if (event.key === 'Escape' && isDrawingPolyline) {
        setIsDrawingPolyline(false);
        setCurrentPolyline([]);
        setLineStart(null);
        setLineEnd(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawingPolyline, currentPolyline, finalizePolyline]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === 'Enter' &&
        isDrawingPolyline &&
        currentPolyline.length > 1
      ) {
        finalizePolyline();
      } else if (event.key === 'Escape' && isDrawingPolyline) {
        setIsDrawingPolyline(false);
        setCurrentPolyline([]);
        setLineStart(null);
        setLineEnd(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [finalizePolyline, isDrawingPolyline]);

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

  const updateLayerList = useCallback(
    (updatedLayer) => {
      if (!updatedLayer || !updatedLayer.id) {
        return null;
      }

      setLayerList((prevLayers) => {
        const newLayerList = prevLayers.map((layer) =>
          layer.id === updatedLayer.id ? updatedLayer : layer,
        );
        return newLayerList;
      });

      return updatedLayer;
    },
    [setLayerList],
  );

  useEffect(() => {}, [layerList]);

  const handlePaintBucket = useCallback(
    async (event) => {
      if (selectedTool !== 'paintBucket') return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / scale;
      const y = (event.clientY - rect.top) / scale;

      const clickedLayerInfo = layerList.reduce(
        (result, layer) => {
          if (result.clickedLayer) return result;

          const pathIndex = layer.path.findIndex((path) =>
            isPointInPath(path, x, y),
          );

          if (pathIndex !== -1) {
            return { clickedLayer: layer, clickedPathIndex: pathIndex };
          }

          return result;
        },
        { clickedLayer: null, clickedPathIndex: -1 },
      );

      const { clickedLayer, clickedPathIndex } = clickedLayerInfo;

      if (clickedLayer && clickedPathIndex !== -1) {
        const clickedPath = clickedLayer.path[clickedPathIndex];

        // 폴리라인이고 닫혀있지 않다면 닫아줍니다.
        if (clickedPath.type === 'polyline' && !clickedPath.closed) {
          clickedPath.closed = true;
          clickedPath.points.push(clickedPath.points[0]);
        }

        const updatedPath = {
          ...clickedPath,
          fill: paintBucketColor,
        };

        const updatedLayer = {
          ...clickedLayer,
          path: [...clickedLayer.path],
        };
        updatedLayer.path[clickedPathIndex] = updatedPath;

        const success = await updateLayerInFirestore(updatedLayer);

        if (success) {
          setLayerList((prevLayers) =>
            prevLayers.map((layer) =>
              layer.id === updatedLayer.id ? updatedLayer : layer,
            ),
          );
        }

        renderCanvas();
      }
    },
    [
      selectedTool,
      layerList,
      canvasRef,
      scale,
      paintBucketColor,
      updateLayerInFirestore,
      setLayerList,
      renderCanvas,
    ],
  );

  const handleCanvasClick = (event) => {
    if (selectedTool === 'paintBucket') {
      handlePaintBucket(event);
      return;
    }
    if (selectedTool === 'rectangle') return;

    const rect = canvasRef.current.getBoundingClientRect();
    let mouseX = (event.clientX - rect.left) / scale;
    let mouseY = (event.clientY - rect.top) / scale;

    const nearestPoint = findNearestPoint(mouseX, mouseY);
    if (nearestPoint) {
      mouseX = nearestPoint.x;
      mouseY = nearestPoint.y;
    }
    if (selectedTool === 'line') {
      const newPoint = { x: mouseX, y: mouseY };
      if (!isDrawingPolyline) {
        setIsDrawingPolyline(true);
        setCurrentPolyline([newPoint]);
        setLineStart(newPoint);
        setLineEnd(newPoint);
      } else {
        setCurrentPolyline((prev) => [...prev, newPoint]);
        setLineEnd(newPoint);
      }
    }
  };

  const handleMouseUp = useCallback(async () => {
    if (
      selectedTool === 'eraser' &&
      isErasing &&
      eraserStart &&
      eraserEnd &&
      selectedLayer
    ) {
      try {
        const currentLayer = layerList.find(
          (layer) => layer.id === selectedLayer.id,
        );

        if (!currentLayer) {
          return;
        }

        const updatedPaths = currentLayer.path.filter((path) => {
          const shouldKeep = !isPathInEraserArea(path, {
            start: eraserStart,
            end: eraserEnd,
          });
          return shouldKeep;
        });

        const updatedLayer = {
          ...currentLayer,
          path: updatedPaths,
        };

        const success = await updateLayerInFirestore(updatedLayer);

        if (success) {
          setLayerList((prevLayers) => {
            const newLayers = prevLayers.map((layer) =>
              layer.id === updatedLayer.id ? updatedLayer : layer,
            );

            return newLayers;
          });
        }
      } catch (error) {
        return;
      } finally {
        setIsErasing(false);
        setEraserStart(null);
        setEraserEnd(null);
      }
    }

    if (selectedTool === 'move') {
      setDragging(false);
    } else if (selectedTool === 'line' && isDrawingPolyline) {
      if (selectedLayer && lineStart && lineEnd) {
        const newPath = {
          type: 'line',
          x1: lineStart.x,
          y1: lineStart.y,
          x2: lineEnd.x,
          y2: lineEnd.y,
        };

        const currentPaths = [...selectedLayer.path];

        if (currentPaths.length === 0) {
          addPathToLayer(selectedLayer.index, newPath);
        } else {
          const prevLine = currentPaths[currentPaths.length - 1];
          if (prevLine.x2 === newPath.x1 && prevLine.y2 === newPath.y1) {
            const firstLine = currentPaths[0];
            const distance = Math.sqrt(
              (newPath.x2 - firstLine.x1) ** 2 +
                (newPath.y2 - firstLine.y1) ** 2,
            );

            if (distance <= 5) {
              const closedPath = {
                type: 'polyline',
                points: currentPaths
                  .map((line) => ({ x: line.x1, y: line.y1 }))
                  .concat({ x: firstLine.x1, y: firstLine.y1 }),
                closed: true,
              };

              selectedLayer.path = selectedLayer.path.filter(
                (path) => path.type !== 'line',
              );
              addPathToLayer(selectedLayer.index, closedPath);
            } else {
              addPathToLayer(selectedLayer.index, newPath);
            }
          } else {
            addPathToLayer(selectedLayer.index, newPath);
          }
        }
      }

      setLineStart(lineEnd);
    } else if (
      selectedTool === 'bezier' &&
      bezierStart &&
      bezierEnd &&
      bezierControl
    ) {
      if (selectedLayer) {
        const newPath = autoClosePath({
          type: 'bezier',
          x1: bezierStart.x,
          y1: bezierStart.y,
          x2: bezierEnd.x,
          y2: bezierEnd.y,
          cx: bezierControl.x,
          cy: bezierControl.y,
        });
        addPathToLayer(selectedLayer.index, newPath);
      }
      setBezierStart(null);
      setBezierEnd(null);
      setBezierControl(null);
      setIsBezierDrawing(false);
    } else if (selectedTool === 'rectangle' && rectStart && rectEnd) {
      const currentLayer = layerList.find(
        (layer) => layer.id === selectedLayer.id,
      );

      if (currentLayer) {
        const newPath = {
          type: 'rectangle',
          x: Math.min(rectStart.x, rectEnd.x),
          y: Math.min(rectStart.y, rectEnd.y),
          width: Math.abs(rectEnd.x - rectStart.x),
          height: Math.abs(rectEnd.y - rectStart.y),
          fill: 'none',
        };

        const updatedLayer = {
          ...currentLayer,
          path: [...currentLayer.path, newPath],
        };

        const success = await updateLayerInFirestore(updatedLayer);

        if (success) {
          setLayerList((prevLayers) => {
            const newLayers = prevLayers.map((layer) =>
              layer.id === updatedLayer.id ? updatedLayer : layer,
            );

            return newLayers;
          });
        }
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
    } else if (selectedTool === 'line') {
      const point = getMousePosition(event);
      if (!isDrawingPolyline) {
        setIsDrawingPolyline(true);
        setLineStart(point);
        setLineEnd(point);
        setCurrentPolyline([point]);
      } else {
        setLineEnd(point);
        setCurrentPolyline((prev) => [...prev, point]);

        setLineStart(lineEnd);
      }
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
    setLayerList,
    currentPolyline,
    setCurrentPolyline,
    isDrawingPolyline,
    setIsDrawingPolyline,
    finalizePolyline,
  };
};

export default useMouseHandlers;
