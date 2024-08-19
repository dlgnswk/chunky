import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SettingArea from '../components/Workspace/SettingArea';
import useStore from '../../src/store/store';
import { signOut } from 'firebase/auth';

vi.mock('../../src/store/store');
vi.mock('firebase/auth');

describe('SettingArea', () => {
  beforeEach(() => {
    useStore.mockReturnValue({
      isModalOpened: false,
      setIsModalOpened: vi.fn(),
      modalType: '',
      setModalType: vi.fn(),
      setCanvasSize: vi.fn(),
      setAlertState: vi.fn(),
      user: { displayName: 'Test User' },
    });

    signOut.mockResolvedValue();
  });

  const renderWithRouter = (ui) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  test('renders user information correctly', () => {
    renderWithRouter(<SettingArea />);
    expect(screen.getByText('Test User 님,')).toBeInTheDocument();
  });

  test('calls setCanvasSize on layout change', () => {
    renderWithRouter(<SettingArea />);
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'option2' } });
    expect(useStore().setCanvasSize).toHaveBeenCalledWith(210, 210, 210);
  });

  test('calls logout function when logout button is clicked', async () => {
    renderWithRouter(<SettingArea />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(useStore().setAlertState).toHaveBeenCalledWith('success-logout');
    });
  });
});
