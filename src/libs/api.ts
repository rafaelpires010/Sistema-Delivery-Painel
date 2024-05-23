import { Order } from "@/types/Order";
import { OrderStatus } from "@/types/Ordersatus";
import { Product } from "@/types/Product";

const tempProduct: Product = {
    id: 99,
    image: 'https://saopaulosecreto.com/wp-content/uploads/2022/10/Get-Burguer-1024x683.jpg',
    categoria: {
        id: 99,
        name: 'Burguers'
    },
    nome: 'Burgão Boladão',
    preco: 35.3,
    description: 'um burgão boladão muito legal'
}

export const api = {
    login: async (email: string, password: string): Promise<{error: string, token?: string}> => {
        return new Promise(resolve => {
            setTimeout(() => {
                if(email !== 'suporte@rpdev.com') {
                    resolve({
                        error: 'E-mail e/ou senha estão errados'
                    });
                } else {
                    resolve({
                        error: '',
                        token: '123'
                    });
                }
            }, 1000);
        });
    },
    forgotPassword: async (email: string): Promise<{error: string}> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ error: ''});
            }, 1000);
        });
    },
    redefinePassword: async (password: string, token: string): Promise<{error: string}> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ error: ''});
            }, 1000);
        });
    },
    getOrders: async (): Promise<Order[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const orders: Order[] = [];
                const statuses: OrderStatus [] = ['preparing', 'sent', 'delivered'];
                //montar array de pedidos
                for(let i=0;i<6;i++) {
                    orders.push({
                        id: parseInt('12'+i),
                        status: statuses[Math.floor(Math.random() * 3)],
                        orderDate: '2023-01-03 18:30',
                        userid: '1',
                        userName: 'Rafael',
                        shippingAddress: {
                            id: 99,
                            cep: '31573373',
                            rua: 'Grão de Ouro',
                            numero: '95',
                            bairro: 'Piratininga',
                            cidade: 'Belo Horizonte',
                            estado: 'MG',
                            complemento: 'Cupreto'
                        },
                        shippingPrice: 12,
                        paymentType: 'card',
                        changeValue: 0,
                        cupom: 'Cupreto',
                        cupomDiscount: 2,
                        products: [
                            {qt: 2, product: tempProduct},
                            {qt: 3, product: {...tempProduct, id: 888, nome: 'Burguer Vegano'}}
                        ],
                        subtotal: 99,
                        total: 120
                    });
                }

                resolve(orders);
            }, 1000);
        });
    },
    changeOrderStats: async (id: number, newStatus: OrderStatus) => {
        return true;
    }
}