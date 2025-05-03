import axios from 'axios';
import Cookies from 'js-cookie';

const axiosClient = axios.create({
    baseURL : process.env.NEXT_PUBLIC_API_URL,
});

axiosClient.interceptors.request.use(
    (config) => {
      const token = Cookies.get('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

// axios client interceptor request when 401 dispatch redux saga

axiosClient.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response.status === 401) {
        Cookies.remove('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );


export default axiosClient;