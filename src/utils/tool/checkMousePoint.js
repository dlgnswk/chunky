const checkMousePoint = (path, x, y) => {
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
    case 'closedBezier':
      context.moveTo(path.curves[0].x1, path.curves[0].y1);
      context.quadraticCurveTo(
        path.curves[0].cx,
        path.curves[0].cy,
        path.curves[0].x2,
        path.curves[0].y2,
      );
      context.closePath();
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

export default checkMousePoint;
