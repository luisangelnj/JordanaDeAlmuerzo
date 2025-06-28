import axios from "axios";

const apiAxios = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL ?? "http://192.168.1.71:8000/api/v1",
    headers: {
        'Content-Type': 'application/json',
    },
})

export default apiAxios;