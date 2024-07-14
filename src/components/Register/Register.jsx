import MainButton from '../shared/Button/MainButton';
import RegisterInput from './RegisterInput';

import './style.scss';

function Register() {
  return (
    <div className="wrapper">
      <div className="container">
        <p className="register-form-title">회원 정보를 입력해주세요.</p>
        <form className="register-form">
          <div className="register-section">
            <RegisterInput title="아이디" placeholder="ID" />
            <RegisterInput title="비밀번호" placeholder="Password" />
            <RegisterInput title="비밀번호 재입력" placeholder="Password" />
          </div>
          <div className="register-section">
            <RegisterInput title="유저 이름" placeholder="User name" />
            <RegisterInput title="이메일" placeholder="Email" />
          </div>
          <MainButton text="Join" />
        </form>
      </div>
    </div>
  );
}

export default Register;
