'use client';

import { Box, Typography, Paper } from '@mui/material';
import { LocalOffer } from '@mui/icons-material';

interface Promotion {
    id: number;
    title: string;
    description: string;
    discount: number;
    color: string;
}

interface PromotionBannerProps {
    promotions: Promotion[];
}

export const PromotionBanner = ({ promotions }: PromotionBannerProps) => {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                py: 1,
                px: 0.5,
                '&::-webkit-scrollbar': {
                    height: 6
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'primary.light',
                    borderRadius: 3
                }
            }}
        >
            {promotions.map((promo) => (
                <Paper
                    key={promo.id}
                    sx={{
                        minWidth: 200,
                        p: 1.5,
                        bgcolor: `${promo.color}15`,
                        border: 1,
                        borderColor: `${promo.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                        }
                    }}
                >
                    <LocalOffer sx={{ color: promo.color }} />
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: promo.color }}>
                            {promo.title}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                            {promo.description}
                        </Typography>
                    </Box>
                </Paper>
            ))}
        </Box>
    );
}; 