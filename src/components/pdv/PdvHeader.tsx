'use client';

import { AppBar, Toolbar, Typography, IconButton, Badge, Box, Avatar } from '@mui/material';
import { ShoppingCart, Logout } from '@mui/icons-material';

interface PdvHeaderProps {
    pdvInfo: {
        pdvId: number;
        pdv: string;
    };
    caixaInfo?: {
        UserTenant: {
            operadorId: string;
            user: {
                nome: string;
            }
        }
    };
}

export const PdvHeader: React.FC<PdvHeaderProps> = ({ pdvInfo, caixaInfo }) => {
    return (
        <AppBar position="fixed" color="default" elevation={1}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                    {pdvInfo?.pdv}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {caixaInfo?.UserTenant?.user && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                {caixaInfo.UserTenant.user.nome?.[0] || ''}
                            </Avatar>
                            <Typography variant="subtitle2">
                                {caixaInfo.UserTenant.operadorId} - {caixaInfo.UserTenant.user.nome}
                            </Typography>
                        </Box>
                    )}

                    <IconButton color="primary">
                        <Badge badgeContent={pdvInfo?.pdvId} color="error">
                            <ShoppingCart />
                        </Badge>
                    </IconButton>

                    <IconButton color="error">
                        <Logout />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
}; 