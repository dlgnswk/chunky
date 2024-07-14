import MainButton from '../shared/Button/MainButton';
import Container from '../shared/Container/Container';
import Logo from '../shared/Logo/Logo';
import LoginInput from './LoginInput';

import './style.scss';

function Login() {
  return (
    <div className="wrapper">
      <div className="login-logo">
        <Logo />
        <p>쉽고 편한 3D 라이프</p>
      </div>
      <Container>
        <div className="input-container">
          <LoginInput text="ID" />
          <LoginInput text="Password" />
        </div>
        <MainButton text="Login" />
        <div className="text-button">
          <span>회원이 아니세요? </span>
          <span className="text-button-title">Join</span>
        </div>
      </Container>
    </div>
  );
}

export default Login;
