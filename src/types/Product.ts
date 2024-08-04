import { Categoria } from "./Categoria"

export type Product = {

    id: number
    img: string
    id_category: number;
    nome: string
    preco: number;
    description?: string;
}