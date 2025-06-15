/* eslint-disable @typescript-eslint/no-explicit-any */
import { RoleEnum } from '@/props';
import axios from 'axios';
// import { UserProps } from '@/props';

const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem("token");
    }
    return null;
};

// Configuration axios avec intercepteur pour le token
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Créer une instance axios spécifique pour l'envoi de fichiers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fileAxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${getToken()}`
    },
    withCredentials: true
});

// Intercepteur pour ajouter le token à chaque requête
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// eslint-disable-next-line prefer-const
let User: any = {};
User.getAllUsers = async () =>{
    return await axiosInstance.get(`${process.env.NEXT_PUBLIC_BASE_URL}/user/all`)
}

User.updateStatus = async (userId: number, status: boolean) =>{
    return await axiosInstance.post(`${process.env.NEXT_PUBLIC_BASE_URL}/user/status?user_id=${userId}&status=${status}`,{})
}

User.updateRole = async (userId: number, role: RoleEnum) =>{
    return await axiosInstance.post(`${process.env.NEXT_PUBLIC_BASE_URL}/user/role?user_id=${userId}&role=${role}`,{})
}

User.register = async (data: any) => {
    return await axiosInstance.post(`${process.env.NEXT_PUBLIC_BASE_URL}/user/register`, data);
}

User.update = async (userId: number, data: any) => {
    return await axiosInstance.put(`${process.env.NEXT_PUBLIC_BASE_URL}/user/edit/${userId}`, data);
}

User.delete = async (userId: number) => {
    return await axiosInstance.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/user/delete/${userId}`);
}

User.getGarage = async (userId: number) => {
    return await axiosInstance.get(`${process.env.NEXT_PUBLIC_BASE_URL}/garage/${userId}/`);
}




export default User;