import axios from 'axios';

const AuthAxios = axios.create({
  baseURL: 'https://api.travo.kr',
});

// Request 인터셉터: 매 요청에 accessToken 자동 추가
AuthAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response 인터셉터: accessToken이 만료되면 refresh 시도
AuthAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // accessToken이 만료된 경우 (예: 401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지

      try {
        const res = await axios.post('/auth/refresh');
        const newAccessToken = res.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return AuthAxios(originalRequest); // 재요청
      } catch (refreshError) {
        // refreshToken도 만료된 경우 → 토큰 만료 모달 띄우기 예정..
        localStorage.removeItem('accessToken');
        // window.location.href = '/login';
        console.log('refreshError', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default AuthAxios;
