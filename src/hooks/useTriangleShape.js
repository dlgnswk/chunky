import { useMemo } from 'react';
import { Shape } from 'three';
import convert2Dto3D from '../utils/convert2Dto3D';

const useTriangleShape = (path, canvasSize) => {
  return useMemo(() => {
    const { points } = path;
    const convertedPoints = points.map((point) => {
      const [pointX, pointY] = convert2Dto3D(point.x, point.y, 0, canvasSize);
      return { x: pointX, y: pointY };
    });

    const shape = new Shape();

    shape.moveTo(convertedPoints[0].x, convertedPoints[0].y);
    shape.lineTo(convertedPoints[1].x, convertedPoints[1].y);
    shape.lineTo(convertedPoints[2].x, convertedPoints[2].y);
    shape.lineTo(convertedPoints[0].x, convertedPoints[0].y);
    shape.closePath();

    return shape;
  }, [path, canvasSize]);
};

export default useTriangleShape;
