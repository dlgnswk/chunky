import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MainButton from '../shared/Button/MainButton';
import Logo from '../shared/Logo/Logo';

import './style.scss';

function Welcome() {
  const navigate = useNavigate();
  const goMain = () => {
    navigate('/');
  };

  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.displayName) {
      setUserName(userData.displayName);
    }
  }, []);

  return (
    <div className="container">
      <div className="welcome-image-container">
        <img
          className="welcome-image"
          src="images/welcomeChunky.png"
          alt="welcome chunky"
        />
      </div>
      <p className="welcome-message">{userName} 님, 환영해요!</p>
      <div className="intro-message">
        <div className="intro-logo horizon-text">
          <Logo />
        </div>
        <div className="horizon-text">에서 쉽고 편한</div>
        <div>3D 라이프를 경험해 보세요!</div>
      </div>
      <MainButton text="Start" type="button" handleClick={goMain} />
    </div>
  );
}

export default Welcome;
