'use client';

import { Box, IconButton, Typography, Badge } from '@mui/material';
import {
    Cancel,
    MoneyOff,
    Print,
    History,
    Lock,
    Calculate,
    AccountBalance
} from '@mui/icons-material';

const actions = [
    { icon: <Cancel />, name: 'Cancelar', action: 'cancel', color: 'error.main' },
    { icon: <MoneyOff />, name: 'Estorno', action: 'refund', color: 'warning.main' },
    { icon: <Print />, name: 'Reimprimir', action: 'reprint', color: 'info.main' },
    { icon: <History />, name: 'Histórico', action: 'history', color: 'success.main' },
    { icon: <Lock />, name: 'Sangria', action: 'withdraw', color: 'secondary.main' },
    { icon: <Calculate />, name: 'Fechamento', action: 'closing', color: 'primary.main' },
    { icon: <AccountBalance />, name: 'Suprimento', action: 'supply', color: 'info.dark' }
];

interface CashierActionsProps {
    onAction: (action: string, data?: any) => void;
}

export const CashierActions = ({ onAction }: CashierActionsProps) => {
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: 1,
            p: 1
        }}>
            {actions.map((action) => (
                <Box
                    key={action.action}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5
                    }}
                >
                    <IconButton
                        onClick={() => onAction(action.action)}
                        sx={{
                            width: 56,
                            height: 56,
                            bgcolor: `${action.color}15`,
                            '&:hover': {
                                bgcolor: `${action.color}25`
                            }
                        }}
                    >
                        {action.action === 'history' ? (
                            <Badge color="error" variant="dot">
                                {action.icon}
                            </Badge>
                        ) : action.icon}
                    </IconButton>
                    <Typography
                        variant="caption"
                        align="center"
                        sx={{ fontSize: '0.75rem' }}
                    >
                        {action.name}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}; 