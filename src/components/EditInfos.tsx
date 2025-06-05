import React, { FormEvent, useState } from 'react';
import { Box, TextField, Typography, IconButton, Tooltip, Button, Grid, Divider, InputAdornment } from '@mui/material';
import { Edit, Instagram, WhatsApp } from '@mui/icons-material';
import { Tenant } from '@/types/Tenant';
import { formatValue } from '@/libs/formatValue'; // Exemplo de importação

type Props = {
    data: Tenant;
    onEditInfos: (event: FormEvent<HTMLFormElement>) => void;
    onEditZones: (event: FormEvent<HTMLFormElement>) => void;
};

const EditInfos = ({ data, onEditInfos, onEditZones }: Props) => {
    const [editandoInfo, setEditandoInfo] = useState(false);
    const [editandoEntrega, setEditandoEntrega] = useState(false);

    const [cnpj, setCnpj] = useState(data.tenantInfo.cnpj);
    const [telefone, setTelefone] = useState(data.tenantInfo.telefone);
    const [whatsapp, setWhatsapp] = useState(data.tenantInfo.whatsapp);
    const [instagram, setInstagram] = useState(data.tenantInfo.instagram);
    const [tempoMaxEntre, setTempoMaxEntre] = useState(data.zone.tempoMaxEntre);
    const [taxaMinimaEntrega, setTaxaMinimaEntrega] = useState(data.zone.fixedFee);
    const [adicionalKmEntrega, setAdicionalKmEntrega] = useState(data.zone.additionalKmFee);
    const [distanciaMaximaEntrega, setDistanciaMaximaEntrega] = useState(data.zone.maxDistanceKm);
    const [kmTaxaMinima, setKmTaxaMinima] = useState(data.zone.fixedDistanceKm);

    const toggleEdicaoInfo = () => {
        setEditandoInfo(!editandoInfo);
    };

    const toggleEdicaoEntrega = () => {
        setEditandoEntrega(!editandoEntrega);
    };

    const handleSubmitInfo = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onEditInfos(event)
        setEditandoInfo(false);
    };

    const handleSubmitEntrega = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onEditZones(event)
        setEditandoEntrega(false);
    };

    return (
        <Box
            sx={{
                border: '1px solid #ddd',
                borderRadius: 2,
                padding: 3,
                backgroundColor: '#f9f9f9',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            }}
        >
            {/* Formulário de Informações */}
            <form onSubmit={handleSubmitInfo}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 3,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        Informações do Estabelecimento
                    </Typography>
                    <Tooltip title={editandoInfo ? 'Salvar alterações' : 'Editar informações'}>
                        <IconButton color="primary" onClick={toggleEdicaoInfo}>
                            <Edit />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>CNPJ</Typography>}
                            variant="outlined"
                            value={editandoInfo ? cnpj : formatValue(cnpj, 'cnpj')}
                            onChange={(e) => setCnpj(e.target.value)}
                            name="cnpj"
                            disabled={!editandoInfo}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>Telefone</Typography>}
                            variant="outlined"
                            value={editandoInfo ? telefone : formatValue(telefone, 'phone')}
                            onChange={(e) => setTelefone(e.target.value)}
                            name="telefone"
                            disabled={!editandoInfo}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>WhatsApp</Typography>}
                            variant="outlined"
                            value={editandoInfo ? whatsapp : formatValue(whatsapp, 'phone')}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            name="whatsapp"
                            disabled={!editandoInfo}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton
                                            href={`https://wa.me/${whatsapp}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <WhatsApp color="success" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>Instagram</Typography>}
                            variant="outlined"
                            value={editandoInfo ? instagram : formatValue(instagram, 'instagram')}
                            onChange={(e) => setInstagram(e.target.value)}
                            name="instagram"
                            disabled={!editandoInfo}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton
                                            href={`https://instagram.com/${instagram}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Instagram color="primary" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                </Grid>

                {editandoInfo && (
                    <Box sx={{ marginTop: 3 }}>
                        <Button type="submit" variant="contained" color="success" fullWidth>
                            Salvar Informações
                        </Button>
                    </Box>
                )}
            </form>

            <Divider sx={{ marginY: 3 }} />

            {/* Formulário de Entrega */}
            <form onSubmit={handleSubmitEntrega}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 3,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        Informações de Entrega
                    </Typography>
                    <Tooltip title={editandoEntrega ? 'Salvar alterações' : 'Editar informações'}>
                        <IconButton color="primary" onClick={toggleEdicaoEntrega}>
                            <Edit />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Grid container spacing={2}>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>Taxa Mínima de Entrega</Typography>}
                            variant="outlined"
                            value={editandoEntrega ? taxaMinimaEntrega : formatValue(taxaMinimaEntrega, 'currency')}
                            onChange={(e) =>
                                setTaxaMinimaEntrega(
                                    parseFloat(e.target.value.replace(/[^\d.-]/g, '')) || 0
                                )
                            }
                            name="fixedFee"
                            disabled={!editandoEntrega}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>Km Taxa Mínima</Typography>}
                            variant="outlined"
                            value={editandoEntrega ? kmTaxaMinima : formatValue(kmTaxaMinima, 'kilometers')}
                            onChange={(e) =>
                                setKmTaxaMinima(
                                    parseFloat(e.target.value.replace(/[^\d.-]/g, '')) || 0
                                )
                            }
                            name="fixedDistanceKm"
                            disabled={!editandoEntrega}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>Adicional por Km excedido</Typography>}
                            variant="outlined"
                            value={editandoEntrega ? adicionalKmEntrega : formatValue(adicionalKmEntrega, 'currency')}
                            onChange={(e) =>
                                setAdicionalKmEntrega(
                                    parseFloat(e.target.value.replace(/[^\d.-]/g, '')) || 0
                                )
                            }
                            name="additionalKmFee"
                            disabled={!editandoEntrega}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>Máxima Distância Percorrida</Typography>}
                            variant="outlined"
                            value={editandoEntrega ? distanciaMaximaEntrega : formatValue(distanciaMaximaEntrega, 'kilometers')}
                            onChange={(e) =>
                                setDistanciaMaximaEntrega(
                                    parseFloat(e.target.value.replace(/[^\d.-]/g, '')) || 0
                                )
                            }
                            name="maxDistanceKm"
                            disabled={!editandoEntrega}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>Tempo Máximo de Entrega</Typography>}
                            variant="outlined"
                            value={editandoEntrega ? tempoMaxEntre : formatValue(tempoMaxEntre, 'time')}
                            onChange={(e) => setTempoMaxEntre(parseFloat(e.target.value.replace(/[^\d.-]/g, '')) || 0)}
                            name="tempoMaxEntre"
                            disabled={!editandoEntrega}
                        />
                    </Grid>


                </Grid>

                {editandoEntrega && (
                    <Box sx={{ marginTop: 3 }}>
                        <Button type="submit" variant="contained" color="success" fullWidth>
                            Salvar Informações de Entrega
                        </Button>
                    </Box>
                )}
            </form>
        </Box>
    );
};

export default EditInfos;
