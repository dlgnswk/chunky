import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileButton from '../components/shared/Button/FileButton';
import useStore from '../../src/store/store';

vi.mock('../../src/store/store');

describe('FileButton Component', () => {
  it('should render correctly and handle click event for "Save"', async () => {
    const mockSetAlertState = vi.fn();
    const mockSaveCurrentWork = vi.fn().mockResolvedValue();

    useStore.mockImplementation(() => ({
      setAlertState: mockSetAlertState,
      layerList: [{ id: 1 }],
      exportToSTL: vi.fn(),
      saveCurrentWork: mockSaveCurrentWork,
      saveAsPreset: vi.fn(),
    }));

    render(<FileButton text="Save" />);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockSaveCurrentWork).toHaveBeenCalledTimes(1);
      expect(mockSetAlertState).toHaveBeenCalledWith('success-save');
    });
  });
});
