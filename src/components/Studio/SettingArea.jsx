import React from 'react';
import useStore from '../../store/store';
import ModalButton from '../shared/Button/ModalButton';
import Logo from '../shared/Logo/Logo';

function SettingArea() {
  const {
    isModalOpened,
    setIsModalOpened,
    modalType,
    setModalType,
    setCanvasSize,
  } = useStore();

  const userName = 'leeraeroon';

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

  return (
    <div className="setting-area">
      <div className="main-logo">
        <Logo />
      </div>
      <div className="user-info">
        <span className="user-name">{userName},</span>
        <button className="logout-button">Logout</button>
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
