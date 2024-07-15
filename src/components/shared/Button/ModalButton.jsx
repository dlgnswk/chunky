import { GoArrowUpRight } from 'react-icons/go';
import Modal from '../Modal/Modal';

function ModalButton({
  text,
  isModalOpened,
  setIsModalOpened,
  setModalType,
  modalType,
}) {
  const openModal = () => {
    setIsModalOpened((prev) => !prev);
    setModalType(text);
  };

  return (
    <div className="modal-container">
      <button className="modal-button" onClick={openModal}>
        <span className="modal-label">{text}</span>
        <div className="modal-icon">
          <GoArrowUpRight />
        </div>
      </button>
      {isModalOpened && modalType === text && (
        <Modal text={text} setIsModalOpened={setIsModalOpened} />
      )}
    </div>
  );
}

export default ModalButton;
