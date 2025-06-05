'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    useTheme,
    TextField,
    MenuItem,
    Button
} from '@mui/material';
import {
    Person,
    TrendingUp,
    Group,
    FileDownload,
    DateRange
} from '@mui/icons-material';
import { formatCurrency } from '@/libs/formatCurrency';
import { getCookie } from 'cookies-next';

interface ClienteRelatorio {
    id: number;
    nome: string;
    totalCompras: number;
    ticketMedio: number;
    ultimaCompra: string;
    frequencia: number;
    status: 'novo' | 'recorrente' | 'inativo';
}

export default function RelatorioClientesPage() {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [clientes, setClientes] = useState<ClienteRelatorio[]>([]);
    const token = getCookie('token') as string;

    // Métricas calculadas
    const totalClientes = clientes.length;
    const clientesNovos = clientes.filter(c => c.status === 'novo').length;
    const clientesRecorrentes = clientes.filter(c => c.status === 'recorrente').length;

    useEffect(() => {
        const loadData = async () => {
            try {
                //const response = await api.getRelatorioClientes(token);
                //setClientes(response);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [token]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Cabeçalho */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Relatório de Clientes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Análise do comportamento e fidelidade dos clientes
                </Typography>
            </Paper>

            {/* Filtros */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="Período"
                            size="small"
                        >
                            <MenuItem value="hoje">Hoje</MenuItem>
                            <MenuItem value="semana">Última Semana</MenuItem>
                            <MenuItem value="mes">Último Mês</MenuItem>
                            <MenuItem value="ano">Último Ano</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Status"
                        >
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="novo">Novos</MenuItem>
                            <MenuItem value="recorrente">Recorrentes</MenuItem>
                            <MenuItem value="inativo">Inativos</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownload />}
                            fullWidth
                        >
                            Exportar Relatório
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Cards de Métricas */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {[
                    {
                        title: 'Total de Clientes',
                        value: totalClientes,
                        icon: <Group />,
                        color: theme.palette.primary.main
                    },
                    {
                        title: 'Novos Clientes',
                        value: clientesNovos,
                        icon: <Person />,
                        color: theme.palette.success.main
                    },
                    {
                        title: 'Clientes Recorrentes',
                        value: clientesRecorrentes,
                        icon: <TrendingUp />,
                        color: theme.palette.info.main
                    }
                ].map((metric, index) => (
                    <Grid item xs={12} md={4} key={index}>
                        <Card sx={{
                            height: '100%',
                            borderRadius: 2,
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: `${metric.color}15`,
                                        color: metric.color
                                    }}>
                                        {metric.icon}
                                    </Box>
                                    <Typography variant="h6" sx={{ ml: 2 }}>
                                        {metric.title}
                                    </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ color: metric.color, fontWeight: 'bold' }}>
                                    {metric.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Tabela de Clientes */}
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Cliente</TableCell>
                                <TableCell align="right">Total Compras</TableCell>
                                <TableCell align="right">Ticket Médio</TableCell>
                                <TableCell>Última Compra</TableCell>
                                <TableCell align="right">Frequência</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : clientes.map((cliente) => (
                                <TableRow key={cliente.id} hover>
                                    <TableCell>{cliente.nome}</TableCell>
                                    <TableCell align="right">{cliente.totalCompras}</TableCell>
                                    <TableCell align="right">{formatCurrency(cliente.ticketMedio)}</TableCell>
                                    <TableCell>{cliente.ultimaCompra}</TableCell>
                                    <TableCell align="right">{cliente.frequencia}x/mês</TableCell>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                color: cliente.status === 'novo'
                                                    ? 'success.main'
                                                    : cliente.status === 'recorrente'
                                                        ? 'primary.main'
                                                        : 'error.main'
                                            }}
                                        >
                                            {cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
} 