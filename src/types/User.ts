export interface TenantUsers {
  tenant: string;
  img: string;
  id: number;
  users: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    cargo: string;
    active: boolean;
  }[];
}

export interface User {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  active: boolean;
  tenants: string[];
}

export interface UserTenant {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  active: boolean;
  tenants: {
    id: number;
    nome: string;
    slug: string;
    cargo: string;
    active: boolean;
    ultimo_login: string;
    roles: string[];
    claims: string[];
    img: string;
  }[];
}
