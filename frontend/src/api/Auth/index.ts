/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { ReponseLogin, Me, RegisterDataProps } from '@/props';
import { UserService, Credentials } from '@/props/index';

class UsersApiServiceImplementation implements UserService {
   async login(data: Credentials): Promise<any> {
        return await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
            new URLSearchParams({
                username: data.username,
                password: data.password,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
    }

    public async register(data: RegisterDataProps): Promise<any> {
        return await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/register`,
            data
        );
    }

    public async logout(token: string): Promise<any> {
        return await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/logout`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            }
        );
    }
    public async fetchMe(): Promise<Me | string> {
        const token = localStorage.getItem('token');
        return await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URL}/auth/me`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                withCredentials: true
            }
        );
    }
}

const Auth = new UsersApiServiceImplementation();
export default Auth;