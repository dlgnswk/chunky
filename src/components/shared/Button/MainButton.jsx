import './style.scss';

function MainButton({ text, type }) {
  return (
    <button className="main-button" type={type}>
      {text}
    </button>
  );
}

export default MainButton;
