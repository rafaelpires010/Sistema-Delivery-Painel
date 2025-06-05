'use client';

import {
    Box, Button, Typography, IconButton, Drawer, CircularProgress,
    Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, DialogActions, DialogContentText, TextField, Stack, Alert
} from '@mui/material';
import {
    Receipt, // Reimprimir cupom
    Person, // Trocar operador
    Close, // Fechar caixa
    Cancel, // Cancelar venda
    LocalAtm, // Sangria
    AddCircle, // Suprimento
    Calculate, // Fechamento parcial
    Settings, // Configurações
    Menu as MenuIcon,
    Print,
    RemoveCircle
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { api } from '@/libs/api';
import { getCookie, setCookie } from 'cookies-next';
import { formatCurrency } from '@/libs/formatCurrency';
import { InputDialog } from './InputDialog';

interface CaixaFunctionsProps {
    onReprint: () => void;
    onChangeOperator: () => void;
    onCloseCashier: () => void;
    onCancelSale: () => void;
    onWithdraw: () => void;
    onSupply: () => void;
    onPartialClose: () => void;
    onSettings: () => void;
    pdvId: number;
    onDialogChange: (isOpen: boolean) => void;
}

interface OperacaoData {
    id: number;
    frenteCaixaId: number;
    valor: number;
    motivo: string;
    data: string;
    operadorId: number;
}

export const CaixaFunctions = ({
    onReprint,
    onChangeOperator,
    pdvId,
    onCancelSale,
    onWithdraw,
    onSupply,
    onPartialClose,
    onSettings,
    onDialogChange
}: CaixaFunctionsProps) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resumoOpen, setResumoOpen] = useState(false);
    const [resumoData, setResumoData] = useState<any>(null);
    const [resumoPagamentosOpen, setResumoPagamentosOpen] = useState(false);
    const [confirmPrintOpen, setConfirmPrintOpen] = useState(false);
    const [printType, setPrintType] = useState<'resumo' | 'vendas' | 'pagamentos'>('resumo');
    const token = getCookie('token') as string;
    const [confirmCloseCashierOpen, setConfirmCloseCashierOpen] = useState(false);
    const [operadorDialogOpen, setOperadorDialogOpen] = useState(false);
    const [operadorId, setOperadorId] = useState('');
    const [operadorSenha, setOperadorSenha] = useState('');
    const [operadorError, setOperadorError] = useState('');
    const [confirmOperadorOpen, setConfirmOperadorOpen] = useState(false);
    const [showOperadorId, setShowOperadorId] = useState(false);
    const [showOperadorSenha, setShowOperadorSenha] = useState(false);
    const [showValorInicial, setShowValorInicial] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showCancelOptions, setShowCancelOptions] = useState(false);
    const [cancelError, setCancelError] = useState('');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [cancelamentoData, setCancelamentoData] = useState<any>(null);
    const [showReprintOptions, setShowReprintOptions] = useState(false);
    const [showReprintDialog, setShowReprintDialog] = useState(false);
    const [reprintError, setReprintError] = useState('');
    const [showCloseCashierOperadorId, setShowCloseCashierOperadorId] = useState(false);
    const [showCloseCashierOperadorSenha, setShowCloseCashierOperadorSenha] = useState(false);
    const [closeCashierOperadorId, setCloseCashierOperadorId] = useState('');
    const [closeCashierOperadorSenha, setCloseCashierOperadorSenha] = useState('');
    const [closeCashierError, setCloseCashierError] = useState('');
    const [showSangriaDialog, setShowSangriaDialog] = useState(false);
    const [showSuprimentoDialog, setShowSuprimentoDialog] = useState(false);
    const [showMotivoDialog, setShowMotivoDialog] = useState(false);
    const [valorOperacao, setValorOperacao] = useState('');
    const [motivoOperacao, setMotivoOperacao] = useState('');
    const [tipoOperacao, setTipoOperacao] = useState<'sangria' | 'suprimento'>('sangria');
    const [operacaoError, setOperacaoError] = useState('');
    const [showSuccessOperacaoDialog, setShowSuccessOperacaoDialog] = useState(false);
    const [successOperacaoData, setSuccessOperacaoData] = useState<OperacaoData | null>(null);

    console.log(pdvId);

    const handleCloseCashierClick = () => {
        setCloseCashierOperadorId('');
        setCloseCashierOperadorSenha('');
        setCloseCashierError('');
        setShowCloseCashierOperadorId(true);
    };

    const handleCloseCashierOperadorIdSubmit = async (value: string) => {
        setCloseCashierOperadorId(value);
        setShowCloseCashierOperadorId(false);
        setShowCloseCashierOperadorSenha(true);
    };

    const handleCloseCashierOperadorSenhaSubmit = async (value: string) => {
        try {
            setLoading(true);
            const data = {
                pdvId,
                operadorId: closeCashierOperadorId,
                operadorSenha: value
            };

            const response = await api.fecharCaixa(token, data);

            if (response.success) {
                setShowCloseCashierOperadorSenha(false);
                setResumoData(response.data);
                setResumoOpen(true);
            }
        } catch (error: any) {
            setCloseCashierError(error.response?.data?.message || 'Erro ao fechar caixa');
            setShowCloseCashierOperadorId(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseResumo = () => {
        setConfirmPrintOpen(true);
    };

    const handleClosePagamentos = () => {
        setResumoPagamentosOpen(false);
        window.location.href = '/pdv';
    };

    const calcularTotalPorPagamento = () => {
        if (!resumoData?.vendas) return [];

        const totais = resumoData.vendas.reduce((acc: any, venda: any) => {
            const metodo = venda.formaPagamento?.nome || 'Não especificado';
            if (!acc[metodo]) {
                acc[metodo] = {
                    total: 0,
                    quantidade: 0
                };
            }
            acc[metodo].total += venda.valor;
            acc[metodo].quantidade += 1;
            return acc;
        }, {});

        return Object.entries(totais).map(([metodo, dados]: [string, any]) => ({
            metodo,
            total: dados.total,
            quantidade: dados.quantidade
        }));
    };

    const handlePrintClick = (tipo: 'resumo' | 'vendas' | 'pagamentos') => {
        setPrintType(tipo);
        setConfirmPrintOpen(true);
    };

    const handleConfirmPrint = () => {
        setConfirmPrintOpen(false);
        handlePrint('resumo');
        handlePrint('vendas');
        handlePrint('pagamentos');
        setResumoOpen(false);
        setResumoPagamentosOpen(true);
    };

    // Função para lidar com o "Não" do diálogo
    const handleNoPrint = () => {
        setConfirmPrintOpen(false);
        setResumoOpen(false);
        setResumoPagamentosOpen(true);
    };

    const handlePrint = (tipo: 'resumo' | 'vendas' | 'pagamentos') => {
        const style = `
            <style>
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                h2 { margin-bottom: 10px; }
                .text-right { text-align: right; }
                @media print {
                    button { display: none; }
                }
            </style>
        `;

        let conteudo = '';

        if (tipo === 'resumo') {
            conteudo = `
                <h2>Resumo Financeiro</h2>
                <table>
                    <tr>
                        <td>Valor Inicial</td>
                        <td class="text-right">${formatCurrency(resumoData.resumo.valorInicial || 0)}</td>
                    </tr>
                    <tr>
                        <td>Total de Vendas</td>
                        <td class="text-right">${formatCurrency(resumoData.resumo.totalVendas)}</td>
                    </tr>
                    <tr>
                        <td>Total de Sangrias</td>
                        <td class="text-right" sx={{ color: 'error.main' }}>
                            -${formatCurrency(resumoData.resumo.totalSangrias)}
                        </td>
                    </tr>
                    <tr>
                        <td>Total de Suprimentos</td>
                        <td class="text-right" sx={{ color: 'success.main' }}>
                            +${formatCurrency(resumoData.resumo.totalSuprimentos)}
                        </td>
                    </tr>
                    <tr>
                        <td>Valor Final</td>
                        <td class="text-right" sx={{ fontWeight: 'bold' }}>
                            ${formatCurrency(resumoData.resumo.valorFinal)}
                        </td>
                    </tr>
                    <tr>
                        <td>Quantidade de Vendas</td>
                        <td class="text-right">${resumoData.resumo.quantidadeVendas}</td>
                    </tr>
                    <tr>
                        <td>Quantidade de Sangrias</td>
                        <td class="text-right">${resumoData.resumo.quantidadeSangrias}</td>
                    </tr>
                    <tr>
                        <td>Quantidade de Suprimentos</td>
                        <td class="text-right">${resumoData.resumo.quantidadeSuprimentos}</td>
                    </tr>
                </table>
            `;
        } else if (tipo === 'vendas') {
            conteudo = `
                <h2>Vendas Realizadas</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nº Venda</th>
                            <th>Data/Hora</th>
                            <th>Valor</th>
                            <th>Forma Pgto.</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${resumoData.vendas.map((venda: any) => `
                            <tr>
                                <td>${venda.nrVenda}</td>
                                <td>${new Date(venda.data).toLocaleString()}</td>
                                <td class="text-right">${formatCurrency(venda.valor)}</td>
                                <td>${venda.formaPagamento?.nome}</td>
                                <td>${venda.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            const totaisPagamento = calcularTotalPorPagamento();
            conteudo = `
                <h2>Resumo por Método de Pagamento</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Método</th>
                            <th>Quantidade</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${totaisPagamento.map(item => `
                            <tr>
                                <td>${item.metodo}</td>
                                <td class="text-right">${item.quantidade}</td>
                                <td class="text-right">${formatCurrency(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        const janela = window.open('', '', 'height=600,width=800');
        if (janela) {
            janela.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>${style}</head>
                    <body>
                        <h1>Relatório de Fechamento de Caixa</h1>
                        ${conteudo}
                    </body>
                </html>
            `);
            janela.document.close();
            janela.print();
        }
    };

    // Ajuste as funções de submit do operador
    const handleOperadorIdSubmit = async (value: string) => {
        setOperadorId(value);
        setShowOperadorId(false);
        setShowOperadorSenha(true);
    };

    const handleOperadorSenhaSubmit = async (value: string) => {
        try {
            setLoading(true);
            const data = {
                pdvId,
                operadorId: operadorId,
                operadorSenha: value
            };

            const response = await api.trocarOperador(token, data);

            if (response.success) {
                // Atualiza os cookies com as novas credenciais
                setCookie('operadorId', operadorId, {
                    maxAge: 8 * 60 * 60, // 8 horas
                    path: '/'
                });
                setCookie('operadorSenha', value, {
                    maxAge: 8 * 60 * 60, // 8 horas
                    path: '/'
                });
                setShowOperadorSenha(false);
                window.location.reload();
            }
        } catch (error: any) {
            setOperadorError(error.response?.data?.message || 'Erro ao trocar operador');
            setShowOperadorId(true);
            setShowOperadorSenha(false);
        } finally {
            setLoading(false);
        }
    };

    // Modifique a função que abre o diálogo
    const handleOpenOperadorDialog = () => {
        setOperadorId('');
        setOperadorError('');
        setShowOperadorId(true);
    };

    const handleValorInicialSubmit = async (value: string) => {
        try {
            setLoading(true);
            const data = {
                pdvId,
                valorInicial: Number(value),
                operadorId: operadorId,
                operadorSenha: operadorSenha
            };

            const response = await api.abrirCaixa(token, data);

            if (response.success) {
                setShowValorInicial(false);
                window.location.reload();
            }
        } catch (error: any) {
            console.error('Erro ao abrir caixa:', error);
            setOperadorError(error.response?.data?.message || 'Erro ao abrir caixa');
        } finally {
            setLoading(false);
        }
    };

    // Função para abrir diálogo de opções de cancelamento
    const handleCancelClick = () => {
        setShowCancelOptions(true);
    };

    // Função para cancelar última venda
    const handleCancelLastSale = async () => {
        try {
            setLoading(true);
            const data = {
                pdvId,
                operadorId: getCookie('operadorId'),
                operadorSenha: getCookie('operadorSenha')
            };
            const response = await api.cancelarUltimaVendaPdv(token, data);

            if (response.success) {
                setCancelamentoData(response.data);
                setShowCancelOptions(false);
                setShowSuccessDialog(true);
                onCancelSale();
            }
        } catch (error: any) {
            setCancelError(error.response?.data?.message || 'Erro ao cancelar venda');
        } finally {
            setLoading(false);
        }
    };

    // Função para cancelar venda específica
    const handleCancelSpecificSale = async (nrVenda: string) => {
        try {
            setLoading(true);
            const data = {
                pdvId,
                nrVenda,
                operadorId: getCookie('operadorId'),
                operadorSenha: getCookie('operadorSenha')
            };

            const response = await api.cancelarVendaPdv(token, data);

            if (response.success) {
                setCancelamentoData(response.data);
                setShowCancelDialog(false);
                setShowCancelOptions(false);
                setShowSuccessDialog(true);
                onCancelSale();
            }
        } catch (error: any) {
            setCancelError(error.response?.data?.message || 'Erro ao cancelar venda');
        } finally {
            setLoading(false);
        }
    };

    // Função para abrir diálogo de opções de reimpressão
    const handleReprintClick = () => {
        setShowReprintOptions(true);
    };

    // Função para reimprimir último cupom
    const handleReprintLastSale = async () => {
        try {
            setLoading(true);
            const data = {
                pdvId,
                operadorId: getCookie('operadorId'),
                operadorSenha: getCookie('operadorSenha')
            };
            const response = await api.reimprimirUltimoCupom(token, data);

            if (response.success) {
                setShowReprintOptions(false);
                onReprint();
            }
        } catch (error: any) {
            setReprintError(error.response?.data?.message || 'Erro ao reimprimir cupom');
        } finally {
            setLoading(false);
        }
    };

    // Função para reimprimir cupom específico
    const handleReprintSpecificSale = async (nrVenda: string) => {
        try {
            setLoading(true);
            const data = {
                pdvId,
                nrVenda,
                operadorId: getCookie('operadorId'),
                operadorSenha: getCookie('operadorSenha')
            };

            const response = await api.reimprimirCupom(token, data);

            if (response.success) {
                setShowReprintDialog(false);
                setShowReprintOptions(false);
                onReprint();
            }
        } catch (error: any) {
            setReprintError(error.response?.data?.message || 'Erro ao reimprimir cupom');
        } finally {
            setLoading(false);
        }
    };

    // Funções para lidar com sangria
    const handleSangriaClick = () => {
        setTipoOperacao('sangria');
        setValorOperacao('');
        setOperacaoError('');
        setShowSangriaDialog(true);
    };

    const handleSuprimentoClick = () => {
        setTipoOperacao('suprimento');
        setValorOperacao('');
        setOperacaoError('');
        setShowSuprimentoDialog(true);
    };

    const handleValorOperacaoSubmit = (value: string) => {
        setValorOperacao(value);
        if (tipoOperacao === 'sangria') {
            setShowSangriaDialog(false);
        } else {
            setShowSuprimentoDialog(false);
        }
        setTimeout(() => {
            setShowMotivoDialog(true);
        }, 100);
    };

    const handleMotivoSubmit = async (value: string) => {
        try {
            setLoading(true);
            setShowMotivoDialog(false);

            const data = {
                pdvId,
                operadorId: getCookie('operadorId'),
                operadorSenha: getCookie('operadorSenha'),
                valor: Number(valorOperacao),
                motivo: value
            };

            const response = await (tipoOperacao === 'sangria'
                ? api.sangria(token, data)
                : api.suprimento(token, data));

            console.log('Resposta completa:', response);

            if (response) {
                const operacaoData: OperacaoData = {
                    id: response.id,
                    frenteCaixaId: response.frenteCaixaId,
                    valor: response.valor,
                    motivo: response.motivo,
                    data: response.data,
                    operadorId: response.operadorId
                };

                setSuccessOperacaoData(operacaoData);
                setShowSuccessOperacaoDialog(true);
            }
        } catch (error: any) {
            console.error('Erro na operação:', error);
            setOperacaoError(error.response?.data?.message || `Erro ao realizar ${tipoOperacao}`);
            setShowMotivoDialog(true);
        } finally {
            setLoading(false);
        }
    };

    const handlePrintOperacao = () => {
        const janela = window.open('', '', 'width=800,height=600');
        if (janela) {
            const style = `
                <style>
                    body { font-family: Arial; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .content { margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    td { padding: 8px; border-bottom: 1px solid #ddd; }
                    .label { font-weight: bold; width: 150px; }
                </style>
            `;

            const conteudo = `
                <div class="header">
                    <h2>${tipoOperacao === 'sangria' ? 'Comprovante de Sangria' : 'Comprovante de Suprimento'}</h2>
                </div>
                <div class="content">
                    <table>
                        <tr>
                            <td class="label">Nº Operação:</td>
                            <td>${successOperacaoData?.id || ''}</td>
                        </tr>
                        <tr>
                            <td class="label">PDV:</td>
                            <td>${successOperacaoData?.frenteCaixaId || ''}</td>
                        </tr>
                        <tr>
                            <td class="label">Valor:</td>
                            <td>${successOperacaoData?.valor ? formatCurrency(successOperacaoData.valor) : ''}</td>
                        </tr>
                        <tr>
                            <td class="label">Motivo:</td>
                            <td>${successOperacaoData?.motivo || ''}</td>
                        </tr>
                        <tr>
                            <td class="label">Data/Hora:</td>
                            <td>${successOperacaoData?.data ? new Date(successOperacaoData.data).toLocaleString() : ''}</td>
                        </tr>
                        <tr>
                            <td class="label">Operador:</td>
                            <td>${successOperacaoData?.operadorId || ''}</td>
                        </tr>
                    </table>
                </div>
            `;

            janela.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>${style}</head>
                    <body>${conteudo}</body>
                </html>
            `);
            janela.document.close();
            janela.print();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'F1': onReprint(); break;
                case 'F2': onChangeOperator(); break;
                case 'F3': handleCloseCashierClick(); break;
                case 'F4': onCancelSale(); break;
                case 'F5': onWithdraw(); break;
                case 'F6': onSupply(); break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onReprint, onChangeOperator, handleCloseCashierClick, onCancelSale, onWithdraw, onSupply, onPartialClose, onSettings]);

    useEffect(() => {
        const isAnyDialogOpen = showOperadorId ||
            showOperadorSenha ||
            showValorInicial ||
            showCancelDialog ||
            showReprintDialog ||
            showSangriaDialog ||
            showSuprimentoDialog ||
            showMotivoDialog ||
            showCloseCashierOperadorId ||
            showCloseCashierOperadorSenha;

        onDialogChange(isAnyDialogOpen);
    }, [
        showOperadorId,
        showOperadorSenha,
        showValorInicial,
        showCancelDialog,
        showReprintDialog,
        showSangriaDialog,
        showSuprimentoDialog,
        showMotivoDialog,
        showCloseCashierOperadorId,
        showCloseCashierOperadorSenha
    ]);

    const functions = [
        { key: 'F1', label: 'Reimprimir Cupom', icon: <Receipt />, onClick: handleReprintClick },
        { key: 'F2', label: 'Trocar Operador', icon: <Person />, onClick: handleOpenOperadorDialog },
        { key: 'F3', label: 'Fechar Caixa', icon: <Close />, onClick: handleCloseCashierClick },
        { key: 'F4', label: 'Cancelar Venda', icon: <Cancel />, onClick: handleCancelClick },
        { key: 'F5', label: 'Sangria', icon: <RemoveCircle />, onClick: handleSangriaClick },
        { key: 'F7', label: 'Suprimento', icon: <AddCircle />, onClick: handleSuprimentoClick },
    ];

    const FunctionsList = () => (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 0.5, sm: 1 },
            p: { xs: 0.5, sm: 1 },
            bgcolor: 'background.paper',
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: 1,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                width: '6px'
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '3px'
            }
        }}>
            {functions.map((fn) => (
                <Button
                    key={fn.key}
                    variant="outlined"
                    onClick={() => {
                        fn.onClick();
                        setIsDrawerOpen(false);
                    }}
                    startIcon={loading ? <CircularProgress size={24} /> : fn.icon}
                    sx={{
                        justifyContent: 'flex-start',
                        px: { xs: 0.5, sm: 2 },
                        py: { xs: 0.5, sm: 1.5 },
                        minHeight: { xs: '32px', sm: '48px' },
                        '& .MuiButton-startIcon': {
                            mr: { xs: 0.5, sm: 2 },
                            display: { xs: 'none', sm: 'inline-flex' }
                        }
                    }}
                    disabled={loading}
                >
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: { xs: 'center', sm: 'flex-start' },
                        width: '100%'
                    }}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '0.5rem', sm: '0.75rem' },
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            {fn.key}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: { xs: '0.65rem', sm: '0.875rem' },
                                lineHeight: { xs: 1.1, sm: 1.5 },
                                textAlign: { xs: 'center', sm: 'left' },
                                width: '100%',
                                wordBreak: { xs: 'break-word', sm: 'normal' },
                                whiteSpace: { xs: 'normal', sm: 'nowrap' },
                                display: '-webkit-box',
                                WebkitLineClamp: { xs: 2, sm: 1 },
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {fn.label}
                        </Typography>
                    </Box>
                </Button>
            ))}

        </Box>
    );

    const getTipoRelatorio = (tipo: 'resumo' | 'vendas' | 'pagamentos') => {
        switch (tipo) {
            case 'resumo':
                return 'Resumo Financeiro';
            case 'vendas':
                return 'Vendas Realizadas';
            case 'pagamentos':
                return 'Resumo por Método de Pagamento';
            default:
                return '';
        }
    };

    return (
        <>
            <Box sx={{
                display: { xs: 'block', md: 'none' },
                position: 'fixed',
                bottom: 16,
                left: 16,
                zIndex: 1000
            }}>
                <IconButton
                    onClick={() => setIsDrawerOpen(true)}
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        boxShadow: 2,
                        '&:hover': {
                            bgcolor: 'primary.dark'
                        }
                    }}
                >
                    <MenuIcon />
                </IconButton>
            </Box>

            <Drawer
                anchor="left"
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: '80%',
                        maxWidth: 300,
                        p: 1,
                        bgcolor: 'background.default'
                    }
                }}
            >
                <FunctionsList />
            </Drawer>

            <Box sx={{
                display: { xs: 'none', md: 'block' },
                height: '100%'
            }}>
                <FunctionsList />
            </Box>

            <Dialog open={resumoOpen} onClose={handleCloseResumo} maxWidth="md" fullWidth>
                <DialogTitle>
                    Resumo do Fechamento de Caixa
                </DialogTitle>
                <DialogContent>
                    {resumoData && (
                        <>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" gutterBottom>Resumo Financeiro</Typography>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>Valor Inicial</TableCell>
                                                <TableCell align="right">
                                                    {formatCurrency(resumoData.resumo.valorInicial || 0)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Total de Vendas</TableCell>
                                                <TableCell align="right">
                                                    {formatCurrency(resumoData.resumo.totalVendas)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Total de Sangrias</TableCell>
                                                <TableCell align="right" sx={{ color: 'error.main' }}>
                                                    -{formatCurrency(resumoData.resumo.totalSangrias)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Total de Suprimentos</TableCell>
                                                <TableCell align="right" sx={{ color: 'success.main' }}>
                                                    +{formatCurrency(resumoData.resumo.totalSuprimentos)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Valor Final</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                    {formatCurrency(resumoData.resumo.valorFinal)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Quantidade de Vendas</TableCell>
                                                <TableCell align="right">{resumoData.resumo.quantidadeVendas}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Quantidade de Sangrias</TableCell>
                                                <TableCell align="right">{resumoData.resumo.quantidadeSangrias}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Quantidade de Suprimentos</TableCell>
                                                <TableCell align="right">{resumoData.resumo.quantidadeSuprimentos}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" gutterBottom>Vendas Realizadas</Typography>
                                <TableContainer component={Paper}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nº Venda</TableCell>
                                                <TableCell>Data/Hora</TableCell>
                                                <TableCell>Valor</TableCell>
                                                <TableCell>Forma Pgto.</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {resumoData.vendas.map((venda: any) => (
                                                <TableRow key={venda.id}>
                                                    <TableCell>{venda.nrVenda}</TableCell>
                                                    <TableCell>
                                                        {new Date(venda.data).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatCurrency(venda.valor)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {venda.formaPagamento?.nome}
                                                    </TableCell>
                                                    <TableCell>
                                                        {venda.status}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>

                            {resumoData.sangrias.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" gutterBottom>Sangrias Realizadas</Typography>
                                    <TableContainer component={Paper}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Data/Hora</TableCell>
                                                    <TableCell>Valor</TableCell>
                                                    <TableCell>Operador</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {resumoData.sangrias.map((sangria: any) => (
                                                    <TableRow key={sangria.id}>
                                                        <TableCell>{new Date(sangria.data).toLocaleString()}</TableCell>
                                                        <TableCell>{formatCurrency(sangria.valor)}</TableCell>
                                                        <TableCell>{sangria.operador?.user?.nome}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}

                            {resumoData.suprimentos.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" gutterBottom>Suprimentos Realizados</Typography>
                                    <TableContainer component={Paper}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Data/Hora</TableCell>
                                                    <TableCell>Valor</TableCell>
                                                    <TableCell>Operador</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {resumoData.suprimentos.map((suprimento: any) => (
                                                    <TableRow key={suprimento.id}>
                                                        <TableCell>{new Date(suprimento.data).toLocaleString()}</TableCell>
                                                        <TableCell>{formatCurrency(suprimento.valor)}</TableCell>
                                                        <TableCell>{suprimento.operador?.user?.nome}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', gap: 2, mt: 2, px: 2, pb: 2 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleCloseResumo}
                                >
                                    Próximo
                                </Button>
                            </Box>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={resumoPagamentosOpen} onClose={handleClosePagamentos} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Resumo por Método de Pagamento
                </DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Método</TableCell>
                                    <TableCell align="right">Quantidade</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {calcularTotalPorPagamento().map((item) => (
                                    <TableRow key={item.metodo}>
                                        <TableCell>{item.metodo}</TableCell>
                                        <TableCell align="right">{item.quantidade}</TableCell>
                                        <TableCell align="right">
                                            {formatCurrency(item.total)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleClosePagamentos}
                        sx={{ mt: 2 }}
                    >
                        Finalizar
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Diálogo de Confirmação de Impressão */}
            <Dialog
                open={confirmPrintOpen}
                onClose={() => {
                    setConfirmPrintOpen(false);
                    setResumoOpen(true);
                }}
                aria-labelledby="print-dialog-title"
                aria-describedby="print-dialog-description"
            >
                <DialogTitle id="print-dialog-title">
                    Impressão de Relatórios
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="print-dialog-description">
                        Deseja imprimir os relatórios de fechamento do caixa?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleNoPrint}
                        variant="outlined"
                    >
                        Não
                    </Button>
                    <Button onClick={handleConfirmPrint} variant="contained" color="primary">
                        Sim
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Substitua o diálogo de confirmação pelos novos InputDialogs */}
            <InputDialog
                open={showCloseCashierOperadorId}
                title="Digite o ID do Operador"
                onClose={() => setShowCloseCashierOperadorId(false)}
                onSubmit={handleCloseCashierOperadorIdSubmit}
                error={closeCashierError}
            />

            <InputDialog
                open={showCloseCashierOperadorSenha}
                title="Digite a Senha"
                onClose={() => setShowCloseCashierOperadorSenha(false)}
                onSubmit={handleCloseCashierOperadorSenhaSubmit}
                password
                error={closeCashierError}
            />

            <InputDialog
                open={showValorInicial}
                title="Digite o Valor Inicial do Caixa"
                onClose={() => setShowValorInicial(false)}
                onSubmit={handleValorInicialSubmit}
                isCurrency
            />

            {/* Diálogo de opções de cancelamento */}
            <Dialog
                open={showCancelOptions}
                onClose={() => setShowCancelOptions(false)}
            >
                <DialogTitle>Cancelar Venda</DialogTitle>
                <DialogContent>
                    <Stack spacing={2}>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setShowCancelOptions(false);
                                setShowCancelDialog(true);
                            }}
                        >
                            Informar Número da Venda
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCancelLastSale}
                        >
                            Cancelar Última Venda
                        </Button>
                    </Stack>
                    {cancelError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {cancelError}
                        </Alert>
                    )}
                </DialogContent>
            </Dialog>

            {/* Diálogo para informar número da venda */}
            <InputDialog
                open={showCancelDialog}
                title="Digite o Número da Venda"
                onClose={() => setShowCancelDialog(false)}
                onSubmit={handleCancelSpecificSale}
            />

            {/* Modal de Sucesso do Cancelamento */}
            <Dialog
                open={showSuccessDialog}
                onClose={() => setShowSuccessDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Venda Cancelada com Sucesso</DialogTitle>
                <DialogContent>
                    {cancelamentoData && (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Nº Venda:</TableCell>
                                        <TableCell>{cancelamentoData.nrVenda}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Valor:</TableCell>
                                        <TableCell>{formatCurrency(cancelamentoData.valor)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Data:</TableCell>
                                        <TableCell>
                                            {new Date(cancelamentoData.data).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Forma de Pagamento:</TableCell>
                                        <TableCell>{cancelamentoData.formaPagamento?.nome}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Operador:</TableCell>
                                        <TableCell>{cancelamentoData.operador?.user?.nome}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Status:</TableCell>
                                        <TableCell>{cancelamentoData.status}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowSuccessDialog(false)} variant="contained">
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de opções de reimpressão */}
            <Dialog
                open={showReprintOptions}
                onClose={() => setShowReprintOptions(false)}
            >
                <DialogTitle>Reimprimir Cupom</DialogTitle>
                <DialogContent>
                    <Stack spacing={2}>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setShowReprintOptions(false);
                                setShowReprintDialog(true);
                            }}
                        >
                            Informar Número da Venda
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleReprintLastSale}
                        >
                            Reimprimir Último Cupom
                        </Button>
                    </Stack>
                    {reprintError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {reprintError}
                        </Alert>
                    )}
                </DialogContent>
            </Dialog>

            {/* Diálogo para informar número da venda para reimpressão */}
            <InputDialog
                open={showReprintDialog}
                title="Digite o Número da Venda"
                onClose={() => setShowReprintDialog(false)}
                onSubmit={handleReprintSpecificSale}
            />

            <InputDialog
                open={showSangriaDialog}
                title="Digite o Valor da Sangria"
                onClose={() => setShowSangriaDialog(false)}
                onSubmit={handleValorOperacaoSubmit}
                isCurrency
                error={operacaoError}
            />

            <InputDialog
                open={showSuprimentoDialog}
                title="Digite o Valor do Suprimento"
                onClose={() => setShowSuprimentoDialog(false)}
                onSubmit={handleValorOperacaoSubmit}
                isCurrency
                error={operacaoError}
            />

            <InputDialog
                open={showMotivoDialog}
                title={`Digite o Motivo do ${tipoOperacao === 'sangria' ? 'Sangria' : 'Suprimento'}`}
                onClose={() => setShowMotivoDialog(false)}
                onSubmit={handleMotivoSubmit}
                error={operacaoError}
                startWithAlpha={true}
                allowSpace={true}
            />

            {/* Diálogos para troca de operador */}
            <InputDialog
                open={showOperadorId}
                title="Digite o ID do Operador"
                onClose={() => setShowOperadorId(false)}
                onSubmit={handleOperadorIdSubmit}
                error={operadorError}
                showDisplay={true}
            />

            <InputDialog
                open={showOperadorSenha}
                title="Digite a Senha do Operador"
                onClose={() => setShowOperadorSenha(false)}
                onSubmit={handleOperadorSenhaSubmit}
                password
                error={operadorError}
                showDisplay={true}
            />

            {/* Modal de Sucesso da Operação */}
            <Dialog
                open={showSuccessOperacaoDialog && successOperacaoData !== null}
                onClose={() => {
                    setShowSuccessOperacaoDialog(false);
                    setSuccessOperacaoData(null);
                    window.location.reload();
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {tipoOperacao === 'sangria' ? 'Sangria' : 'Suprimento'} Realizado com Sucesso
                </DialogTitle>
                <DialogContent>
                    {successOperacaoData && (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Nº Operação:</TableCell>
                                        <TableCell>{successOperacaoData.id}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>PDV:</TableCell>
                                        <TableCell>{successOperacaoData.frenteCaixaId}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Valor:</TableCell>
                                        <TableCell>{formatCurrency(successOperacaoData.valor)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Motivo:</TableCell>
                                        <TableCell>{successOperacaoData.motivo}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Data:</TableCell>
                                        <TableCell>
                                            {new Date(successOperacaoData.data).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Operador:</TableCell>
                                        <TableCell>{successOperacaoData.operadorId}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handlePrintOperacao}
                        variant="outlined"
                        startIcon={<Print />}
                    >
                        Imprimir
                    </Button>
                    <Button
                        onClick={() => {
                            setShowSuccessOperacaoDialog(false);
                            setSuccessOperacaoData(null);
                            window.location.reload();
                        }}
                        variant="contained"
                    >
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}; 