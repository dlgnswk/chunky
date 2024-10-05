import { useMemo } from 'react';
import { Shape } from 'three';
import convert2Dto3D from '../utils/convert2Dto3D';

const useBezierShape = (path, canvasSize) => {
  return useMemo(() => {
    const shape = new Shape();

    path.curves.forEach((curve, index) => {
      const [x1, y1] = convert2Dto3D(curve.x1, curve.y1, 0, canvasSize);
      const [x2, y2] = convert2Dto3D(curve.x2, curve.y2, 0, canvasSize);

      if (index === 0) {
        shape.moveTo(x1, y1);
      }

      if (curve.type === 'bezier') {
        const [cx, cy] = convert2Dto3D(curve.cx, curve.cy, 0, canvasSize);
        shape.quadraticCurveTo(cx, cy, x2, y2);
      } else if (curve.type === 'line') {
        shape.lineTo(x2, y2);
      }
    });

    shape.closePath();

    return shape;
  }, [path, canvasSize]);
};

export default useBezierShape;
