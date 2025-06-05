'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Switch,
    IconButton,
    Tab,
    Tabs,
    Card,
    CardContent,
    CardActions,
    Divider,
    TextField,
    FormControlLabel,
    Checkbox,
    Chip,
    MenuItem,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import {
    Edit,
    Add,
    CreditCard,
    Money,
    Pix,
    Receipt,
    Store,
    LocalShipping,
    Payment,
    Terminal,
    Save,
    Delete,
    Block,
    CheckCircle,
    Cancel
} from '@mui/icons-material';
import { api } from '@/libs/api';
import { getCookie } from 'cookies-next';

// Tipos de integração disponíveis
const INTEGRATION_TYPES = {
    NONE: { value: 'none', label: 'Nenhuma', icon: <Payment /> },
    TEF: { value: 'tef', label: 'TEF', icon: <Terminal /> },
    PIX: { value: 'pix', label: 'PIX', icon: <Pix /> },
    STONE: { value: 'stone', label: 'Stone', icon: <CreditCard /> },
    REDE: { value: 'rede', label: 'Rede', icon: <CreditCard /> },
    GETNET: { value: 'getnet', label: 'Getnet', icon: <CreditCard /> }
} as const;

// Métodos de pagamento pré-definidos
const PAYMENT_TYPES = {
    CARTAO: { value: 'cartao', label: 'Cartão', icon: <CreditCard /> },
    DINHEIRO: { value: 'dinheiro', label: 'Dinheiro', icon: <Money /> },
    PIX: { value: 'pix', label: 'PIX', icon: <Pix /> }
} as const;

interface Pagamento {
    id: number;
    nome: string;
    tipo: 'CARTAO' | 'DINHEIRO' | 'PIX';
    api_key: string | null;
    merchant_id: string | null;
    terminal_id: string | null;
    integracao: keyof typeof INTEGRATION_TYPES | null;
    delivery: boolean;
    ativo: boolean;
    aceitaIntegracao: boolean;
    pdvs: any[];
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const PagamentosPage = () => {
    const token = getCookie('token') as string;
    const [tabValue, setTabValue] = useState(0);
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [integracaoModalOpen, setIntegracaoModalOpen] = useState(false);
    const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null);
    const [formData, setFormData] = useState<Omit<Pagamento, 'id' | 'pdvs'>>({
        nome: '',
        tipo: 'DINHEIRO',
        api_key: null,
        merchant_id: null,
        terminal_id: null,
        integracao: null,
        delivery: false,
        ativo: true,
        aceitaIntegracao: false
    });
    const [integracaoConfig, setIntegracaoConfig] = useState<{
        apiKey: string | undefined;
        merchantId: string | undefined;
        terminal: string | undefined;
    }>({
        apiKey: undefined,
        merchantId: undefined,
        terminal: undefined
    });

    const carregarPagamentos = async () => {
        try {
            setLoading(true);
            const response = await api.getMetodosPagamento(token as string);
            setPagamentos(response.data);
        } catch (error) {
            console.error('Erro ao carregar pagamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarPagamentos();
    }, []);

    const handleOpenModal = (pagamento?: Pagamento) => {
        if (pagamento) {
            setPagamentoSelecionado(pagamento);
            setFormData({
                nome: pagamento.nome,
                tipo: pagamento.tipo,
                api_key: pagamento.api_key,
                merchant_id: pagamento.merchant_id,
                terminal_id: pagamento.terminal_id,
                integracao: pagamento.integracao,
                delivery: pagamento.delivery,
                ativo: pagamento.ativo,
                aceitaIntegracao: pagamento.aceitaIntegracao
            });
        } else {
            setPagamentoSelecionado(null);
            setFormData({
                nome: '',
                tipo: 'DINHEIRO',
                api_key: null,
                merchant_id: null,
                terminal_id: null,
                integracao: null,
                delivery: tabValue === 1,
                ativo: true,
                aceitaIntegracao: false
            });
        }
        setModalOpen(true);
    };

    const handleOpenIntegracaoModal = (pagamento: Pagamento) => {
        setPagamentoSelecionado(pagamento);
        setIntegracaoConfig({
            apiKey: pagamento.api_key || '',
            merchantId: pagamento.merchant_id || '',
            terminal: pagamento.terminal_id || ''
        });
        setIntegracaoModalOpen(true);
    };

    const handleSalvar = async () => {
        try {
            const data = {
                ...formData,
                delivery: tabValue === 1,
                aceitaTroco: formData.tipo === 'DINHEIRO',
                aceitaIntegracao: !tabValue && (formData.tipo === 'CARTAO' || formData.tipo === 'PIX')
            };

            if (pagamentoSelecionado) {
                const response = await api.updateMetodoPagamento(token, pagamentoSelecionado.id, data);
                setPagamentos(pagamentos.map(p =>
                    p.id === pagamentoSelecionado.id ? response.data : p
                ));
            } else {
                const response = await api.createMetodoPagamento(token, data);
                setPagamentos([...pagamentos, response.data]);
            }
            setModalOpen(false);
        } catch (error) {
            console.error('Erro ao salvar pagamento:', error);
            // TODO: Adicionar feedback visual do erro
        }
    };

    const handleSalvarIntegracao = async () => {
        try {
            if (pagamentoSelecionado) {
                const data = {
                    ...pagamentoSelecionado,
                    api_key: integracaoConfig.apiKey,
                    merchant_id: integracaoConfig.merchantId,
                    terminal_id: integracaoConfig.terminal
                };

                const response = await api.updateMetodoPagamento(token, pagamentoSelecionado.id, data);
                setPagamentos(pagamentos.map(p =>
                    p.id === pagamentoSelecionado.id ? response.data : p
                ));
            }
            setIntegracaoModalOpen(false);
        } catch (error) {
            console.error('Erro ao salvar integração:', error);
            // TODO: Adicionar feedback visual do erro
        }
    };

    const handleExcluir = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este pagamento?')) {
            try {
                await api.deleteMetodoPagamento(token, id);
                setPagamentos(pagamentos.filter(p => p.id !== id));
            } catch (error) {
                console.error('Erro ao excluir pagamento:', error);
                // TODO: Adicionar feedback visual do erro
            }
        }
    };

    const handleToggleStatus = async (id: number, ativo: boolean) => {
        try {
            await api.toggleMetodoPagamentoStatus(token, id);
            setPagamentos(pagamentos.map(p =>
                p.id === id ? { ...p, ativo: !ativo } : p
            ));
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            // TODO: Adicionar feedback visual do erro
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>Formas de Pagamento</Typography>

                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                >
                    <Tab
                        icon={<Store />}
                        label="PDV"
                        iconPosition="start"
                    />
                    <Tab
                        icon={<LocalShipping />}
                        label="Delivery"
                        iconPosition="start"
                    />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Stack direction="row" justifyContent="space-between" mb={3}>
                        <Typography variant="h6">Pagamentos do PDV</Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenModal()}
                        >
                            Novo Pagamento PDV
                        </Button>
                    </Stack>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Integração</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Troco</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pagamentos
                                    .filter(p => !p.delivery)
                                    .map((pagamento) => (
                                        <TableRow key={pagamento.id} hover>
                                            <TableCell>{pagamento.nome}</TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    {PAYMENT_TYPES[pagamento.tipo].icon}
                                                    <Typography>{PAYMENT_TYPES[pagamento.tipo].label}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-start" sx={{ minWidth: 200 }}>
                                                    {pagamento.aceitaIntegracao ? (
                                                        pagamento.integracao ? (
                                                            // Tem integração configurada
                                                            <>
                                                                <Box sx={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                                                                    {INTEGRATION_TYPES[pagamento.integracao].icon}
                                                                </Box>
                                                                <Typography>{INTEGRATION_TYPES[pagamento.integracao].label}</Typography>
                                                            </>
                                                        ) : (
                                                            // Aceita integração mas não está configurada
                                                            <>
                                                                <Box sx={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                                                                    <Payment color="warning" />
                                                                </Box>
                                                                <Typography color="warning.main">Disponível (Não configurada)</Typography>
                                                            </>
                                                        )
                                                    ) : (
                                                        // Não aceita integração
                                                        <>
                                                            <Box sx={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                                                                <Cancel color="error" />
                                                            </Box>
                                                            <Typography color="error">Não disponível</Typography>
                                                        </>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={pagamento.ativo ? 'Ativo' : 'Inativo'}
                                                    color={pagamento.ativo ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {pagamento.tipo === 'DINHEIRO' ? <CheckCircle color="success" /> : <Cancel color="error" />}
                                            </TableCell>
                                            <TableCell align="center" sx={{ minWidth: 200 }}>
                                                <Stack direction="row" spacing={2} justifyContent="center">
                                                    {/* Coluna de Integração - sempre mantém o espaço */}
                                                    <Box sx={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        {pagamento.aceitaIntegracao && (
                                                            <Tooltip title="Configurar Integração">
                                                                <IconButton size="small" onClick={() => handleOpenIntegracaoModal(pagamento)}>
                                                                    <Terminal />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Box>

                                                    {/* Coluna de Edição */}
                                                    <Box sx={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Tooltip title="Editar">
                                                            <IconButton size="small" onClick={() => handleOpenModal(pagamento)}>
                                                                <Edit />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>

                                                    {/* Coluna de Status */}
                                                    <Box sx={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Tooltip title={pagamento.ativo ? 'Inativar' : 'Ativar'}>
                                                            <IconButton size="small" onClick={() => handleToggleStatus(pagamento.id, pagamento.ativo)}>
                                                                {pagamento.ativo ? <Block /> : <CheckCircle />}
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>

                                                    {/* Coluna de Exclusão */}
                                                    <Box sx={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Tooltip title="Excluir">
                                                            <IconButton size="small" onClick={() => handleExcluir(pagamento.id)}>
                                                                <Delete />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Stack direction="row" justifyContent="space-between" mb={3}>
                        <Typography variant="h6">Pagamentos do Delivery</Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenModal()}
                        >
                            Novo Pagamento Delivery
                        </Button>
                    </Stack>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Troco</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pagamentos
                                    .filter(p => p.delivery)
                                    .map((pagamento) => (
                                        <TableRow key={pagamento.id} hover>
                                            <TableCell>{pagamento.nome}</TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    {PAYMENT_TYPES[pagamento.tipo].icon}
                                                    <Typography>{PAYMENT_TYPES[pagamento.tipo].label}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={pagamento.ativo ? 'Ativo' : 'Inativo'}
                                                    color={pagamento.ativo ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {pagamento.tipo === 'DINHEIRO' ? <CheckCircle color="success" /> : <Cancel color="error" />}
                                            </TableCell>
                                            <TableCell align="center" sx={{ minWidth: 200 }}>
                                                <Stack direction="row" spacing={2} justifyContent="center">
                                                    {/* Coluna de Integração - sempre mantém o espaço */}
                                                    <Box sx={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        {pagamento.aceitaIntegracao && (
                                                            <Tooltip title="Configurar Integração">
                                                                <IconButton size="small" onClick={() => handleOpenIntegracaoModal(pagamento)}>
                                                                    <Terminal />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Box>

                                                    {/* Coluna de Edição */}
                                                    <Box sx={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Tooltip title="Editar">
                                                            <IconButton size="small" onClick={() => handleOpenModal(pagamento)}>
                                                                <Edit />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>

                                                    {/* Coluna de Status */}
                                                    <Box sx={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Tooltip title={pagamento.ativo ? 'Inativar' : 'Ativar'}>
                                                            <IconButton size="small" onClick={() => handleToggleStatus(pagamento.id, pagamento.ativo)}>
                                                                {pagamento.ativo ? <Block /> : <CheckCircle />}
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>

                                                    {/* Coluna de Exclusão */}
                                                    <Box sx={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Tooltip title="Excluir">
                                                            <IconButton size="small" onClick={() => handleExcluir(pagamento.id)}>
                                                                <Delete />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            </Paper>

            {/* Modal de Pagamento */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {pagamentoSelecionado ? 'Editar Pagamento' : 'Novo Pagamento'}
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            label="Nome"
                            fullWidth
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Tipo de Pagamento</InputLabel>
                            <Select
                                value={formData.tipo}
                                label="Tipo de Pagamento"
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'CARTAO' | 'DINHEIRO' | 'PIX' })}
                            >
                                <MenuItem value="DINHEIRO">Dinheiro</MenuItem>
                                <MenuItem value="CARTAO">Cartão</MenuItem>
                                <MenuItem value="PIX">PIX</MenuItem>
                            </Select>
                        </FormControl>

                        {formData.tipo === 'CARTAO' && (
                            <FormControl fullWidth>
                                <InputLabel>Integração</InputLabel>
                                <Select
                                    value={formData.integracao || ''}
                                    label="Integração"
                                    onChange={(e) => setFormData({ ...formData, integracao: e.target.value as keyof typeof INTEGRATION_TYPES | null })}
                                >
                                    {Object.entries(INTEGRATION_TYPES).map(([key, type]) => (
                                        <MenuItem key={key} value={key}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {type.icon}
                                                <Typography>{type.label}</Typography>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <FormControlLabel
                            control={<Switch checked={formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} />}
                            label="Ativo"
                        />

                        {formData.tipo === 'DINHEIRO' && (
                            <FormControlLabel
                                control={<Switch checked={formData.delivery} onChange={(e) => setFormData({ ...formData, delivery: e.target.checked })} />}
                                label="Aceita Troco"
                            />
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSalvar} disabled={!formData.nome}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Configuração de Integração */}
            <Dialog open={integracaoModalOpen} onClose={() => setIntegracaoModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Configurar Integração</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            label="API Key"
                            fullWidth
                            value={integracaoConfig.apiKey}
                            onChange={(e) => setIntegracaoConfig({ ...integracaoConfig, apiKey: e.target.value })}
                        />
                        <TextField
                            label="Merchant ID"
                            fullWidth
                            value={integracaoConfig.merchantId}
                            onChange={(e) => setIntegracaoConfig({ ...integracaoConfig, merchantId: e.target.value })}
                        />
                        <TextField
                            label="Terminal"
                            fullWidth
                            value={integracaoConfig.terminal}
                            onChange={(e) => setIntegracaoConfig({ ...integracaoConfig, terminal: e.target.value })}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIntegracaoModalOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSalvarIntegracao}>
                        Salvar Configuração
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PagamentosPage;
