import findNearPoint from './findNearPoint';

const handleStart = (event, state) => {
  const {
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
  } = state;

  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  let mouseX = (event.clientX - rect.left) / scale;
  let mouseY = (event.clientY - rect.top) / scale;

  const nearestPoint = findNearPoint(mouseX, mouseY, scale, layerList);

  if (nearestPoint) {
    mouseX = nearestPoint.x;
    mouseY = nearestPoint.y;
  }

  const point = { x: mouseX, y: mouseY };

  if (!isDrawingPolyline || currentPolyline.length === 0) {
    setIsDrawingPolyline(true);
    setCurrentPolyline([point]);
    setLineStart(point);
    setLineEnd(point);
  } else {
    const lastPoint = currentPolyline[currentPolyline.length - 1];

    if (Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) > 0.001) {
      setCurrentPolyline((prev) => [...prev, point]);
      setLineEnd(point);
    }
  }

  renderCanvas();
};

const handleMove = (event, state) => {
  const {
    canvasRef,
    scale,
    isDrawingPolyline,
    setLineEnd,
    renderCanvas,
    layerList,
  } = state;

  if (!isDrawingPolyline) return;

  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  let mouseX = (event.clientX - rect.left) / scale;
  let mouseY = (event.clientY - rect.top) / scale;

  const nearestPoint = findNearPoint(mouseX, mouseY, scale, layerList);

  if (nearestPoint) {
    mouseX = nearestPoint.x;
    mouseY = nearestPoint.y;
  }

  const point = { x: mouseX, y: mouseY };

  setLineEnd(point);
  renderCanvas();
};

const handleEnd = (event, state) => {
  const {
    isDrawingPolyline,
    lineEnd,
    currentPolyline,
    setCurrentPolyline,
    setLineStart,
    selectedLayer,
    addPathToLayer,
    renderCanvas,
  } = state;

  if (isDrawingPolyline && lineEnd) {
    setCurrentPolyline((prev) => [...prev, lineEnd]);
    setLineStart(lineEnd);

    if (selectedLayer) {
      const newPath = {
        type: 'line',
        points: currentPolyline,
      };

      addPathToLayer(selectedLayer.id, newPath);
    }
  }

  renderCanvas();
};

const finalizeLine = async (state) => {
  const {
    isDrawingPolyline,
    currentPolyline,
    selectedLayer,
    layerList,
    updateLayerInFirestore,
  } = state;

  const currentLayer = layerList.find((layer) => layer.id === selectedLayer.id);

  if (!currentLayer) return { success: false, message: 'not-select-layer' };

  if (!isDrawingPolyline || currentPolyline.length <= 2)
    return { success: false, message: 'invalid-line' };

  const uniquePoints = currentPolyline.filter(
    (point, index, self) =>
      index === self.findIndex((t) => t.x === point.x && t.y === point.y),
  );

  const closedPath = {
    type: 'polyline',
    points: uniquePoints,
    closed: true,
    fill: 'none',
  };

  const updatedLayer = {
    ...currentLayer,
    path: [...(currentLayer.path || []), closedPath],
  };

  try {
    await updateLayerInFirestore(updatedLayer);

    return { success: true };
  } catch (error) {
    return { success: false, message: 'failed-save-drawing' };
  }
};

export default {
  handleStart,
  handleMove,
  handleEnd,
  finalizeLine,
};
