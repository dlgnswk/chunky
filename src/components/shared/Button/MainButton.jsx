import PropTypes from 'prop-types';

import './style.scss';

function MainButton({ text, type, handleClick }) {
  return (
    <button className="main-button" type={type} onClick={() => handleClick()}>
      {text}
    </button>
  );
}

export default MainButton;

MainButton.propTypes = {
  text: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
};
