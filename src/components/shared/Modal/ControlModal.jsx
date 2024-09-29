import { IoCloseOutline } from 'react-icons/io5';

function ControlModal({ setIsFirstVisit }) {
  const handleCloseClick = () => {
    setIsFirstVisit(false);
  };
  return (
    <div className="control-layer" onClick={handleCloseClick}>
      <div className="control-modal-window">
        <div className="control-modal-header">
          <p>
            <span className="control-modal-title">Chunky</span>
            <span className="control-modal-sub-title"> 가 처음이신가요?</span>
          </p>
          <button
            className="control-modal-close-button"
            aria-label="modal close button"
            onClick={handleCloseClick}
          >
            <IoCloseOutline />
          </button>
        </div>
        <div className="control-modal-content">
          <p>먼저 preset을 보여드릴게요, 구경해보세요!</p>
          <p>
            Chunky에서 사용하는 조작방법은 다음과 같아요.&nbsp;
            <a
              className="controls-readme-link"
              href="https://github.com/dlgnswk/chunky/blob/main/README.md#controls"
              target="_blank"
              rel="noreferrer"
            >
              여기
            </a>
            에서 다시 보실 수 있어요.
          </p>
          <img
            className="control-image"
            src="images/chunkyControls.png"
            alt="chunky controls"
          />
          <div>
            <p>
              <a
                className="controls-readme-link"
                href="https://github.com/dlgnswk/chunky"
                target="_blank"
                rel="noreferrer"
              >
                여기
              </a>
              에서 더 많은 정보를 확인해보세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ControlModal;
