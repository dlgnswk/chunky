import { useMemo } from 'react';
import { ExtrudeGeometry, Shape } from 'three';
import convert2Dto3D from '../../../utils/convert2Dto3D';

function CircleModel({ path, depth, canvasSize, fill, zPosition }) {
  const geometry = useMemo(() => {
    const shape = new Shape();

    const { radius, center } = path;
    const [centerX, centerY] = convert2Dto3D(center.x, center.y, 0, canvasSize);

    shape.absarc(centerX, centerY, radius, 0, Math.PI * 2, false);

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

export default CircleModel;
