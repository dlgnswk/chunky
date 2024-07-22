import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import useStore from '../../store/store';
import ModalButton from '../shared/Button/ModalButton';
import Logo from '../shared/Logo/Logo';
import { auth } from '../../services/firebase-config';

const LAYOUT_OPTIONS = {
  option1: { width: 827, height: 827, depth: 827 },
  option2: { width: 866, height: 866, depth: 984 },
  option3: { width: 1181, height: 1181, depth: 1181 },
  option4: { width: 1575, height: 1575, depth: 1772 },
};

function SettingArea() {
  const {
    isModalOpened,
    setIsModalOpened,
    modalType,
    setModalType,
    setCanvasSize,
    setAlertState,
  } = useStore();

  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
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
          <option value="option1">210 x 210 x 210</option>
          <option value="option2">220 x 220 x 250</option>
          <option value="option3">300 x 300 x 300</option>
          <option value="option4">400 x 400 x 450</option>
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
        text="Chunky"
        isModalOpened={isModalOpened}
        setIsModalOpened={setIsModalOpened}
        modalType={modalType}
        setModalType={setModalType}
      />
    </div>
  );
}

export default SettingArea;
