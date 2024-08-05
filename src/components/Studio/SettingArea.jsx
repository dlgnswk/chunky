import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase-config';

import useStore from '../../store/store';

import ModalButton from '../shared/Button/ModalButton';
import Logo from '../shared/Logo/Logo';

const LAYOUT_OPTIONS = {
  option1: { width: 180, height: 180, depth: 180 },
  option2: { width: 210, height: 210, depth: 210 },
  option3: { width: 220, height: 220, depth: 250 },
  option4: { width: 300, height: 300, depth: 300 },
  option5: { width: 400, height: 400, depth: 450 },
};

function SettingArea() {
  const {
    isModalOpened,
    setIsModalOpened,
    modalType,
    setModalType,
    setCanvasSize,
    setAlertState,
    user,
  } = useStore();

  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userData = user;
    if (userData && userData.displayName) {
      setUserName(userData.displayName);
    }
  }, []);

  const navigate = useNavigate();

  const handleLayoutChange = (event) => {
    const selectedValue = event.target.value;
    const layout = LAYOUT_OPTIONS[selectedValue];

    if (layout) {
      setCanvasSize(layout.width, layout.height, layout.depth);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await signOut(auth);
      setAlertState('success-logout');
      navigate('/login');
    } catch (error) {
      setAlertState('failed-logout');
    }
  };

  return (
    <div className="setting-area">
      <div className="main-logo">
        <Logo />
      </div>
      <div className="user-info">
        <span className="user-name">{userName} 님,</span>
        <button className="logout-button" onClick={handleLogoutClick}>
          Logout
        </button>
      </div>
      <div className="layout-setting">
        <span>Layout</span>
        <select className="layout-select" onChange={handleLayoutChange}>
          <option value="option1">180 x 180 x 180</option>
          <option value="option2">210 x 210 x 210</option>
          <option value="option3">220 x 220 x 250</option>
          <option value="option4">300 x 300 x 300</option>
          <option value="option5">400 x 400 x 450</option>
        </select>
      </div>
      <ModalButton
        text="Preset"
        isModalOpened={isModalOpened}
        setIsModalOpened={setIsModalOpened}
        modalType={modalType}
        setModalType={setModalType}
      />
      <ModalButton
        text="History"
        isModalOpened={isModalOpened}
        setIsModalOpened={setIsModalOpened}
        modalType={modalType}
        setModalType={setModalType}
      />
    </div>
  );
}

export default SettingArea;
