import { Category } from "./Category";

export type Product = {
  id: number;
  img: string;
  category: Category;
  nome: string;
  preco: number;
  descricao?: string;
  ativo: boolean;
};
