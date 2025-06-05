'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/types/Product';
import { Category } from '@/types/Category';
import { formatPrice } from '@/utils/formatPrice';
import { api } from "@/libs/api";
import { getCookie } from 'cookies-next';
import {
    Box,
    Grid,
    Typography,
    CircularProgress,
    useTheme,
    Stack,
    Alert,
    Avatar,
    GlobalStyles,
} from '@mui/material';

import { CashierActions } from '@/components/pdv/CashierActions';
import { PdvHeader } from '@/components/pdv/PdvHeader';
import { SearchProducts } from '@/components/pdv/SearchProducts';
import { CategoryTabs } from '@/components/pdv/CategoryTabs';
import { Cart } from '@/components/pdv/Cart';
import { PaymentDialog } from '@/components/pdv/PaymentDialog';
import { TouchMenu } from '@/components/pdv/TouchMenu';
import { CreditCard, Money, Pix, Payment } from '@mui/icons-material';
import { PaymentMethod } from '@/types/PaymentMethod';
import { CaixaFunctions } from '@/components/pdv/CaixaFunctions';
import { ErrorDialog } from '@/components/ErrorDialog';

interface FormaPagamentoCaixa {
    formaPagamento: {
        id: number;
        nome: string;
        tipo: string;
        aceitaTroco: boolean;
        ativo: boolean;
    }
}

const CaixaPage = () => {
    const params = useParams();
    const token = getCookie('token') as string;
    const operadoId = getCookie('operadorId') as string;
    const operadoSenha = getCookie('operadorSenha') as string;

    const [searchText, setSearchText] = useState('');
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentDialog, setPaymentDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [error, setError] = useState<string>('');
    const [pdvInfo, setPdvInfo] = useState<any>(null);
    const [caixaInfo, setCaixaInfo] = useState<any>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<string>('');
    const [inputDialogOpen, setInputDialogOpen] = useState(false);
    const [dialogsOpen, setDialogsOpen] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                // Carrega informações do caixa
                const data = {
                    pdvId: Number(params.id),
                    operadorId: operadoId,
                    operadorSenha: operadoSenha
                };

                const response = await api.getCaixa(token, data);
                const caixaData = response.data;

                if (!caixaData) {
                    console.log('Caixa não encontrado');
                    setError('Caixa não encontrado');
                    return;
                }

                if (caixaData.status !== 'ABERTO') {
                    console.log('Caixa fechado');
                    setError('Caixa não está aberto');
                    return;
                }

                // Configura informações do PDV e caixa
                setPdvInfo({
                    pdvId: caixaData.pdv.id,
                    pdv: caixaData.pdv.pdv
                });
                setCaixaInfo(caixaData);

                // Carrega produtos e categorias
                const [productsResponse, categoriesResponse] = await Promise.all([
                    api.getProducts(token),
                    api.getCategories(token)
                ]);

                setProducts(Array.isArray(productsResponse) ? productsResponse : []);
                setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);

                if (Array.isArray(caixaData.formasPagamento)) {
                    setPaymentMethods(caixaData.formasPagamento.map((item: FormaPagamentoCaixa) => ({
                        id: item.formaPagamento.id.toString(),
                        nome: item.formaPagamento.nome,
                        tipo: item.formaPagamento.tipo,
                        aceitarTroco: item.formaPagamento.aceitaTroco,
                        ativo: item.formaPagamento.ativo
                    })));
                }

            } catch (error: any) {
                console.error('Erro:', error);
                // Mostra o erro no diálogo independente do status
                setErrorDialogOpen(true);
                // Pega a mensagem de erro da API ou usa mensagem padrão
                setErrorMessage(
                    error.message ||
                    error.response?.data?.message ||
                    'Erro ao acessar o caixa'
                );
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            loadInitialData();
        }
    }, [params.id, token, operadoId, operadoSenha]);

    const getPaymentIcon = (type: string) => {
        switch (type) {
            case 'CARTAO_CREDITO':
                return <CreditCard />;
            case 'CARTAO_DEBITO':
                return <CreditCard />;
            case 'DINHEIRO':
                return <Money />;
            case 'PIX':
                return <Pix />;
            default:
                return <Payment />;
        }
    };

    const filteredProducts = products.filter(product => {
        const searchLower = searchText.toLowerCase();
        const matchesSearch =
            product.nome.toLowerCase().includes(searchLower) || // Busca por nome
            product.id.toString() === searchText; // Busca por ID exato
        const matchesCategory = selectedCategory === 'all' || product.category.id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleProductClick = (product: Product) => {
        if (!product?.id) return; // Evita adições inválidas
        addToCart(product);
    };

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
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(cart.map(item => {
            if (item.product.id === productId) {
                const newQuantity = item.quantity + delta;
                if (newQuantity <= 0) {
                    return null;
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(Boolean) as { product: Product; quantity: number }[]);
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => {
            return total + (item.product.preco * item.quantity);
        }, 0);
    };

    const handleProductCode = (searchValue: string) => {
        // Primeiro tenta encontrar por ID
        const productById = products.find(p => p.id === Number(searchValue));
        if (productById) {
            addToCart(productById);
            return;
        }

        // Se não encontrou por ID, procura por nome
        const productByName = products.find(p =>
            p.nome.toLowerCase().includes(searchValue.toLowerCase())
        );
        if (productByName) {
            addToCart(productByName);
            return;
        }

        // Produto não encontrado
        console.log('Produto não encontrado');
    };

    const handleDelete = () => {
        if (cart.length > 0) {
            // Remove o último item do carrinho
            const newCart = [...cart];
            newCart.pop();
            setCart(newCart);
        }
    };

    const handleReprint = () => {
        console.log('Reimprimir cupom');
    };

    const handleChangeOperator = () => {
        console.log('Trocar operador');
    };

    const handleCloseCashier = () => {
        console.log('Fechar caixa');
    };

    const handleCancelSale = () => {
        setCart([]); // Limpa o carrinho
    };

    const handleWithdraw = () => {
        console.log('Sangria');
    };

    const handleSupply = () => {
        console.log('Suprimento');
    };

    const handlePartialClose = () => {
        console.log('Fechamento parcial');
    };

    const handleSettings = () => {
        console.log('Configurações');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Box sx={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '1600px',
                maxHeight: '900px',
                margin: '0 auto',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                p: { xs: 1, sm: 2 }
            }}>
                <Grid container spacing={{ xs: 1, sm: 2 }} sx={{
                    flex: 1,
                    height: '100%',
                    '& > .MuiGrid-item': {
                        height: { xs: 'auto', md: '100%' }
                    }
                }}>
                    {/* Funções do Caixa */}
                    <Grid item xs={6} sm={3} md={2} sx={{
                        display: { xs: 'block', sm: 'block' },
                        order: { xs: 2, md: 1 },
                    }}>
                        <CaixaFunctions
                            onReprint={handleReprint}
                            onChangeOperator={handleChangeOperator}
                            onCloseCashier={handleCloseCashier}
                            onCancelSale={handleCancelSale}
                            onWithdraw={handleWithdraw}
                            onSupply={handleSupply}
                            onPartialClose={handlePartialClose}
                            onSettings={handleSettings}
                            onDialogChange={(isOpen) => setDialogsOpen(isOpen)}
                            pdvId={Number(params.id)}
                        />

                    </Grid>

                    {/* Área de Produtos */}
                    <Grid item xs={12} sm={12} md={5} sx={{
                        order: { xs: 1, md: 2 },
                        height: { xs: 'calc(100vh - 400px)', md: '100%' }
                    }}>
                        <Box sx={{
                            height: '100%',
                            bgcolor: 'background.paper',
                            borderRadius: { xs: 1, sm: 2 },
                            boxShadow: 1,
                            overflow: 'hidden'
                        }}>
                            <Stack spacing={1} sx={{ height: '100%', p: { xs: 0.5, sm: 1 } }}>
                                <Box sx={{ p: 1 }}>
                                    <SearchProducts
                                        value={searchText}
                                        onChange={setSearchText}
                                        onCodeEnter={handleProductCode}
                                        onDelete={handleDelete}
                                        onFinalize={() => cart.length > 0 && setPaymentDialog(true)}
                                        disabled={dialogsOpen}
                                    />
                                </Box>

                                <Box sx={{ p: 1 }}>
                                    <CategoryTabs
                                        categories={categories}
                                        selectedCategory={selectedCategory}
                                        onSelectCategory={setSelectedCategory}
                                    />
                                </Box>

                                <Box sx={{
                                    flex: 1,
                                    overflow: 'auto',
                                    p: 1
                                }}>
                                    <Grid container spacing={1}>
                                        {filteredProducts.map((product) => (
                                            <Grid item xs={6} sm={4} md={2.4} key={product.id}>
                                                <TouchMenu
                                                    product={product}
                                                    onClick={() => handleProductClick(product)}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </Stack>
                        </Box>
                    </Grid>

                    {/* Carrinho */}
                    <Grid item xs={12} sm={12} md={3} sx={{
                        order: { xs: 3, md: 3 },
                        height: { xs: '300px', md: '100%' }
                    }}>
                        <Box sx={{
                            height: '100%',
                            bgcolor: 'background.paper',
                            borderRadius: { xs: 1, sm: 2 },
                            boxShadow: 1,
                            overflow: 'hidden'
                        }}>
                            <Cart
                                items={cart}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeFromCart}
                                onFinalize={() => setPaymentDialog(true)}
                                total={getTotalPrice()}
                            />
                        </Box>
                    </Grid>

                    {/* Informações do Operador */}
                    <Grid item md={2} sx={{
                        display: { xs: 'none', sm: 'none', md: 'block' },
                        order: { md: 4 }
                    }}>
                        <Box sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 2,
                            overflow: 'hidden',
                            p: 2
                        }}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 3,
                                p: 2,
                                borderRadius: 1,
                            }}>
                                <Avatar sx={{
                                    width: 80,
                                    height: 80,
                                    fontSize: '2rem',
                                    bgcolor: 'primary.main',
                                    boxShadow: 2
                                }}>
                                    {caixaInfo?.UserTenant?.user?.nome?.[0]}
                                </Avatar>
                                <Box sx={{ textAlign: 'left', width: '100%' }}>
                                    <Typography variant="h6" sx={{
                                        fontSize: '1.3rem',
                                        mb: 2,
                                        fontWeight: 'bold',
                                        color: 'primary.main',
                                        borderBottom: '2px solid',
                                        borderColor: 'primary.main',
                                        pb: 1
                                    }}>
                                        {caixaInfo?.UserTenant?.user?.nome}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: '1rem',
                                        mb: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        color: 'text.secondary'
                                    }}>
                                        <strong>ID:</strong> {caixaInfo?.UserTenant?.operadorId}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: '1rem',
                                        mb: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        color: 'text.secondary'
                                    }}>
                                        <strong>PDV:</strong> {caixaInfo?.pdv || '-'}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: '1.4rem',
                                        fontWeight: 800,
                                        mb: 1,
                                        mt: 2,
                                        color: 'text.primary'
                                    }}>
                                        {new Date().toLocaleDateString('pt-BR')}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: '1.4rem',
                                        fontWeight: 800,
                                        color: 'text.primary'
                                    }}>
                                        {new Date().toLocaleTimeString('pt-BR')}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <PaymentDialog
                open={paymentDialog}
                onClose={() => setPaymentDialog(false)}
                items={cart}
                total={getTotalPrice()}
                paymentMethods={paymentMethods}
                selectedPayment={selectedPayment}
                onSelectPayment={setSelectedPayment}
                pdvId={Number(params.id)}
            />
            <ErrorDialog
                open={errorDialogOpen}
                message={errorMessage}
                onClose={() => {
                    setErrorDialogOpen(false);
                    setErrorMessage('');
                }}
                redirectTo="/pdv"
            />
        </>
    );
};

export default CaixaPage; 