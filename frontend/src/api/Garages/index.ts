/* eslint-disable @typescript-eslint/no-explicit-any */
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
let Garage: any = {};

Garage.getAllGarages = async () =>{
    return await axiosInstance.get(`${process.env.NEXT_PUBLIC_BASE_URL}/garages`)
}

Garage.getGaragesUser = async (userId: number) =>{
    return await axiosInstance.get(`${process.env.NEXT_PUBLIC_BASE_URL}/garages/${userId}`)
}


export default Garage;