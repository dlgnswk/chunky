import { useMemo } from 'react';
import { ExtrudeGeometry, Shape } from 'three';
import convert2Dto3D from '../../../utils/convert2Dto3D';

function TriangleModel({ path, depth, canvasSize, fill, zPosition }) {
  const geometry = useMemo(() => {
    const shape = new Shape();
    const { points } = path;

    const convertedPoints = points.map((point) => {
      const [pointX, pointY] = convert2Dto3D(point.x, point.y, 0, canvasSize);
      return { x: pointX, y: pointY };
    });

    shape.moveTo(convertedPoints[0].x, convertedPoints[0].y);
    shape.lineTo(convertedPoints[1].x, convertedPoints[1].y);
    shape.lineTo(convertedPoints[2].x, convertedPoints[2].y);
    shape.lineTo(convertedPoints[0].x, convertedPoints[0].y);

    shape.closePath();

    return new ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
    });
  }, [path, depth, canvasSize]);

  return (
    <mesh
      geometry={geometry}
      position={[0, 0, zPosition]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        visible
        transparent={false}
        opacity={1}
        side={2}
        color={fill}
        roughness={0.7}
        metalness={0.4}
        flatShading={false}
      />
    </mesh>
  );
}

export default TriangleModel;
