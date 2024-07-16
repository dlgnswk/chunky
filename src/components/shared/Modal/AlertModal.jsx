import { useEffect } from 'react';

function AlertModal({ id, message, onClose }) {
  let displayMessage;

  switch (message) {
    case 'layer-name':
      displayMessage = '레이어명은 중복될 수 없습니다.';
      break;
    case 'no-layer':
      displayMessage = '레이어를 생성해 주세요.';
      break;
    case 'invalid-height':
      displayMessage =
        '높이는 1보다 작거나 레이아웃의 최대 높이를 초과할 수 없습니다.';
      break;
    default:
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
