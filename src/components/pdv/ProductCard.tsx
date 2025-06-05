'use client';

import { Product } from '@/types/Product';
import { formatPrice } from '@/utils/formatPrice';
import { Card, Box, Typography, Fade, CardMedia, CardContent } from '@mui/material';

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
    onClick: (product: Product) => void;
}

export const ProductCard = ({ product, onAdd }: ProductCardProps) => {
    const handleClick = () => {
        onAdd(product);
    };

    return (
        <Fade in={true}>
            <Card
                onClick={handleClick}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        transition: 'transform 0.2s ease-in-out'
                    }
                }}
            >
                <CardMedia
                    component="img"
                    image={product.img || '/placeholder.jpg'}
                    alt={product.nome}
                    sx={{
                        height: '80px',
                        objectFit: 'cover'
                    }}
                />
                <CardContent sx={{
                    p: 0.5,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <Typography variant="subtitle2" noWrap>
                        {product.nome}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                        {formatPrice(product.preco)}
                    </Typography>
                </CardContent>
            </Card>
        </Fade>
    );
}; 