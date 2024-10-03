const findNearPoint = (x, y, scale, layerList) => {
  const SNAP_THRESHOLD = 5;
  let nearest = null;
  let minDistance = Infinity;

  const checkPoint = (point) => {
    const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);

    if (distance < minDistance && distance < SNAP_THRESHOLD / scale) {
      minDistance = distance;
      nearest = point;
    }
  };

  layerList.forEach((layer) => {
    if (layer.visible) {
      layer.path.forEach((path) => {
        let points = [];

        switch (path.type) {
          case 'rectangle':
            points = [
              { x: path.x, y: path.y },
              { x: path.x + path.width, y: path.y },
              { x: path.x, y: path.y + path.height },
              { x: path.x + path.width, y: path.y + path.height },
            ];
            break;
          case 'line':
            points = [
              { x: path.x1, y: path.y1 },
              { x: path.x2, y: path.y2 },
            ];
            break;
          case 'polyline':
            points = path.points;
            break;
          case 'triangle':
            points = path.points;
            break;
          case 'bezier':
            points = [
              { x: path.x1, y: path.y1 },
              { x: path.x2, y: path.y2 },
              { x: path.cx, y: path.cy },
            ];
            break;
          case 'closedBezier':
            path.curves.forEach((curve) => {
              if (curve.type === 'bezier') {
                points.push(
                  { x: curve.x1, y: curve.y1 },
                  { x: curve.x2, y: curve.y2 },
                  { x: curve.cx, y: curve.cy },
                );
              } else if (curve.type === 'line') {
                points.push(
                  { x: curve.x1, y: curve.y1 },
                  { x: curve.x2, y: curve.y2 },
                );
              }
            });
            break;
          case 'circle':
            points = [{ x: path.center.x, y: path.center.y }];
            break;
          default:
            break;
        }

        points.forEach(checkPoint);
      });
    }
  });

  return nearest;
};

export default findNearPoint;
