import { useMemo } from 'react';
import { Shape, Vector2 } from 'three';
import convert2Dto3D from '../utils/convert2Dto3D';

const usePolygonShape = (path, canvasSize) => {
  return useMemo(() => {
    const { points, closed } = path;
    const convertedPoints = points.map((point) => {
      const [pointX, pointY] = convert2Dto3D(point.x, point.y, 0, canvasSize);
      return new Vector2(pointX, pointY);
    });

    const shape = new Shape();

    shape.setFromPoints(convertedPoints);

    if (closed) {
      shape.closePath();
    }

    return shape;
  }, [path, canvasSize]);
};

export default usePolygonShape;
