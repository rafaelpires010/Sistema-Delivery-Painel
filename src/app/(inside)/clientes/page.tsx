'use client'

import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Button,
    TextField,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    InputAdornment,
} from '@mui/material';
import {
    Search,
    WhatsApp,
    Send,
    Campaign
} from '@mui/icons-material';
import { api } from '@/libs/api';
import { getCookie } from 'cookies-next';
import { Campanha } from "@/types/Campanha";
import { User } from '@/types/User';
import { Cupom } from '@/types/Cupom';

const ClientesPage = () => {
    const [loading, setLoading] = useState(false);
    const [clientes, setClientes] = useState<User[]>([]);
    const [campanhas, setCampanhas] = useState<Campanha[]>([]);
    const [cupons, setCupons] = useState<Cupom[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClients, setSelectedClients] = useState<number[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCampanha, setSelectedCampanha] = useState<string>('');
    const [showImageInstructions, setShowImageInstructions] = useState(false);
    const token = getCookie('token');

    // Buscar dados
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.getClientes(token as string);
                const campanhasData = await api.getCampanhas(token as string);
                const cuponsData = await api.getCupons(token as string);
                setClientes(response);
                setCampanhas(campanhasData);
                setCupons(cuponsData);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filtrar clientes
    const filteredClientes = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefone.includes(searchTerm)
    );

    // Selecionar/Deselecionar todos
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedClients(filteredClientes.map(c => c.id));
        } else {
            setSelectedClients([]);
        }
    };

    // Selecionar/Deselecionar um cliente
    const handleSelectClient = (clientId: number) => {
        setSelectedClients(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        );
    };

    // Enviar campanha
    const handleSendCampanha = async () => {
        try {
            setLoading(true);
            const campanha = campanhas.find(c => c.id === parseInt(selectedCampanha));

            if (!campanha) {
                throw new Error('Campanha não encontrada');
            }

            // Se tiver imagem, baixa primeiro
            let localImagePath = '';
            if (campanha.img) {
                const response = await fetch('/api/download-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ imageUrl: campanha.img })
                });

                const data = await response.json();
                if (!data.success) {
                    throw new Error('Erro ao baixar imagem');
                }
                localImagePath = data.filePath;
            }

            // Para cada cliente selecionado
            for (const clientId of selectedClients) {
                const cliente = clientes.find(c => c.id === clientId);
                if (cliente) {
                    const mensagem = `Olá ${cliente.nome}!\n\n` +
                        `${campanha.descricao}\n\n` +
                        `${campanha.cupom ?
                            `Use o cupom *${campanha.cupom.codigo}* e ganhe ${campanha.cupom.desconto}${cupons.find(c => c.id === campanha.cupom?.id)?.tipoDesconto === "PERCENTUAL" ? "%" : " reais"
                            } de desconto!`
                            : ''}`;

                    if (localImagePath) {
                        // Usa a API do WhatsApp Business para enviar imagem e texto
                        const whatsappUrl = `https://api.whatsapp.com/send?phone=${cliente.telefone}`;
                        const fullUrl = `${whatsappUrl}&text=${encodeURIComponent(mensagem)}&image=${encodeURIComponent(window.location.origin + localImagePath)}`;
                        window.open(fullUrl, '_blank');
                    } else {
                        window.open(
                            `https://api.whatsapp.com/send?phone=${cliente.telefone}&text=${encodeURIComponent(mensagem)}`,
                            '_blank'
                        );
                    }

                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            // Limpar arquivos temporários após o envio
            if (localImagePath) {
                await fetch('/api/cleanup-temp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ filePath: localImagePath })
                });
            }

            setOpenDialog(false);
            setSelectedClients([]);
            setSelectedCampanha('');
        } catch (error) {
            console.error('Erro ao enviar campanha:', error);
        } finally {
            setLoading(false);
        }
    };

    // Adicionar função de máscara para telefone
    const formatPhone = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    };

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {/* Cabeçalho mais compacto em mobile */}
            <Typography
                variant="h4"
                sx={{
                    mb: { xs: 1, sm: 2, md: 3 },
                    color: 'text.primary',
                    fontWeight: 'bold',
                    fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' }
                }}
            >
                Gestão de Clientes
            </Typography>

            {/* Barra de Ações mais adaptável */}
            <Paper sx={{
                p: { xs: 1, sm: 2 },
                mb: { xs: 1, sm: 2 },
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 2 },
                alignItems: 'stretch'
            }}>
                <TextField
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 'auto' } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant="contained"
                    startIcon={<Campaign fontSize="small" />}
                    disabled={selectedClients.length === 0}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        whiteSpace: 'nowrap',
                        minWidth: { xs: '100%', sm: 'auto' },
                        py: { xs: 1, sm: 'auto' }
                    }}
                >
                    Enviar ({selectedClients.length})
                </Button>
            </Paper>

            {/* Tabela mais responsiva */}
            <TableContainer
                component={Paper}
                sx={{
                    overflowX: 'auto',
                    '& .MuiTable-root': {
                        minWidth: { xs: '100%', sm: 500, md: 750 }
                    }
                }}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" sx={{ width: '40px' }}>
                                <Checkbox
                                    size="small"
                                    checked={selectedClients.length === filteredClientes.length}
                                    indeterminate={selectedClients.length > 0 && selectedClients.length < filteredClientes.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell sx={{
                                width: { xs: '40%', sm: '30%' },
                                padding: { xs: 1, sm: 2 }
                            }}>Nome</TableCell>
                            <TableCell sx={{
                                display: { xs: 'none', sm: 'table-cell' },
                                width: { sm: '25%', md: '20%' },
                                padding: { xs: 1, sm: 2 }
                            }}>Telefone</TableCell>
                            <TableCell sx={{
                                display: { xs: 'none', md: 'table-cell' },
                                width: '30%',
                                padding: { xs: 1, sm: 2 }
                            }}>Email</TableCell>
                            <TableCell align="center" sx={{
                                width: { xs: '60px', sm: '100px' },
                                padding: { xs: 0.5, sm: 1 }
                            }}>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : filteredClientes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    Nenhum cliente encontrado
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClientes.map((cliente) => (
                                <TableRow key={cliente.id} hover selected={selectedClients.includes(cliente.id)}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            size="small"
                                            checked={selectedClients.includes(cliente.id)}
                                            onChange={() => handleSelectClient(cliente.id)}
                                        />
                                    </TableCell>
                                    <TableCell sx={{
                                        maxWidth: { xs: '120px', sm: '200px', md: '300px' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        padding: { xs: 1, sm: 2 },
                                        fontSize: { xs: '0.875rem', sm: 'inherit' }
                                    }}>
                                        {cliente.nome}
                                    </TableCell>
                                    <TableCell sx={{
                                        display: { xs: 'none', sm: 'table-cell' },
                                        padding: { xs: 1, sm: 2 },
                                        fontSize: { xs: '0.875rem', sm: 'inherit' }
                                    }}>
                                        {formatPhone(cliente.telefone)}
                                    </TableCell>
                                    <TableCell sx={{
                                        display: { xs: 'none', md: 'table-cell' },
                                        maxWidth: { md: '200px', lg: '300px' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        padding: { xs: 1, sm: 2 },
                                        fontSize: { xs: '0.875rem', sm: 'inherit' }
                                    }}>
                                        {cliente.email}
                                    </TableCell>
                                    <TableCell align="center" sx={{
                                        padding: { xs: 0.5, sm: 1 }
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            gap: { xs: 0.5, sm: 1 },
                                            justifyContent: 'center'
                                        }}>
                                            <Tooltip title="WhatsApp">
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={() => window.open(`https://wa.me/${cliente.telefone}`)}
                                                    sx={{ padding: { xs: 0.5, sm: 1 } }}
                                                >
                                                    <WhatsApp fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Campanha">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => {
                                                        setSelectedClients([cliente.id]);
                                                        setOpenDialog(true);
                                                    }}
                                                    sx={{ padding: { xs: 0.5, sm: 1 } }}
                                                >
                                                    <Send fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog de Campanha mais responsivo */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        m: { xs: 1, sm: 2 },
                        width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' },
                        maxWidth: { xs: '100%', sm: 500 }
                    }
                }}
            >
                <DialogTitle sx={{
                    p: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}>
                    Enviar Campanha
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <FormControl fullWidth sx={{ mt: { xs: 1, sm: 2 } }}>
                        <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            Selecione a Campanha
                        </InputLabel>
                        <Select
                            value={selectedCampanha}
                            onChange={(e) => setSelectedCampanha(e.target.value)}
                            label="Selecione a Campanha"
                            size="small"
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            {campanhas.map((campanha) => (
                                <MenuItem
                                    key={campanha.id}
                                    value={campanha.id}
                                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                                >
                                    {campanha.nome}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{
                    p: { xs: 1.5, sm: 2 },
                    gap: { xs: 1, sm: 2 }
                }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        size="small"
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (campanhas.find(c => c.id === parseInt(selectedCampanha))?.img) {
                                setShowImageInstructions(true);
                            } else {
                                handleSendCampanha();
                            }
                        }}
                        disabled={!selectedCampanha || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Send fontSize="small" />}
                        size="small"
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                        Enviar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={showImageInstructions}
                onClose={() => setShowImageInstructions(false)}
            >
                <DialogTitle>Instruções para Envio</DialogTitle>
                <DialogContent>
                    <Typography>
                        1. Na primeira janela do WhatsApp que abrir, clique no ícone de anexo (clipe) e selecione a imagem da campanha
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        2. Após enviar a imagem, uma segunda janela abrirá automaticamente com o texto da campanha
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        3. Envie o texto para completar o envio da campanha
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setShowImageInstructions(false);
                        handleSendCampanha();
                    }}>
                        Entendi, continuar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ClientesPage;
