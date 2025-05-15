import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    axios
      .post('https://api.travo.kr/auth/login', {
        email: email,
        password: password,
      })
      .then((res) => {
        if (res.status == 201) {
          const accessToken = res.data.access_token;
          const refreshToken = res.data.refresh_token;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          console.log(accessToken);
          console.log(refreshToken);
          navigate('/main');
        }
      })
      .catch((err) => {
        console.log(err);
        setError(err.response.data.message);
      });
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div
      className="login-wrapper"
      style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}
    >
      <button className="logo-button" onClick={() => navigate('/')}>
        <img src="/logo.svg" alt="Logo" className="logo-image" />
        Travo
      </button>
      <div className="login-container">
        <div className="container-row">
          <label className="input-label">이메일 주소</label>
          <input
            type="text"
            id="id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="container-row">
          <label className="input-label">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button onClick={handleLogin}>로그인</button>
      </div>
      <div className="login-links">
        <button
          className="login-transparent-button"
          onClick={() => navigate('/signup')}
        >
          <div style={{ color: '#b0b0b0' }}>회원가입</div>
        </button>
      </div>
    </div>
  );
};

export default Login;
