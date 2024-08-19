import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import Modal from '../components/shared/Modal/Modal';
import useStore from '../../src/store/store';

vi.mock('../../src/store/store');
vi.mock('../../src/services/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getPresetsFromFirestore: vi.fn(() =>
      Promise.resolve([{ id: '1', name: '로고', layers: [] }]),
    ),
    getHistoryFromFirestore: vi.fn(() =>
      Promise.resolve([{ id: '2', layerTitle: '기록1', layers: [] }]),
    ),
  };
});

describe('Modal Component', () => {
  const mockSetIsModalOpened = vi.fn();
  const mockSetLayers = vi.fn();
  const mockSetLayerTitle = vi.fn();
  const mockSetAlertState = vi.fn();

  beforeEach(() => {
    useStore.mockReturnValue({
      user: { uid: '123' },
      setLayers: mockSetLayers,
      setLayerTitle: mockSetLayerTitle,
      setAlertState: mockSetAlertState,
    });
  });

  it('calls handleCloseClick when close button is clicked', async () => {
    render(<Modal text="Preset" setIsModalOpened={mockSetIsModalOpened} />);

    const closeButton = screen.getByLabelText('modal close button');
    fireEvent.click(closeButton);

    expect(mockSetIsModalOpened).toHaveBeenCalledWith(false);
  });
});
