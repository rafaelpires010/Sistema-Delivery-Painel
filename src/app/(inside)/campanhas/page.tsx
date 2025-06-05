'use client'

import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    IconButton,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Tooltip,
    InputAdornment,
    FormControlLabel,
    Switch,
} from '@mui/material';
import {
    Add,
    Image,
    Delete,
    Edit,
    LocalOffer,
    Search,
} from '@mui/icons-material';
import { api } from "@/libs/api";
import { Cupom } from "@/types/Cupom";
import { Campanha } from "@/types/Campanha";
import { getCookie } from 'cookies-next';

const CampanhasPage = () => {
    const [loading, setLoading] = useState(false);
    const [campanhas, setCampanhas] = useState<Campanha[]>([]);
    const [cupons, setCupons] = useState<Cupom[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [editingCampanha, setEditingCampanha] = useState<Campanha | null>(null);
    const token = getCookie('token');

    // Form states
    const [formData, setFormData] = useState({
        nome: '',
        mensagem: '',
        cupomId: '',
        ativo: true
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response: Campanha[] = await api.getCampanhas(token as string);
                const resolve: Cupom[] = await api.getCupons(token as string);
                setCampanhas(response);
                setCupons(resolve);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenDialog = (campanha?: Campanha) => {
        if (campanha) {
            setEditingCampanha(campanha);
            setFormData({
                nome: campanha.nome,
                mensagem: campanha.descricao,
                cupomId: campanha.cupom?.id?.toString() || '',
                ativo: campanha.ativo
            });
            setImagePreview(campanha.img || '');
        } else {
            setEditingCampanha(null);
            setFormData({
                nome: '',
                mensagem: '',
                cupomId: '',
                ativo: true
            });
            setSelectedImage(null);
            setImagePreview('');
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingCampanha(null);
        setFormData({ nome: '', mensagem: '', cupomId: '', ativo: true });
        setSelectedImage(null);
        setImagePreview('');
    };

    const handleSave = async () => {
        if (!formData.nome || !formData.mensagem) return;

        try {
            setLoading(true);
            const data = {
                nome: formData.nome,
                descricao: formData.mensagem,
                cupomId: formData.cupomId ? parseInt(formData.cupomId) : null,
                ativo: formData.ativo
            };

            if (editingCampanha) {
                await api.updateCampanha(token as string, {
                    ...data,
                    id: editingCampanha.id,
                    img: selectedImage || undefined
                });
            } else {
                await api.createCampanha(token as string, {
                    ...data,
                    img: selectedImage
                });
            }

            // Recarrega a lista
            const response = await api.getCampanhas(token as string);
            setCampanhas(response);
            handleCloseDialog();
        } catch (error) {
            console.error('Erro ao salvar campanha:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            const success = await api.deleteCampanha(token as string, id);
            if (success) {
                // Recarrega a lista após deletar
                const response = await api.getCampanhas(token as string);
                setCampanhas(response);
            }
        } catch (error) {
            console.error('Erro ao deletar campanha:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCampanhas = campanhas.filter(campanha =>
        campanha.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campanha.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {/* Cabeçalho */}
            <Typography
                variant="h4"
                sx={{
                    mb: { xs: 2, sm: 3, md: 4 },
                    color: 'text.primary',
                    fontWeight: 'bold',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}
            >
                Campanhas de Marketing
            </Typography>

            {/* Barra de Ações */}
            <Paper sx={{
                p: { xs: 1, sm: 2 },
                mb: { xs: 2, sm: 3 },
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: 'stretch'
            }}>
                <TextField
                    placeholder="Buscar campanha..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        whiteSpace: 'nowrap',
                        minWidth: { xs: '100%', sm: 'auto' }
                    }}
                >
                    Nova Campanha
                </Button>
            </Paper>

            {/* Lista de Campanhas */}
            <Grid container spacing={{ xs: 1, sm: 2 }}>
                {loading ? (
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 4 }}>
                            <CircularProgress />
                        </Box>
                    </Grid>
                ) : filteredCampanhas.length === 0 ? (
                    <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', width: '100%', mt: 4 }}>
                            <Typography color="text.secondary">
                                Nenhuma campanha encontrada
                            </Typography>
                        </Box>
                    </Grid>
                ) : (
                    filteredCampanhas.map((campanha) => (
                        <Grid item xs={12} key={campanha.id}>
                            <Card sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                height: { xs: 'auto', sm: 300 }
                            }}>
                                {/* Imagem */}
                                <Box sx={{
                                    width: { xs: '100%', sm: 300 },
                                    position: 'relative',
                                    height: { xs: 200, sm: '100%' }
                                }}>
                                    {campanha.img ? (
                                        <CardMedia
                                            component="img"
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                            image={campanha.img}
                                            alt={campanha.nome}
                                        />
                                    ) : (
                                        <Box sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'grey.200'
                                        }}>
                                            <Image sx={{ fontSize: 40, color: 'grey.400' }} />
                                        </Box>
                                    )}
                                </Box>

                                {/* Conteúdo */}
                                <Box sx={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    p: { xs: 1.5, sm: 2 }
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        mb: 1
                                    }}>
                                        <Box sx={{ flexGrow: 1, pr: 1 }}>
                                            <Typography variant="h6" component="div" sx={{
                                                fontSize: { xs: '1rem', sm: '1.25rem' },
                                                mb: 0.5
                                            }}>
                                                {campanha.nome}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 1,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                                }}
                                            >
                                                {campanha.descricao}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenDialog(campanha)}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Excluir">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(campanha.id)}
                                                    disabled={loading}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    {/* Informações do Cupom */}
                                    <Box sx={{ mt: 'auto' }}>
                                        <Grid container spacing={1} sx={{ mt: 1 }}>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}>
                                                    <LocalOffer color="primary" fontSize="small" />
                                                    <Typography variant="body2" color="primary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                                        {cupons.find(c => c.id === campanha.cupom?.id)?.codigo || 'Sem cupom'}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            {campanha.cupom && (
                                                <>
                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                                            <strong>Desconto:</strong> {campanha.cupom.desconto}
                                                            {cupons.find(c => c.id === campanha.cupom?.id)?.tipoDesconto === "PERCENTUAL" ? "%" : ""}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" sx={{
                                                            color: 'success.main',
                                                            fontWeight: 'bold',
                                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                                        }}>
                                                            Usos: {campanha.cupom.usosAtuais} / {campanha.cupom.limiteUso}
                                                        </Typography>
                                                    </Grid>
                                                </>
                                            )}
                                        </Grid>
                                    </Box>

                                    {/* Status */}
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mt: 2
                                    }}>
                                        <Box sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: campanha.ativo ? 'success.main' : 'error.main'
                                        }} />
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                        >
                                            {campanha.ativo ? 'Ativa' : 'Inativa'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Dialog de Criação/Edição */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        m: 2,
                        width: 'calc(100% - 32px)',
                        maxWidth: 'sm'
                    }
                }}
            >
                <DialogTitle>
                    {editingCampanha ? 'Editar Campanha' : 'Nova Campanha'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Nome da Campanha"
                                fullWidth
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Mensagem"
                                fullWidth
                                multiline
                                rows={4}
                                value={formData.mensagem}
                                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Cupom de Desconto</InputLabel>
                                <Select
                                    value={formData.cupomId}
                                    onChange={(e) => setFormData({ ...formData, cupomId: e.target.value })}
                                    label="Cupom de Desconto"
                                >
                                    <MenuItem value="">Nenhum</MenuItem>
                                    {cupons.map((cupom) => (
                                        <MenuItem key={cupom.id} value={cupom.id}>
                                            {cupom.codigo} - {cupom.desconto} {cupom.tipoDesconto === "PERCENTUAL" ? "%" : ""} OFF
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.ativo}
                                        onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                                    />
                                }
                                label="Campanha Ativa"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<Image />}
                                fullWidth
                            >
                                {imagePreview ? 'Trocar Imagem' : 'Adicionar Imagem'}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                />
                            </Button>
                        </Grid>
                        {imagePreview && (
                            <Grid item xs={12}>
                                <Box
                                    component="img"
                                    src={imagePreview}
                                    alt="Preview"
                                    sx={{
                                        width: '100%',
                                        maxHeight: 200,
                                        objectFit: 'cover',
                                        borderRadius: 1
                                    }}
                                />
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!formData.nome || !formData.mensagem || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Add />}
                    >
                        {editingCampanha ? 'Salvar' : 'Criar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CampanhasPage;
