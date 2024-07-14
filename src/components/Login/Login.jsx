import { useNavigate } from 'react-router-dom';
import MainButton from '../shared/Button/MainButton';
import Container from '../shared/Container/Container';
import Logo from '../shared/Logo/Logo';
import LoginInput from './LoginInput';

import './style.scss';

function Login() {
  const navigate = useNavigate();

  return (
    <>
      <div className="login-logo">
        <Logo />
        <p>쉽고 편한 3D 라이프</p>
      </div>
      <div className="wrapper">
        <Container>
          <div className="input-container">
            <LoginInput text="ID" />
            <LoginInput text="Password" />
          </div>
          <MainButton text="Login" />
          <button className="text-button" onClick={() => navigate('/register')}>
            <span>회원이 아니세요? </span>
            <span className="text-button-title">Join</span>
          </button>
        </Container>
      </div>
    </>
  );
}

export default Login;
