import { Categoria } from "@/types/Categoria";
import { Order } from "@/types/Order";
import { OrderStatus } from "@/types/Ordersatus";
import { Product } from "@/types/Product";

const tempProduct: Product = {
    id: 99,
    image: 'https://292aa00292a014763d1b-96a84504aed2b25fc1239be8d2b61736.ssl.cf1.rackcdn.com/GaleriaImagem/130275/fotos-para-hamburguerias_fotografia-de-hamburguer-4.JPG',
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
    },
    getCategories: async (): Promise<Categoria[]> => {
        const list: Categoria[] = [
            {id: 99, name: 'Burgers'},
            {id: 98, name: 'Refrigerantes'},
            {id: 97, name: 'Doces'},
        ];

        return new Promise(resolve => {
            setTimeout(()=> {
                resolve(list);
            }, 200)
        })
    },
    getProducts: async (): Promise<Product[]> => {
        const list: Product[] = [
           {...tempProduct, id: 123},
           {...tempProduct, id: 124},
           {...tempProduct, id: 125},
           {...tempProduct, id: 126},
           {...tempProduct, id: 127},
           {...tempProduct, id: 128},
           {...tempProduct, id: 129},
           {...tempProduct, id: 130},
        ];

        return new Promise(resolve => {
            setTimeout(()=> {
                resolve(list);
            }, 500)
        })
    },
    deleteProduct: async (id: number): Promise<boolean> => {
        return new Promise(resolve => {
            setTimeout(()=> {
                resolve(true);
            }, 1000)
        })
    },

    createProduct: async (form: FormData) => {
        return new Promise(resolve => {
            setTimeout(()=> {
                resolve(true);
            }, 1000)
        })
    },

    updateProduct: async (form: FormData) => {
        return new Promise(resolve => {
            setTimeout(()=> {
                resolve(true);
            }, 1000)
        })
    },
    deleteCategory: async (id: number): Promise<boolean> => {
        return new Promise(resolve => {
            setTimeout(()=> {
                resolve(true);
            }, 1000)
        })
    },
    createCategory: async (form: FormData) => {
        return new Promise(resolve => {
            setTimeout(()=> {
                resolve(true);
            }, 1000)
        })
    },

    updateCategory: async (form: FormData) => {
        return new Promise(resolve => {
            setTimeout(()=> {
                resolve(true);
            }, 1000)
        })
    },
}