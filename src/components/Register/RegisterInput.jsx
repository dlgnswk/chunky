function RegisterInput({ title, placeholder, type, feature, error }) {
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
      />
      <p className="error-message">{error ? error.message : ' '}</p>
    </div>
  );
}

export default RegisterInput;
