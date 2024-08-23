import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LayoutGridAxes from '../components/Workspace/LayoutGridAxes';
import * as THREE from 'three';
import useStore from '../../src/store/store';

vi.mock('../../src/store/store');
vi.mock('three', async (importOriginal) => {
  const actualThree = await importOriginal('three');
  return {
    ...actualThree,
    WebGLRenderer: vi.fn(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
    })),
    LineSegments: vi.fn((geometry, material) => ({
      geometry,
      material,
    })),
  };
});

describe('LayoutGridAxes', () => {
  const mockCanvasSize = {
    width: 100,
    height: 100,
    depth: 100,
  };

  beforeEach(() => {
    useStore.mockReturnValue({
      canvasSize: mockCanvasSize,
    });
  });

  it('renders LayoutGridAxes without crashing', () => {
    const { container } = render(<LayoutGridAxes />);
    expect(container).toBeDefined();
  });

  it('grid and axes lines are created', () => {
    const lineSegmentsSpy = vi.spyOn(THREE, 'LineSegments');
    render(<LayoutGridAxes />);

    expect(lineSegmentsSpy).toHaveBeenCalledTimes(2);
  });
});
