'use client';

import { Box, Typography, Card, CardContent, CardMedia } from '@mui/material';
import { ImageNotSupported } from '@mui/icons-material';
import { formatPrice } from '@/utils/formatPrice';
import { Product } from '@/types/Product';

interface TouchMenuProps {
    product: Product;
    onClick: () => void;
}

export const TouchMenu: React.FC<TouchMenuProps> = ({ product, onClick }) => {
    return (
        <Card
            onClick={onClick}
            elevation={1}
            sx={{
                cursor: 'pointer',
                height: '100%',
                minHeight: { xs: 80, sm: 100, md: 120 },
                display: 'flex',
                flexDirection: 'column',
                borderRadius: { xs: 1, sm: 2 },
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2
                }
            }}
        >
            <Box sx={{
                position: 'relative',
                paddingTop: { xs: '40%', sm: '45%', md: '50%' },
                bgcolor: 'grey.50'
            }}>
                {product.img ? (
                    <CardMedia
                        component="img"
                        image={product.img}
                        alt={product.nome}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ImageNotSupported sx={{
                            fontSize: { xs: 18, sm: 20, md: 24 },
                            color: 'grey.300'
                        }} />
                    </Box>
                )}
            </Box>

            <CardContent sx={{
                p: { xs: '4px !important', sm: '6px !important', md: '8px !important' },
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                <Typography
                    variant="body2"
                    align="center"
                    sx={{
                        fontWeight: 500,
                        mb: { xs: 0.25, sm: 0.5 },
                        height: { xs: '2em', sm: '2.4em' },
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                        lineHeight: { xs: 1, sm: 1.2 }
                    }}
                >
                    {product.id} - {product.nome}
                </Typography>

                <Typography
                    align="center"
                    color="primary"
                    sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.9rem' }
                    }}
                >
                    {formatPrice(product.preco)}
                </Typography>
            </CardContent>
        </Card>
    );
}; 