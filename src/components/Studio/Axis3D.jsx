import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

import * as THREE from 'three';

function Axis3D({ size = 1, lineWidth = 3 }) {
  const ref = useRef();

  const axes = useMemo(() => {
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      linewidth: lineWidth,
    });
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(size, 0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, size, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, size),
    ];
    const colors = [
      new THREE.Color(0xff0000),
      new THREE.Color(0xff0000),
      new THREE.Color(0x00ff00),
      new THREE.Color(0x00ff00),
      new THREE.Color(0x0000ff),
      new THREE.Color(0x0000ff),
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(
        colors.flatMap((c) => c.toArray()),
        3,
      ),
    );

    return new THREE.LineSegments(geometry, material);
  }, [size, lineWidth]);

  useFrame(() => {
    if (ref.current) {
      ref.current.copy(axes);
    }
  });

  return <primitive object={axes} ref={ref} />;
}

export default Axis3D;
