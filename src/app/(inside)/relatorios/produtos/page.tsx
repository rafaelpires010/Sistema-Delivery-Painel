'use client'

import { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Grid, Card, CardContent, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Chip, Stack, Tooltip, IconButton, useTheme,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Checkbox,
    ListItemText,
    TextField,
    MenuItem,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import {
    AttachMoney, ShoppingCart, TrendingUp, Download,
    Visibility, TrendingDown, TableChart, InsertChart, Close
} from '@mui/icons-material';
import { formatCurrency } from '@/libs/formatCurrency';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import { api } from '@/libs/api';
import { getCookie } from 'cookies-next';
const XLSX = require('xlsx');

interface ProdutoRelatorio {
    id: number;
    nome: string;
    categoria: {
        nome: string;
    };
    quantidade_vendida: number;
    quantidade_cancelada: number;
    preco_venda: number;
    valor_total_vendas: number;
    imagem: string;
    data: string;
}

interface Categoria {
    id: number;
    nome: string;
}

const PERIODOS_PREDEFINIDOS = [
    { valor: 'hoje', label: 'Hoje' },
    { valor: 'personalizado', label: 'Personalizado' }
];

const RelatorioProdutosPage = () => {
    const theme = useTheme();
    const token = getCookie('token') as string;
    const [loading, setLoading] = useState(true);
    const [produtos, setProdutos] = useState<ProdutoRelatorio[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [periodoPredefinido, setPeriodoPredefinido] = useState('hoje');
    const [dataInicial, setDataInicial] = useState<Dayjs | null>(dayjs());
    const [dataFinal, setDataFinal] = useState<Dayjs | null>(dayjs());
    const [categoriasSelected, setCategoriasSelected] = useState<string[]>([]);
    const [produtoSearch, setProdutoSearch] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoRelatorio | null>(null);

    // Métricas calculadas
    const totalVendas = produtos.reduce((acc, p) => acc + p.valor_total_vendas, 0);
    const totalQuantidade = produtos.reduce((acc, p) => acc + p.quantidade_vendida, 0);
    const margemMediaLucro = produtos.length > 0 ?
        produtos.reduce((acc, p) => acc + ((p.valor_total_vendas - (p.preco_venda * p.quantidade_vendida)) / p.valor_total_vendas * 100), 0) / produtos.length : 0;

    // Dados processados para os gráficos
    const produtosMaisVendidos = [...produtos]
        .sort((a, b) => b.quantidade_vendida - a.quantidade_vendida)
        .slice(0, 5)
        .map(p => ({
            nome: p.nome,
            quantidade: p.quantidade_vendida,
            valor: p.valor_total_vendas
        }));

    const produtosMenosVendidos = [...produtos]
        .sort((a, b) => a.quantidade_vendida - b.quantidade_vendida)
        .slice(0, 5)
        .map(p => ({
            nome: p.nome,
            quantidade: p.quantidade_vendida,
            valor: p.valor_total_vendas
        }));

    const calcularCrescimento = () => {
        const hoje = dayjs();
        const inicioMesAtual = hoje.startOf('month');
        const inicioMesAnterior = hoje.subtract(1, 'month').startOf('month');
        const fimMesAnterior = inicioMesAtual.subtract(1, 'day');

        const vendasMesAtual = produtos.reduce((acc, p) => {
            const dataVenda = dayjs(p.data);
            if (dataVenda.isAfter(inicioMesAtual) || dataVenda.isSame(inicioMesAtual)) {
                return acc + p.valor_total_vendas;
            }
            return acc;
        }, 0);

        const vendasMesAnterior = produtos.reduce((acc, p) => {
            const dataVenda = dayjs(p.data);
            if ((dataVenda.isAfter(inicioMesAnterior) || dataVenda.isSame(inicioMesAnterior)) &&
                (dataVenda.isBefore(fimMesAnterior) || dataVenda.isSame(fimMesAnterior))) {
                return acc + p.valor_total_vendas;
            }
            return acc;
        }, 0);

        if (vendasMesAnterior === 0) return 0;
        return ((vendasMesAtual - vendasMesAnterior) / vendasMesAnterior) * 100;
    };

    const carregarDados = async () => {
        setLoading(true);
        try {
            const [produtosRes, categoriasRes] = await Promise.all([
                api.getRelatorioProdutos(
                    token,
                    dataInicial?.format('YYYY-MM-DD'),
                    dataFinal?.format('YYYY-MM-DD'),
                    categoriasSelected.map(Number)
                ),
                api.getCategories(token)
            ]);
            setProdutos(produtosRes.data);
            setCategorias(categoriasRes);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    // Função para limpar filtros
    const handleLimparFiltros = () => {
        setPeriodoPredefinido('hoje');
        setDataInicial(dayjs());
        setDataFinal(dayjs());
        setCategoriasSelected([]);
        setProdutoSearch('');
        carregarDados();
    };

    const handleExportarExcel = () => {
        const dados = produtos.map(produto => ({
            'Produto': produto.nome,
            'Categoria': produto.categoria.nome,
            'Quantidade Vendida': produto.quantidade_vendida,
            'Quantidade Cancelada': produto.quantidade_cancelada,
            'Preço de Venda': formatCurrency(produto.preco_venda),
            'Total em Vendas': formatCurrency(produto.valor_total_vendas),
            'Margem': `${((produto.valor_total_vendas - (produto.preco_venda * produto.quantidade_vendida)) / produto.valor_total_vendas * 100).toFixed(2)}%`
        }));

        const ws = XLSX.utils.json_to_sheet(dados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Produtos");
        XLSX.writeFile(wb, `relatorio_produtos_${dayjs().format('DDMMYYYY_HHmm')}.xlsx`);
    };

    const handleVerDetalhes = (produto: ProdutoRelatorio) => {
        setProdutoSelecionado(produto);
        setModalOpen(true);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Cabeçalho */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Relatório de Produtos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Análise detalhada dos produtos e vendas
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
                            onChange={(e) => setPeriodoPredefinido(e.target.value)}
                        >
                            {PERIODOS_PREDEFINIDOS.map((periodo) => (
                                <MenuItem key={periodo.valor} value={periodo.valor}>
                                    {periodo.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

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

                    <Grid item xs={12} md={periodoPredefinido === 'personalizado' ? 3 : 4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Categorias</InputLabel>
                            <Select
                                multiple
                                value={categoriasSelected}
                                onChange={(e) => setCategoriasSelected(e.target.value as string[])}
                                input={<OutlinedInput label="Categorias" />}
                                renderValue={(selected) => (
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                        {selected.map((value) => {
                                            const categoria = categorias.find(c => c.id.toString() === value);
                                            return (
                                                <Chip key={value} label={categoria?.nome || value} size="small" />
                                            );
                                        })}
                                    </Stack>
                                )}
                            >
                                {categorias.map((categoria) => (
                                    <MenuItem key={categoria.id} value={categoria.id.toString()}>
                                        <Checkbox checked={categoriasSelected.indexOf(categoria.id.toString()) > -1} />
                                        <ListItemText primary={categoria.nome} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={periodoPredefinido === 'personalizado' ? 3 : 4}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Buscar Produto"
                            value={produtoSearch}
                            onChange={(e) => setProdutoSearch(e.target.value)}
                        />
                    </Grid>

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

                    <Grid item xs={12} md={3}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={carregarDados}
                            disabled={loading}
                            sx={{ height: '40px' }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Buscar'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Chips de filtros ativos */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Filtros ativos:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                        label={`Período: ${PERIODOS_PREDEFINIDOS.find(p => p.valor === periodoPredefinido)?.label}`}
                        size="small"
                    />
                    {categoriasSelected.length > 0 && (
                        <Chip
                            label={`Categorias: ${categoriasSelected.length} selecionada(s)`}
                            size="small"
                        />
                    )}
                    {produtoSearch && (
                        <Chip
                            label={`Busca: ${produtoSearch}`}
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

            {/* Toggle Button */}
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
                        title: 'Total em Vendas',
                        value: formatCurrency(totalVendas),
                        icon: <AttachMoney />,
                        color: theme.palette.success.main
                    },
                    {
                        title: 'Produtos Vendidos',
                        value: totalQuantidade,
                        icon: <ShoppingCart />,
                        color: theme.palette.primary.main
                    },
                    {
                        title: 'Margem Média',
                        value: `${margemMediaLucro.toFixed(2)}%`,
                        icon: <TrendingUp />,
                        color: theme.palette.info.main
                    },
                    {
                        title: 'Crescimento',
                        value: `${Math.abs(calcularCrescimento()).toFixed(1)}%`,
                        icon: calcularCrescimento() >= 0 ? <TrendingUp /> : <TrendingDown />,
                        color: calcularCrescimento() >= 0 ? theme.palette.success.main : theme.palette.error.main,
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

            {/* Conteúdo condicional */}
            {viewMode === 'table' ? (
                <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={handleExportarExcel}
                        >
                            Exportar Excel
                        </Button>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Produto</TableCell>
                                    <TableCell>Categoria</TableCell>
                                    <TableCell align="right">Qtd. Vendida</TableCell>
                                    <TableCell align="right">Qtd. Cancelada</TableCell>
                                    <TableCell align="right">Preço Venda</TableCell>
                                    <TableCell align="right">Total Vendas</TableCell>
                                    <TableCell align="right">Margem</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {produtos.map((produto) => (
                                    <TableRow key={produto.id} hover>
                                        <TableCell>{produto.nome}</TableCell>
                                        <TableCell>{produto.categoria.nome}</TableCell>
                                        <TableCell align="right">{produto.quantidade_vendida}</TableCell>
                                        <TableCell align="right">{produto.quantidade_cancelada}</TableCell>
                                        <TableCell align="right">{formatCurrency(produto.preco_venda)}</TableCell>
                                        <TableCell align="right">{formatCurrency(produto.valor_total_vendas)}</TableCell>
                                        <TableCell align="right">
                                            <Chip
                                                label={`${((produto.valor_total_vendas - (produto.preco_venda * produto.quantidade_vendida)) / produto.valor_total_vendas * 100).toFixed(2)}%`}
                                                color={((produto.valor_total_vendas - (produto.preco_venda * produto.quantidade_vendida)) / produto.valor_total_vendas * 100) > 30 ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="Ver Detalhes">
                                                    <IconButton size="small" onClick={() => handleVerDetalhes(produto)}>
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            ) : (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* Produtos Mais Vendidos */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: '400px' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Produtos Mais Vendidos
                            </Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart
                                    data={produtosMaisVendidos}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis
                                        dataKey="nome"
                                        type="category"
                                        width={150}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <RechartsTooltip
                                        formatter={(value: any, name: string) => [
                                            name === 'valor' ? formatCurrency(value) : value,
                                            name === 'valor' ? 'Valor Total' : 'Quantidade'
                                        ]}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="quantidade"
                                        name="Quantidade"
                                        fill={theme.palette.primary.main}
                                    />
                                    <Bar
                                        dataKey="valor"
                                        name="Valor Total"
                                        fill={theme.palette.success.main}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Produtos Menos Vendidos */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: '400px' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Produtos Menos Vendidos
                            </Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart
                                    data={produtosMenosVendidos}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis
                                        dataKey="nome"
                                        type="category"
                                        width={150}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <RechartsTooltip
                                        formatter={(value: any, name: string) => [
                                            name === 'valor' ? formatCurrency(value) : value,
                                            name === 'valor' ? 'Valor Total' : 'Quantidade'
                                        ]}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="quantidade"
                                        name="Quantidade"
                                        fill={theme.palette.error.main}
                                    />
                                    <Bar
                                        dataKey="valor"
                                        name="Valor Total"
                                        fill={theme.palette.warning.main}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Distribuição por Categoria */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, height: '400px' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Distribuição por Categoria
                            </Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart
                                    data={categorias.map(cat => ({
                                        nome: cat.nome,
                                        quantidade: produtos
                                            .filter(p => p.categoria.nome === cat.nome)
                                            .reduce((acc, p) => acc + p.quantidade_vendida, 0),
                                        valor: produtos
                                            .filter(p => p.categoria.nome === cat.nome)
                                            .reduce((acc, p) => acc + p.valor_total_vendas, 0)
                                    }))}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="nome" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <RechartsTooltip
                                        formatter={(value: any, name: string) => [
                                            name === 'valor' ? formatCurrency(value) : value,
                                            name === 'valor' ? 'Valor Total' : 'Quantidade'
                                        ]}
                                    />
                                    <Legend />
                                    <Bar
                                        yAxisId="left"
                                        dataKey="quantidade"
                                        name="Quantidade"
                                        fill={theme.palette.primary.main}
                                    />
                                    <Bar
                                        yAxisId="right"
                                        dataKey="valor"
                                        name="Valor Total"
                                        fill={theme.palette.success.main}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Novo gráfico com imagens */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Visão Geral dos Produtos
                            </Typography>
                            <Grid container spacing={2}>
                                {produtos.map((produto) => (
                                    <Grid item xs={12} sm={6} md={3} key={produto.id}>
                                        <Paper
                                            elevation={3}
                                            sx={{
                                                p: 2,
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={produto.imagem}
                                                alt={produto.nome}
                                                sx={{
                                                    width: 120,
                                                    height: 120,
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    mb: 1
                                                }}
                                            />
                                            <Typography variant="subtitle1" noWrap>
                                                {produto.nome}
                                            </Typography>
                                            <Box sx={{ width: '100%', mt: 1 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Vendas
                                                </Typography>
                                                <Box sx={{
                                                    width: '100%',
                                                    height: 8,
                                                    bgcolor: 'grey.200',
                                                    borderRadius: 1,
                                                    overflow: 'hidden'
                                                }}>
                                                    <Box
                                                        sx={{
                                                            width: `${(produto.quantidade_vendida / totalQuantidade) * 100}%`,
                                                            height: '100%',
                                                            bgcolor: theme.palette.primary.main
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                            <Stack
                                                direction="row"
                                                spacing={2}
                                                sx={{
                                                    width: '100%',
                                                    justifyContent: 'space-between',
                                                    mt: 1
                                                }}
                                            >
                                                <Typography variant="body2">
                                                    {produto.quantidade_vendida} un
                                                </Typography>
                                                <Typography variant="body2" color="primary">
                                                    {formatCurrency(produto.valor_total_vendas)}
                                                </Typography>
                                            </Stack>
                                            <Chip
                                                label={`${((produto.valor_total_vendas - (produto.preco_venda * produto.quantidade_vendida)) / produto.valor_total_vendas * 100).toFixed(2)}%`}
                                                color={((produto.valor_total_vendas - (produto.preco_venda * produto.quantidade_vendida)) / produto.valor_total_vendas * 100) > 30 ? 'success' : 'warning'}
                                                size="small"
                                                sx={{ mt: 1 }}
                                            />
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <Dialog
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Detalhes do Produto
                    <IconButton
                        onClick={() => setModalOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {produtoSelecionado && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Box
                                    component="img"
                                    src={produtoSelecionado.imagem}
                                    alt={produtoSelecionado.nome}
                                    sx={{
                                        width: '100%',
                                        height: 200,
                                        objectFit: 'cover',
                                        borderRadius: 2
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6">{produtoSelecionado.nome}</Typography>
                                <Typography color="text.secondary" gutterBottom>
                                    {produtoSelecionado.categoria.nome}
                                </Typography>

                                <Stack spacing={2} sx={{ mt: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Preço de Venda
                                        </Typography>
                                        <Typography variant="h6">
                                            {formatCurrency(produtoSelecionado.preco_venda)}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Total em Vendas
                                        </Typography>
                                        <Typography variant="h6">
                                            {formatCurrency(produtoSelecionado.valor_total_vendas)}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Margem de Lucro
                                        </Typography>
                                        <Chip
                                            label={`${((produtoSelecionado.valor_total_vendas - (produtoSelecionado.preco_venda * produtoSelecionado.quantidade_vendida)) / produtoSelecionado.valor_total_vendas * 100).toFixed(2)}%`}
                                            color={((produtoSelecionado.valor_total_vendas - (produtoSelecionado.preco_venda * produtoSelecionado.quantidade_vendida)) / produtoSelecionado.valor_total_vendas * 100) > 30 ? 'success' : 'warning'}
                                        />
                                    </Box>
                                </Stack>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Métricas de Vendas
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Quantidade Vendida
                                            </Typography>
                                            <Typography variant="h4">
                                                {produtoSelecionado.quantidade_vendida}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Quantidade Cancelada
                                            </Typography>
                                            <Typography variant="h4">
                                                {produtoSelecionado.quantidade_cancelada}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default RelatorioProdutosPage;