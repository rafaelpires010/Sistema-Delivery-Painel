'use client';

import { Box, Paper, Typography, Button, Divider } from '@mui/material';
import { ShoppingCart, Payment } from '@mui/icons-material';
import { CartItem } from './CartItem';
import { Product } from '@/types/Product';
import { formatPrice } from '@/utils/formatPrice';

interface CartProps {
    items: { product: Product; quantity: number }[];
    onUpdateQuantity: (productId: number, delta: number) => void;
    onRemove: (productId: number) => void;
    onFinalize: () => void;
    total: number;
}

export const Cart: React.FC<CartProps> = ({
    items,
    onUpdateQuantity,
    onRemove,
    onFinalize,
    total
}) => {
    return (
        <Paper
            elevation={2}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 2
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ShoppingCart />
                <Typography variant="h6">Carrinho</Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                {items.map(({ product, quantity }) => (
                    <CartItem
                        key={product.id}
                        product={product}
                        quantity={quantity}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemove={onRemove}
                    />
                ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{
                borderTop: 2,
                borderColor: 'grey.300',
                pt: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}>
                <Typography
                    variant="h3"
                    align="center"
                    sx={{
                        fontFamily: '"Roboto Condensed", "Arial", sans-serif',
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: { xs: '1.5rem', sm: '2.0rem', md: '2.5rem' },
                        letterSpacing: '0.02em'
                    }}
                >
                    {formatPrice(total)}
                </Typography>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<Payment />}
                    onClick={onFinalize}
                    disabled={items.length === 0}
                    sx={{
                        py: 2.5,
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        bgcolor: 'success.main',
                        '&:hover': {
                            bgcolor: 'success.dark'
                        }
                    }}
                >
                    Finalizar Venda
                </Button>
            </Box>
        </Paper>
    );
}; 