import PropTypes from 'prop-types';

function LoginInput({ placeholder, type, feature, error, autocomplete }) {
  return (
    <div>
      <input
        className="login-input"
        type={type}
        placeholder={placeholder}
        {...feature}
        autoComplete={autocomplete}
      ></input>
      <p className="error-message">{error ? error.message : ' '}</p>
    </div>
  );
}

export default LoginInput;

LoginInput.propTypes = {
  placeholder: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  feature: PropTypes.shape({
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    ref: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({
        current: PropTypes.instanceOf(Element),
      }),
    ]),
  }).isRequired,
  error: PropTypes.shape({
    type: PropTypes.string,
    message: PropTypes.string,
    ref: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({
        current: PropTypes.instanceOf(Element),
      }),
    ]),
  }).isRequired,
  autocomplete: PropTypes.string.isRequired,
};
