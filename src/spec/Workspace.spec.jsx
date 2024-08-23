import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Workspace from '../components/Workspace/Workspace';
import SettingArea from '../components/Workspace/SettingArea';
import LayerArea from '../components/Workspace/LayerArea';
import DrawingArea from '../components/Workspace/DrawingArea';
import ButtonArea from '../components/Workspace/ButtonArea';

vi.mock('../components/Workspace/SettingArea');
vi.mock('../components/Workspace/LayerArea');
vi.mock('../components/Workspace/DrawingArea');
vi.mock('../components/Workspace/ButtonArea');

describe('Workspace', () => {
  it('renders without crashing', () => {
    const { container } = render(<Workspace />);
    expect(container).toBeDefined();
  });

  it('renders SettingArea, LayerArea, DrawingArea, and ButtonArea components', () => {
    render(<Workspace />);

    expect(SettingArea).toHaveBeenCalled();
    expect(LayerArea).toHaveBeenCalled();
    expect(DrawingArea).toHaveBeenCalled();
    expect(ButtonArea).toHaveBeenCalled();
  });
});
