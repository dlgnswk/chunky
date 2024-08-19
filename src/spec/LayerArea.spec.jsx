import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LayerArea from '../components/Workspace/LayerArea';
import useStore from '../../src/store/store';

vi.mock('../../src/store/store', () => ({
  default: vi.fn(),
}));

describe('LayerArea Component', () => {
  it('renders correctly and allows adding a layer', () => {
    const mockAddLayer = vi.fn();
    const mockSetSelectedLayer = vi.fn();
    const mockSetLayerTitle = vi.fn();

    useStore.mockReturnValue({
      layerList: [],
      addLayer: mockAddLayer,
      selectedLayer: null,
      setSelectedLayer: mockSetSelectedLayer,
      layerTitle: '',
      setLayerTitle: mockSetLayerTitle,
    });

    render(<LayerArea />);

    expect(screen.getByText('레이어를 추가하세요.')).toBeInTheDocument();

    const addButton = screen.getByLabelText('add layer');
    fireEvent.click(addButton);

    expect(mockAddLayer).toHaveBeenCalled();
  });
});
