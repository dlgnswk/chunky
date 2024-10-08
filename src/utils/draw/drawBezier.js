import findNearPoint from '../tool/findNearPoint';

const handleStart = (event, state) => {
  const {
    canvasRef,
    scale,
    bezierStart,
    setBezierStart,
    bezierEnd,
    setBezierEnd,
    setBezierControl,
    setIsBezierDrawing,
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

  if (!bezierStart) {
    setBezierStart(point);
    setIsBezierDrawing(true);
  } else if (!bezierEnd) {
    setBezierEnd(point);
    setBezierControl(point);
  }
};

const handleMove = (event, state) => {
  const {
    canvasRef,
    scale,
    bezierStart,
    bezierEnd,
    setBezierControl,
    isBezierDrawing,
    layerList,
  } = state;

  if (isBezierDrawing && bezierStart && bezierEnd) {
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

    setBezierControl(point);
  }
};

const handleEnd = async (event, state) => {
  const {
    bezierStart,
    bezierEnd,
    bezierControl,
    selectedLayer,
    layerList,
    updateLayerInFirestore,
  } = state;

  const currentLayer = layerList.find((layer) => layer.id === selectedLayer.id);

  if (!currentLayer) return { success: false, message: 'not-select-layer' };

  const newPath = {
    type: 'closedBezier',
    curves: [
      {
        type: 'bezier',
        x1: bezierStart.x,
        y1: bezierStart.y,
        x2: bezierEnd.x,
        y2: bezierEnd.y,
        cx: bezierControl.x,
        cy: bezierControl.y,
      },
      {
        type: 'line',
        x1: bezierEnd.x,
        y1: bezierEnd.y,
        x2: bezierStart.x,
        y2: bezierStart.y,
      },
    ],
    fill: 'none',
  };

  const updatedLayer = {
    ...currentLayer,
    path: [...currentLayer.path, newPath],
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
};
