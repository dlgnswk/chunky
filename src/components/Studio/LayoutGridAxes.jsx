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

      // X axis lines
      points.push(-size / 2, position, 0, size / 2, position, 0);
      // Y axis lines
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
      0, // X axis (red)
      0,
      0,
      0,
      0,
      size,
      0, // Y axis (green)
      0,
      0,
      0,
      0,
      0,
      size, // Z axis (blue)
    ];
    const colors = [
      1,
      0,
      0,
      1,
      1,
      0,
      0,
      1, // Red for X
      0,
      1,
      0,
      1,
      0,
      1,
      0,
      1, // Green for Y
      0,
      0,
      1,
      1,
      0,
      0,
      1,
      1, // Blue for Z
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

  const layout = useMemo(() => {
    const { width, depth } = canvasSize;
    const geometry = new THREE.PlaneGeometry(width, depth);
    const material = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    // 평면이 XY 평면에 놓이도록 회전하지 않음
    return mesh;
  }, [canvasSize]);

  return (
    <group position={[0, 0, 0]}>
      <primitive object={grid} />
      <primitive object={axes} />
      <primitive object={layout} />
    </group>
  );
}

export default LayoutGridAxes;
