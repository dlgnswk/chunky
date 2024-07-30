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
  const presetList = [
    { title: '에어팟 케이스', src: 'src/assets/images/presetDefault02.png' },
    { title: '카라비너', src: 'src/assets/images/presetDefault03.png' },
    { title: '키링', src: 'src/assets/images/presetDefault04.png' },
    { title: '건물 모형', src: 'src/assets/images/presetDefault01.png' },
  ];

  const [history, setHistory] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { user, setLayers, setAlertState, setLayerTitle } = useStore();

  useEffect(() => {
    const fetchHistory = async () => {
      if (user && text === 'History') {
        const fetchedHistory = await firestore.getHistoryFromFirestore(
          user.uid,
        );
        setHistory(fetchedHistory);
      }
    };
    fetchHistory();
  }, [user, text]);

  const handleCloseClick = () => {
    setIsModalOpened(false);
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
          presetList.map((preset) => (
            <div className="card" key={preset.title}>
              <div className="card-image">
                <img src={preset.src} alt="preset" />
              </div>
              <p className="card-title">{preset.title}</p>
            </div>
          ))}
        {text === 'History' &&
          history.map((prevWork, index) => (
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
                      ? 'src/assets/images/chunkyHoverDefault.png'
                      : 'src/assets/images/chunkyDefault.png'
                  }
                  alt="chunky"
                />
              </div>
              <p className="card-title">{prevWork.layerTitle}</p>
            </button>
          ))}
      </div>
    </div>
  );
}

export default Modal;
