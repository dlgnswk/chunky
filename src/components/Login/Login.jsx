import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { noop } from 'lodash';
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebase-config';

import MainButton from '../shared/Button/MainButton';
import Container from '../shared/Container/Container';
import Logo from '../shared/Logo/Logo';
import LoginInput from './LoginInput';

import useStore from '../../store/store';

import './style.scss';

function Login() {
  const navigate = useNavigate();
  const { login, setAlertState } = useStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [signInWithGoogle] = useSignInWithGoogle(auth);

  const onSubmit = async (data) => {
    const { id, password } = data;
    await login(id, password);

    navigate('/workspace');
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/workspace');
    } catch (error) {
      setAlertState('failed-login');
    }
  };

  return (
    <>
      <div className="login-logo">
        <Logo />
        <p>쉽고 편한 3D 라이프</p>
      </div>
      <form className="wrapper" onSubmit={handleSubmit(onSubmit)}>
        <Container>
          <div className="input-container">
            <LoginInput
              placeholder="ID"
              type="id"
              feature={{
                ...register('id', {
                  required: '아이디를 입력해주세요.',
                  minLength: {
                    value: 3,
                    message: '아이디는 3글자 이상이에요.',
                  },
                }),
              }}
              error={errors.id || {}}
              autocomplete="userid"
            />
            <LoginInput
              placeholder="Password"
              type="password"
              feature={{
                ...register('password', {
                  required: '비밀번호를 입력해주세요.',
                  minLength: {
                    value: 6,
                    message: '비밀번호는 6글자 이상이에요.',
                  },
                }),
              }}
              error={errors.password || {}}
              autocomplete="password"
            />
          </div>
          <MainButton text="Login" type="submit" handleClick={noop} />
          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleLogin}
          >
            <img
              alt="google login"
              src="/images/google.png"
              className="social-login-icon"
            />
            <span className="social-login-text">Google로 로그인</span>
          </button>
          <button className="text-button" onClick={() => navigate('/register')}>
            <span>회원이 아니세요? </span>
            <span className="text-button-title">JOIN</span>
          </button>
        </Container>
      </form>
    </>
  );
}

export default Login;
