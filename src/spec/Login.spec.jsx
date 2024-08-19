import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Login from '../components/Login/Login';

const mockedLogin = vi.fn();
const mockedSignInWithGoogle = vi.fn();
const mockedNavigate = vi.fn();
const mockedSetAlertState = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockedNavigate,
}));

vi.mock('../../src/store/store', () => ({
  default: () => ({
    login: mockedLogin,
    setAlertState: mockedSetAlertState,
  }),
}));

vi.mock('react-firebase-hooks/auth', () => ({
  useSignInWithGoogle: () => [mockedSignInWithGoogle],
}));

describe('Login Component', () => {
  it('renders correctly', () => {
    render(<Login />);

    expect(screen.getByPlaceholderText('ID')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Google로 로그인')).toBeInTheDocument();
  });

  it('calls login function on form submit', async () => {
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('ID'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith('testuser', 'password');
    });

    expect(mockedNavigate).toHaveBeenCalledWith('/workspace');
  });

  it('calls Google sign in function on Google login button click', async () => {
    render(<Login />);

    fireEvent.click(screen.getByText('Google로 로그인'));

    await waitFor(() => {
      expect(mockedSignInWithGoogle).toHaveBeenCalled();
    });

    expect(mockedNavigate).toHaveBeenCalledWith('/workspace');
  });
});
