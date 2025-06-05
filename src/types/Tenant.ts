import { Banner } from "./Banner";
import { TenantFuncionamento } from "./TenantFuncionamento";
import { TenantInfo } from "./TenantInfo";
import { Zone } from "./Zone";

export type Tenant = {
  id: number;
  nome: string;
  OnClose: boolean;
  img: string;
  slug: string;
  main_color: string;
  second_color: string;
  tenantFuncionamento: TenantFuncionamento;
  tenantInfo: TenantInfo;
  zone: Zone;
  banners: Banner[];
};
