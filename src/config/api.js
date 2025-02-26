import axios from 'axios';
import { getToken, setToken } from '../core/token';
import { authService } from '~/services/auth.service';

// Khởi tạo Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_HOST,
    withCredentials: true, // ✅ Đảm bảo luôn gửi cookie trong request
});

// Request Interceptor: Gửi token trong header nếu có
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Xử lý lỗi và refresh token
api.interceptors.response.use(
    (res) => {
        return res.data;
    },
    async (err) => {
        console.log('Lỗi API:', err?.response?.data);

        // Kiểm tra lỗi do token hết hạn
        if (err?.response?.data?.message === 'Token is not valid') {
            try {
                console.log('🔄 Refreshing token...');

                // Gọi API refresh token
                const newAccessToken = await authService.refreshToken();

                // Lưu token mới vào localStorage hoặc cookie
                setToken(newAccessToken.access_token);

                // Cập nhật token mới vào headers của axios
                api.defaults.headers.Authorization = `Bearer ${newAccessToken.access_token}`;

                // Gửi lại request ban đầu với token mới
                err.config.headers.Authorization = `Bearer ${newAccessToken.access_token}`;
                return api.request(err.config);
            } catch (refreshError) {
                console.error('🚨 Refresh token failed', refreshError);
                throw new Error(refreshError?.response?.data);
            }
        }

        return Promise.reject(err);
    },
);

export default api;
