function RegisterInput({ title, placeholder }) {
  return (
    <>
      <p className="input-title">{title}</p>
      <input className="input-content" placeholder={placeholder} />
    </>
  );
}

export default RegisterInput;
