'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Typography,
    Button,
    Grid,
    Avatar,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import { PhotoCamera, Edit } from '@mui/icons-material';
import { SketchPicker } from 'react-color';
import { Tenant } from '@/types/Tenant';
import { Banner } from '@/types/Banner';
import { api } from '@/libs/api';
import { getCookie } from 'cookies-next';
import axios from 'axios';

type Props = {
    data: Tenant;
    onEditImg: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEditNome: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEditMainColor: (color: string) => void;
    onEditSecondColor: (color: string) => void;
}

const EditLayout = ({ data, onEditImg, onEditNome, onEditMainColor, onEditSecondColor }: Props) => {
    const [nomeRestaurante, setNomeRestaurante] = useState(data.nome);
    const [editandoNome, setEditandoNome] = useState(false);
    const [corPrimaria, setCorPrimaria] = useState(data.second_color);
    const [corSecundaria, setCorSecundaria] = useState(data.main_color);
    const [selecionandoCorPrimaria, setSelecionandoCorPrimaria] = useState(false);
    const [selecionandoCorSecundaria, setSelecionandoCorSecundaria] = useState(false);
    const [abaAtiva, setAbaAtiva] = useState(0);
    const [banners, setBanners] = useState<Banner[]>(data.banners);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);


    const token = getCookie('token');

    const toggleEditarNome = async () => {
        setEditandoNome(!editandoNome);
    };

    const handleNomeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNomeRestaurante(event.target.value);
        onEditNome(event)
    };

    const getBanners = async () => {
        try {
            const response: Banner[] = await api.getBanners(token as string);
            setBanners(response); // Atualiza o estado com os dados do tenant
        } catch (error) {
            console.error('Erro ao buscar o tenant:', error);
        }
    };

    const handleAddBanner = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Obtém o primeiro arquivo selecionado
        if (!file) {
            console.error("Nenhum arquivo foi selecionado.");
            return;
        }

        const form = new FormData();
        form.append("img", file);

        try {
            // Faz a requisição para adicionar o banner
            await api.addBanner(token as string, form);

            await getBanners(); // Espera o retorno da API antes de atualizar o estado
            console.log("Tenant atualizado com sucesso após o banner");
        } catch (error) {
            console.error("Erro ao adicionar Banner:", error);
        }
    };

    const handleDeleteBanner = async () => {
        if (!bannerToDelete) return;
        console.log(bannerToDelete.id)
        try {
            await api.deleteBanner(token as string, bannerToDelete.id); // Chama a API para excluir o banner
            setBanners(banners.filter((banner) => banner.id !== bannerToDelete.id)); // Remove o banner do estado
            setShowDeleteDialog(false); // Fecha o modal
            setBannerToDelete(null); // Reseta o banner a ser deletado
        } catch (error) {
            console.error('Erro ao excluir o banner:', error);
        }
    };

    const handleOpenDeleteDialog = (banner: Banner) => {
        setBannerToDelete(banner);
        setShowDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setShowDeleteDialog(false);
        setBannerToDelete(null);
    };

    const handleeditCorSecundaria = (color: string) => {
        console.log(color)
    }

    useEffect(() => {
        getBanners(); // Chama a função para buscar os dados do tenant
    }, []);

    return (
        <Box
            sx={{
                border: '1px solid #ddd',
                borderRadius: 2,
                padding: 2,
                backgroundColor: '#f9f9f9',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Box principal com imagem e informações */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                    {/* Seção da imagem */}
                    <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
                        <Avatar
                            alt="Logo do Estabelecimento"
                            src={data.img}
                            sx={{
                                width: 200,
                                height: 200,
                                marginBottom: 2,
                                borderRadius: 4,
                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                            }}
                        />
                        <IconButton color="primary" component="label">
                            <input
                                hidden
                                accept="image/*"
                                type="file"
                                onChange={onEditImg}
                            />
                            <PhotoCamera />
                        </IconButton>
                    </Box>

                    {/* Informações ao lado */}
                    <Grid container spacing={3} sx={{ flex: 1 }}>
                        {/* Nome do restaurante */}
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                {editandoNome ? (
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        value={nomeRestaurante}
                                        onChange={handleNomeChange}
                                        onBlur={toggleEditarNome}
                                        autoFocus
                                        placeholder="Digite o nome do restaurante"
                                    />
                                ) : (
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 500,
                                            flexGrow: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {nomeRestaurante}
                                        <Tooltip title="Editar Nome">
                                            <IconButton
                                                sx={{ marginLeft: 1 }}
                                                onClick={toggleEditarNome}
                                            >
                                                <Edit />
                                            </IconButton>
                                        </Tooltip>
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Cor Primária */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ position: 'relative' }}> {/* Adicionando position relative ao Box */}
                                <Typography variant="body1">Principal</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            backgroundColor: corPrimaria,
                                            borderRadius: '50%',
                                            border: '1px solid #ccc',
                                        }}
                                    />
                                    <Button
                                        variant="outlined"
                                        onClick={() => setSelecionandoCorPrimaria(!selecionandoCorPrimaria)}
                                    >
                                        Alterar Cor
                                    </Button>
                                </Box>
                                {selecionandoCorPrimaria && (
                                    <Box
                                        sx={{
                                            position: 'absolute', // Coloca o seletor de cor sobre os outros elementos
                                            top: '100%',  // Faz com que o seletor apareça abaixo do botão
                                            left: 0,
                                            zIndex: 10,  // Garante que o seletor fique sobre os outros elementos
                                            display: 'flex',
                                            flexDirection: 'column',
                                            marginTop: 2,
                                            backgroundColor: 'white',
                                            borderRadius: 2,
                                            padding: 2,
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.6)',
                                        }}
                                    >
                                        <SketchPicker
                                            color={corPrimaria}
                                            onChangeComplete={(color) => {
                                                setCorPrimaria(color.hex);  // Atualiza o estado da cor
                                            }}
                                            disableAlpha
                                        />
                                        <Box sx={{ marginTop: 2 }}>
                                            <Button
                                                variant="contained"
                                                onClick={(event) => {
                                                    setSelecionandoCorPrimaria(false);
                                                    onEditMainColor(corPrimaria);
                                                }}
                                            >
                                                Confirmar Cor
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Grid>

                        {/* Cor Secundária */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ position: 'relative' }}> {/* Adicionando position relative ao Box */}
                                <Typography variant="body1">Secundária</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            backgroundColor: corSecundaria,
                                            borderRadius: '50%',
                                            border: '1px solid #ccc',
                                        }}
                                    />
                                    <Button
                                        variant="outlined"
                                        onClick={() => setSelecionandoCorSecundaria(!selecionandoCorSecundaria)}
                                    >
                                        Alterar Cor
                                    </Button>
                                </Box>
                                {selecionandoCorSecundaria && (
                                    <Box
                                        sx={{
                                            position: 'absolute', // Coloca o seletor de cor sobre os outros elementos
                                            top: '100%',  // Faz com que o seletor apareça abaixo do botão
                                            left: 0,
                                            zIndex: 10,  // Garante que o seletor fique sobre os outros elementos
                                            display: 'flex',
                                            flexDirection: 'column',
                                            marginTop: 2,
                                            backgroundColor: 'white',
                                            borderRadius: 2,
                                            padding: 2,
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.6)',
                                        }}
                                    >
                                        <SketchPicker
                                            color={corSecundaria}
                                            onChangeComplete={(color) => {
                                                setCorSecundaria(color.hex);  // Atualiza o estado da cor
                                            }}
                                            disableAlpha
                                        />
                                        <Box sx={{ marginTop: 2 }}>
                                            <Button
                                                variant="contained"
                                                onClick={(event) => {
                                                    setSelecionandoCorSecundaria(false);
                                                    onEditSecondColor(corSecundaria);
                                                }}
                                            >
                                                Confirmar Cor
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Grid>

                    </Grid>
                </Box>

                {/* Sessão de banners */}
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ marginBottom: 2 }}>
                            Edição de Banners
                        </Typography>
                        <Box sx={{ marginTop: 2 }}>
                            <label htmlFor="img">
                                <Button
                                    variant="contained"
                                    component="span"
                                >
                                    Adicionar Novo Banner
                                </Button>
                            </label>
                            <input
                                id="img"
                                hidden
                                accept="image/*"
                                type="file"
                                onChange={handleAddBanner}
                            />
                        </Box>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Card para cada banner */}
                        {banners.map((banner, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Box
                                    sx={{
                                        border: '1px solid #ddd',
                                        borderRadius: 2,
                                        padding: 2,
                                        textAlign: 'center',
                                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    <img
                                        src={banner.img || '/public/notImage.jpg'}
                                        alt={`Banner ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: 150,
                                            objectFit: 'cover',
                                            borderRadius: 4,
                                        }}
                                    />
                                    <Box sx={{ marginTop: 2 }}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleOpenDeleteDialog(banner)}
                                        >
                                            Remover
                                        </Button>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    <Dialog open={showDeleteDialog} onClose={handleCloseDeleteDialog} fullWidth maxWidth="xs">
                        <DialogTitle>Tem certeza que deseja deletar esse banner?</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                O banner será excluído permanentemente após essa ação. Deseja continuar?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDeleteDialog} color="primary">
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleDeleteBanner}
                                color="error"
                                variant="contained"
                            >
                                Deletar
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        </Box>
    );
};


export default EditLayout;
