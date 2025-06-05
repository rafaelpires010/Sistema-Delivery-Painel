'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    CircularProgress
} from '@mui/material';
import {
    TrendingUp,
    ShoppingCart,
    Inventory,
    AttachMoney
} from '@mui/icons-material';
import { api } from '@/libs/api';
import { getCookie } from 'cookies-next';
import { formatCurrency } from '@/libs/formatCurrency';

interface DashboardData {
    totalVendas: {
        diario: number;
        semanal: number;
        mensal: number;
        anual: number;
    };
    ticketMedio: number;
    totalPedidos: number;
    produtosVendidos: number;
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const token = getCookie('token') as string;

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                //const response = await api.getDashboardData(token);
                //setData(response);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [token]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>Resumo Geral</Typography>

            <Grid container spacing={3}>
                {/* Total de Vendas */}
                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <AttachMoney color="primary" />
                                <Typography variant="h6" sx={{ ml: 1 }}>Total de Vendas</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Hoje</Typography>
                                    <Typography variant="h6">{formatCurrency(data?.totalVendas.diario || 0)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Semana</Typography>
                                    <Typography variant="h6">{formatCurrency(data?.totalVendas.semanal || 0)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Mês</Typography>
                                    <Typography variant="h6">{formatCurrency(data?.totalVendas.mensal || 0)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Ano</Typography>
                                    <Typography variant="h6">{formatCurrency(data?.totalVendas.anual || 0)}</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Ticket Médio */}
                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TrendingUp color="primary" />
                                <Typography variant="h6" sx={{ ml: 1 }}>Ticket Médio</Typography>
                            </Box>
                            <Typography variant="h4">{formatCurrency(data?.ticketMedio || 0)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total de Pedidos */}
                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <ShoppingCart color="primary" />
                                <Typography variant="h6" sx={{ ml: 1 }}>Total de Pedidos</Typography>
                            </Box>
                            <Typography variant="h4">{data?.totalPedidos || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Produtos Vendidos */}
                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Inventory color="primary" />
                                <Typography variant="h6" sx={{ ml: 1 }}>Produtos Vendidos</Typography>
                            </Box>
                            <Typography variant="h4">{data?.produtosVendidos || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
} 