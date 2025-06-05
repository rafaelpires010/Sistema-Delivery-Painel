'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Grid,
    Button,
    Stack,
    Box
} from '@mui/material';
import { Backspace } from '@mui/icons-material';
import { formatCurrency } from '@/libs/formatCurrency';

interface ValorInicialDialogProps {
    open: boolean;
    title: string;
    onClose: () => void;
    onSubmit: (value: string) => void;
}

export const ValorInicialDialog = ({ open, title, onClose, onSubmit }: ValorInicialDialogProps) => {
    const [value, setValue] = useState('');
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '<'];

    const handleNumber = (num: string) => {
        if (num === '<') {
            setValue(prev => prev.slice(0, -1));
        } else {
            setValue(prev => prev + num);
        }
    };

    const handleSubmit = () => {
        onSubmit(value);
        setValue('');
    };

    const handleClose = () => {
        setValue('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h3" align="center" sx={{ mb: 4 }}>
                        {formatCurrency(Number(value) || 0)}
                    </Typography>
                    <Grid container spacing={2}>
                        {numbers.map((num) => (
                            <Grid item xs={4} key={num}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => handleNumber(num)}
                                    sx={{ height: 70 }}
                                >
                                    {num === '<' ? <Backspace /> : num}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Button
                            variant="outlined"
                            fullWidth
                            color="error"
                            onClick={handleClose}
                            sx={{ height: 70 }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSubmit}
                            sx={{ height: 70 }}
                        >
                            Confirmar
                        </Button>
                    </Stack>
                </Box>
            </DialogContent>
        </Dialog>
    );
}; 