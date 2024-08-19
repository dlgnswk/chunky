import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../components/Login/Login';

// Mock the dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../store/store', () => ({
  default: () => ({
    login: vi.fn(),
    setAlertState: vi.fn(),
  }),
}));

vi.mock('react-firebase-hooks/auth', () => ({
  useSignInWithGoogle: () => [vi.fn()],
}));

describe('Login Component', () => {
  it('renders login form elements', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );

    // Check if the main elements are rendered
    expect(screen.getByText('쉽고 편한 3D 라이프')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ID')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Google로 로그인')).toBeInTheDocument();
    expect(screen.getByText('JOIN')).toBeInTheDocument();
  });
});
