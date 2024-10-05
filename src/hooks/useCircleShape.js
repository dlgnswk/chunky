import { useMemo } from 'react';
import { Shape } from 'three';
import convert2Dto3D from '../utils/convert2Dto3D';

const useCircleShape = (path, canvasSize) => {
  return useMemo(() => {
    const { radius, center } = path;
    const [centerX, centerY] = convert2Dto3D(center.x, center.y, 0, canvasSize);

    const shape = new Shape();
    shape.absarc(centerX, centerY, radius, 0, Math.PI * 2, false);

    return shape;
  }, [path, canvasSize]);
};

export default useCircleShape;
