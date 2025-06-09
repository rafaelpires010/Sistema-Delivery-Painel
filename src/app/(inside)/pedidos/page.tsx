'use client'

import React, { useEffect, useState, KeyboardEvent, useRef } from "react";
import { OrderItem } from "@/components/OrderItem";
import { api } from "@/libs/api";
import { dateFormat, dateTimeFormat } from "@/libs/dateFormat";
import { Order } from "@/types/Order";
import { OrderStatus } from "@/types/Ordersatus";
import { Refresh, Search, AccessTime, Warning, ShoppingBag, LocalShipping, CheckCircle, Inventory2, TwoWheeler, Restaurant } from "@mui/icons-material";
import { Box, Button, Grid, InputAdornment, Skeleton, TextField, Typography, Divider, Paper, Alert, Select, MenuItem } from "@mui/material";
import { io } from "socket.io-client";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { OrderDetailsModal } from "@/components/OrderDetailsModal";

const ApiUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL!;
const socket = io(ApiUrl);

const Page = () => {
    const token = getCookie('token') as string;
    const router = useRouter();

    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [printOrder, setPrintOrder] = useState<Order | null>(null);
    const [dateTime, setDateTime] = useState(new Date());
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioPermission, setAudioPermission] = useState<NotificationPermission | 'pending'>('pending');
    const [pendingOrders, setPendingOrders] = useState<Set<number>>(new Set());
    const soundIntervalRef = useRef<{ [key: number]: NodeJS.Timeout }>({});
    const [searchType, setSearchType] = useState<'id' | 'name'>('id');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Buscar pedidos da API
    const getOrders = async () => {
        setLoading(true);
        try {
            const orderList: Order[] = await api.getOrders(token);
            setOrders(orderList);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
        } finally {
            setLoading(false);
        }
    };

    // Função para solicitar permissão
    const requestAudioPermission = async () => {
        try {
            // Solicita permissão de notificação (que inclui áudio)
            const permission = await Notification.requestPermission();
            setAudioPermission(permission);

            // Tenta inicializar o áudio com interação do usuário
            if (permission === 'granted') {
                audioRef.current = new Audio('/sounds/notification.mp3');
                // Carrega o áudio com volume 0 para pré-carregar
                audioRef.current.volume = 0;
                await audioRef.current.play();
                audioRef.current.pause();
                audioRef.current.volume = 1;
            }
        } catch (error) {
            console.error('Erro ao solicitar permissão:', error);
            setAudioPermission('denied');
        }
    };

    // Função para tocar o som
    const playNotificationSound = async () => {
        try {
            if (audioPermission !== 'granted') {
                await requestAudioPermission();
                return;
            }

            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.volume = 1;
                await audioRef.current.play();
            } else {
                const audio = new Audio('/sounds/notification.mp3');
                await audio.play();
            }
        } catch (error) {
            console.error('Erro ao tocar som:', error);
        }
    };

    // Função para tocar som repetidamente
    const startRepeatingSound = (orderId: number) => {
        if (audioPermission === 'granted') {
            setPendingOrders(prev => new Set(prev).add(orderId));
            soundIntervalRef.current[orderId] = setInterval(async () => {
                try {
                    if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        await audioRef.current.play();
                    }
                } catch (error) {
                    console.error('Erro ao tocar som:', error);
                }
            }, 5000); // Toca a cada 5 segundos
        }
    };

    // Função para parar o som
    const stopRepeatingSound = (orderId: number) => {
        if (soundIntervalRef.current[orderId]) {
            clearInterval(soundIntervalRef.current[orderId]);
            delete soundIntervalRef.current[orderId];
            setPendingOrders(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    };

    useEffect(() => {
        // Inicializa verificando a permissão
        if (Notification.permission === 'granted') {
            setAudioPermission('granted');
        }

        // Atualização da data e hora
        const timer = setInterval(() => setDateTime(new Date()), 1000);

        // Buscar pedidos na montagem
        getOrders();

        // Inicializa o áudio
        if (!audioRef.current) {
            audioRef.current = new Audio('/sounds/notification.mp3');
            audioRef.current.load();
        }

        // Escutar novos pedidos via socket
        socket.on('newOrder', async (newOrder: Order) => {
            setOrders(prev => [newOrder, ...prev]);
            setFilteredOrders(prev => [newOrder, ...prev]);
            startRepeatingSound(newOrder.id);
        });

        return () => {
            clearInterval(timer);
            // Limpa todos os intervalos ao desmontar
            Object.values(soundIntervalRef.current).forEach(interval => clearInterval(interval));
            socket.off('newOrder');
        };
    }, [audioPermission]);

    useEffect(() => {
        setFilteredOrders(orders);
    }, [orders]);

    const handleSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.code.toLowerCase() === 'enter') {
            const newOrders = searchInput
                ? orders.filter(order => {
                    if (searchType === 'id') {
                        return order.id.toString() === searchInput;
                    } else {
                        return order.user.nome.toLowerCase().includes(searchInput.toLowerCase());
                    }
                })
                : orders;
            setFilteredOrders(newOrders);
        }
    };

    const handleChangeStatus = async (id: number, newStatus: OrderStatus) => {
        try {
            await api.changeOrderStats(token, id, newStatus);
            if (newStatus === "delivered") {
                await api.aceitaVenda(token, id);
            }
            stopRepeatingSound(id); // Para o som quando o status é atualizado
            getOrders();
        } catch (error) {
            console.error("Erro ao mudar status:", error);
        }
    };

    const handlePrintAction = (order: Order) => {
        setPrintOrder(order);
    };

    useEffect(() => {
        if (printOrder) {
            window.print();
            setPrintOrder(null);
        }
    }, [printOrder]);

    // Contadores de status
    const totalOrders = orders.length;
    const totalInProduction = orders.filter(order => order.status === 'preparing').length;
    const totalShipped = orders.filter(order => order.status === 'sent').length;
    const totalDelivered = orders.filter(order => order.status === 'delivered').length;

    const handleEditOrder = (order: Order) => {
        // Implementar navegação para a página de edição
        router.push(`/pedidos/editar/${order.id}`);
    };

    return (
        <>
            {/* Container principal - oculto na impressão */}
            <Box sx={{ my: 3, mx: { xs: 2, sm: 3 }, '@media print': { display: 'none' } }}>
                {audioPermission === 'pending' && (
                    <Alert
                        severity="info"
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={requestAudioPermission}
                            >
                                Permitir Notificações
                            </Button>
                        }
                        sx={{ mb: 2 }}
                    >
                        Permita as notificações para ouvir alertas de novos pedidos
                    </Alert>
                )}

                {audioPermission === 'denied' && (
                    <Alert
                        severity="warning"
                        sx={{ mb: 2 }}
                    >
                        Notificações bloqueadas. Habilite-as nas configurações do navegador para ouvir alertas.
                    </Alert>
                )}

                {/* Cabeçalho */}
                <Box sx={{
                    mb: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2
                }}>
                    <Typography
                        component="h5"
                        variant="h5"
                        sx={{
                            color: '#555',
                            fontWeight: 'bold'
                        }}
                    >
                        Painel de Pedidos
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <AccessTime color="action" />
                        <Typography variant="h6" color="text.secondary">
                            {dateTimeFormat(dateTime)}
                        </Typography>
                    </Box>
                </Box>

                {/* Resumo de Pedidos */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1fr 1fr',
                        md: 'repeat(4, 1fr)'
                    },
                    gap: 2,
                    mb: 3
                }}>
                    {[
                        {
                            label: "Total de Pedidos",
                            count: totalOrders,
                            bg: "rgba(108, 49, 162, 0.8)",
                            icon: <ShoppingBag sx={{ fontSize: 28, mb: 1 }} />
                        },
                        {
                            label: "Em Produção",
                            count: totalInProduction,
                            bg: "rgba(3, 169, 244, 0.8)",
                            icon: <Restaurant sx={{ fontSize: 28, mb: 1 }} />
                        },
                        {
                            label: "Enviados",
                            count: totalShipped,
                            bg: "rgba(221, 148, 34, 0.8)",
                            icon: <TwoWheeler sx={{ fontSize: 28, mb: 1 }} />
                        },
                        {
                            label: "Entregues",
                            count: totalDelivered,
                            bg: "rgba(76, 175, 80, 0.8)",
                            icon: <CheckCircle sx={{ fontSize: 28, mb: 1 }} />
                        }
                    ].map(({ label, count, bg, icon }, index) => (
                        <Paper
                            key={index}
                            elevation={1}
                            sx={{
                                p: 1,
                                bgcolor: bg,
                                color: 'white',
                                borderRadius: 2,
                                textAlign: 'center',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.02)'
                                }
                            }}
                        >
                            {icon}
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{label}</Typography>
                            <Typography variant="h6">{count}</Typography>
                        </Paper>
                    ))}
                </Box>

                {/* Pesquisa e Atualização */}
                <Box sx={{
                    mb: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <Button
                        onClick={getOrders}
                        startIcon={<Refresh />}
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: 'none'
                        }}
                    >
                        Atualizar
                    </Button>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value as 'id' | 'name')}
                            size="small"
                            sx={{ minWidth: 120 }}
                        >
                            <MenuItem value="id">Nº Pedido</MenuItem>
                            <MenuItem value="name">Nome Cliente</MenuItem>
                        </Select>
                        <TextField
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyUp={handleSearchKey}
                            placeholder={searchType === 'id' ? "Buscar por nº do pedido" : "Buscar por nome do cliente"}
                            variant="outlined"
                            size="small"
                            disabled={loading}
                            sx={{ minWidth: { sm: 300 } }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Box>
                </Box>

                {/* Listagem de Pedidos */}
                <Grid container spacing={2}>
                    {[
                        { status: 'received', title: 'Novo Pedido', color: '#6c31a2' },
                        { status: 'preparing', title: 'Em Preparação', color: '#03A9F4' },
                        { status: 'sent', title: 'Enviado', color: '#dd9422' }
                    ].map(({ status, title, color }, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Paper sx={{
                                height: '100%',
                                borderRadius: 2,
                                overflow: 'hidden'
                            }}>
                                <Typography
                                    variant="h6"
                                    align="center"
                                    sx={{
                                        bgcolor: color,
                                        color: 'white',
                                        p: 2
                                    }}
                                >
                                    {title}
                                </Typography>
                                <Box sx={{
                                    p: 2,
                                    maxHeight: 'calc(100vh - 400px)',
                                    overflow: 'auto'
                                }}>
                                    {loading ? (
                                        Array(3).fill(0).map((_, i) => (
                                            <Skeleton
                                                key={i}
                                                variant="rectangular"
                                                height={100}
                                                sx={{ mb: 2, borderRadius: 2 }}
                                            />
                                        ))
                                    ) : filteredOrders.filter(order => order.status === status).length === 0 ? (
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 1,
                                            py: 4
                                        }}>
                                            <Warning sx={{ fontSize: 40, color: 'text.secondary' }} />
                                            <Typography color="text.secondary">
                                                Nenhum pedido nesta categoria
                                            </Typography>
                                        </Box>
                                    ) : (
                                        filteredOrders
                                            .filter(order => order.status === status)
                                            .map(order => (
                                                <OrderItem
                                                    key={order.id}
                                                    item={order}
                                                    onChangeStatus={handleChangeStatus}
                                                    onPrint={handlePrintAction}
                                                    isPlaying={pendingOrders.has(order.id)}
                                                    onClickCard={(order) => {
                                                        setSelectedOrder(order);
                                                        setIsDetailsModalOpen(true);
                                                    }}
                                                />
                                            ))
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Container de impressão - visível apenas na impressão */}
            <Box sx={{
                display: 'none',
                '@media print': {
                    display: 'block',
                    margin: 0,
                    padding: '20px',
                    fontSize: '12pt',
                    backgroundColor: 'white',
                    minHeight: '100vh'
                }
            }}>
                {printOrder && (
                    <>
                        <Typography variant="h6" align="center" gutterBottom>
                            PEDIDO #{printOrder.id}
                        </Typography>

                        {/* Informações Básicas */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body1">Data: {dateFormat(printOrder.data_order)}</Typography>
                            <Typography variant="body1">Cliente: {printOrder.user.nome}</Typography>
                        </Box>

                        {/* Endereço de Entrega */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" gutterBottom>Endereço de Entrega</Typography>
                            <Typography variant="body1">
                                {printOrder.address.rua}, {printOrder.address.numero}
                                {printOrder.address.complemento && ` - ${printOrder.address.complemento}`}
                            </Typography>
                            <Typography variant="body1">
                                Bairro: {printOrder.address.bairro}
                            </Typography>
                            <Typography variant="body1">
                                {printOrder.address.cidade} - {printOrder.address.estado}
                            </Typography>
                            <Typography variant="body1">CEP: {printOrder.address.cep}</Typography>
                        </Box>

                        {/* Itens do Pedido */}
                        <Typography variant="h6" gutterBottom>Itens do Pedido</Typography>
                        {printOrder.products.map((item, index) => (
                            <Typography key={index} variant="body1" sx={{ mb: 0.5 }}>
                                {item.quantidade}x {item.nome_produto}
                            </Typography>
                        ))}

                        {/* Pagamento */}
                        <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #ccc' }}>
                            <Typography variant="h6" gutterBottom>Pagamento</Typography>
                            <Typography variant="body1">
                                Forma de pagamento: {printOrder.metodo_pagamento === 'card' ? 'Cartão' : 'Dinheiro'}
                            </Typography>
                            <Typography variant="body1">Subtotal: R$ {printOrder.subtotal.toFixed(2)}</Typography>
                            <Typography variant="body1">Entrega: R$ {printOrder.shippingPrice.toFixed(2)}</Typography>
                            {printOrder.cupomDiscount && (
                                <Typography variant="body1">Desconto: -R$ {printOrder.cupomDiscount.toFixed(2)}</Typography>
                            )}
                            {printOrder.troco && printOrder.troco > 0 && (
                                <Typography variant="body1">Troco para: R$ {printOrder.troco.toFixed(2)}</Typography>
                            )}
                            <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 1 }}>
                                Total: R$ {printOrder.preco.toFixed(2)}
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    open={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    onEdit={handleEditOrder}
                />
            )}
        </>
    );
};

export default Page;
