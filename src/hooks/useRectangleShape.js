import { useMemo } from 'react';
import { Shape } from 'three';
import convert2Dto3D from '../utils/convert2Dto3D';

const useRectangleShape = (path, canvasSize) => {
  return useMemo(() => {
    const { x, y, width, height } = path;
    const [x1, y1] = convert2Dto3D(x, y, 0, canvasSize);
    const [x2, y2] = convert2Dto3D(x + width, y + height, 0, canvasSize);

    const shape = new Shape();
    shape.moveTo(x1, y1);
    shape.lineTo(x2, y1);
    shape.lineTo(x2, y2);
    shape.lineTo(x1, y2);
    shape.lineTo(x1, y1);

    return shape;
  }, [path, canvasSize]);
};

export default useRectangleShape;
