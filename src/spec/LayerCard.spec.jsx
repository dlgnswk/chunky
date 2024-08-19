import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LayerCard from '../components/Workspace/LayerCard';
import useStore from '../../src/store/store';

vi.mock('../../src/store/store', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('LayerCard Component', () => {
  it('renders correctly and handles button clicks', () => {
    const mockUpdateLayer = vi.fn();
    const mockRemoveLayer = vi.fn();
    const mockSetAlertState = vi.fn();
    const mockUpdateLayerInFirestore = vi.fn().mockResolvedValue(true);
    const mockCopyLayer = vi.fn();

    const layer = {
      id: '1',
      name: 'Layer 1',
      index: 0,
      height: 100,
      zIndex: 1,
      visible: true,
      fill: '#ffffff',
    };

    useStore.mockReturnValue({
      updateLayer: mockUpdateLayer,
      removeLayer: mockRemoveLayer,
      setAlertState: mockSetAlertState,
      updateLayerInFirestore: mockUpdateLayerInFirestore,
      copyLayer: mockCopyLayer,
    });

    render(
      <LayerCard
        layer={layer}
        name={layer.name}
        index={layer.index}
        height={layer.height}
        zIndex={layer.zIndex}
        visible={layer.visible}
        fill={layer.fill}
        selectLayer={null}
        handleSelectClick={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue(layer.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(layer.height)).toBeInTheDocument();
    expect(screen.getByDisplayValue(layer.zIndex)).toBeInTheDocument();
    expect(screen.getByDisplayValue(layer.fill)).toBeInTheDocument();

    const visibleButton = screen.getByTestId('layer-visible-button');
    fireEvent.click(visibleButton);
    expect(mockUpdateLayer).toHaveBeenCalledWith(layer.index, {
      visible: false,
    });

    const nameInput = screen.getByDisplayValue(layer.name);
    fireEvent.change(nameInput, { target: { value: 'New Layer Name' } });

    const heightInput = screen.getByDisplayValue(layer.height);
    fireEvent.change(heightInput, { target: { value: '200' } });

    const copyButton = screen.getByRole('button', {
      name: /layer copy button/i,
    });
    fireEvent.click(copyButton);
    expect(mockCopyLayer).toHaveBeenCalledWith(layer.id);

    const removeButton = screen.getByRole('button', {
      name: /layer remove button/i,
    });
    fireEvent.click(removeButton);
    expect(mockRemoveLayer).toHaveBeenCalledWith(layer.index);
  });
});
