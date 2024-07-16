import { IoCloseOutline } from 'react-icons/io5';
import './style.scss';
import { useState } from 'react';

function Modal({ text, setIsModalOpened }) {
  const presetList = [
    { title: '빌라 사보아', src: 'src/assets/images/presetDefault.png' },
    { title: '구겐하임', src: 'src/assets/images/presetDefault.png' },
    { title: '오페라 하우스', src: 'src/assets/images/presetDefault.png' },
    { title: '록펠러 센터', src: 'src/assets/images/presetDefault.png' },
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
