/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
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


let Offers: any = {};

Offers.getAllOffers = async () => {
    return await axiosInstance.get(`${process.env.NEXT_PUBLIC_BASE_URL}/offers/all`);
};

Offers.getBenefitByOfferId = async (offerId: number) => {
    return await axiosInstance.get(`${process.env.NEXT_PUBLIC_BASE_URL}/offer_benefits/${offerId}`);
};

Offers.createOffer = async (data: any) => {
    const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_BASE_URL}/offers/create`, data);
    return response.data;
}

Offers.deleteOffer = async (offerId: number) => {
    return await axiosInstance.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/offers/delete/${offerId}`);
}

Offers.linkBenefitToOffer = async (offerId:number, data: any) => {
    return await axiosInstance.post(`${process.env.NEXT_PUBLIC_BASE_URL}/offer_benefits/create/${offerId}`, data);
}

Offers.getAllBenefits = async () => {
    return await axiosInstance.get(`${process.env.NEXT_PUBLIC_BASE_URL}/benefits/all`);
}

// Offers.dele
export default Offers;