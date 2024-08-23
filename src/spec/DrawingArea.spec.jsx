import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DrawingArea from '../components/Workspace/DrawingArea';
import Canvas2D from '../components/Workspace/Canvas2D';
import Canvas3D from '../components/Workspace/Canvas3D';

vi.mock('../components/Workspace/Canvas2D');
vi.mock('../components/Workspace/Canvas3D');

describe('DrawingArea', () => {
  it('renders without crashing', () => {
    const { container } = render(<DrawingArea />);
    expect(container).toBeDefined();
  });

  it('renders Canvas2D and Canvas3D components', () => {
    render(<DrawingArea />);

    expect(Canvas2D).toHaveBeenCalled();
    expect(Canvas3D).toHaveBeenCalled();
  });
});
