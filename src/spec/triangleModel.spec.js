import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import triangleModel from '../models/triangleModel';

vi.mock('../r3f-utils/convert2Dto3D', () => ({
  default: vi.fn((x, y, z) => [x, y, z]),
}));

describe('triangleModel', () => {
  it('should return a valid 3D model with geometry, material, and mesh for a valid triangle', () => {
    const path = {
      type: 'triangle',
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 100 },
      ],
    };
    const depth = 10;
    const canvasSize = { width: 500, height: 500 };
    const fill = '#00ffff';

    const result = triangleModel(path, depth, canvasSize, fill);

    expect(result).toHaveProperty('geometry');
    expect(result).toHaveProperty('material');
    expect(result).toHaveProperty('mesh');

    expect(result.geometry).toBeInstanceOf(THREE.ExtrudeGeometry);
    expect(result.material).toBeInstanceOf(THREE.MeshPhongMaterial);
    expect(result.mesh).toBeInstanceOf(THREE.Mesh);

    expect(result.material.color).toEqual(new THREE.Color(fill));
  });

  it('should return null if the path is not a valid triangle', () => {
    const invalidPaths = [
      { type: 'triangle', points: [{ x: 0, y: 0 }] }, // Not enough points
      {
        type: 'triangle',
        points: [
          { x: 0, y: 0 },
          { x: 50, y: 50 },
        ],
      }, // Not enough points
      {
        type: 'otherType',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 50, y: 100 },
        ],
      }, // Incorrect type
    ];

    const depth = 10;
    const canvasSize = { width: 500, height: 500 };
    const fill = '#00ffff';

    invalidPaths.forEach((path) => {
      const result = triangleModel(path, depth, canvasSize, fill);
      expect(result).toBeNull();
    });
  });
});
