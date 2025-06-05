'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Grid,
    Button,
    Stack,
    Box,
    TextField,
    IconButton
} from '@mui/material';
import { Backspace, Keyboard, Numbers } from '@mui/icons-material';
import { formatCurrency } from '@/libs/formatCurrency';

interface NumericKeypadProps {
    onNumberClick: (value: string) => void;
    onBackspace: () => void;
    onEnter: () => void;
    onCancel: () => void;
    isCurrency?: boolean;
    showDisplay?: boolean;
    displayValue?: string;
    startWithAlpha?: boolean;
    allowSpace?: boolean;
}

export const NumericKeypad = ({
    onNumberClick,
    onBackspace,
    onEnter,
    onCancel,
    isCurrency,
    showDisplay = false,
    displayValue = '',
    startWithAlpha = false,
    allowSpace = false
}: NumericKeypadProps) => {
    const [isNumeric, setIsNumeric] = useState(!startWithAlpha);
    const [inputValue, setInputValue] = useState('');
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '<'];
    const lettersRow1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    const lettersRow2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'];
    const lettersRow3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<'];

    // Adicione uma linha para o espaço se allowSpace for true
    const spaceRow = allowSpace ? [
        <Button
            key="space"
            variant="outlined"
            fullWidth
            onClick={() => onNumberClick(' ')}
            sx={{
                height: 70,
                fontSize: '1.2rem',
                borderRadius: 2
            }}
        >
            Espaço
        </Button>
    ] : [];

    // Função para lidar com entrada do teclado físico
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onEnter();
                return;
            }

            if (e.key === 'Escape') {
                e.preventDefault();
                onCancel();
                return;
            }

            if (e.key === 'Backspace') {
                e.preventDefault();
                onBackspace();
                return;
            }

            // Permite números e letras baseado no modo atual
            if (isNumeric) {
                if (/^[0-9.]$/.test(e.key)) {
                    e.preventDefault();
                    onNumberClick(e.key);
                }
            } else {
                if (/^[a-zA-Z0-9]$/.test(e.key)) {
                    e.preventDefault();
                    onNumberClick(e.key.toUpperCase());
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNumberClick, onBackspace, onEnter, onCancel, isNumeric]);

    // Função para lidar com mudança no campo de texto
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Permite apenas números e ponto
        if (isCurrency) {
            if (/^\d*\.?\d*$/.test(value)) {
                setInputValue(value);
                onNumberClick(value);
            }
        } else {
            setInputValue(value);
            onNumberClick(value);
        }
    };

    const renderNumericKeypad = () => (
        <Grid container spacing={1}>
            {numbers.map((num) => (
                <Grid item xs={4} key={num}>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => num === '<' ? onBackspace() : onNumberClick(num)}
                        sx={{
                            height: 70,
                            fontSize: '1.5rem',
                            borderRadius: 2
                        }}
                    >
                        {num === '<' ? <Backspace /> : num}
                    </Button>
                </Grid>
            ))}
        </Grid>
    );

    const renderAlphaKeypad = () => (
        <Stack spacing={1}>
            <Grid container spacing={1}>
                {lettersRow1.map((letter) => (
                    <Grid item xs={1.2} key={letter}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => onNumberClick(letter)}
                            sx={{
                                height: 70,
                                fontSize: '1.2rem',
                                borderRadius: 2
                            }}
                        >
                            {letter}
                        </Button>
                    </Grid>
                ))}
            </Grid>
            <Grid container spacing={1} sx={{ pl: 2 }}>
                {lettersRow2.map((letter) => (
                    <Grid item xs={1.2} key={letter}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => onNumberClick(letter)}
                            sx={{
                                height: 70,
                                fontSize: '1.2rem',
                                borderRadius: 2
                            }}
                        >
                            {letter}
                        </Button>
                    </Grid>
                ))}
            </Grid>
            <Grid container spacing={1} sx={{ pl: 4 }}>
                {lettersRow3.map((letter) => (
                    <Grid item xs={1.5} key={letter}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => letter === '<' ? onBackspace() : onNumberClick(letter)}
                            sx={{
                                height: 70,
                                fontSize: '1.2rem',
                                borderRadius: 2
                            }}
                        >
                            {letter === '<' ? <Backspace /> : letter}
                        </Button>
                    </Grid>
                ))}
            </Grid>
            {allowSpace && (
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        {spaceRow}
                    </Grid>
                </Grid>
            )}
        </Stack>
    );

    return (
        <Stack spacing={2}>
            {showDisplay && (
                <Typography variant="h3" align="center" sx={{ mb: 4 }}>
                    {isCurrency ? formatCurrency(Number(displayValue) || 0) : displayValue}
                </Typography>
            )}

            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
            }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {isNumeric ? 'Teclado Numérico' : 'Teclado Alfabético'}
                </Typography>
                <IconButton
                    onClick={() => setIsNumeric(!isNumeric)}
                    color="primary"
                    sx={{ p: 1 }}
                >
                    {isNumeric ? <Keyboard /> : <Numbers />}
                </IconButton>
            </Box>

            {isNumeric ? renderNumericKeypad() : renderAlphaKeypad()}

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                    variant="outlined"
                    fullWidth
                    color="error"
                    onClick={onCancel}
                    sx={{
                        height: 70,
                        fontSize: '1.2rem',
                        borderRadius: 2
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={onEnter}
                    sx={{
                        height: 70,
                        fontSize: '1.2rem',
                        borderRadius: 2
                    }}
                >
                    Enter
                </Button>
            </Stack>
        </Stack>
    );
}; 