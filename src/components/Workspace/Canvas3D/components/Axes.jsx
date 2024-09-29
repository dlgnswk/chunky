import * as THREE from 'three';
import useStore from '../../../../store/store';

function Axes() {
  const canvasSize = useStore((state) => state.canvasSize);
  const { width, height, depth } = canvasSize;
  const size = (Math.max(width, height, depth) / 2) * 1.3;

  return (
    <group>
      <arrowHelper
        args={[
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, 0, 0),
          size,
          0xff0000,
          size * 0.15,
          size * 0.03,
        ]}
      />
      <arrowHelper
        args={[
          new THREE.Vector3(0, -1, 0),
          new THREE.Vector3(0, 0, 0),
          size,
          0x00ff00,
          size * 0.15,
          size * 0.03,
        ]}
      />
      <arrowHelper
        args={[
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(0, 0, 0),
          size,
          0x0000ff,
          size * 0.15,
          size * 0.03,
        ]}
      />
    </group>
  );
}

export default Axes;
