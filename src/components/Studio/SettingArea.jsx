import useStore from '../../store/store';

import ModalButton from '../shared/Button/ModalButton';
import Logo from '../shared/Logo/Logo';

function SettingArea() {
  const { isModalOpened, setIsModalOpened, modalType, setModalType } =
    useStore();

  const userName = 'leeraeroon';

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
        <select className="layout-select">
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
