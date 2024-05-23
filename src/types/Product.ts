import { Categoria } from "./Categoria"

export type Product = {

    id: number
    image: string
    categoria: Categoria;
    nome: string
    preco: number;
    description?: string;
}