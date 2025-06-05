'use client';

import { useState, FormEvent } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { Upload, Send } from '@mui/icons-material';
import { getCookie } from 'cookies-next';
import { api } from '@/libs/api';

const WhatsAppCampaignPage = () => {
    const token = getCookie('token');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('message', message);
            if (image) {
                formData.append('image', image);
            }

            await api.sendWhatsAppCampaign(token as string, formData);
            alert('Campanha enviada com sucesso!');
            setMessage('');
            setImage(null);
            setImagePreview('');
        } catch (error) {
            console.error('Erro ao enviar campanha:', error);
            alert('Erro ao enviar campanha. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ my: 3 }}>
            <Typography component="h5" variant="h5" sx={{ color: '#555', mb: 2 }}>
                Nova Campanha WhatsApp
            </Typography>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Box component="form" onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            label="Mensagem"
                            multiline
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="image-upload"
                            type="file"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="image-upload">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<Upload />}
                            >
                                Selecionar Imagem
                            </Button>
                        </label>

                        {imagePreview && (
                            <Box sx={{ mt: 2 }}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '200px',
                                        maxHeight: '200px',
                                        objectFit: 'contain',
                                        borderRadius: '4px'
                                    }}
                                />
                            </Box>
                        )}
                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !message}
                        startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                    >
                        {loading ? 'Enviando...' : 'Enviar Campanha'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default WhatsAppCampaignPage; 