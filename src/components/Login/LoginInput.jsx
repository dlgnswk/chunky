import PropTypes from 'prop-types';

function LoginInput({ text }) {
  return <input className="login-input" placeholder={text}></input>;
}

export default LoginInput;

LoginInput.propTypes = {
  text: PropTypes.string.isRequired,
};
