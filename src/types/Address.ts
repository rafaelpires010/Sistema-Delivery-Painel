export type Address = {
    id: number;
    cep: string;
    rua: string;
    numero:string;
    bairro: string;
    cidade: string;
    estado: string;
    complemento?: string; 
}