'use client';

import { Alert, AlertTitle, Snackbar } from '@mui/material';
import { useState, useEffect } from 'react';

export type AlertType = 'error' | 'warning' | 'info' | 'success';

interface AlertMessageProps {
    open: boolean;
    type: AlertType;
    title?: string;
    message: string;
    onClose: () => void;
    autoHideDuration?: number;
}

export const AlertMessage = ({
    open,
    type,
    title,
    message,
    onClose,
    autoHideDuration = 6000
}: AlertMessageProps) => {
    const [isOpen, setIsOpen] = useState(open);

    useEffect(() => {
        setIsOpen(open);
    }, [open]);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setIsOpen(false);
        onClose();
    };

    return (
        <Snackbar
            open={isOpen}
            autoHideDuration={autoHideDuration}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert
                onClose={handleClose}
                severity={type}
                variant="filled"
                elevation={6}
                sx={{ width: '100%' }}
            >
                {title && <AlertTitle>{title}</AlertTitle>}
                {message}
            </Alert>
        </Snackbar>
    );
}; 