'use client';

import { Product } from '@/types/Product';
import { formatPrice } from '@/utils/formatPrice';
import { ListItem, Box, Typography, IconButton, Fade } from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';

interface CartItemProps {
    product: Product;
    quantity: number;
    onUpdateQuantity: (productId: number, delta: number) => void;
    onRemove: (productId: number) => void;
}

export const CartItem = ({ product, quantity, onUpdateQuantity, onRemove }: CartItemProps) => {
    return (
        <Fade in={true}>
            <ListItem
                sx={{
                    mb: 1,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 1,
                    '&:hover': {
                        bgcolor: 'action.hover'
                    }
                }}
            >
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    gap: 2
                }}>
                    <Box
                        component="img"
                        src={product.img || '/public/notImage.jpg'}
                        alt={product.nome}
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 1,
                            objectFit: 'cover'
                        }}
                    />

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                            {product.nome}
                        </Typography>
                        <Typography color="primary" fontWeight="bold">
                            {formatPrice(product.preco)}
                        </Typography>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <IconButton
                            size="small"
                            onClick={() => onUpdateQuantity(product.id, -1)}
                            sx={{
                                bgcolor: 'action.selected',
                                '&:hover': { bgcolor: 'action.focus' }
                            }}
                        >
                            <Remove fontSize="small" />
                        </IconButton>

                        <Typography
                            sx={{
                                minWidth: 32,
                                textAlign: 'center',
                                fontWeight: 'medium'
                            }}
                        >
                            {quantity}
                        </Typography>

                        <IconButton
                            size="small"
                            onClick={() => onUpdateQuantity(product.id, 1)}
                            sx={{
                                bgcolor: 'action.selected',
                                '&:hover': { bgcolor: 'action.focus' }
                            }}
                        >
                            <Add fontSize="small" />
                        </IconButton>

                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => onRemove(product.id)}
                            sx={{ ml: 1 }}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </ListItem>
        </Fade>
    );
}; 