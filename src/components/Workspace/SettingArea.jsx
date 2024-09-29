import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase-config';

import useStore from '../../store/store';

import ModalButton from '../shared/Button/ModalButton';
import Logo from '../shared/Logo/Logo';
import firestore from '../../services/firestore';
import ControlModal from '../shared/Modal/ControlModal';

const LAYOUT_OPTIONS = {
  option1: { width: 180, height: 180, depth: 180 },
  option2: { width: 210, height: 210, depth: 210 },
  option3: { width: 220, height: 220, depth: 250 },
  option4: { width: 300, height: 300, depth: 300 },
  option5: { width: 400, height: 400, depth: 450 },
};

function SettingArea() {
  const isModalOpened = useStore((state) => state.isModalOpened);
  const setIsModalOpened = useStore((state) => state.setIsModalOpened);
  const modalType = useStore((state) => state.modalType);
  const setModalType = useStore((state) => state.setModalType);
  const setCanvasSize = useStore((state) => state.setCanvasSize);
  const setAlertState = useStore((state) => state.setAlertState);
  const user = useStore((state) => state.user);
  const isFirstVisit = useStore((state) => state.isFirstVisit);
  const setIsFirstVisit = useStore((state) => state.setIsFirstVisit);
  const setLayers = useStore((state) => state.setLayers);
  const setLayerTitle = useStore((state) => state.setLayerTitle);

  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userData = user;
    if (userData && userData.displayName) {
      setUserName(userData.displayName);
    }

    const fetchData = async () => {
      const fetchedHistory = await firestore.getHistoryFromFirestore(user.uid);
      const fetchedLayer = await firestore.getLayersFromFirestore(user.uid);

      if (fetchedLayer.length !== 0 && fetchedHistory.length !== 0)
        setIsFirstVisit(false);

      try {
        const fetchedPresets = await firestore.getPresetsFromFirestore();

        setLayers(fetchedPresets[0].layers);
        setLayerTitle(fetchedPresets[0].name);
      } catch (error) {
        setAlertState('failed-load-preset');
      }
    };
    fetchData();
  }, [user, isFirstVisit, setIsFirstVisit]);

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
          <option value="option1">400 x 400 x 450</option>
          <option value="option2">300 x 300 x 300</option>
          <option value="option3">220 x 220 x 250</option>
          <option value="option4">210 x 210 x 210</option>
          <option value="option5">180 x 180 x 180</option>
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
      {isFirstVisit && <ControlModal setIsFirstVisit={setIsFirstVisit} />}
    </div>
  );
}

export default SettingArea;
