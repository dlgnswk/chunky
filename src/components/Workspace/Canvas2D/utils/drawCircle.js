import findNearPoint from './findNearPoint';

const handleStart = (event, state) => {
  const { canvasRef, scale, setCircleCenter, layerList } = state;

  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  let mouseX = (event.clientX - rect.left) / scale;
  let mouseY = (event.clientY - rect.top) / scale;

  const nearestPoint = findNearPoint(mouseX, mouseY, scale, layerList);

  if (nearestPoint) {
    mouseX = nearestPoint.x;
    mouseY = nearestPoint.y;
  }

  setCircleCenter({ x: mouseX, y: mouseY });
};

const handleMove = (event, state) => {
  const {
    canvasRef,
    scale,
    circleCenter,
    setCircleRadius,
    setCurrentMousePos,
    layerList,
  } = state;
  if (!circleCenter) return;

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

  const dx = mouseX - circleCenter.x;
  const dy = mouseY - circleCenter.y;
  setCircleRadius(Math.sqrt(dx * dx + dy * dy));
};

const handleEnd = async (event, state) => {
  const {
    circleCenter,
    setCircleCenter,
    circleRadius,
    setCircleRadius,
    layerList,
    selectedLayer,
    updateLayerInFirestore,
    renderCanvas,
  } = state;

  if (circleCenter && circleRadius) {
    const newPath = {
      type: 'circle',
      center: circleCenter,
      radius: circleRadius,
    };

    const currentLayer = layerList.find(
      (layer) => layer.id === selectedLayer.id,
    );
    if (currentLayer) {
      const updatedLayer = {
        ...currentLayer,
        path: [...currentLayer.path, newPath],
      };
      await updateLayerInFirestore(updatedLayer);
      renderCanvas();
    }
  }

  setCircleCenter(null);
  setCircleRadius(0);
};

export default {
  handleStart,
  handleMove,
  handleEnd,
};
