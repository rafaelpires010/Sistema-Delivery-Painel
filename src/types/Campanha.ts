import { Cupom } from "./Cupom";

export type Campanha = {
  id: number;
  nome: string;
  img?: string;
  cupom?: Cupom;
  descricao: string;
  ativo: boolean;
  status: "ativa" | "inativa";
};
