'use client';

import { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, TextField, Button, Table,
    TableBody, TableCell, TableContainer, TableHead,
    TableRow, IconButton, Chip, InputAdornment
} from '@mui/material';
import { Search, Add, Edit, Warning } from '@mui/icons-material';
import { formatCurrency } from '@/libs/formatCurrency';

interface EstoqueProduto {
    id: number;
    nome: string;
    quantidade: number;
    minimo: number;
    valor_unitario: number;
    categoria: string;
    status: 'normal' | 'baixo' | 'critico';
}

export default function EstoqueProdutosPage() {
    const [produtos, setProdutos] = useState<EstoqueProduto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const getStatusColor = (status: string) => {
        const colors = {
            normal: 'success',
            baixo: 'warning',
            critico: 'error'
        } as const;
        return colors[status as keyof typeof colors];
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Controle de Estoque - Produtos</Typography>
                <Button startIcon={<Add />} variant="contained">
                    Novo Produto
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Produto</TableCell>
                            <TableCell>Categoria</TableCell>
                            <TableCell align="right">Quantidade</TableCell>
                            <TableCell align="right">Mínimo</TableCell>
                            <TableCell align="right">Valor Unitário</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {produtos.map((produto) => (
                            <TableRow key={produto.id}>
                                <TableCell>{produto.nome}</TableCell>
                                <TableCell>{produto.categoria}</TableCell>
                                <TableCell align="right">{produto.quantidade}</TableCell>
                                <TableCell align="right">{produto.minimo}</TableCell>
                                <TableCell align="right">
                                    {formatCurrency(produto.valor_unitario)}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={produto.status}
                                        color={getStatusColor(produto.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary">
                                        <Edit />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
} 