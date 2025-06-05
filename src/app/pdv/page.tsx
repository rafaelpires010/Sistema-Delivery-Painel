'use client';

import { useState, useEffect, useRef } from 'react';
import { Product } from '@/types/Product';
import { Category } from '@/types/Category';
import { api } from "@/libs/api";
import { getCookie, setCookie } from "cookies-next";
import {
    Box,
    Typography,
    TextField,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    Stack,
    Alert,
} from '@mui/material';
import {
    CreditCard,
    Money,
    Pix,
    Store
} from '@mui/icons-material';
import { NumericKeypad } from '@/components/pdv/NumericKeypad';
import { useRouter } from 'next/navigation';
import { ErrorDialog } from '@/components/ErrorDialog';
import { AlertMessage, AlertType } from '@/components/AlertMessage';

interface PaymentMethod {
    id: string;
    label: string;
    icon: JSX.Element;
}

const PAYMENT_METHODS: PaymentMethod[] = [
    { id: 'credit', label: 'Cartão de Crédito', icon: <CreditCard /> },
    { id: 'debit', label: 'Cartão de Débito', icon: <CreditCard /> },
    { id: 'money', label: 'Dinheiro', icon: <Money /> },
    { id: 'pix', label: 'PIX', icon: <Pix /> }
];

interface PDV {
    id: number;
    pdv: string;
    status: 'ABERTO' | 'FECHADO';
}

interface OpenCashierStep {
    step: 'initial_value' | 'operator' | 'password';
    title: string;
}

const STEPS: OpenCashierStep[] = [
    { step: 'initial_value', title: 'Valor Inicial do Caixa' },
    { step: 'operator', title: 'Operador' },
    { step: 'password', title: 'Senha' }
];

const PDVPage = () => {
    const theme = useTheme();
    const token = getCookie('token') as string;
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentDialog, setPaymentDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [selectedPayment, setSelectedPayment] = useState<string>('');
    const [receivedAmount, setReceivedAmount] = useState<string>('');
    const [change, setChange] = useState<number>(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [quantityDialog, setQuantityDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [customQuantity, setCustomQuantity] = useState<string>('1');
    const [mobileCartOpen, setMobileCartOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [pdvs, setPDVs] = useState<PDV[]>([]);
    const [selectedPDV, setSelectedPDV] = useState<PDV | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [valorInicial, setValorInicial] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [currentStep, setCurrentStep] = useState<OpenCashierStep['step']>('initial_value');
    const [operador, setOperador] = useState('');
    const [senha, setSenha] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertType, setAlertType] = useState<AlertType>('success');
    const [alertMessage, setAlertMessage] = useState('');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [productsData, categoriesData] = await Promise.all([
                    api.getProducts(token),
                    api.getCategories(token)
                ]);

                setProducts(productsData);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [token]);

    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 1200); // lg breakpoint
        };

        checkDesktop();
        window.addEventListener('resize', checkDesktop);

        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    useEffect(() => {
        loadPDVs();
    }, []);

    const loadPDVs = async () => {
        try {
            setLoading(true);
            const response = await api.getPDVs(token);
            console.log(response.data);
            setPDVs(response.data);
        } catch (error) {
            setError('Erro ao carregar PDVs');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.nome.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category.id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setQuantityDialog(true);
    }

    const addToCart = (product: Product, quantity: number = 1) => {
        const existingItem = cart.find(item => item.product.id === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            ));
        } else {
            setCart([...cart, { product, quantity }]);
        }
    }

    const handleAddCustomQuantity = () => {
        if (selectedProduct) {
            const quantity = parseInt(customQuantity) || 1;
            addToCart(selectedProduct, quantity);
            setQuantityDialog(false);
            setSelectedProduct(null);
            setCustomQuantity('1');
        }
    }

    const calculateChange = (received: string) => {
        const receivedValue = parseFloat(received) || 0;
        const total = getTotalPrice();
        setChange(receivedValue - total);
    }

    const updateQuantity = (productId: number, delta: number) => {
        setCart(cart.map(item => {
            if (item.product.id === productId) {
                const newQuantity = item.quantity + delta;
                if (newQuantity <= 0) {
                    return null; // Retorna null para remover o item
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(Boolean) as { product: Product; quantity: number }[]); // Remove itens null
    }

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(item => item.product.id !== productId));
    }

    const getTotalPrice = () => {
        return cart.reduce((total, item) => {
            return total + (item.product.preco * item.quantity);
        }, 0);
    }

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }

    const handleFinalizeSale = (receivedAmount?: number) => {
        console.log('Finalizando venda:', {
            method: selectedPayment,
            receivedAmount,
            items: cart
        });
        setCart([]);
        setSelectedPayment('');
    };

    const handleCashierAction = async (action: string, data: any) => {
        try {
            switch (action) {
                case 'cancel':
                    // Implementar cancelamento
                    console.log('Cancelar venda:', data);
                    break;
                case 'refund':
                    // Implementar estorno
                    console.log('Estorno:', data);
                    break;
                case 'withdraw':
                    // Implementar sangria
                    console.log('Sangria:', data);
                    break;
                case 'supply':
                    // Implementar suprimento
                    console.log('Suprimento:', data);
                    break;
                // ... outras ações
            }
        } catch (error) {
            console.error('Erro na ação:', error);
        }
    };

    const openPaymentDialog = () => {
        setPaymentDialog(true);
    };

    const handlePDVSelect = async (pdv: PDV) => {
        try {
            if (pdv.status === 'ABERTO') {
                // Se o caixa estiver aberto, redireciona direto para a página do PDV
                router.push(`/pdv/caixa/${pdv.id}`);
                return;
            }

            // Se o caixa estiver fechado, continua com o fluxo de abrir o caixa
            setSelectedPDV(pdv);
            setOpenDialog(true);
            setCurrentStep('initial_value');
            setError('');

        } catch (error: any) {
            setError(error.message || 'Erro ao selecionar PDV');
        }
    };

    const handleKeypadInput = (value: string) => {
        switch (currentStep) {
            case 'initial_value':
                setValorInicial(prev => prev + value);
                break;
            case 'operator':
                setOperador(prev => prev + value);
                break;
            case 'password':
                setSenha(prev => prev + value);
                break;
        }
    };

    const handleBackspace = () => {
        switch (currentStep) {
            case 'initial_value':
                setValorInicial(prev => prev.slice(0, -1));
                break;
            case 'operator':
                setOperador(prev => prev.slice(0, -1));
                break;
            case 'password':
                setSenha(prev => prev.slice(0, -1));
                break;
        }
    };

    const handleNext = () => {
        const stepIndex = STEPS.findIndex(s => s.step === currentStep);
        if (stepIndex < STEPS.length - 1) {
            setCurrentStep(STEPS[stepIndex + 1].step);
        } else {
            handleAbrirCaixa();
        }
    };

    const handleCancel = () => {
        setOpenDialog(false);
        setCurrentStep('initial_value');
        setValorInicial('');
        setOperador('');
        setSenha('');
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'initial_value':
                return (
                    <Stack spacing={3}>
                        <TextField
                            label="Valor Inicial"
                            value={valorInicial}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />
                        <NumericKeypad
                            onNumberClick={handleKeypadInput}
                            onBackspace={handleBackspace}
                            onEnter={handleNext}
                            onCancel={handleCancel}
                        />
                    </Stack>
                );
            case 'operator':
                return (
                    <Stack spacing={3}>
                        <TextField
                            label="Operador"
                            value={operador}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />
                        <NumericKeypad
                            onNumberClick={handleKeypadInput}
                            onBackspace={handleBackspace}
                            onEnter={handleNext}
                            onCancel={handleCancel}
                        />
                    </Stack>
                );
            case 'password':
                return (
                    <Stack spacing={3}>
                        <TextField
                            label="Senha"
                            type="password"
                            value={senha}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />
                        <NumericKeypad
                            onNumberClick={handleKeypadInput}
                            onBackspace={handleBackspace}
                            onEnter={handleNext}
                            onCancel={handleCancel}
                        />
                    </Stack>
                );
        }
    };

    const handleAbrirCaixa = async () => {
        try {
            if (!selectedPDV || !valorInicial || !operador || !senha) {
                setError('Todos os campos são obrigatórios');
                return;
            }

            const data = {
                pdvId: selectedPDV.id,
                valorInicial: parseFloat(valorInicial),
                operadorId: operador,
                operadorSenha: senha
            };

            const response = await api.abrirCaixa(token, data);

            if (response.success) {
                // Salva as credenciais nos cookies
                setCookie('operadorId', operador, {
                    maxAge: 8 * 60 * 60, // 8 horas
                    path: '/'
                });
                setCookie('operadorSenha', senha, {
                    maxAge: 8 * 60 * 60, // 8 horas
                    path: '/'
                });

                // Limpar estados e fechar diálogo
                setOpenDialog(false);
                setCurrentStep('initial_value');
                setValorInicial('');
                setOperador('');
                setSenha('');

                // Recarregar PDVs para atualizar status
                await loadPDVs();

                // Redirecionar para a tela do PDV
                router.push(`/pdv/caixa/${selectedPDV.id}`);
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Erro ao abrir o caixa');
            console.error('Erro ao abrir caixa:', error);

            // Voltar para o primeiro passo em caso de erro
            setCurrentStep('initial_value');
            setValorInicial('');
            setOperador('');
            setSenha('');
        }
    };

    // Função helper para mostrar alertas
    const showAlert = (type: AlertType, message: string) => {
        setAlertType(type);
        setAlertMessage(message);
        setAlertOpen(true);
    };

    const playNotificationSound = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(error => {
                console.error('Erro ao tocar áudio:', error);
            });
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
            <audio ref={audioRef} preload="auto">
                <source src="/sounds/notification.mp3" type="audio/mpeg" />
            </audio>

            <Typography variant="h4" gutterBottom>
                Selecione o PDV
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Stack direction="row" spacing={2} flexWrap="wrap">
                {pdvs.map((pdv) => (
                    <Card
                        key={pdv.id}
                        sx={{
                            width: 250,
                            cursor: 'pointer',
                            '&:hover': {
                                opacity: 0.9,
                                transform: 'scale(1.02)',
                                transition: 'all 0.2s'
                            }
                        }}
                        onClick={() => handlePDVSelect(pdv)}
                    >
                        <CardContent>
                            <Stack spacing={2} alignItems="center">
                                <Store sx={{ fontSize: 48, color: pdv.status === 'ABERTO' ? 'success.main' : 'error.main' }} />
                                <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', color: "black" }}>
                                    {pdv.pdv || 'PDV sem nome'}
                                </Typography>
                                <Chip
                                    label={pdv.status === 'ABERTO' ? 'ABERTO' : 'FECHADO'}
                                    color={pdv.status === 'ABERTO' ? 'success' : 'error'}
                                    variant="outlined"
                                    size="small"
                                />
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            <Dialog
                open={openDialog}
                onClose={handleCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {STEPS.find(s => s.step === currentStep)?.title} - {selectedPDV?.pdv}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {renderStepContent()}
                    </Box>
                </DialogContent>
            </Dialog>

            <AlertMessage
                open={alertOpen}
                type={alertType}
                message={alertMessage}
                onClose={() => setAlertOpen(false)}
            />
        </Box>
    );
}

export default PDVPage;
