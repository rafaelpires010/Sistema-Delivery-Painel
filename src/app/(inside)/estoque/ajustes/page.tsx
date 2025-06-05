'use client';

import { useState } from 'react';
import {
    Box, Paper, Typography, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Button, TextField, MenuItem, Grid, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Add } from '@mui/icons-material';

interface Ajuste {
    id: number;
    data: string;
    produto: string;
    quantidade_anterior: number;
    quantidade_nova: number;
    motivo: string;
    responsavel: string;
    status: 'pendente' | 'aprovado' | 'rejeitado';
}

export default function AjustesPage() {
    const [status, setStatus] = useState('todos');

    const getStatusColor = (status: string) => {
        const colors = {
            pendente: 'warning',
            aprovado: 'success',
            rejeitado: 'error'
        } as const;
        return colors[status as keyof typeof colors];
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Ajustes de Estoque</Typography>
                <Button startIcon={<Add />} variant="contained">
                    Solicitar Ajuste
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="pendente">Pendente</MenuItem>
                            <MenuItem value="aprovado">Aprovado</MenuItem>
                            <MenuItem value="rejeitado">Rejeitado</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Data</TableCell>
                            <TableCell>Produto</TableCell>
                            <TableCell align="right">Qtd. Anterior</TableCell>
                            <TableCell align="right">Qtd. Nova</TableCell>
                            <TableCell>Motivo</TableCell>
                            <TableCell>Responsável</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>
        </Box>
    );
} 