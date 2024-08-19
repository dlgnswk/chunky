import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Canvas3D from '../components/Workspace/Canvas3D';

vi.mock('../../src/store/store', () => ({
  default: vi.fn(() => ({
    canvasSize: { width: 500, height: 500, depth: 500 },
    layerList: [],
    viewToolList: [
      { id: 'viewPerspective', icon: () => <div>Perspective Icon</div> },
      { id: 'viewFront', icon: () => <div>Front Icon</div> },
    ],
    setExportToSTL: vi.fn(),
    cameraPosition: { x: 0, y: 0, z: 500 },
    cameraTarget: { x: 0, y: 0, z: 0 },
    cameraUp: { x: 0, y: 1, z: 0 },
    setCameraView: vi.fn(),
  })),
}));

describe('Canvas3D Component', () => {
  it('renders ToolBox and changes selectedTool on click', () => {
    render(<Canvas3D />);

    const perspectiveToolButton = screen.getByLabelText('viewPerspective');
    const frontToolButton = screen.getByLabelText('viewFront');

    expect(perspectiveToolButton).toHaveClass('selected');
    expect(frontToolButton).not.toHaveClass('selected');

    fireEvent.click(frontToolButton);
    expect(frontToolButton).toHaveClass('selected');
    expect(perspectiveToolButton).not.toHaveClass('selected');
  });

  it('renders default logo when layerList is empty', () => {
    render(<Canvas3D />);

    const defaultLogo = screen.getByLabelText('cube-outline-icon');
    expect(defaultLogo).toBeInTheDocument();
  });
});
