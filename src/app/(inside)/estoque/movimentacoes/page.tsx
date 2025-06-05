'use client';

import { useState } from 'react';
import {
    Box, Paper, Typography, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Button, TextField, MenuItem, Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Add } from '@mui/icons-material';
import { formatCurrency } from '@/libs/formatCurrency';
import { Dayjs } from 'dayjs';

interface Movimentacao {
    id: number;
    data: string;
    tipo: 'entrada' | 'saida';
    produto: string;
    quantidade: number;
    valor_unitario: number;
    responsavel: string;
    motivo: string;
}

export default function MovimentacoesPage() {
    const [dataInicio, setDataInicio] = useState<Dayjs | null>(null);
    const [dataFim, setDataFim] = useState<Dayjs | null>(null);
    const [tipoFiltro, setTipoFiltro] = useState('todos');

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Movimentações de Estoque</Typography>
                <Button startIcon={<Add />} variant="contained">
                    Nova Movimentação
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <DatePicker
                            label="Data Início"
                            value={dataInicio}
                            onChange={(newValue) => setDataInicio(newValue)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <DatePicker
                            label="Data Fim"
                            value={dataFim}
                            onChange={(newValue) => setDataFim(newValue)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            select
                            fullWidth
                            label="Tipo"
                            value={tipoFiltro}
                            onChange={(e) => setTipoFiltro(e.target.value)}
                        >
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="entrada">Entrada</MenuItem>
                            <MenuItem value="saida">Saída</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Data</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Produto</TableCell>
                            <TableCell align="right">Quantidade</TableCell>
                            <TableCell align="right">Valor Unitário</TableCell>
                            <TableCell>Responsável</TableCell>
                            <TableCell>Motivo</TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>
        </Box>
    );
} 