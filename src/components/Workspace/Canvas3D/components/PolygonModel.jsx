import { useMemo } from 'react';
import { ExtrudeGeometry, Shape, Vector2 } from 'three';
import convert2Dto3D from '../../../../r3f-utils/convert2Dto3D';

function PolygonModel({ path, depth, canvasSize, fill, zPosition }) {
  const geometry = useMemo(() => {
    const shape = new Shape();
    const { points, closed } = path;

    const convertedPoints = points.map((point) => {
      const [pointX, pointY] = convert2Dto3D(point.x, point.y, 0, canvasSize);
      return new Vector2(pointX, pointY);
    });

    shape.setFromPoints(convertedPoints);

    if (closed) {
      shape.closePath();
    }

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

export default PolygonModel;
