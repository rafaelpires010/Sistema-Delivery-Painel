import { Address } from "./Address";
import { CartItem } from "./CartItem";
import { OrderStatus } from "./Ordersatus";
import { User } from "./User";

export type Order = {
  user: User;
  id: number;
  status: OrderStatus;
  data_order: string;
  id_user: string;
  address: Address;
  shippingPrice: number;
  metodo_pagamento: "money" | "card";
  troco?: number;
  cupom?: string;
  cupomDiscount?: number;
  products: CartItem[];
  subtotal: number;
  preco: number;
};
