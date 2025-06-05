import { api } from "@/libs/api";
import { dateFormat } from "@/libs/dateFormat";
import { Order } from "@/types/Order";
import { OrderStatus } from "@/types/Ordersatus";
import { User } from "@/types/User";
import { Box, Button, Chip, Divider, IconButton, MenuItem, Select, SelectChangeEvent, Typography, Paper } from "@mui/material";
import { useState } from "react";
import { VolumeUp, AccessTime, Person, LocalShipping, Payment, Receipt, Check, Restaurant } from "@mui/icons-material";

interface OrderItemProps {
    item: Order;
    onChangeStatus: (id: number, status: OrderStatus) => void;
    onPrint: (order: Order) => void;
    isPlaying?: boolean;
    onClickCard?: (order: Order) => void;
}

export const OrderItem = ({ item, onChangeStatus, onPrint, isPlaying, onClickCard }: OrderItemProps) => {
    const getStatusColor = (status: OrderStatus) => {
        const statuses = {
            received: '#2787ba',
            preparing: '#ed6c02',
            sent: '#d1b125',
            delivered: '#27BA3A',
        }
        return statuses[status];
    }

    const getStatusLabel = (status: OrderStatus) => {
        const labels = {
            received: 'Novo Pedido',
            preparing: 'Preparando',
            sent: 'Enviado',
            delivered: 'Entregue'
        }
        return labels[status];
    }

    const getNextStatus = (currentStatus: OrderStatus): OrderStatus => {
        if (currentStatus === 'delivered') return currentStatus;

        const sequence = {
            'received': 'preparing',
            'preparing': 'sent',
            'sent': 'delivered'
        } as const;

        return sequence[currentStatus];
    };

    const getStatusButton = () => {
        if (item.status === 'delivered') return null;

        const nextStatus = getNextStatus(item.status);
        const buttonProps = {
            received: {
                icon: <Restaurant />,
                label: 'Preparar',
                color: 'warning'
            },
            preparing: {
                icon: <LocalShipping />,
                label: 'Enviar',
                color: 'info'
            },
            sent: {
                icon: <Check />,
                label: 'Confirmar Entrega',
                color: 'success'
            }
        } as const;

        const props = buttonProps[item.status];

        return (
            <Button
                variant="contained"
                size="small"
                color={props.color}
                startIcon={props.icon}
                onClick={() => onChangeStatus(item.id, nextStatus)}
                sx={{
                    minWidth: 140,
                    textTransform: 'none'
                }}
            >
                {props.label}
            </Button>
        );
    };

    return (
        <Paper
            elevation={3}
            sx={{
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                '&:hover': {
                    opacity: 0.9
                }
            }}
            onClick={(e) => {
                // Verifica se o clique foi na área de botões
                const target = e.target as HTMLElement;
                const isButtonArea = target.closest('[data-button-area="true"]');
                if (!isButtonArea && onClickCard) {
                    onClickCard(item);
                }
            }}
        >
            {/* Cabeçalho do Pedido */}
            <Box sx={{
                p: 2,
                bgcolor: getStatusColor(item.status),
                color: '#FFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">#{item.id}</Typography>
                    {isPlaying && (
                        <IconButton size="small" sx={{ color: '#FFF' }}>
                            <VolumeUp />
                        </IconButton>
                    )}
                </Box>
                <Chip
                    label={getStatusLabel(item.status)}
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: '#FFF',
                        fontWeight: 'bold'
                    }}
                />
            </Box>

            {/* Informações do Cliente e Pedido */}
            <Box sx={{ p: 2, bgcolor: '#FFF' }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2">{dateFormat(item.data_order)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">{item.user.nome}</Typography>
                    </Box>
                </Box>

                {/* Endereço */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocalShipping fontSize="small" color="action" />
                    <Typography variant="body2">
                        {item.address.rua}, {item.address.numero}
                        {item.address.complemento && ` - ${item.address.complemento}`}
                        {` - ${item.address.bairro}`}
                    </Typography>
                </Box>

                {/* Pagamento */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Payment fontSize="small" color="action" />
                    <Typography variant="body2">
                        {item.metodo_pagamento === 'card' ? 'Cartão' : 'Dinheiro'}
                        {item.troco && item.troco > 0 && ` (Troco: R$ ${item.troco.toFixed(2)})`}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Itens do Pedido */}
                <Box sx={{ mb: 2 }}>
                    {item.products.map((product, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                            {product.quantidade}x {product.nome_produto}
                        </Typography>
                    ))}
                </Box>

                {/* Total e Ações */}
                <Box>
                    {/* Total */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mb: 2
                    }}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">Total do Pedido</Typography>
                            <Typography variant="h6" color="primary">
                                R$ {item.preco.toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Área de botões */}
                    <Box
                        data-button-area="true"
                        sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'flex-end'
                        }}
                    >
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Receipt />}
                            onClick={() => onPrint(item)}
                        >
                            Imprimir
                        </Button>
                        {getStatusButton()}
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
}