import findNearPoint from './findNearPoint';

const handleStart = (event, state) => {
  const { canvasRef, scale, setTrianglePoints, layerList } = state;

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

  setTrianglePoints((prevPoints) => {
    const newPoints = [...prevPoints, point];

    return newPoints;
  });
};

const handleMove = (event, state) => {
  const { canvasRef, scale, setCurrentMousePos, layerList } = state;

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
};

const handleEnd = async (event, state) => {
  const {
    layerList,
    trianglePoints,
    selectedLayer,
    updateLayerInFirestore,
    renderCanvas,
  } = state;

  const currentLayer = layerList.find((layer) => layer.id === selectedLayer.id);

  if (!currentLayer) return { success: false, message: 'not-select-layer' };

  const newPath = {
    type: 'triangle',
    points: trianglePoints,
  };

  const updatedLayer = {
    ...currentLayer,
    path: [...currentLayer.path, newPath],
  };

  try {
    await updateLayerInFirestore(updatedLayer);
    renderCanvas();

    return { success: true };
  } catch (error) {
    return { success: false, message: 'failed-save-drawing' };
  }
};

export default {
  handleStart,
  handleMove,
  handleEnd,
};
