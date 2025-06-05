'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip
} from '@mui/material';
import {
    Warning,
    CheckCircle,
    Receipt,
    AttachMoney,
    Block,
    Timer
} from '@mui/icons-material';
import { formatPrice } from '@/utils/formatPrice';
import { api } from '@/libs/api';
import { getCookie } from 'cookies-next';

interface Fatura {
    id: number;
    valor: number;
    dataVencimento: string;
    dataPagamento: string | null;
    status: 'pendente' | 'pago' | 'vencido';
    linkBoleto: string;
}

interface AssinaturaInfo {
    ativo: boolean;
    dataVencimento: string;
    diasRestantes: number;
    valorMensal: number;
    plano: string;
}

export default function AssinaturaPage() {
    const token = getCookie('token') as string;
    const [faturas, setFaturas] = useState<Fatura[]>([]);
    const [assinatura, setAssinatura] = useState<AssinaturaInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const [faturasRes, assinaturaRes] = await Promise.all([
                api.getFaturas(token),
                api.getAssinaturaStatus(token)
            ]);

            setFaturas(faturasRes);
            setAssinatura(assinaturaRes);

            // Abre diálogo se estiver bloqueado
            if (!assinaturaRes.ativo) {
                setDialogOpen(true);
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };

    const handleLiberarAcesso = async () => {
        setLoading(true);
        try {
            await api.liberarAcessoTemporario(token);
            setDialogOpen(false);
            await carregarDados();
        } catch (error) {
            console.error('Erro ao liberar acesso:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendente': return 'warning';
            case 'pago': return 'success';
            case 'vencido': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Box sx={{ p: 3, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h5">Assinatura</Typography>
            </Box>

            <Box sx={{ p: 3 }}>
                {/* Status Card */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            {assinatura?.ativo ? (
                                <CheckCircle color="success" fontSize="large" />
                            ) : (
                                <Warning color="error" fontSize="large" />
                            )}
                            <Typography variant="h6">
                                Status: {assinatura?.ativo ? 'Ativo' : 'Bloqueado'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            <Box>
                                <Typography color="text.secondary" gutterBottom>
                                    Plano
                                </Typography>
                                <Typography variant="h6">
                                    {assinatura?.plano || '-'}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography color="text.secondary" gutterBottom>
                                    Valor Mensal
                                </Typography>
                                <Typography variant="h6">
                                    {assinatura?.valorMensal ? formatPrice(assinatura.valorMensal) : '-'}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography color="text.secondary" gutterBottom>
                                    Vencimento
                                </Typography>
                                <Typography variant="h6">
                                    {assinatura?.dataVencimento ?
                                        new Date(assinatura.dataVencimento).toLocaleDateString() :
                                        '-'
                                    }
                                </Typography>
                            </Box>

                            <Box>
                                <Typography color="text.secondary" gutterBottom>
                                    Dias Restantes
                                </Typography>
                                <Typography
                                    variant="h6"
                                    color={(assinatura?.diasRestantes || 0) < 5 ? 'error.main' : 'inherit'}
                                >
                                    {assinatura?.diasRestantes || 0} dias
                                </Typography>
                            </Box>
                        </Box>

                        {(assinatura?.diasRestantes || 0) < 5 && assinatura?.ativo && (
                            <Alert severity="warning" sx={{ mt: 3 }}>
                                Sua assinatura vencerá em breve. Efetue o pagamento para evitar a suspensão do sistema.
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Faturas */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Fatura</TableCell>
                                <TableCell>Valor</TableCell>
                                <TableCell>Vencimento</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {faturas.map((fatura) => (
                                <TableRow key={fatura.id}>
                                    <TableCell>#{fatura.id}</TableCell>
                                    <TableCell>{formatPrice(fatura.valor)}</TableCell>
                                    <TableCell>
                                        {new Date(fatura.dataVencimento).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={fatura.status}
                                            color={getStatusColor(fatura.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {fatura.status === 'pendente' && (
                                            <Button
                                                startIcon={<Receipt />}
                                                href={fatura.linkBoleto}
                                                target="_blank"
                                                size="small"
                                            >
                                                Boleto
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Dialog de Bloqueio Melhorado */}
            <Dialog
                open={dialogOpen}
                maxWidth="sm"
                fullWidth
                disableEscapeKeyDown={!assinatura?.ativo}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Block color="error" />
                        Sistema Bloqueado
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography paragraph>
                        Seu acesso está bloqueado pois sua assinatura venceu em{' '}
                        {assinatura?.dataVencimento ?
                            new Date(assinatura.dataVencimento).toLocaleDateString() :
                            'data não disponível'
                        }.
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Caso você já tenha efetuado o pagamento e ele ainda não foi compensado,
                        você pode liberar o sistema temporariamente por 3 dias até a confirmação do pagamento.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button
                        disabled={loading}
                        startIcon={<Timer />}
                        variant="outlined"
                        onClick={handleLiberarAcesso}
                    >
                        {loading ? 'Verificando pagamento...' : 'Já paguei - Liberar Acesso'}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AttachMoney />}
                        onClick={() => {
                            const faturaPendente = faturas.find(f => f.status === 'pendente');
                            if (faturaPendente?.linkBoleto) {
                                window.open(faturaPendente.linkBoleto, '_blank');
                            }
                        }}
                    >
                        Gerar Boleto
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 