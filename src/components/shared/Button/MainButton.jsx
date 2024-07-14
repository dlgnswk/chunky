import './style.scss';

function MainButton({ text, type, handleClick }) {
  return (
    <button className="main-button" type={type} onClick={() => handleClick()}>
      {text}
    </button>
  );
}

export default MainButton;
