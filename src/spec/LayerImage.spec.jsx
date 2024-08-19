import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LayerImage from '../components/Workspace/LayerImage';
import useStore from '../../src/store/store';

vi.mock('../../src/store/store');

describe('LayerImage Component', () => {
  it('should handle opacity change correctly', async () => {
    const updateLayer = vi.fn();
    const updateLayerInFirestore = vi.fn();
    useStore.mockReturnValue({
      updateLayer,
      removeLayer: vi.fn(),
      updateLayerInFirestore,
    });

    const layer = { opacity: 0.5, width: 100, height: 100 };
    const { getByRole, getByText } = render(
      <LayerImage layer={layer} index={0} name="Test Layer" visible={true} />,
    );

    const opacityInput = getByRole('slider');
    fireEvent.change(opacityInput, { target: { value: '0.8' } });

    expect(updateLayer).toHaveBeenCalledWith(0, { opacity: 0.8 });

    fireEvent.mouseUp(opacityInput);

    expect(updateLayerInFirestore).toHaveBeenCalledWith({
      opacity: 0.8,
      width: 100,
      height: 100,
    });

    expect(getByText('80%')).toBeTruthy();
  });
});
