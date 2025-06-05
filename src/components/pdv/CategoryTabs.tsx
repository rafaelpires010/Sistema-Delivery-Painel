'use client';

import { Box, Button, Typography } from '@mui/material';
import { Category } from '@/types/Category';

// Array de cores para as categorias
const CATEGORY_COLORS = [
    '#2196f3', // azul
    '#4caf50', // verde
    '#ff9800', // laranja
    '#e91e63', // rosa
    '#9c27b0', // roxo
    '#00bcd4', // ciano
    '#009688', // teal
    '#f44336', // vermelho
];

interface CategoryTabsProps {
    categories: Category[];
    selectedCategory: number | 'all';
    onSelectCategory: (category: number | 'all') => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, selectedCategory, onSelectCategory }) => {
    return (
        <Box sx={{
            p: 1.5,
            bgcolor: 'background.default',
            borderRadius: 2,
            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)'
        }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 500, color: 'text.secondary' }}>
                Categorias
            </Typography>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: 1.5
            }}>
                <Button
                    onClick={() => onSelectCategory('all')}
                    variant={selectedCategory === 'all' ? 'contained' : 'outlined'}
                    sx={{
                        minWidth: 'unset',
                        height: '60px',
                        borderRadius: 2,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        textTransform: 'none',
                        bgcolor: selectedCategory === 'all' ? 'primary.main' : 'transparent',
                        borderColor: 'primary.main',
                        color: selectedCategory === 'all' ? 'white' : 'primary.main',
                        '&:hover': {
                            bgcolor: selectedCategory === 'all' ? 'primary.dark' : 'primary.light',
                            color: 'white'
                        }
                    }}
                >
                    Todas
                </Button>

                {categories.map((category, index) => (
                    <Button
                        key={category.id}
                        onClick={() => onSelectCategory(category.id)}
                        variant={selectedCategory === category.id ? 'contained' : 'outlined'}
                        sx={{
                            minWidth: 'unset',
                            height: '60px',
                            borderRadius: 2,
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            bgcolor: selectedCategory === category.id ?
                                CATEGORY_COLORS[index % CATEGORY_COLORS.length] :
                                'transparent',
                            borderColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                            color: selectedCategory === category.id ?
                                'white' :
                                CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                            '&:hover': {
                                bgcolor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                                opacity: 0.9,
                                color: 'white'
                            }
                        }}
                    >
                        {category.nome}
                    </Button>
                ))}
            </Box>
        </Box>
    );
}; 