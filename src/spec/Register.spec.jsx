import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../components/Register/Register';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('../../store/store', () => ({
  default: () => ({
    registerUser: vi.fn(),
    setAlertState: vi.fn(),
  }),
}));

describe('Register Component', () => {
  it('allows user to input email', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>,
    );

    const emailInput = screen.getByPlaceholderText('email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput.value).toBe('test@example.com');
  });
});
