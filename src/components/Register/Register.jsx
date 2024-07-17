import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { noop } from 'lodash';

import MainButton from '../shared/Button/MainButton';
import RegisterInput from './RegisterInput';
import useStore from '../../store/store';

import './style.scss';

function Register() {
  const navigate = useNavigate();
  const { registerUser, setAlertState } = useStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    try {
      await registerUser(data.email, data.password, data.userName);
      navigate('/welcome');
      setAlertState('success-register');
    } catch (error) {
      setAlertState('failed-register');
    }
  };

  return (
    <div className="container">
      <p className="register-form-title">회원 정보를 입력해주세요.</p>
      <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
        <RegisterInput
          title="이메일"
          placeholder="email"
          type="email"
          feature={{
            ...register('email', {
              required: '이메일을 입력해주세요.',
              minLength: {
                value: 5,
                message: '이메일은 5글자 이상으로 입력해주세요.',
              },
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: '유효한 이메일 주소를 입력해주세요.',
              },
            }),
          }}
          error={errors.email || {}}
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
          type="text"
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
        <MainButton text="JOIN" type="submit" handleClick={noop} />
      </form>
    </div>
  );
}

export default Register;
