import { render, screen, waitFor } from '@testing-library/react';
import AlertModal from '../components/shared/Modal/AlertModal';
import { vi } from 'vitest';

describe('AlertModal', () => {
  it('displays the correct message and closes automatically after 2 seconds', async () => {
    const mockOnClose = vi.fn();
    const testMessage = 'success-logout';
    const testId = 'test-id';

    render(
      <AlertModal id={testId} message={testMessage} onClose={mockOnClose} />,
    );

    expect(
      screen.getByText('로그아웃했어요. 다음에 만나요!'),
    ).toBeInTheDocument();

    await waitFor(() => expect(mockOnClose).toHaveBeenCalledWith(testId), {
      timeout: 2500,
    });
  });

  it('displays default error message for unknown message type', () => {
    const mockOnClose = vi.fn();
    const testMessage = 'unknown-error';

    render(
      <AlertModal id="test-id" message={testMessage} onClose={mockOnClose} />,
    );

    expect(
      screen.getByText('알 수 없는 오류가 발생했어요.'),
    ).toBeInTheDocument();
  });
});
