import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Layer3D from '../components/Workspace/Layer3D';

describe('Layer3D Component', () => {
  it('should render nothing when layer or layer.path is invalid', () => {
    const { container } = render(
      <Layer3D layer={null} zPosition={5} thickness={2} />,
    );
    expect(container.firstChild).toBeNull();

    render(<Layer3D layer={{ path: [] }} zPosition={5} thickness={2} />);
    expect(container.firstChild).toBeNull();
  });
});
