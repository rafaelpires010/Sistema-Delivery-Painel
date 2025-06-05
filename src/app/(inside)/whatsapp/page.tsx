'use client';

import { useEffect, useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Chip, InputAdornment, CircularProgress } from '@mui/material';
import { Search, WhatsApp, Campaign, Settings } from '@mui/icons-material';
import { getCookie } from 'cookies-next';
import { api } from '@/libs/api';
import { Message } from '@/types/whatsapp';

const WhatsAppPage = () => {
    const token = getCookie('token');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChat, setSelectedChat] = useState<string | null>(null);

    useEffect(() => {
        getMessages();
    }, []);

    const getMessages = async () => {
        setLoading(true);
        try {
            const response = await api.getWhatsAppMessages(token as string);
            setMessages(response);
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMessages = messages.filter(message =>
        message.phone.includes(searchTerm) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ my: 3 }}>
            {/* Cabeçalho */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography component="h5" variant="h5" sx={{ color: '#555', mb: 2 }}>
                    WhatsApp
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        startIcon={<Campaign />}
                        variant="outlined"
                        onClick={() => window.location.href = '/whatsapp/campaigns'}
                    >
                        Campanhas
                    </Button>
                    <Button
                        startIcon={<Settings />}
                        variant="outlined"
                        onClick={() => window.location.href = '/whatsapp/settings'}
                    >
                        Configurações
                    </Button>
                </Box>
            </Box>

            {/* Barra de Pesquisa */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar por número ou mensagem..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        )
                    }}
                />
            </Box>

            {/* Lista de Conversas */}
            <Paper sx={{ borderRadius: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Número</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Última Mensagem</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Data/Hora</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredMessages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Nenhuma conversa encontrada
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMessages.map((message) => (
                                    <TableRow
                                        key={message.id}
                                        hover
                                        onClick={() => window.location.href = `/whatsapp/chats/${message.phone}`}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell>{message.phone}</TableCell>
                                        <TableCell>{message.content.substring(0, 50)}...</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={message.attendanceType === 'ai' ? 'IA' : 'Humano'}
                                                color={message.attendanceType === 'ai' ? 'info' : 'success'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={message.status}
                                                color={message.status === 'delivered' ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(message.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `/whatsapp/chats/${message.phone}`;
                                                }}
                                            >
                                                <WhatsApp />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default WhatsAppPage; 