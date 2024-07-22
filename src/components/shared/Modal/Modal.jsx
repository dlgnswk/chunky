import { IoCloseOutline } from 'react-icons/io5';
import './style.scss';
import { useState } from 'react';

function Modal({ text, setIsModalOpened }) {
  const presetList = [
    { title: '에어팟 케이스', src: 'src/assets/images/presetDefault02.png' },
    { title: '카라비너', src: 'src/assets/images/presetDefault03.png' },
    { title: '키링', src: 'src/assets/images/presetDefault04.png' },
    { title: '건물 모형', src: 'src/assets/images/presetDefault01.png' },
  ];

  const chunkyList = [
    {
      title: '작업중1',
      src: 'src/assets/images/chunkyDefault.png',
      hoverSrc: 'src/assets/images/chunkyHoverDefault.png',
    },
    {
      title: '중간 수정본',
      src: 'src/assets/images/chunkyDefault.png',
      hoverSrc: 'src/assets/images/chunkyHoverDefault.png',
    },
    {
      title: '최초최최종수정',
      src: 'src/assets/images/chunkyDefault.png',
      hoverSrc: 'src/assets/images/chunkyHoverDefault.png',
    },
    {
      title: '작업중123123',
      src: 'src/assets/images/chunkyDefault.png',
      hoverSrc: 'src/assets/images/chunkyHoverDefault.png',
    },
    {
      title: '최종본',
      src: 'src/assets/images/chunkyDefault.png',
      hoverSrc: 'src/assets/images/chunkyHoverDefault.png',
    },
    {
      title: '최종수정본',
      src: 'src/assets/images/chunkyDefault.png',
      hoverSrc: 'src/assets/images/chunkyHoverDefault.png',
    },
    {
      title: '최종의최종수정본2',
      src: 'src/assets/images/chunkyDefault.png',
      hoverSrc: 'src/assets/images/chunkyHoverDefault.png',
    },
  ];

  const [hoveredIndex, setHoveredIndex] = useState(null);

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
        {text === 'Chunky' &&
          chunkyList.map((chunky, index) => {
            return (
              <div
                className="card"
                key={chunky.title}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="card-image">
                  <img
                    src={hoveredIndex === index ? chunky.hoverSrc : chunky.src}
                    alt="chunky"
                  />
                </div>
                <p className="card-title">{chunky.title}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Modal;
