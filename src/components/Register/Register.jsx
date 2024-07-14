import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { noop } from 'lodash';

import MainButton from '../shared/Button/MainButton';
import RegisterInput from './RegisterInput';

import './style.scss';

function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');

  const onSubmit = () => {
    navigate('/welcome');
  };

  return (
    <div className="container">
      <p className="register-form-title">회원 정보를 입력해주세요.</p>
      <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
        <RegisterInput
          title="아이디"
          placeholder="id"
          type="id"
          feature={{
            ...register('id', {
              required: '아이디를 입력해주세요.',
              minLength: {
                value: 3,
                message: '아이디는 3글자 이상으로 입력해주세요.',
              },
            }),
          }}
          error={errors.id || {}}
          autocomplete=""
        />
        <RegisterInput
          title="비밀번호"
          placeholder="password"
          type="password"
          feature={{
            ...register('password', {
              required: '비밀번호를 입력해주세요.',
              minLength: {
                value: 6,
                message: '비밀번호는 6글자 이상으로 입력해주세요.',
              },
            }),
          }}
          error={errors.password || {}}
          autocomplete="username new-password"
        />
        <RegisterInput
          title="비밀번호 재입력"
          placeholder="password confirm"
          type="password"
          feature={{
            ...register('confirmPassword', {
              required: '비밀번호를 확인해주세요.',
              validate: (value) =>
                value === password || '입력하신 비밀번호와 일치하지 않아요.',
            }),
          }}
          error={errors.confirmPassword || {}}
          autocomplete="username new-password"
        />
        <RegisterInput
          title="유저 이름"
          placeholder="user name"
          type="userName"
          feature={{
            ...register('userName', {
              required: '유저명을 입력해주세요.',
              minLength: {
                value: 1,
                message: '유저명은 1글자 이상으로 입력해주세요.',
              },
              maxLength: {
                value: 8,
                message: '유저명은 8글자 이하로 입력해주세요.',
              },
            }),
          }}
          error={errors.userName || {}}
          autocomplete=""
        />
        <RegisterInput
          title="이메일"
          placeholder="email"
          type="email"
          feature={{
            ...register('email', { required: '이메일을 입력해주세요.' }),
          }}
          error={errors.email || {}}
          autocomplete=""
        />
        <MainButton text="Join" type="submit" handleClick={noop} />
      </form>
    </div>
  );
}

export default Register;
