'use client';

import { Box } from '@mui/material';

export default function PdvLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Box sx={{
            //display: 'flex',
            height: '100vh',
            width: '100vw',
            bgcolor: '#1976d2',
            overflow: 'hidden'
        }}>
            {children}
        </Box>
    );
} 