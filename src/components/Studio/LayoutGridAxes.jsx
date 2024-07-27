import React, { useMemo } from 'react';
import * as THREE from 'three';
import useStore from '../../store/store';

function LayoutGridAxes() {
  const { canvasSize } = useStore();

  const grid = useMemo(() => {
    const { width, depth } = canvasSize;
    const size = Math.max(width, depth);
    const divisions = 20;
    const step = size / divisions;

    const points = [];
    const colors = [];
    const color = new THREE.Color(0x555555);

    for (let i = 0; i <= divisions; i += 1) {
      const position = i * step - size / 2;

      points.push(-size / 2, position, 0, size / 2, position, 0);
      points.push(position, -size / 2, 0, position, size / 2, 0);

      const alpha = i === 0 || i === divisions ? 1 : 0.5;
      for (let j = 0; j < 4; j += 1) {
        color.toArray(colors, colors.length);
        colors.push(alpha);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(points, 3),
    );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      linewidth: 2,
    });

    return new THREE.LineSegments(geometry, material);
  }, [canvasSize]);

  const axes = useMemo(() => {
    const { width, height, depth } = canvasSize;
    const size = Math.max(width, height, depth) / 2;
    const points = [
      0,
      0,
      0,
      size,
      0,
      0,
      0,
      0,
      0,
      0,
      -size,
      0,
      0,
      0,
      0,
      0,
      0,
      size,
    ];
    const colors = [
      1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1,
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(points, 3),
    );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      linewidth: 3,
    });

    return new THREE.LineSegments(geometry, material);
  }, [canvasSize]);

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <primitive object={grid} />
      <primitive object={axes} />
    </group>
  );
}

export default LayoutGridAxes;
