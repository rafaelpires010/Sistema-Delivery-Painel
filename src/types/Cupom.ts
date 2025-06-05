export type Cupom = {
  id: number;
  codigo: string;
  desconto: number;
  tipoDesconto: "PERCENTUAL" | "VALOR";
  validade?: Date;
  dataInicio?: Date;
  limiteUso?: number;
  usosAtuais: number;
  valorMinimo?: number;
  descricao?: string;
  ativo: boolean;
};
