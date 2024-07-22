import { v4 as uuidv4 } from 'uuid';

function handleAuthError(error, set) {
  let message;
  switch (error.code) {
    case 'auth/invalid-email':
      message = 'invalid-email';
      break;
    case 'auth/invalid-credential':
      message = 'invalid-credential';
      break;
    default:
      message = 'failed-login';
      break;
  }
  set((state) => ({
    alertState: [...state.alertState, { id: uuidv4(), message }],
  }));
}

export default handleAuthError;
