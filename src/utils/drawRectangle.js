import findNearPoint from './findNearPoint';

const handleStart = (event, state) => {
  const {
    canvasRef,
    scale,
    setRectStart,
    setRectEnd,
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

  setRectStart({ x: mouseX, y: mouseY });
  setRectEnd({ x: mouseX, y: mouseY });
  renderCanvas();
};

const handleMove = (event, state) => {
  const {
    canvasRef,
    scale,
    rectStart,
    setRectEnd,
    setCurrentMousePos,
    renderCanvas,
    layerList,
  } = state;

  if (!rectStart) return;

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

  setCurrentMousePos(point);
  setRectEnd(point);
  renderCanvas();
};

const handleEnd = async (event, state) => {
  const {
    rectStart,
    rectEnd,
    setRectStart,
    setRectEnd,
    selectedLayer,
    layerList,
    updateLayerInFirestore,
    renderCanvas,
  } = state;

  if (rectStart && rectEnd) {
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

      await updateLayerInFirestore(updatedLayer);
    }

    setRectStart(null);
    setRectEnd(null);
  }

  renderCanvas();
};

export default {
  handleStart,
  handleMove,
  handleEnd,
};
