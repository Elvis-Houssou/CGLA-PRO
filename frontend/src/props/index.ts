export interface LoginDataProps {
    username: string;
    password: string;
}

export interface RegisterDataProps {
    username: string;
    email: string;
    password: string;
    role?: string;
}

export interface UserProps {
    id: number;
    image: string;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    age: string;
    role?: string;
    is_verified: boolean;
    is_active: boolean;
    can_add: boolean;
    can_edit: boolean;
    garage?: {
        id: number;
        user_id: number;
        name: string;
        image?: string;
        city?: string;
        country?: string;
        address?: string;
    },
    createdAt: string,
    lastLogin?: string
}

export interface QuotaProps {
    id: number;
    user_id: number;
    quota: number;
    remuneration: number;
    period_start: string;
    period_end: string;
}

export interface WashRecordProps {
    id: number;
    user_id: number;
    wash_id: number;
    wash_date: string;
}

export interface ManagerProps {
    manager: UserProps;
    quota: QuotaProps;
    wash_records: WashRecordProps;
    count_wash_records: number;
}

export interface GarageProps {
    id: number;
    user_id: number;
    name: string;
    image?: string;
    city?: string;
    country?: string;
    address?: string;
}

export interface OfferProps {
    id: number;
    name: string;
    description?: string;
    price: number;
    icon?: string;
    benefits?: BenefitProps[];
}

export interface BenefitProps {
    id: number;
    icon?: string;
    name: string;
    description?: string;
}

export enum RoleEnum {
    super_admin = "Super Admin",
    manager = "Manager" ,
    admin_garage = "Propriétaire de garage",
    employee_garage = "Employé de garage",
    client_garage = "Client de garage",
}