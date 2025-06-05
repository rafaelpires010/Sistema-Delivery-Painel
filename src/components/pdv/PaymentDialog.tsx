'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    Typography,
    Button,
    Box,
    Divider,
    IconButton,
    TextField,
    CircularProgress
} from '@mui/material';
import {
    Close,
    CreditCard,
    Payments,
    Pix,
    AttachMoney,
    AccountBalance,
    Receipt
} from '@mui/icons-material';
import { formatPrice } from '@/utils/formatPrice';
import { Product } from '@/types/Product';
import { PaymentMethod } from '@/types/PaymentMethod';
import { useState, useRef, useEffect } from 'react';
import { getCookie } from "cookies-next";
import { api } from '@/libs/api';

// Configuração de cores e ícones por tipo de pagamento
const PAYMENT_STYLES = {
    CARTAO: {
        color: '#2196f3',
        icon: <CreditCard />
    },
    DINHEIRO: {
        color: '#4caf50',
        icon: <AttachMoney />
    },
    PIX: {
        color: '#9c27b0',
        icon: <Pix />
    },
    BOLETO: {
        color: '#f44336',
        icon: <Receipt />
    },
    TRANSFERENCIA: {
        color: '#009688',
        icon: <AccountBalance />
    }
};

interface PaymentDialogProps {
    open: boolean;
    onClose: () => void;
    items: { product: Product; quantity: number }[];
    total: number;
    paymentMethods: PaymentMethod[];
    selectedPayment: string;
    onSelectPayment: (method: string) => void;
    pdvId: number;
}

export const PaymentDialog = ({ open, onClose, items, total, paymentMethods, selectedPayment, onSelectPayment, pdvId }: PaymentDialogProps) => {
    const [valorRecebido, setValorRecebido] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const token = getCookie('token') as string;
    const operadorId = getCookie('operadorId') as string;
    const operadorSenha = getCookie('operadorSenha') as string;
    const selectedMethod = paymentMethods.find(m => m.id === selectedPayment);
    const troco = valorRecebido ? Number(valorRecebido.replace(',', '.')) - total : 0;

    const handleConfirmarPagamento = async () => {
        try {
            setLoading(true);
            const data = {
                pdvId: pdvId, // Precisa ser dinâmico baseado no PDV atual
                formaPagamentoId: Number(selectedPayment),
                valor: total,
                produtos: items.map(item => ({
                    id: item.product.id,
                    nome: item.product.nome,
                    preco: item.product.preco,
                    quantidade: item.quantity
                })),
                operadorId: operadorId,
                operadorSenha: operadorSenha
            };

            console.log('Data para registrar venda:', data);
            await api.registrarVenda(token, data);
            onClose();
            // Adicionar feedback de sucesso ou redirecionamento se necessário
        } catch (error) {
            console.error('Erro ao registrar venda:', error);
            // Adicionar feedback de erro
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            onKeyDown={(e) => {
                if (selectedMethod?.aceitarTroco) {
                    e.stopPropagation();
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: 1,
                borderColor: 'divider'
            }}>
                <Typography variant="h6">Finalizar Venda</Typography>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Resumo do Pedido */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Resumo do Pedido</Typography>
                        <Box sx={{
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            p: 2,
                            maxHeight: 300,
                            overflow: 'auto'
                        }}>
                            {items.map(({ product, quantity }) => (
                                <Box key={product.id} sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 1,
                                    p: 1,
                                    borderBottom: '1px solid',
                                    borderColor: 'grey.200'
                                }}>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            {product.nome}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {quantity}x {formatPrice(product.preco)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="bold">
                                        {formatPrice(product.preco * quantity)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderRadius: 1,
                            textAlign: 'right'
                        }}>
                            <Typography variant="h5" fontWeight="bold">
                                Total: {formatPrice(total)}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Formas de Pagamento */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Forma de Pagamento</Typography>
                        <Grid container spacing={1}>
                            {paymentMethods.filter(method => method.ativo).map((method) => {
                                const style = PAYMENT_STYLES[method.tipo as keyof typeof PAYMENT_STYLES] || {
                                    color: '#757575',
                                    icon: <CreditCard />
                                };

                                return (
                                    <Grid item xs={6} key={method.id}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => {
                                                onSelectPayment(method.id);
                                                setValorRecebido('');
                                            }}
                                            sx={{
                                                p: 2,
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                bgcolor: selectedPayment === method.id ? style.color : `${style.color}99`,
                                                color: 'white',
                                                '&:hover': {
                                                    bgcolor: style.color
                                                }
                                            }}
                                        >
                                            {style.icon}
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    textTransform: 'none'
                                                }}
                                            >
                                                {method.nome}
                                            </Typography>
                                        </Button>
                                    </Grid>
                                );
                            })}
                        </Grid>

                        {/* Campo de Valor Recebido */}
                        {selectedMethod?.aceitarTroco && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Valor Recebido
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={valorRecebido}
                                    onChange={(e) => setValorRecebido(e.target.value.replace(/[^\d,]/g, ''))}
                                    placeholder="0,00"
                                    inputProps={{
                                        inputMode: 'numeric',
                                        pattern: '[0-9]*'
                                    }}
                                    sx={{ mb: 1 }}
                                />
                                {troco > 0 && (
                                    <Typography
                                        variant="h6"
                                        color="success.main"
                                        sx={{ textAlign: 'right' }}
                                    >
                                        Troco: {formatPrice(troco)}
                                    </Typography>
                                )}
                            </Box>
                        )}

                        <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            size="large"
                            disabled={!selectedPayment || (selectedMethod?.aceitarTroco && !valorRecebido) || loading}
                            onClick={handleConfirmarPagamento}
                            sx={{ mt: 3, py: 2 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirmar Pagamento'}
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
}; 