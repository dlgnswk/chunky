import findNearPoint from './findNearPoint';

const handleStart = (event, state) => {
  const {
    canvasRef,
    scale,
    setTrianglePoints,
    selectedLayer,
    addPathToLayer,
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

  setTrianglePoints((prevPoints) => {
    const newPoints = [...prevPoints, point];
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

export default {
  handleStart,
  handleMove,
};
