import PropTypes from 'prop-types';

function RegisterInput({
  title,
  placeholder,
  type,
  feature,
  error,
  autocomplete,
}) {
  return (
    <div className="input-container">
      <label className="input-title" htmlFor={title}>
        {title}
      </label>
      <input
        className="input-content"
        id={title}
        type={type}
        placeholder={placeholder}
        {...feature}
        autoComplete={autocomplete}
      />
      <p className="error-message">{error ? error.message : ' '}</p>
    </div>
  );
}

export default RegisterInput;

RegisterInput.propTypes = {
  title: PropTypes.string.isRequired,
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
