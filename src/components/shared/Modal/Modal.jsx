import { useState, useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../services/firebase-config';

import useStore from '../../../store/store';

import firestore from '../../../services/firestore';
import './style.scss';

function Modal({ text, setIsModalOpened }) {
  const getImgPath = (presetName) => {
    switch (presetName) {
      case '로고':
        return 'images/presetDefault01.png';
      case '남산타워':
        return 'images/presetDefault02.png';
      case '키링':
        return 'images/presetDefault03.png';
      default:
        return '';
    }
  };

  const [presets, setPresets] = useState([]);
  const [history, setHistory] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { user, setLayers, setAlertState, setLayerTitle } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      if (text === 'Preset') {
        const fetchedPresets = await firestore.getPresetsFromFirestore();
        setPresets(fetchedPresets);
      } else if (user && text === 'History') {
        const fetchedHistory = await firestore.getHistoryFromFirestore(
          user.uid,
        );
        setHistory(fetchedHistory);
      }
    };
    fetchData();
  }, [user, text]);

  const handleCloseClick = () => {
    setIsModalOpened(false);
  };

  const handlePresetClick = async (preset) => {
    try {
      setLayers(preset.layers);
      setIsModalOpened(false);
      setLayerTitle(preset.name);
    } catch (error) {
      setAlertState('failed-load-preset');
    }
  };

  const handleHistoryClick = async (prevWork) => {
    try {
      const historyDocRef = doc(db, 'users', user.uid, 'history', prevWork.id);
      const historyDocSnap = await getDoc(historyDocRef);

      if (historyDocSnap.exists()) {
        const historyData = historyDocSnap.data();
        const layersToLoad = historyData.layers;

        const layersRef = collection(db, 'users', user.uid, 'layers');
        const currentLayersSnap = await getDocs(layersRef);

        const batch = writeBatch(db);
        currentLayersSnap.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
        });

        layersToLoad.forEach((layer) => {
          const newLayerRef = doc(collection(db, 'users', user.uid, 'layers'));
          batch.set(newLayerRef, layer);
        });

        await batch.commit();

        setLayers(layersToLoad);
        setIsModalOpened(false);
        setLayerTitle(prevWork.layerTitle);
      } else {
        setAlertState('faild-load-history');
      }
    } catch (error) {
      setAlertState('faild-load-history');
    }
  };

  return (
    <div className="modal-window">
      <div className="modal-header">
        <span className="modal-title">{text}</span>
        <button
          className="modal-close-button"
          aria-label="modal close button"
          onClick={handleCloseClick}
        >
          <IoCloseOutline />
        </button>
      </div>
      <div className="modal-content">
        {text === 'Preset' &&
          presets.map((preset) => (
            <button
              className="card"
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
            >
              <div className="card-image">
                <img src={getImgPath(preset.name)} alt="preset" />
              </div>
              <p className="card-title">{preset.name}</p>
            </button>
          ))}
        {text === 'History' && history.length > 0
          ? history.map((prevWork, index) => (
              <button
                className="card"
                key={prevWork.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleHistoryClick(prevWork)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleHistoryClick(prevWork);
                  }
                }}
              >
                <div className="card-image">
                  <img
                    src={
                      hoveredIndex === index
                        ? 'images/chunkyHoverDefault.png'
                        : 'images/chunkyDefault.png'
                    }
                    alt="history"
                  />
                </div>
                <p className="card-title">{prevWork.layerTitle}</p>
              </button>
            ))
          : text === 'History' && (
              <p className="no-history-message">저장된 히스토리가 없습니다.</p>
            )}
      </div>
    </div>
  );
}

export default Modal;
