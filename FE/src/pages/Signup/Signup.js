import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  // const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    axios
      .post(
        'https://api-server-860259406241.asia-northeast1.run.app/auth/signup',
        {
          email: email,
          password: password,
          name: name,
        }
      )
      .then((res) => {
        console.log(res);
        if (res.status == 201) {
          navigate('/login');
        }
      })
      .catch((err) => {
        console.log(err);
        setError(err.response.data.message);
      });
  };
  //비밀번호 일치 확인
  const confirmPassword = (password, checkPassword) => {
    setPasswordError(password !== checkPassword);
  };
  return (
    <div
      className="signup-wrapper"
      style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}
    >
      <button className="logo-button" onClick={() => navigate('/')}>
        <img src="/logo.svg" alt="Logo" className="logo-image" />
        Travo
      </button>
      <div className="signup-container">
        <div className="container-row">
          <label className="input-label">이름 입력</label>
          <input
            type="text"
            id="id"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="container-row">
          <label className="input-label">이메일 주소</label>
          <input
            type="text"
            id="id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="container-row">
          <label className="input-label">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {passwordError !== null && (
          <p style={{ color: passwordError ? 'red' : 'green' }}>
            {passwordError
              ? '비밀번호가 일치하지 않습니다.'
              : '비밀번호가 일치합니다.'}
          </p>
        )}
        <div className="container-row">
          <label className="input-label">비밀번호 확인</label>
          <input
            type="password"
            id="checkpassword"
            onChange={(e) => {
              confirmPassword(password, e.target.value);
            }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="container-row">
          <button
            className="signup-button"
            onClick={handleSignup}
            disabled={passwordError}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
