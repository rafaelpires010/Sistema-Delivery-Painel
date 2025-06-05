import { ReactElement } from "react";

export interface PaymentMethod {
  id: string;
  nome: string;
  tipo: string;
  aceitarTroco?: boolean;
  ativo: boolean;
}
