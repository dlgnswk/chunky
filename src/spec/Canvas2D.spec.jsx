import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Canvas2D from '../components/Workspace/Canvas2D';

vi.mock('../../src/store/store', () => ({
  default: vi.fn(() => ({
    drawingToolList: [
      { id: 'rectangle', icon: () => <div>Rectangle Icon</div> },
      { id: 'circle', icon: () => <div>Circle Icon</div> },
    ],
    canvasSize: { width: 500, height: 500 },
    addPathToLayer: vi.fn(),
    selectedLayer: null,
    loadLayers: vi.fn(),
    user: { uid: 'test-user' },
    layerList: [],
    initializeLayerListener: vi.fn(),
    setLayerList: vi.fn(),
    setCameraView: vi.fn(),
    addLayer: vi.fn(),
    setAlertState: vi.fn(),
  })),
}));

describe('Canvas2D Component', () => {
  it('renders ToolBox and changes selectedTool on click', () => {
    render(<Canvas2D />);

    const rectangleToolButton = screen.getByLabelText('rectangle');
    const circleToolButton = screen.getByLabelText('circle');

    expect(rectangleToolButton).not.toHaveClass('selected');
    expect(circleToolButton).not.toHaveClass('selected');

    fireEvent.click(rectangleToolButton);
    expect(rectangleToolButton).toHaveClass('selected');

    fireEvent.click(circleToolButton);
    expect(circleToolButton).toHaveClass('selected');
    expect(rectangleToolButton).not.toHaveClass('selected');
  });
});
