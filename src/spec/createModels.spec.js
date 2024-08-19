import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import createModels from '../models/createModels';
import rectangleModel from '../models/rectangleModel';
import circleModel from '../models/circleModel';
import triangleModel from '../models/triangleModel';
import polygonModel from '../models/polygonModel';
import bezierModel from '../models/bezierModel';

// Mock the model functions to return a valid 3D model structure
const mock3DModel = {
  geometry: new THREE.BoxGeometry(),
  material: new THREE.MeshStandardMaterial(),
  mesh: new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial(),
  ),
};

vi.mock('../models/rectangleModel', () => ({
  default: vi.fn(() => mock3DModel),
}));
vi.mock('../models/circleModel', () => ({
  default: vi.fn(() => mock3DModel),
}));
vi.mock('../models/triangleModel', () => ({
  default: vi.fn(() => mock3DModel),
}));
vi.mock('../models/polygonModel', () => ({
  default: vi.fn(() => mock3DModel),
}));
vi.mock('../models/bezierModel', () => ({
  default: vi.fn(() => mock3DModel),
}));

describe('createModels', () => {
  const depth = 10;
  const canvasSize = { width: 500, height: 500 };
  const fill = '#123456';

  it('should call rectangleModel for rectangle type', () => {
    const path = { type: 'rectangle', x: 0, y: 0, width: 100, height: 50 };
    createModels(path, depth, canvasSize, false, fill);
    expect(rectangleModel).toHaveBeenCalledWith(path, depth, canvasSize, fill);
  });

  it('should call circleModel for circle type', () => {
    const path = { type: 'circle', radius: 50, center: { x: 100, y: 100 } };
    createModels(path, depth, canvasSize, false, fill);
    expect(circleModel).toHaveBeenCalledWith(path, depth, canvasSize, fill);
  });

  it('should call triangleModel for triangle type', () => {
    const path = {
      type: 'triangle',
      points: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 25, y: 50 },
      ],
    };
    createModels(path, depth, canvasSize, false, fill);
    expect(triangleModel).toHaveBeenCalledWith(path, depth, canvasSize, fill);
  });

  it('should call polygonModel for polyline type', () => {
    const path = {
      type: 'polyline',
      points: [
        { x: 0, y: 0 },
        { x: 50, y: 50 },
        { x: 100, y: 0 },
      ],
    };
    createModels(path, depth, canvasSize, false, fill);
    expect(polygonModel).toHaveBeenCalledWith(path, depth, canvasSize, fill);
  });

  it('should call bezierModel for bezier type', () => {
    const path = {
      type: 'bezier',
      curves: [
        { type: 'bezier', x1: 0, y1: 0, x2: 100, y2: 100, cx: 50, cy: 50 },
      ],
    };
    createModels(path, depth, canvasSize, false, fill);
    expect(bezierModel).toHaveBeenCalledWith(path, depth, canvasSize, fill);
  });

  it('should create a default box geometry for unknown type', () => {
    const path = { type: 'unknown' };
    const result = createModels(path, depth, canvasSize, false, fill);
    expect(result.geometry).toBeInstanceOf(THREE.BoxGeometry);
    expect(result.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(result.material.color).toEqual(new THREE.Color(fill));
  });

  it('should flip the model horizontally if flipHorizontally is true', () => {
    const path = { type: 'rectangle', x: 0, y: 0, width: 100, height: 50 };
    const result = createModels(path, depth, canvasSize, true, fill);

    expect(result.mesh.scale.x).toBeLessThan(0);
    expect(result.mesh.rotation.y).toBe(Math.PI);
  });
});
