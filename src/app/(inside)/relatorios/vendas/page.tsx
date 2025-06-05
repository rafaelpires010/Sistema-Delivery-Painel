'use client'

import { useEffect, useState } from 'react';
import { api } from '@/libs/api';
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
    Button,
    Chip,
    Stack,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Checkbox,
    ListItemText,
    Tooltip,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import {
    AttachMoney,
    ShoppingCart,
    TrendingUp,
    FileDownload,
    CompareArrows,
    DateRange,
    Visibility,
    CreditCard,
    Money,
    Pix,
    TableChart,
    InsertChart,
    Close,
    Download,
    Cancel,
    TrendingDown
} from '@mui/icons-material';
import { formatCurrency } from '@/libs/formatCurrency';
import { getCookie } from 'cookies-next';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import * as XLSX from 'xlsx';
import { format, subDays } from 'date-fns';
const token = getCookie('token') as string;

dayjs.extend(isBetween);

interface VendaRelatorio {
    id: number;
    valor: number;
    status: string;
    data: string;
    formaPagamento: {
        id: number;
        nome: string;
    };
    order: {
        id: number;
        preco: number;
        subtotal: number;
        status: string;
        origem: string;
        user: {
            nome: string;
            email: string;
            telefone: string;
        };
        troco: number;
        shippingPrice: number;
        products: {
            id: number;
            nome_produto: string;
            quantidade: number;
            preco_produto: number;
        }[];
    };
    tenant: {
        id: number;
        nome: string;
    };
    nrVenda: string;
}

interface MetodoPagamento {
    id: number;
    nome: string;
}

interface Filters {
    dataInicio: string;
    dataFim: string;
    status: string;
    formaPagamento: string;
    nrVenda: string;
}

const RelatorioVendasPage = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [vendas, setVendas] = useState<VendaRelatorio[]>([]);
    const [metodosPagamento, setMetodosPagamento] = useState<MetodoPagamento[]>([]);
    const [periodoPredefinido, setPeriodoPredefinido] = useState('hoje');
    const [dataInicial, setDataInicial] = useState<Dayjs | null>(dayjs());
    const [dataFinal, setDataFinal] = useState<Dayjs | null>(dayjs());
    const [metodosSelected, setMetodosSelected] = useState<string[]>([]);
    const [compararPeriodo, setCompararPeriodo] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
    const [statusSelected, setStatusSelected] = useState<string[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [vendaSelecionada, setVendaSelecionada] = useState<VendaRelatorio | null>(null);
    const [filters, setFilters] = useState<Filters>({
        dataInicio: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        dataFim: format(new Date(), 'yyyy-MM-dd'),
        status: 'all',
        formaPagamento: 'all',
        nrVenda: ''
    });

    const STATUS_OPTIONS = [
        { value: 'PENDENTE', label: 'Pendente' },
        { value: 'ACEITO', label: 'Aceito' },
        { value: 'CANCELADO', label: 'Cancelado' }
    ];

    useEffect(() => {
        const carregarMetodosPagamento = async () => {
            try {
                const response = await api.getMetodosPagamento(token);
                console.log('Métodos de pagamento:', response); // Debug
                if (response && Array.isArray(response.data)) {
                    setMetodosPagamento(response.data);
                } else {
                    console.error('Resposta inválida:', response);
                    setMetodosPagamento([]);
                }
            } catch (error) {
                console.error('Erro ao carregar métodos de pagamento:', error);
                setMetodosPagamento([]);
            }
        };

        const loadData = async () => {
            try {
                await carregarMetodosPagamento();
                await buscarDados();
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setVendas([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [token]);

    const PERIODOS_PREDEFINIDOS = [
        { valor: 'hoje', label: 'Hoje' },
        { valor: 'personalizado', label: 'Personalizado' }
    ];

    // Métricas calculadas
    const totalVendas = vendas.reduce((acc, venda) => acc + venda.valor, 0);
    const ticketMedio = totalVendas / (vendas.length || 1);
    const totalPedidos = vendas.length;
    const vendasPorMetodo = {
        dinheiro: vendas.filter(v => v.formaPagamento.nome === 'DINHEIRO').length,
        credito: vendas.filter(v => v.formaPagamento.nome === 'CREDITO').length,
        debito: vendas.filter(v => v.formaPagamento.nome === 'DEBITO').length,
        pix: vendas.filter(v => v.formaPagamento.nome === 'PIX').length,
    };

    const handleMetodosChange = (event: any) => {
        const { value } = event.target;
        const newSelected = typeof value === 'string' ? value.split(',') : value;
        setMetodosSelected(newSelected);
        // Chamar buscarDados com os novos valores selecionados
        buscarDados();
    };

    const handleStatusChange = (event: any) => {
        const { value } = event.target;
        const newSelected = typeof value === 'string' ? value.split(',') : value;
        setStatusSelected(newSelected);
        buscarDados();
    };

    const buscarDados = async () => {
        setLoading(true);
        try {
            let dataIni: Dayjs;
            let dataFim: Dayjs;

            switch (periodoPredefinido) {
                case 'hoje':
                    dataIni = dataFim = dayjs();
                    break;
                case 'ontem':
                    dataIni = dataFim = dayjs().subtract(1, 'day');
                    break;
                case '7dias':
                    dataIni = dayjs().subtract(6, 'days'); // -6 porque inclui o dia atual
                    dataFim = dayjs();
                    break;
                case '30dias':
                    dataIni = dayjs().subtract(29, 'days'); // -29 porque inclui o dia atual
                    dataFim = dayjs();
                    break;
                case 'mes_atual':
                    dataIni = dayjs().startOf('month');
                    dataFim = dayjs().endOf('month');
                    break;
                case 'mes_anterior':
                    dataIni = dayjs().subtract(1, 'month').startOf('month');
                    dataFim = dayjs().subtract(1, 'month').endOf('month');
                    break;
                case 'personalizado':
                    dataIni = dataInicial || dayjs();
                    dataFim = dataFinal || dayjs();
                    break;
                default:
                    dataIni = dataFim = dayjs();
            }

            // Garantir que as datas estejam no início/fim do dia
            dataIni = dataIni.startOf('day');
            dataFim = dataFim.endOf('day');

            console.log('Datas da busca:', {
                dataIni: dataIni.format('YYYY-MM-DD HH:mm:ss'),
                dataFim: dataFim.format('YYYY-MM-DD HH:mm:ss'),
                periodo: periodoPredefinido
            });

            const response = await api.getVendas(
                token,
                dataIni.format('YYYY-MM-DD'),
                dataFim.format('YYYY-MM-DD'),
                metodosSelected.length > 0 ? metodosSelected.map(Number) : [],
                statusSelected
            );

            console.log('Resposta da busca:', response);
            setVendas(response?.data || []);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            setVendas([]);
        } finally {
            setLoading(false);
        }
    };

    // Adicionar handler para mudança de período
    const handlePeriodoChange = (event: any) => {
        const novoPeriodo = event.target.value;
        setPeriodoPredefinido(novoPeriodo);
        buscarDados();
    };

    // Adicionar função para limpar filtros
    const handleLimparFiltros = () => {
        setPeriodoPredefinido('hoje');
        setDataInicial(dayjs());
        setDataFinal(dayjs());
        setMetodosSelected([]);
        setStatusSelected([]);
        setFilters({
            dataInicio: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
            dataFim: format(new Date(), 'yyyy-MM-dd'),
            status: 'all',
            formaPagamento: 'all',
            nrVenda: ''
        });
        buscarDados();
    };

    // Adicionar função para processar dados do gráfico
    const processarDadosGrafico = () => {
        // Agrupar vendas por data
        const vendasPorData = vendas.reduce((acc: any, venda) => {
            const data = dayjs(venda.data).format('DD/MM');
            if (!acc[data]) {
                acc[data] = {
                    data,
                    total: 0,
                    quantidade: 0
                };
            }
            acc[data].total += venda.valor;
            acc[data].quantidade += 1;
            return acc;
        }, {});

        // Converter para array e ordenar por data
        return Object.values(vendasPorData).sort((a: any, b: any) =>
            dayjs(a.data, 'DD/MM').diff(dayjs(b.data, 'DD/MM'))
        );
    };

    // Adicionar função para processar dados do gráfico de categorias
    const processarDadosCategorias = () => {
        const vendasPorCategoria = vendas.reduce((acc: any, venda) => {
            venda.order.products.forEach(product => {
                if (!acc[product.nome_produto]) {
                    acc[product.nome_produto] = {
                        categoria: product.nome_produto,
                        valor: 0,
                        quantidade: 0
                    };
                }
                acc[product.nome_produto].valor += product.preco_produto * product.quantidade;
                acc[product.nome_produto].quantidade += product.quantidade;
            });
            return acc;
        }, {});

        return Object.values(vendasPorCategoria)
            .sort((a: any, b: any) => b.valor - a.valor)
            .slice(0, 5); // Top 5 categorias
    };

    // Adicionar função para abrir modal
    const handleVerDetalhes = (venda: VendaRelatorio) => {
        setVendaSelecionada(venda);
        setModalOpen(true);
    };

    // Adicionar funções de formatação
    const formatarTelefone = (telefone: string) => {
        if (!telefone) return '';
        const cleaned = telefone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return telefone;
    };

    const formatarStatusPedido = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'received': 'Recebido',
            'preparing': 'Em Preparo',
            'ready': 'Pronto',
            'delivered': 'Entregue',
            'canceled': 'Cancelado'
        };
        return statusMap[status] || status;
    };

    // Adicionar função para cancelar venda
    const handleCancelarVenda = async (venda: VendaRelatorio) => {
        if (!confirm('Tem certeza que deseja cancelar esta venda?')) return;

        try {
            await api.cancelarVenda(token, venda.id);
            buscarDados(); // Recarrega os dados
            setModalOpen(false);
        } catch (error) {
            console.error('Erro ao cancelar venda:', error);
            alert('Erro ao cancelar venda');
        }
    };

    // Adicionar função para exportar Excel
    const exportarExcel = () => {
        const dados = vendas.map(venda => ({
            'ID': venda.id,
            'Data': new Date(venda.data).toLocaleString(),
            'Cliente': venda.order.user.nome,
            'Telefone': formatarTelefone(venda.order.user.telefone),
            'Valor': venda.valor,
            'Pagamento': venda.formaPagamento.nome,
            'Status': venda.status,
            'Origem': venda.order.origem
        }));

        const ws = XLSX.utils.json_to_sheet(dados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Vendas");
        XLSX.writeFile(wb, `vendas_${dayjs().format('DDMMYYYY_HHmm')}.xlsx`);
    };

    // Adicionar função para calcular crescimento
    const calcularCrescimento = () => {
        const hoje = dayjs();
        const inicioMesAtual = hoje.startOf('month');
        const fimMesAtual = hoje.endOf('month');
        const inicioMesAnterior = hoje.subtract(1, 'month').startOf('month');
        const fimMesAnterior = hoje.subtract(1, 'month').endOf('month');

        const vendasMesAtual = vendas.filter(v =>
            dayjs(v.data).isBetween(inicioMesAtual, fimMesAtual)
        ).reduce((acc, v) => acc + v.valor, 0);

        const vendasMesAnterior = vendas.filter(v =>
            dayjs(v.data).isBetween(inicioMesAnterior, fimMesAnterior)
        ).reduce((acc, v) => acc + v.valor, 0);

        const crescimento = vendasMesAnterior === 0 ? 100 :
            ((vendasMesAtual - vendasMesAnterior) / vendasMesAnterior) * 100;

        return {
            valor: crescimento,
            positivo: crescimento >= 0
        };
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Cabeçalho */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Relatório de Vendas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Análise detalhada das vendas e faturamento
                </Typography>
            </Paper>

            {/* Filtros */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Período"
                            value={periodoPredefinido}
                            onChange={handlePeriodoChange}
                        >
                            {PERIODOS_PREDEFINIDOS.map((periodo) => (
                                <MenuItem key={periodo.valor} value={periodo.valor}>
                                    {periodo.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Data Inicial e Final (visível quando personalizado) */}
                    {periodoPredefinido === 'personalizado' && (
                        <>
                            <Grid item xs={12} md={3}>
                                <DatePicker
                                    label="Data Inicial"
                                    value={dataInicial}
                                    onChange={setDataInicial}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <DatePicker
                                    label="Data Final"
                                    value={dataFinal}
                                    onChange={setDataFinal}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                />
                            </Grid>
                        </>
                    )}

                    {/* Métodos de Pagamento */}
                    <Grid item xs={12} md={periodoPredefinido === 'personalizado' ? 3 : 6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Métodos de Pagamento</InputLabel>
                            <Select
                                multiple
                                value={metodosSelected}
                                onChange={handleMetodosChange}
                                input={<OutlinedInput label="Métodos de Pagamento" />}
                                renderValue={(selected) => (
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                        {selected.map((value) => {
                                            const metodo = metodosPagamento.find(m => m.id.toString() === value);
                                            return (
                                                <Chip key={value} label={metodo?.nome || value} size="small" />
                                            );
                                        })}
                                    </Stack>
                                )}
                            >
                                {metodosPagamento.map((metodo: MetodoPagamento) => (
                                    <MenuItem key={metodo.id} value={metodo.id.toString()}>
                                        <Checkbox checked={metodosSelected.indexOf(metodo.id.toString()) > -1} />
                                        <ListItemText primary={metodo.nome} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Status */}
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                multiple
                                value={statusSelected}
                                onChange={handleStatusChange}
                                input={<OutlinedInput label="Status" />}
                                renderValue={(selected) => (
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                        {selected.map((value) => (
                                            <Chip
                                                key={value}
                                                label={STATUS_OPTIONS.find(s => s.value === value)?.label || value}
                                                size="small"
                                            />
                                        ))}
                                    </Stack>
                                )}
                            >
                                {STATUS_OPTIONS.map((status) => (
                                    <MenuItem key={status.value} value={status.value}>
                                        <Checkbox checked={statusSelected.indexOf(status.value) > -1} />
                                        <ListItemText primary={status.label} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Novo campo de busca por número */}
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Nº da Venda"
                            value={filters.nrVenda}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                nrVenda: e.target.value
                            }))}
                        />
                    </Grid>

                    {/* Botão Limpar */}
                    <Grid item xs={12} md={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="inherit"
                            onClick={handleLimparFiltros}
                            size="small"
                            sx={{ height: '40px' }}
                        >
                            Limpar Filtros
                        </Button>
                    </Grid>

                    {/* Botões de Ação */}
                    <Grid item xs={12} md={3}>
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                onClick={buscarDados}
                                disabled={loading}
                                sx={{ flex: 1 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Buscar'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setCompararPeriodo(!compararPeriodo)}
                                startIcon={<CompareArrows />}
                                color={compararPeriodo ? "primary" : "inherit"}
                                sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                            >
                                Comparar
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* Adicionar após o Paper dos filtros e antes do ToggleButtonGroup */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Filtros ativos:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                        label={`Período: ${PERIODOS_PREDEFINIDOS.find(p => p.valor === periodoPredefinido)?.label}`}
                        size="small"
                    />
                    {metodosSelected.length > 0 && (
                        <Chip
                            label={`Métodos: ${metodosSelected.length} selecionado(s)`}
                            size="small"
                        />
                    )}
                    {statusSelected.length > 0 && (
                        <Chip
                            label={`Status: ${statusSelected.length} selecionado(s)`}
                            size="small"
                        />
                    )}
                    {periodoPredefinido === 'personalizado' && (
                        <Chip
                            label={`${dataInicial?.format('DD/MM/YYYY')} até ${dataFinal?.format('DD/MM/YYYY')}`}
                            size="small"
                        />
                    )}
                </Stack>
            </Box>

            {/* Adicione após os filtros e antes do conteúdo principal */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newValue) => newValue && setViewMode(newValue)}
                    size="small"
                >
                    <ToggleButton value="table">
                        <TableChart sx={{ mr: 1 }} />
                        Tabela
                    </ToggleButton>
                    <ToggleButton value="chart">
                        <InsertChart sx={{ mr: 1 }} />
                        Gráficos
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Cards de Métricas */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {[
                    {
                        title: 'Total de Vendas',
                        value: formatCurrency(totalVendas),
                        icon: <AttachMoney />,
                        color: theme.palette.success.main
                    },
                    {
                        title: 'Ticket Médio',
                        value: formatCurrency(ticketMedio),
                        icon: <TrendingUp />,
                        color: theme.palette.primary.main
                    },
                    {
                        title: 'Total de Pedidos',
                        value: totalPedidos,
                        icon: <ShoppingCart />,
                        color: theme.palette.info.main
                    },
                    {
                        title: 'Crescimento',
                        value: `${Math.abs(calcularCrescimento().valor).toFixed(1)}%`,
                        icon: calcularCrescimento().positivo ? <TrendingUp /> : <TrendingDown />,
                        color: calcularCrescimento().positivo ? theme.palette.success.main : theme.palette.error.main,
                        subtitle: 'Em relação ao mês anterior'
                    }
                ].map((metric, index) => (
                    <Grid item xs={12} md={3} key={index}>
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
                                {metric.subtitle && (
                                    <Typography variant="body2" color="text.secondary">
                                        {metric.subtitle}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Métodos de Pagamento */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Métodos de Pagamento</Typography>
                <Grid container spacing={2}>
                    {metodosPagamento.map((metodo) => {
                        // Definir ícone baseado no nome do método
                        let icon = <Money />;
                        if (metodo.nome.includes('PIX')) icon = <Pix />;
                        if (metodo.nome.includes('CREDITO')) icon = <CreditCard />;
                        if (metodo.nome.includes('DEBITO')) icon = <CreditCard />;

                        return (
                            <Grid item xs={6} md={3} key={metodo.id}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            {icon}
                                            <Typography sx={{ ml: 1 }}>{metodo.nome}</Typography>
                                        </Box>
                                        <Typography variant="h6">
                                            {vendas.filter(v => v.formaPagamento.id === metodo.id).length}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Paper>

            {/* Conteúdo condicional */}
            {viewMode === 'table' ? (
                <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={exportarExcel}
                            disabled={vendas.length === 0}
                        >
                            Exportar Excel
                        </Button>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nº Venda</TableCell>
                                    <TableCell>Data</TableCell>
                                    <TableCell>Cliente</TableCell>
                                    <TableCell>Estabelecimento</TableCell>
                                    <TableCell align="right">Valor</TableCell>
                                    <TableCell>Pagamento</TableCell>
                                    <TableCell align="right">Origem</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : vendas.map((venda) => (
                                    <TableRow
                                        key={venda.id}
                                        hover
                                        sx={venda.status === 'CANCELADO' ? {
                                            backgroundColor: 'error.lighter',
                                            '&:hover': {
                                                backgroundColor: 'error.light',
                                            }
                                        } : undefined}
                                    >
                                        <TableCell>{venda.nrVenda}</TableCell>
                                        <TableCell>{new Date(venda.data).toLocaleString()}</TableCell>
                                        <TableCell>{venda.order?.user?.nome || '-'}</TableCell>
                                        <TableCell>{venda.tenant?.nome || '-'}</TableCell>
                                        <TableCell align="right" sx={venda.status === 'CANCELADO' ? { textDecoration: 'line-through' } : undefined}>
                                            {formatCurrency(venda.valor)}
                                        </TableCell>
                                        <TableCell>{venda.formaPagamento?.nome || '-'}</TableCell>
                                        <TableCell align="right">{venda.order?.origem || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={venda.status}
                                                size="small"
                                                color={
                                                    venda.status === 'PENDENTE' ? 'warning' :
                                                        venda.status === 'ACEITO' ? 'success' : 'error'
                                                }
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="Ver Detalhes">
                                                    <IconButton size="small" onClick={() => handleVerDetalhes(venda)}>
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip>
                                                {venda.status !== 'CANCELADO' && (
                                                    <Tooltip title="Cancelar Venda">
                                                        <IconButton size="small" color="error" onClick={() => handleCancelarVenda(venda)}>
                                                            <Cancel />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {/* Gráfico de Evolução de Vendas */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2, height: '400px' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Evolução de Vendas</Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={processarDadosGrafico()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="data" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <RechartsTooltip
                                        formatter={(value: number, name: string) => [formatCurrency(value), name]}
                                    />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="total"
                                        stroke={theme.palette.primary.main}
                                        name="Valor Total"
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="quantidade"
                                        stroke={theme.palette.success.main}
                                        name="Quantidade"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Gráfico de Métodos de Pagamento */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, height: '400px' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Métodos de Pagamento</Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <PieChart>
                                    <Pie
                                        data={metodosPagamento.map(metodo => ({
                                            name: metodo.nome,
                                            value: vendas
                                                .filter(v => v.formaPagamento.id === metodo.id)
                                                .reduce((acc, v) => acc + v.valor, 0)
                                        }))}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill={theme.palette.primary.main}
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, value, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}% (${formatCurrency(value)})`
                                        }
                                    >
                                        {metodosPagamento.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={[
                                                    theme.palette.primary.main,
                                                    theme.palette.success.main,
                                                    theme.palette.warning.main,
                                                    theme.palette.error.main
                                                ][index % 4]}
                                            />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: number, name: string) => [value, name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Gráfico de Barras - Ranking de Vendas */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, height: '400px' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Ranking de Vendas por Categoria</Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart
                                    data={processarDadosCategorias()}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="categoria" />
                                    <YAxis />
                                    <RechartsTooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="valor"
                                        name="Valor Total"
                                        fill={theme.palette.primary.main}
                                    />
                                    <Bar
                                        dataKey="quantidade"
                                        name="Quantidade"
                                        fill={theme.palette.success.main}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Modal de detalhes */}
            <Dialog
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Detalhes da Venda #{vendaSelecionada?.id}
                    <IconButton
                        onClick={() => setModalOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {vendaSelecionada && (
                        <Grid container spacing={2}>
                            {/* Informações da Venda */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>Informações da Venda</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Data</Typography>
                                <Typography>{new Date(vendaSelecionada.data).toLocaleString()}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                <Chip
                                    label={vendaSelecionada.status}
                                    color={
                                        vendaSelecionada.status === 'PENDENTE' ? 'warning' :
                                            vendaSelecionada.status === 'ACEITO' ? 'success' : 'error'
                                    }
                                    size="small"
                                />
                            </Grid>

                            {/* Informações do Cliente */}
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom>Informações do Cliente</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Nome</Typography>
                                <Typography>{vendaSelecionada.order.user.nome}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                                <Typography>{vendaSelecionada.order.user.email}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Telefone</Typography>
                                <Typography>{formatarTelefone(vendaSelecionada.order.user.telefone)}</Typography>
                            </Grid>

                            {/* Informações do Pagamento */}
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom>Informações do Pagamento</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Método</Typography>
                                <Typography>{vendaSelecionada.formaPagamento.nome}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Troco</Typography>
                                <Typography>{formatCurrency(vendaSelecionada.order.troco)}</Typography>
                            </Grid>

                            {/* Informações do Pedido */}
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom>Informações do Pedido</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Origem</Typography>
                                <Typography>{vendaSelecionada.order.origem}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Status do Pedido</Typography>
                                <Typography>{formatarStatusPedido(vendaSelecionada.order.status)}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">Subtotal</Typography>
                                <Typography>{formatCurrency(vendaSelecionada.order.subtotal)}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">Frete</Typography>
                                <Typography>{formatCurrency(vendaSelecionada.order.shippingPrice)}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">Total</Typography>
                                <Typography variant="h6" color="primary">{formatCurrency(vendaSelecionada.order.preco)}</Typography>
                            </Grid>

                            {/* Produtos */}
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom>Produtos</Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Produto</TableCell>
                                                <TableCell align="right">Quantidade</TableCell>
                                                <TableCell align="right">Preço Unit.</TableCell>
                                                <TableCell align="right">Total</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {vendaSelecionada.order.products.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>{product.nome_produto}</TableCell>
                                                    <TableCell align="right">{product.quantidade}</TableCell>
                                                    <TableCell align="right">{formatCurrency(product.preco_produto)}</TableCell>
                                                    <TableCell align="right">{formatCurrency(product.preco_produto * product.quantidade)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default RelatorioVendasPage;