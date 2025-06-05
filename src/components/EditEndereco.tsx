import React, { FormEvent, useState } from 'react';
import { Box, TextField, Typography, IconButton, Tooltip, Button, Grid, Divider } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Tenant } from '@/types/Tenant'; // Verifique o tipo de Tenant
import { formatValue } from '@/libs/formatValue'; // Exemplo de importação
import { TenantInfo } from '@/types/TenantInfo';

type Props = {
    data: TenantInfo;
    onEditAddresses: (event: FormEvent<HTMLFormElement>) => void;
};

const EditAddresses = ({ data, onEditAddresses }: Props) => {
    const [editandoEnderecos, setEditandoEnderecos] = useState(false);

    const [rua, setRua] = useState(data.rua); // Exemplo para um único endereço
    const [numero, setNumero] = useState(data.numero); // Exemplo para um único endereço
    const [estado, setEstado] = useState(data.estado)
    const [bairro, setBairro] = useState(data.bairro);
    const [cidade, setCidade] = useState(data.cidade);
    const [cep, setCep] = useState(data.cep);

    const toggleEdicaoEnderecos = () => {
        setEditandoEnderecos(!editandoEnderecos);
    };

    const handleSubmitEnderecos = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onEditAddresses(event);
        setEditandoEnderecos(false);
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
            {/* Formulário de Endereços */}
            <form onSubmit={handleSubmitEnderecos}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 3,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        Endereços de Entrega
                    </Typography>
                    <Tooltip title={editandoEnderecos ? 'Salvar alterações' : 'Editar endereços'}>
                        <IconButton color="primary" onClick={toggleEdicaoEnderecos}>
                            <Edit />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>CEP</Typography>}
                            variant="outlined"
                            value={editandoEnderecos ? cep : formatValue(cep, 'cep')}
                            onChange={(e) => setCep(e.target.value)}
                            name="cep"
                            disabled={!editandoEnderecos}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>Rua</Typography>}
                            variant="outlined"
                            value={rua}
                            onChange={(e) => setRua(e.target.value)}
                            name="rua"
                            disabled={!editandoEnderecos}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>Número</Typography>}
                            variant="outlined"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            name="numero"
                            disabled={!editandoEnderecos}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>Bairro</Typography>}
                            variant="outlined"
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                            name="bairro"
                            disabled={!editandoEnderecos}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>Cidade</Typography>}
                            variant="outlined"
                            value={cidade}
                            onChange={(e) => setCidade(e.target.value)}
                            name="cidade"
                            disabled={!editandoEnderecos}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={<Typography sx={{ fontWeight: 'bold', color: '#333' }}>Estado</Typography>}
                            variant="outlined"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            name="zipCode"
                            disabled={!editandoEnderecos}
                        />
                    </Grid>

                </Grid>

                {editandoEnderecos && (
                    <Box sx={{ marginTop: 3 }}>
                        <Button type="submit" variant="contained" color="success" fullWidth>
                            Salvar Endereço
                        </Button>
                    </Box>
                )}
            </form>
        </Box>
    );
};

export default EditAddresses;
