import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import useStore from '../../store/store';
import ModalButton from '../shared/Button/ModalButton';
import Logo from '../shared/Logo/Logo';
import { auth } from '../../services/firebase-config';

function SettingArea() {
  const {
    isModalOpened,
    setIsModalOpened,
    modalType,
    setModalType,
    setCanvasSize,
  } = useStore();

  const handleLayoutChange = (event) => {
    const selectedValue = event.target.value;
    switch (selectedValue) {
      case 'option1':
        setCanvasSize(210, 210, 210);
        break;
      case 'option2':
        setCanvasSize(220, 220, 250);
        break;
      case 'option3':
        setCanvasSize(300, 300, 300);
        break;
      case 'option4':
        setCanvasSize(400, 400, 450);
        break;
      default:
        break;
    }
  };

  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.displayName) {
      setUserName(userData.displayName);
    }
  }, []);

  const navigate = useNavigate();
  const { setAlertState } = useStore();

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
