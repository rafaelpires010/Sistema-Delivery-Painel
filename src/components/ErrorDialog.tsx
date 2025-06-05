'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { Error } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface ErrorDialogProps {
    open: boolean;
    message: string;
    onClose: () => void;
    redirectTo?: string;
}

export const ErrorDialog = ({ open, message, onClose, redirectTo }: ErrorDialogProps) => {
    const router = useRouter();

    const handleClose = () => {
        onClose();
        if (redirectTo) {
            setTimeout(() => {
                router.push(redirectTo);
            }, 100);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown
            onBackdropClick={() => { }}
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'error.main',
                color: 'white'
            }}>
                <Error />
                Erro
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
                <Typography variant="h6" align="center">
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}
                    variant="contained"
                    color="primary"
                    fullWidth
                >
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 