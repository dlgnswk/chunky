import { useState, useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

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
  const { user } = useStore();

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
  }, [user, text, firestore.getHistoryFromFirestore]);

  const handleCloseClick = () => {
    setIsModalOpened(false);
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
          presetList.map((preset) => {
            return (
              <div className="card" key={preset.title}>
                <div className="card-image">
                  <img src={preset.src} alt="preset" />
                </div>
                <p className="card-title">{preset.title}</p>
              </div>
            );
          })}
        {text === 'History' &&
          history.map((save, index) => {
            return (
              <div
                className="card"
                key={save.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
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
                <p className="card-title">{save.layerTitle}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Modal;
