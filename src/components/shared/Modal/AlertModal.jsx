import { useEffect } from 'react';

function AlertModal({ id, message, onClose }) {
  let displayMessage;

  switch (message) {
    case 'layer-name':
      displayMessage = '레이어 이름은 중복될 수 없어요.';
      break;
    case 'no-layer':
      displayMessage = '레이어를 생성해 주세요.';
      break;
    case 'invalid-height':
      displayMessage =
        '레이어 전체의 높이는 레이아웃의 최대 높이보다 클 수 없어요.';
      break;
    case 'invalid-email':
      displayMessage = '잘못된 이메일이에요.';
      break;
    case 'success-register':
      displayMessage = '회원가입에 성공했어요.';
      break;
    case 'failed-register':
      displayMessage = '회원가입에 실패했어요.';
      break;
    case 'failed-login':
      displayMessage = '로그인에 실패했어요. 다시 시도해 주세요.';
      break;
    case 'invalid-credential':
      displayMessage = '잘못된 비밀번호에요.';
      break;
    case 'exist-email':
      displayMessage = '이미 존재하는 이메일이에요.';
      break;
    case 'success-login':
      displayMessage = '로그인했어요. 환영해요!';
      break;
    case 'success-logout':
      displayMessage = '로그아웃했어요. 다음에 만나요!';
      break;
    case 'failed-logout':
      displayMessage = '로그아웃에 실패했어요.';
      break;
    default:
      displayMessage = '알 수 없는 오류가 발생했어요.';
      break;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 2000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className="alert-container">
      <div className="alert-content">{displayMessage}</div>
    </div>
  );
}

export default AlertModal;
