'use client';

import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box } from '@mui/material';
import { NumericKeypad } from './NumericKeypad';
import { formatCurrency } from '@/libs/formatCurrency';

interface InputDialogProps {
    open: boolean;
    title: string;
    onClose: () => void;
    onSubmit: (value: string) => void;
    password?: boolean;
    isCurrency?: boolean;
    error?: string;
    showDisplay?: boolean;
    startWithAlpha?: boolean;
    allowSpace?: boolean;
}

export const InputDialog = ({
    open,
    title,
    onClose,
    onSubmit,
    password,
    isCurrency,
    error,
    startWithAlpha = false,
    allowSpace = false
}: InputDialogProps) => {
    const [value, setValue] = useState('');

    const handleNumber = (num: string) => setValue(prev => prev + num);
    const handleBackspace = () => setValue(prev => prev.slice(0, -1));
    const handleEnter = () => {
        onSubmit(value);
        setValue('');
    };
    const handleCancel = () => {
        setValue('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ p: 2 }}>
                    <NumericKeypad
                        onNumberClick={handleNumber}
                        onBackspace={handleBackspace}
                        onEnter={handleEnter}
                        onCancel={handleCancel}
                        isCurrency={isCurrency}
                        showDisplay={true}
                        displayValue={value}
                        startWithAlpha={startWithAlpha}
                        allowSpace={allowSpace}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
}; 