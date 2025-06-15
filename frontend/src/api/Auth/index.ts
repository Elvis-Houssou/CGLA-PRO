/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { LoginDataProps, RegisterDataProps } from '@/props';

// eslint-disable-next-line prefer-const
let Auth: any = {};
Auth.login = async (data: LoginDataProps) =>{
    return await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, 
        new URLSearchParams({
            username: data.username,
            password: data.password,
        }),
        {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    )
}

Auth.register = async (data: RegisterDataProps) =>{
    return await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/register`, data)
}

Auth.logout = async (token: string) =>{
    return await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/logout`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        withCredentials: true
    })
}

export default Auth;