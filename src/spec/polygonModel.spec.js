import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import polygonModel from '../models/polygonModel';

vi.mock('../r3f-utils/convert2Dto3D', () => ({
  default: vi.fn((x, y, z) => [x, y, z]),
}));

describe('polygonModel', () => {
  it('should return a valid 3D model with geometry, material, and mesh', () => {
    const path = {
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
      closed: true,
      type: 'polyline',
    };
    const depth = 10;
    const canvasSize = { width: 500, height: 500 };
    const fill = '#0000ff';

    const result = polygonModel(path, depth, canvasSize, fill);

    expect(result).toHaveProperty('geometry');
    expect(result).toHaveProperty('material');
    expect(result).toHaveProperty('mesh');

    expect(result.geometry).toBeInstanceOf(THREE.ExtrudeGeometry);
    expect(result.material).toBeInstanceOf(THREE.MeshPhongMaterial);
    expect(result.mesh).toBeInstanceOf(THREE.Mesh);

    expect(result.material.color).toEqual(new THREE.Color(fill));
    expect(result.mesh.position.z).toBe(depth / 2);
  });

  it('should return null if the path is not a valid polyline', () => {
    const invalidPaths = [
      { points: [], closed: true, type: 'polyline' },
      { points: [{ x: 0, y: 0 }], closed: true, type: 'polyline' },
      {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
        ],
        closed: true,
        type: 'otherType',
      },
    ];

    const depth = 10;
    const canvasSize = { width: 500, height: 500 };
    const fill = '#0000ff';

    invalidPaths.forEach((path) => {
      const result = polygonModel(path, depth, canvasSize, fill);
      expect(result).toBeNull();
    });
  });
});
