import { GoArrowUpRight } from 'react-icons/go';
import Modal from '../Modal/Modal';
import useStore from '../../../store/store';

function ModalButton({ text }) {
  const { isModalOpened, setIsModalOpened, modalType, setModalType } =
    useStore();

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
