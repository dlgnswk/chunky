import { render, screen } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Welcome from '../../src/components/Welcome/Welcome';
import useStore from '../../src/store/store';

vi.mock('../../src/store/store', () => ({
  default: vi.fn(),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('Welcome Component', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it('should render the welcome message with user name', () => {
    const mockUser = { displayName: 'Test User' };
    useStore.mockReturnValue(mockUser);

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>,
    );

    const welcomeMessage = screen.getByTestId('welcome-message');
    expect(welcomeMessage.textContent).toBe('Test User 님, 환영해요!');
  });

  it('should render default welcome message when user is not present', () => {
    useStore.mockReturnValue(null);

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>,
    );

    const welcomeMessage = screen.getByTestId('welcome-message');
    expect(welcomeMessage.textContent).toBe(' 님, 환영해요!');
  });
});
