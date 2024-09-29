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
    case 'closedBezier':
      return path.curves.some((curve) => {
        if (curve.type === 'bezier') {
          return (
            (curve.x1 >= minX &&
              curve.x1 <= maxX &&
              curve.y1 >= minY &&
              curve.y1 <= maxY) ||
            (curve.x2 >= minX &&
              curve.x2 <= maxX &&
              curve.y2 >= minY &&
              curve.y2 <= maxY) ||
            (curve.cx >= minX &&
              curve.cx <= maxX &&
              curve.cy >= minY &&
              curve.cy <= maxY)
          );
        }
        if (curve.type === 'line') {
          return (
            (curve.x1 >= minX &&
              curve.x1 <= maxX &&
              curve.y1 >= minY &&
              curve.y1 <= maxY) ||
            (curve.x2 >= minX &&
              curve.x2 <= maxX &&
              curve.y2 >= minY &&
              curve.y2 <= maxY)
          );
        }
        return false;
      });
    default:
      return false;
  }
};

const handleStart = (event, state) => {
  const { canvasRef, scale, setIsErasing, setEraserStart, setEraserEnd } =
    state;

  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const mouseX = (event.clientX - rect.left) / scale;
  const mouseY = (event.clientY - rect.top) / scale;

  setIsErasing(true);
  setEraserStart({ x: mouseX, y: mouseY });
  setEraserEnd({ x: mouseX, y: mouseY });
};

const handleMove = (event, state) => {
  const { canvasRef, scale, isErasing, setEraserEnd } = state;

  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const mouseX = (event.clientX - rect.left) / scale;
  const mouseY = (event.clientY - rect.top) / scale;

  if (isErasing) {
    setEraserEnd({ x: mouseX, y: mouseY });
  }
};

const handleEnd = async (state) => {
  const {
    isErasing,
    eraserStart,
    eraserEnd,
    selectedLayer,
    layerList,
    updateLayerInFirestore,
    setIsErasing,
    setEraserStart,
    setEraserEnd,
  } = state;

  if (isErasing && eraserStart && eraserEnd && selectedLayer) {
    try {
      const currentLayer = layerList.find(
        (layer) => layer.id === selectedLayer.id,
      );
      if (!currentLayer) return;

      const updatedPaths = currentLayer.path.filter((path) => {
        return !isPathInEraserArea(path, {
          start: eraserStart,
          end: eraserEnd,
        });
      });

      const updatedLayer = { ...currentLayer, path: updatedPaths };
      await updateLayerInFirestore(updatedLayer);
    } finally {
      setIsErasing(false);
      setEraserStart(null);
      setEraserEnd(null);
    }
  }
};

export default {
  handleStart,
  handleMove,
  handleEnd,
};
