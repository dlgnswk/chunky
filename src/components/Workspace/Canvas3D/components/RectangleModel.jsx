import { useMemo } from 'react';
import { ExtrudeGeometry, Shape } from 'three';
import convert2Dto3D from '../utils/convert2Dto3D';

function RectangleModel({ path, depth, canvasSize, fill, zPosition }) {
  const geometry = useMemo(() => {
    const shape = new Shape();
    const { x, y, width, height } = path;

    const [x1, y1] = convert2Dto3D(x, y, 0, canvasSize);
    const [x2, y2] = convert2Dto3D(x + width, y + height, 0, canvasSize);

    shape.moveTo(x1, y1);
    shape.lineTo(x2, y1);
    shape.lineTo(x2, y2);
    shape.lineTo(x1, y2);
    shape.lineTo(x1, y1);

    return new ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
    });
  });

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

export default RectangleModel;
