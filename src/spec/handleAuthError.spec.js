import { describe, it, expect, vi } from 'vitest';
import handleAuthError from '../utils/handleAuthError';

describe('handleAuthError', () => {
  it('should handle "auth/invalid-email" error correctly', () => {
    const set = vi.fn();

    const error = { code: 'auth/invalid-email' };
    handleAuthError(error, set);

    expect(set).toHaveBeenCalledWith(expect.any(Function));

    const callback = set.mock.calls[0][0];
    const state = { alertState: [] };
    const newState = callback(state);
    expect(newState.alertState[0].message).toBe('invalid-email');
  });

  it('should handle "auth/invalid-credential" error correctly', () => {
    const set = vi.fn();

    const error = { code: 'auth/invalid-credential' };
    handleAuthError(error, set);

    expect(set).toHaveBeenCalledWith(expect.any(Function));

    const callback = set.mock.calls[0][0];
    const state = { alertState: [] };
    const newState = callback(state);
    expect(newState.alertState[0].message).toBe('invalid-credential');
  });

  it('should handle unknown errors with "failed-login" message', () => {
    const set = vi.fn();

    const error = { code: 'auth/unknown-error' };
    handleAuthError(error, set);

    expect(set).toHaveBeenCalledWith(expect.any(Function));

    const callback = set.mock.calls[0][0];
    const state = { alertState: [] };
    const newState = callback(state);
    expect(newState.alertState[0].message).toBe('failed-login');
  });
});
