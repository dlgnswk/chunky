const createMask = async (maskId, outerPath, innerPaths) => {
  return {
    id: maskId,
    outerPath,
    innerPaths,
  };
};

const drawPath = (ctx, path) => {
  switch (path.type) {
    case 'rectangle':
      ctx.rect(path.x, path.y, path.width, path.height);
      break;
    case 'triangle':
      ctx.moveTo(path.points[0].x, path.points[0].y);
      ctx.lineTo(path.points[1].x, path.points[1].y);
      ctx.lineTo(path.points[2].x, path.points[2].y);
      ctx.closePath();
      break;
    case 'bezier':
      ctx.moveTo(path.x1, path.y1);
      ctx.quadraticCurveTo(path.cx, path.cy, path.x2, path.y2);
      break;
    case 'circle':
      ctx.arc(path.center.x, path.center.y, path.radius, 0, 2 * Math.PI);
      break;
    default:
      console.warn(`Unknown path type: ${path.type}`);
  }
};

const getPathPoints = (path) => {
  switch (path.type) {
    case 'rectangle':
      return [
        { x: path.x, y: path.y },
        { x: path.x + path.width, y: path.y },
        { x: path.x + path.width, y: path.y + path.height },
        { x: path.x, y: path.y + path.height },
      ];
    case 'triangle':
      return path.points;
    case 'bezier':
      return [
        { x: path.x1, y: path.y1 },
        { x: path.x2, y: path.y2 },
        { x: path.cx, y: path.cy },
      ];
    case 'circle':
      return [path.center];
    default:
      console.warn(`Unknown path type: ${path.type}`);
      return [];
  }
};

const isPointInPath = (path, x, y) => {
  const ctx = document.createElement('canvas').getContext('2d');
  drawPath(ctx, path);
  return ctx.isPointInPath(x, y);
};

const isPathInsidePath = (innerPath, outerPath) => {
  const innerPoints = getPathPoints(innerPath);
  return innerPoints.every((point) =>
    isPointInPath(outerPath, point.x, point.y),
  );
};

export { createMask, drawPath, getPathPoints, isPointInPath, isPathInsidePath };
