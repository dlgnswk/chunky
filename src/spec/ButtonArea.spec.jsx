import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import useStore from '../../src/store/store';
import ButtonArea from '../components/Workspace/ButtonArea';
import FileButton from '../components/shared/Button/FileButton';

vi.mock('../../src/store/store');
vi.mock('../components/shared/Button/FileButton');

describe('ButtonArea', () => {
  it('renders Export and Save buttons for normal user', () => {
    const mockExport = vi.fn();
    const mockSave = vi.fn();
    const mockSavePreset = vi.fn();

    useStore.mockReturnValue({
      exportLayersToSTL: mockExport,
      saveCurrentWork: mockSave,
      saveAsPreset: mockSavePreset,
      user: { email: 'user@chunky.com' },
    });

    FileButton.mockImplementation(({ text, onClick }) => (
      <button onClick={onClick}>{text}</button>
    ));

    render(<ButtonArea />);

    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.queryByText('Preset')).not.toBeInTheDocument();
  });

  it('renders Preset button if the user is an admin', () => {
    const mockExport = vi.fn();
    const mockSave = vi.fn();
    const mockSavePreset = vi.fn();

    useStore.mockReturnValue({
      exportLayersToSTL: mockExport,
      saveCurrentWork: mockSave,
      saveAsPreset: mockSavePreset,
      user: { email: 'admin@chunky.com' },
    });

    FileButton.mockImplementation(({ text, onClick }) => (
      <button onClick={onClick}>{text}</button>
    ));

    render(<ButtonArea />);

    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Preset')).toBeInTheDocument();
  });

  it('calls appropriate functions when buttons are clicked', () => {
    const mockExport = vi.fn();
    const mockSave = vi.fn();
    const mockSavePreset = vi.fn();

    useStore.mockReturnValue({
      exportLayersToSTL: mockExport,
      saveCurrentWork: mockSave,
      saveAsPreset: mockSavePreset,
      user: { email: 'user@chunky.com' },
    });

    FileButton.mockImplementation(({ text, onClick }) => (
      <button onClick={onClick}>{text}</button>
    ));

    render(<ButtonArea />);

    fireEvent.click(screen.getByText('Export'));
    expect(mockExport).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Save'));
    expect(mockSave).toHaveBeenCalled();

    if (screen.queryByText('Preset')) {
      fireEvent.click(screen.getByText('Preset'));
      expect(mockSavePreset).toHaveBeenCalled();
    }
  });
});
