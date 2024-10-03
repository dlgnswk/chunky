import findNearPoint from './findNearPoint';

const findSnapPoint = (
  event,
  { canvasRef, scale, setSnapPoint, layerList },
) => {
  const rect = canvasRef.current.getBoundingClientRect();
  let mouseX = (event.clientX - rect.left) / scale;
  let mouseY = (event.clientY - rect.top) / scale;

  mouseX = Math.round(mouseX * 100) / 100;
  mouseY = Math.round(mouseY * 100) / 100;

  const nearestPoint = findNearPoint(mouseX, mouseY, scale, layerList);

  if (nearestPoint) {
    mouseX = nearestPoint.x;
    mouseY = nearestPoint.y;
    setSnapPoint({ x: mouseX, y: mouseY });
  } else {
    setSnapPoint(null);
  }
};

export default findSnapPoint;
