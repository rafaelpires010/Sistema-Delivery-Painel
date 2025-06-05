export interface Fatura {
  id: number;
  valor: number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: "pendente" | "pago" | "vencido";
  linkBoleto: string;
}
