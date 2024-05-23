import { Address } from "./Address";
import { CartItem } from "./CartItem";
import { OrderStatus } from "./Ordersatus";

export type Order = {
    id: number;
    status: OrderStatus;
    orderDate: string;
    userid: string;
    userName?: string;
    shippingAddress: Address;
    shippingPrice: number;
    paymentType: 'money' | 'card';
    changeValue?: number;
    cupom?: string;
    cupomDiscount?: number;
    products: CartItem[];
    subtotal: number;
    total: number;
}