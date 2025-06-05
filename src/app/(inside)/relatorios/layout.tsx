'use client'

import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';

export default function RelatoriosLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <Box sx={{ p: 2 }}>
                {children}
            </Box>
        </LocalizationProvider>
    );
} 